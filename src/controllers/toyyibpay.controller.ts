import { Request, Response } from 'express';
import { prisma } from '../server';
import { EmailService } from '../services/email.service';

export class ToyyibPayController {
  
  static async createBill(req: Request, res: Response) {
    try {
      const { salon_id, amount, subscription_id, booking_id, payment_type } = req.body;
      
      let resolvedSalonId = salon_id as string | undefined;
      let resolvedAmount = Number(amount || 0);
      let successReference = booking_id as string | undefined;
      let isOrderPayment = false;
      let customerName = 'Customer';
      let customerEmail = 'customer@example.com';
      let customerPhone = '0123456789';

      if (booking_id) {
        const bookingIds = String(booking_id).split(',').map((id) => id.trim()).filter(Boolean);
        const bookings = await prisma.booking.findMany({
          where: { id: { in: bookingIds } },
          include: {
            service: true,
            user: {
              include: { profile: true }
            }
          }
        });

        if (bookings.length > 0) {
          resolvedSalonId = bookings[0].salon_id;
          customerName = bookings[0].user?.profile?.full_name || bookings[0].user?.email || customerName;
          customerEmail = bookings[0].user?.email || customerEmail;
          customerPhone = bookings[0].user?.profile?.phone || customerPhone;
          
          const bookingTotal = bookings.reduce((sum: number, booking: any) => {
            return sum + Number(booking.price_paid || booking.service?.price || 0);
          }, 0);

          if (!resolvedAmount) {
            resolvedAmount = payment_type === 'deposit'
              ? Math.max(Number((bookingTotal * 0.3).toFixed(2)), 1)
              : bookingTotal;
          }
        } else {
          const order = await prisma.platformOrder.findUnique({ where: { id: String(booking_id) } });
          if (order) {
            resolvedAmount = resolvedAmount || Number(order.total_amount || 0);
            successReference = order.id;
            isOrderPayment = true;
            customerName = order.guest_name || customerName;
            customerEmail = order.guest_email || customerEmail;

            const shippingAddress = (order.shipping_address && typeof order.shipping_address === 'object')
              ? order.shipping_address as Record<string, unknown>
              : null;
            const shippingPhone = typeof shippingAddress?.phone === 'string' ? shippingAddress.phone : null;
            if (shippingPhone) {
              customerPhone = shippingPhone;
            }
          }
        }
      }

      if (!resolvedAmount || Number.isNaN(resolvedAmount) || resolvedAmount <= 0) {
        return res.status(400).json({ error: 'Unable to determine a valid payment amount' });
      }

      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
      const toyyibpaySecret = process.env.TOYYIBPAY_USER_SECRET_KEY || process.env.TOYYIBPAY_SECRET_KEY;
      const toyyibpayCategory = process.env.TOYYIBPAY_CATEGORY_CODE;

      if (!toyyibpaySecret || !toyyibpayCategory) {
        // Fallback to MOCK implementation if keys are missing
        const billCode = 'BILL_' + Math.random().toString(36).substring(2, 8).toUpperCase();
        
        if (resolvedSalonId) {
          await prisma.platformPayment.create({
            data: {
              salon_id: resolvedSalonId,
              subscription_id,
              amount: resolvedAmount,
              status: 'completed',
              transaction_id: billCode,
              payment_gateway: 'toyyibpay',
              notes: booking_id ? `[MOCK] Payment settled for ref: ${booking_id}` : '[MOCK] Payment settled',
              paid_at: new Date()
            }
          });
        }

        if (booking_id) {
          const bookingIds = String(booking_id).split(',').map((id) => id.trim()).filter(Boolean);
          await prisma.booking.updateMany({
            where: { id: { in: bookingIds }, status: 'pending' },
            data: { status: 'confirmed' }
          });
          if (isOrderPayment && successReference) {
            await prisma.platformOrder.update({
              where: { id: successReference },
              data: { status: 'paid' }
            });
          }
        }

        const reference = successReference || billCode;
        const paymentUrl = `${frontendBaseUrl}/payment-success?reference=${encodeURIComponent(reference)}&status_id=1&billcode=${billCode}&type=${isOrderPayment ? 'order' : 'booking'}`;

        return res.json({ billCode, payment_url: paymentUrl, paymentUrl });
      }

      // Real ToyyibPay Implementation
      const isProduction = process.env.NODE_ENV === 'production';
      const toyyibpayApiUrl = isProduction 
        ? 'https://toyyibpay.com/index.php/api/createBill' 
        : 'https://dev.toyyibpay.com/index.php/api/createBill';
      const toyyibpayBaseUrl = isProduction ? 'https://toyyibpay.com' : 'https://dev.toyyibpay.com';

      const formData = new URLSearchParams();
      formData.append('userSecretKey', toyyibpaySecret);
      formData.append('categoryCode', toyyibpayCategory);
      formData.append('billName', 'Salon Payment');
      formData.append('billDescription', 'Payment for ' + (isOrderPayment ? 'Order' : 'Booking'));
      formData.append('billPriceSetting', '1');
      formData.append('billPayorInfo', '1');
      formData.append('billAmount', Math.round(resolvedAmount * 100).toString());
      formData.append('billReturnUrl', `${frontendBaseUrl}/payment-success?reference=${successReference || ''}&type=${isOrderPayment ? 'order' : 'booking'}`);
      formData.append('billCallbackUrl', `${process.env.BACKEND_PUBLIC_URL || 'http://localhost:5000'}/api/toyyibpay/callback`);
      formData.append('billExternalReferenceNo', successReference || '');
      formData.append('billTo', customerName);
      formData.append('billEmail', customerEmail);
      formData.append('billPhone', customerPhone);

      const response = await fetch(toyyibpayApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const responseText = await response.text();
      let responseData;
      try {
          responseData = JSON.parse(responseText);
      } catch(e) {
          throw new Error('Invalid response from ToyyibPay: ' + responseText);
      }

      if (!Array.isArray(responseData) || !responseData[0] || !responseData[0].BillCode) {
         throw new Error('Failed to create bill with ToyyibPay: ' + JSON.stringify(responseData));
      }

      const billCode = responseData[0].BillCode;
      const paymentUrl = `${toyyibpayBaseUrl}/${billCode}`;

      // Create PENDING payment record
      if (resolvedSalonId) {
        await prisma.platformPayment.create({
          data: {
            salon_id: resolvedSalonId,
            subscription_id,
            amount: resolvedAmount,
            status: 'pending',
            transaction_id: billCode,
            payment_gateway: 'toyyibpay',
            notes: booking_id ? `Payment initiated for ref: ${booking_id}` : 'Payment initiated'
          }
        });
      }

      res.json({
        billCode,
        payment_url: paymentUrl,
        paymentUrl
      });
    } catch (error: any) {
      console.error('ToyyibPay Create Bill Error:', error);
      res.status(500).json({ error: 'Failed to create bill', detail: error.message });
    }
  }

  static async callback(req: Request, res: Response) {
    try {
      const { refno, status, billcode, msg } = req.body;

      if (status === '1') {
          await prisma.platformPayment.updateMany({
              where: { transaction_id: billcode },
              data: { status: 'completed', paid_at: new Date() }
          });

          if (refno) {
              const order = await prisma.platformOrder.findUnique({ where: { id: refno } });
              if (order) {
                  const updatedOrder = await prisma.platformOrder.update({ where: { id: refno }, data: { status: 'paid' } });
                  if (updatedOrder.guest_email) {
                      EmailService.sendOrderReceiptEmail(updatedOrder, updatedOrder.guest_email, updatedOrder.guest_name || undefined);
                  }
              } else {
                  const bookingIds = String(refno).split(',').map(id => id.trim()).filter(Boolean);
                  if (bookingIds.length > 0) {
                      await prisma.booking.updateMany({
                          where: { id: { in: bookingIds } },
                          data: { status: 'confirmed' }
                      });
                  }
              }
          }
      } else {
          await prisma.platformPayment.updateMany({
            where: { transaction_id: billcode },
            data: { status: 'failed', notes: msg }
        });
      }
      
      res.send('OK');
    } catch (error: any) {
      console.error('ToyyibPay Callback Error:', error);
      res.status(500).send('Error');
    }
  }
}
