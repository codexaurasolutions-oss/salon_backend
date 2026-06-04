import { Request, Response } from 'express';
import { prisma } from '../server';

function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

function formatBookingTime(t: any): string {
  if (!t) return '00:00';
  if (typeof t === 'string') {
    const m = t.match(/T(\d{2}):(\d{2})/);
    if (m) return `${m[1]}:${m[2]}`;
    if (/^\d{2}:\d{2}/.test(t)) return t.substring(0, 5);
    return '00:00';
  }
  if (typeof t === 'object' && typeof t.getTime === 'function') {
    return `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`;
  }
  return '00:00';
}

export class BookingsController {
  
  static async getBookings(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      const { salon_id, date, status, staff_id, user_id: query_user_id } = req.query;

      if (salon_id) {
        // Salon filtered
        const whereClause: any = { salon_id: salon_id as string };
        if (date) whereClause.booking_date = new Date(date as string);
        if (status) whereClause.status = status;
        if (staff_id) whereClause.staff_id = staff_id;
        if (query_user_id) whereClause.user_id = query_user_id as string;

        const bookings = await prisma.booking.findMany({
          where: whereClause,
          include: { 
            service: true, 
            staff: true, 
            salon: { select: { name: true, address: true, city: true } },
            user: { select: { email: true, profile: true } },
            platformPayments: { take: 1, orderBy: { created_at: 'desc' } }
          },
          orderBy: [{ booking_date: 'desc' }, { booking_time: 'desc' }]
        });
        const mapped = bookings.map(b => ({ ...b, booking_time: formatBookingTime(b.booking_time) }));
        return res.json({ bookings: mapped });
      } else {
        // User's own bookings
        const bookings = await prisma.booking.findMany({
          where: { user_id },
          include: { 
            service: true, 
            staff: true,
            salon: { select: { name: true, address: true, city: true, phone: true } },
            platformPayments: { take: 1, orderBy: { created_at: 'desc' } }
          },
          orderBy: [{ booking_date: 'desc' }, { booking_time: 'desc' }]
        });
        const mapped = bookings.map(b => ({ ...b, booking_time: formatBookingTime(b.booking_time) }));
        return res.json({ bookings: mapped });
      }
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch bookings', detail: error.message });
    }
  }

  static async getBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user_id = req.user?.user_id;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          service: true,
          salon: true,
          user: { include: { profile: true } },
          staff: true
        }
      });

      if (!booking) return res.status(404).json({ error: 'Booking not found' });

      const isOwner = booking.user_id === user_id;
      let hasAccess = isOwner;

      if (!hasAccess) {
        const role = await prisma.userRole.findFirst({ where: { user_id, salon_id: booking.salon_id } });
        if (role) hasAccess = true;
      }

      if (!hasAccess) return res.status(403).json({ error: 'Forbidden' });

      res.json({ booking: { ...booking, booking_time: formatBookingTime(booking.booking_time) } });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch booking' });
    }
  }

  static async createBooking(req: Request, res: Response) {
    try {
      const authUserId = req.user?.user_id;
      const data = req.body;

      if (!data.salon_id || !data.service_id || !data.booking_date || !data.booking_time) {
         return res.status(400).json({ error: 'Missing required booking fields' });
      }

      // Allow owner/manager to create booking for a different user (walk-in customer)
      let targetUserId = authUserId;
      if (data.user_id && data.user_id !== authUserId) {
        const role = await prisma.userRole.findFirst({
          where: { user_id: authUserId, salon_id: data.salon_id, role: { in: ['owner', 'manager'] } }
        });
        if (role) {
          targetUserId = data.user_id;
        }
      }

      if (data.staff_id) {
        const existing = await prisma.booking.findFirst({
          where: { 
            staff_id: data.staff_id,
            booking_date: new Date(data.booking_date),
            booking_time: new Date(`1970-01-01T${data.booking_time}Z`),
            status: { not: 'cancelled' }
          }
        });
        if (existing) {
          return res.status(409).json({ error: 'Specialist is already booked for this time.' });
        }
      }

      // Handle Points & Coins if use_coins is true
      let coinsToUse = 0;
      let loyaltyPointsToUse = 0;
      let coinCurrencyValue = 0;
      const coinPrice = 0.01; // Example: $0.01 per coin/point

      if (data.use_coins) {
        const coinBalance = await prisma.coinTransaction.aggregate({
          _sum: { amount: true }, where: { user_id: targetUserId }
        });
        const cBal = Number(coinBalance._sum.amount || 0);

        const loyaltyBalance = await prisma.loyaltyTransaction.aggregate({
          _sum: { points: true }, where: { user_id: targetUserId, salon_id: data.salon_id }
        });
        const lBal = Number(loyaltyBalance._sum.points || 0);

        const totalAvailable = cBal + lBal;

        if (totalAvailable > 0) {
          const service = await prisma.service.findUnique({ where: { id: data.service_id } });
          const basePrice = Number(service?.price || 0);
          const maxDiscount = basePrice; 
          const pointsNeeded = Math.ceil(maxDiscount / coinPrice);

          coinsToUse = Math.min(cBal, pointsNeeded);
          const remainingNeeded = pointsNeeded - coinsToUse;
          loyaltyPointsToUse = Math.min(lBal, remainingNeeded);

          coinCurrencyValue = (coinsToUse + loyaltyPointsToUse) * coinPrice;

          if (coinsToUse > 0) {
            await prisma.coinTransaction.create({
              data: { user_id: targetUserId!, amount: -coinsToUse, transaction_type: 'spent', description: 'Booking payment' }
            });
          }
          if (loyaltyPointsToUse > 0) {
            await prisma.loyaltyTransaction.create({
              data: { user_id: targetUserId!, salon_id: data.salon_id, points: -loyaltyPointsToUse, transaction_type: 'redeemed', description: 'Booking payment' }
            });
          }
        }
      }

      const finalPrice = Math.max((data.price_paid || 0) - coinCurrencyValue, 0);

      const booking = await prisma.booking.create({
        data: {
          user_id: targetUserId!,
          salon_id: data.salon_id,
          service_id: data.service_id,
          staff_id: data.staff_id,
          booking_date: new Date(data.booking_date),
          booking_time: new Date(`1970-01-01T${data.booking_time}Z`),
          price_paid: finalPrice,
          coins_used: coinsToUse,
          coin_currency_value: coinCurrencyValue,
          discount_amount: data.discount_amount || 0,
          coupon_code: data.coupon_code,
          notes: data.notes,
          status: data.status || 'pending'
        },
        include: { service: true, salon: true }
      });

      // Notify owner
      const ownerRole = await prisma.userRole.findFirst({ where: { salon_id: data.salon_id, role: 'owner' } });
      if (ownerRole) {
        await prisma.notification.create({
          data: {
            user_id: ownerRole.user_id,
            title: data.staff_id ? 'New Appointment' : 'Staff Assignment Required',
            body: `New session booked for ${booking.service.name}.`,
            type: 'booking',
            link: `/salon/bookings`
          }
        });
      }

      // Auto-create PlatformPayment if booking is completed (invoice)
      let platformPayment = null;
      if (booking.status === 'completed') {
        platformPayment = await prisma.platformPayment.create({
          data: {
            user_id: targetUserId!,
            booking_id: booking.id,
            salon_id: data.salon_id,
            amount: finalPrice,
            currency: 'MYR',
            status: 'completed',
            payment_method: data.payment_method || 'Cash',
            transaction_id: generateInvoiceNumber(),
            invoice_number: generateInvoiceNumber(),
            invoice_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/invoices/${booking.id}`,
            paid_at: new Date()
          }
        });
      }

      res.status(201).json({ message: 'Booking created successfully', booking: { ...booking, booking_time: formatBookingTime(booking.booking_time) }, platformPayment });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create booking', detail: error.message });
    }
  }

  static async updateBookingStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, staff_id } = req.body;
      const user_id = req.user?.user_id;

      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking) return res.status(404).json({ error: 'Booking not found' });

      const isOwner = booking.user_id === user_id;

      if (isOwner && status !== 'cancelled' && req.user?.role === 'customer') {
        return res.status(403).json({ error: 'Customers can only cancel.' });
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: { status: status ?? booking.status, staff_id: staff_id ?? booking.staff_id },
        include: { service: true }
      });

      // Loyalty Points & Coins Earn
      if (status === 'completed' && booking.status !== 'completed') {
        const amount = Number(booking.price_paid || updated.service.price || 0);
        if (amount > 0) {
          // Earn Loyalty
          const program = await prisma.loyaltyProgram.findUnique({ where: { salon_id: booking.salon_id } });
          const pointsRate = Number(program?.points_per_currency_unit || 1);
          const earnedPoints = Math.floor(amount * pointsRate);
          if (earnedPoints > 0) {
            await prisma.loyaltyTransaction.create({
              data: { user_id: booking.user_id, salon_id: booking.salon_id, points: earnedPoints, transaction_type: 'earned', description: 'Booking completed' }
            });
          }

          // Earn Coins
          const earningRate = 10; // e.g. 1 coin per 10 currency
          const coinsEarned = Math.ceil(amount / earningRate);
          if (coinsEarned > 0) {
            await prisma.coinTransaction.create({
              data: { user_id: booking.user_id, amount: coinsEarned, transaction_type: 'earned', description: 'Booking completed' }
            });
          }
        }
      }

      // Auto-create PlatformPayment if booking completed (invoice)
      if (status === 'completed' && booking.status !== 'completed') {
        const existingPP = await prisma.platformPayment.findFirst({ where: { booking_id: id } });
        if (!existingPP) {
          await prisma.platformPayment.create({
            data: {
              user_id: booking.user_id,
              booking_id: booking.id,
              salon_id: booking.salon_id,
              amount: Number(booking.price_paid || updated.service?.price || 0),
              currency: 'MYR',
              status: 'completed',
              payment_method: 'Cash',
              transaction_id: generateInvoiceNumber(),
              invoice_number: generateInvoiceNumber(),
              paid_at: new Date()
            }
          });
        }
      }

      // Cancel Notification
      if (status === 'cancelled' && isOwner) {
        const ownerRole = await prisma.userRole.findFirst({ where: { salon_id: booking.salon_id, role: 'owner' } });
        if (ownerRole) {
          await prisma.notification.create({
            data: { user_id: ownerRole.user_id, title: 'Appointment Cancelled', body: 'A booking has been cancelled.', type: 'booking', link: `/salon/bookings` }
          });
        }
      }

      res.json({ message: 'Booking updated', booking: { ...updated, booking_time: formatBookingTime(updated.booking_time) } });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update booking status' });
    }
  }

  static async addPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const user_id = req.user?.user_id;

      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking) return res.status(404).json({ error: 'Booking not found' });

      // Ensure user has access
      const isOwner = booking.user_id === user_id;
      let hasAccess = isOwner;
      if (!hasAccess) {
        const role = await prisma.userRole.findFirst({ where: { user_id, salon_id: booking.salon_id } });
        if (role) hasAccess = true;
      }
      if (!hasAccess) return res.status(403).json({ error: 'Forbidden' });

      const updated = await prisma.booking.update({
        where: { id },
        data: { price_paid: { increment: amount } }
      });

      res.json({ message: 'Payment added', booking: { ...updated, booking_time: formatBookingTime(updated.booking_time) } });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to add payment' });
    }
  }

  // ──────────────────────────────────────────
  // REVIEWS
  // ──────────────────────────────────────────

  static async getReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const review = await prisma.review.findUnique({ where: { booking_id: id } });
      res.json({ review });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch review' });
    }
  }

  static async submitReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user_id = req.user?.user_id;
      const { rating, comment } = req.body;

      const booking = await prisma.booking.findFirst({ where: { id, user_id } });
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      if (booking.status !== 'completed') return res.status(400).json({ error: 'Can only review completed bookings' });

      const review = await prisma.review.create({
        data: {
          booking_id: id,
          user_id: user_id!,
          salon_id: booking.salon_id,
          rating: parseInt(rating) || 5,
          comment
        }
      });
      res.status(201).json({ success: true, message: 'Review submitted', review });
    } catch (error: any) {
      if (error.code === 'P2002') return res.status(409).json({ error: 'Review already submitted' });
      res.status(500).json({ error: 'Failed to submit review' });
    }
  }

  static async updateReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user_id = req.user?.user_id;
      const { rating, comment } = req.body;

      const review = await prisma.review.findUnique({ where: { booking_id: id } });
      if (!review) return res.status(404).json({ error: 'Review not found' });
      if (review.user_id !== user_id) return res.status(403).json({ error: 'Forbidden' });

      await prisma.review.update({
        where: { id: review.id },
        data: { rating: parseInt(rating) || 5, comment }
      });
      res.json({ success: true, message: 'Review updated' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update review' });
    }
  }
}
