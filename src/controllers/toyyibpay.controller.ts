import { Request, Response } from 'express';
import { prisma } from '../server';

export class ToyyibPayController {
  
  static async createBill(req: Request, res: Response) {
    try {
      const { salon_id, amount, subscription_id, booking_id, payment_type } = req.body;
      const billCode = 'BILL_' + Math.random().toString(36).substring(2, 8).toUpperCase();
      let resolvedSalonId = salon_id as string | undefined;
      let resolvedAmount = Number(amount || 0);
      let successReference = booking_id as string | undefined;
      let isOrderPayment = false;

      if (booking_id) {
        const bookingIds = String(booking_id).split(',').map((id) => id.trim()).filter(Boolean);
        const bookings = await prisma.booking.findMany({
          where: { id: { in: bookingIds } },
          include: { service: true }
        });

        if (bookings.length > 0) {
          resolvedSalonId = bookings[0].salon_id;
          const bookingTotal = bookings.reduce((sum, booking) => {
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
          }
        }
      }

      if (!resolvedAmount || Number.isNaN(resolvedAmount) || resolvedAmount <= 0) {
        return res.status(400).json({ error: 'Unable to determine a valid payment amount' });
      }

      if (resolvedSalonId) {
        await prisma.platformPayment.create({
          data: {
            salon_id: resolvedSalonId,
            subscription_id,
            amount: resolvedAmount,
            status: 'completed',
            transaction_id: billCode,
            payment_gateway: 'toyyibpay',
            notes: booking_id ? `Payment settled for reference: ${booking_id}` : 'Payment settled',
            paid_at: new Date()
          }
        });
      }

      if (booking_id) {
        const bookingIds = String(booking_id).split(',').map((id) => id.trim()).filter(Boolean);
        // Update bookings
        await prisma.booking.updateMany({
          where: {
            id: { in: bookingIds },
            status: 'pending'
          },
          data: { status: 'confirmed' }
        });
        // Update order if it exists
        if (isOrderPayment) {
          await prisma.platformOrder.update({
            where: { id: successReference! },
            data: { status: 'paid' }
          });
        }
      }

      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5174';
      const reference = successReference || billCode;
      const paymentUrl = `${frontendBaseUrl}/payment-success?reference=${encodeURIComponent(reference)}&status_id=1&billcode=${billCode}&type=${isOrderPayment ? 'order' : 'booking'}`;

      res.json({
        billCode,
        payment_url: paymentUrl,
        paymentUrl
      });
    } catch (error: any) {
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
      } else {
          await prisma.platformPayment.updateMany({
            where: { transaction_id: billcode },
            data: { status: 'failed', notes: msg }
        });
      }
      
      res.send('OK');
    } catch (error: any) {
      res.status(500).send('Error');
    }
  }
}
