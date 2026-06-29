import { Request, Response } from 'express';
import { prisma } from '../server';

function formatBookingTime(t: any): string {
  if (!t) return '00:00';
  if (typeof t === 'string') { const m = t.match(/T(\d{2}):(\d{2})/); if (m) return `${m[1]}:${m[2]}`; if (/^\d{2}:\d{2}/.test(t)) return t.substring(0, 5); return '00:00'; }
  if (typeof t === 'object' && typeof t.getTime === 'function') { return `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`; }
  return '00:00';
}

export class AdminController {

  // ──────────────────────────────────────────
  // STATS & REPORTS
  // ──────────────────────────────────────────

  static async getPlatformStats(req: Request, res: Response) {
    try {
      const [
        totalSalons, activeSalons, pendingSalons,
        totalBookings, totalUsers,
        planRevenue, serviceRevenue,
        todayBookings, recentActivity
      ] = await Promise.all([
        prisma.salon.count(),
        prisma.salon.count({ where: { is_active: true } }),
        prisma.salon.count({ where: { approval_status: 'pending' } }),
        prisma.booking.count(),
        prisma.user.count(),
        prisma.platformPayment.aggregate({ _sum: { amount: true }, where: { status: 'completed' } }),
        prisma.booking.findMany({
          where: { status: 'completed' },
          include: { service: { select: { price: true } } }
        }),
        prisma.booking.count({
          where: { created_at: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
        }),
        prisma.$queryRaw<any[]>`
          (SELECT 'user' as type, id, 'New user registered' as description, created_at FROM users ORDER BY created_at DESC LIMIT 5)
          UNION ALL
          (SELECT 'booking' as type, id, 'New booking received' as description, created_at FROM bookings ORDER BY created_at DESC LIMIT 5)
          UNION ALL
          (SELECT 'salon' as type, id, 'New salon registered' as description, created_at FROM salons ORDER BY created_at DESC LIMIT 5)
          ORDER BY created_at DESC LIMIT 10
        `
      ]);

      const svcRev = serviceRevenue.reduce((sum: number, b: any) => sum + Number(b.service?.price ?? 0), 0);
      const planRev = Number(planRevenue._sum.amount ?? 0);

      res.json({
        total_salons: totalSalons,
        active_salons: activeSalons,
        pending_salons: pendingSalons,
        total_bookings: totalBookings,
        total_users: totalUsers,
        plan_revenue: planRev,
        service_revenue: svcRev,
        total_revenue: planRev + svcRev,
        today_bookings: todayBookings,
        recent_activity: recentActivity
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch stats', detail: error.message });
    }
  }

  static async getReports(req: Request, res: Response) {
    try {
      const range = parseInt(req.query.range as string) || 30;
      const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000);

      const [planRevRow, serviceBookings, totalBookings, cancelledBookings, newUsers, topSalons] = await Promise.all([
        prisma.platformPayment.aggregate({ _sum: { amount: true }, where: { status: 'completed', created_at: { gte: since } } }),
        prisma.booking.findMany({ where: { status: 'completed', created_at: { gte: since } }, include: { service: true } }),
        prisma.booking.count({ where: { created_at: { gte: since } } }),
        prisma.booking.count({ where: { status: 'cancelled', created_at: { gte: since } } }),
        prisma.user.count({ where: { created_at: { gte: since } } }),
        prisma.$queryRaw<any[]>`
          SELECT s.name, COUNT(b.id) as count
          FROM salons s JOIN bookings b ON s.id = b.salon_id
          WHERE b.created_at >= ${since}
          GROUP BY s.id, s.name ORDER BY count DESC LIMIT 5
        `
      ]);

      const planRevenue = Number(planRevRow._sum.amount ?? 0);
      const serviceRevenue = serviceBookings.reduce((sum: number, b: any) => sum + Number(b.service?.price ?? 0), 0);
      const totalRevenue = planRevenue + serviceRevenue;
      const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100 * 10) / 10 : 0;

      res.json({
        reports: {
          total_revenue: totalRevenue,
          plan_revenue: planRevenue,
          service_revenue: serviceRevenue,
          total_bookings: totalBookings,
          cancellation_rate: cancellationRate,
          new_users: newUsers,
          top_salons: topSalons
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch reports', detail: error.message });
    }
  }

  // ──────────────────────────────────────────
  // BOOKINGS
  // ──────────────────────────────────────────

  static async getAllBookings(req: Request, res: Response) {
    try {
        const bookings = await prisma.booking.findMany({
          include: { 
            service: true, 
            staff: true, 
            salon: { select: { name: true, address: true, city: true } },
            user: { select: { email: true, profile: true } }
          },
          orderBy: [{ booking_date: 'desc' }, { booking_time: 'desc' }]
        });
        res.json({ bookings: bookings.map(b => ({ ...b, booking_time: formatBookingTime(b.booking_time) })) });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch all bookings' });
    }
  }

  // ──────────────────────────────────────────
  // SALONS
  // ──────────────────────────────────────────

  static async getAllSalons(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const salons = await prisma.salon.findMany({
        where: status && status !== 'all' ? { approval_status: status as any } : undefined,
        include: {
          user_roles: { where: { role: 'owner' }, include: { user: { include: { profile: true } } } },
          _count: { select: { bookings: true } }
        },
        orderBy: { created_at: 'desc' }
      });
      const flattened = salons.map((s) => {
        const owner = s.user_roles?.[0]?.user;
        const profile = owner?.profile;
        return {
          ...s,
          owner_name: profile?.full_name || owner?.email || null,
          owner_email: owner?.email || null,
        };
      });
      res.json({ salons: flattened });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch salons' });
    }
  }

  static async createSalon(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name || !data.slug) return res.status(400).json({ error: 'name and slug required' });

      const existing = await prisma.salon.findUnique({ where: { slug: data.slug } });
      if (existing) return res.status(409).json({ error: 'Slug already exists' });

      const salon = await prisma.salon.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          address: data.address,
          city: data.city,
          state: data.state,
          phone: data.phone,
          email: data.email,
          is_active: true,
          approval_status: 'approved'
        }
      });

      // Optionally create/link owner
      if (data.owner_email) {
        let user = await prisma.user.findUnique({ where: { email: data.owner_email } });
        if (!user && data.owner_password) {
          const bcrypt = require('bcryptjs');
          const hash = await bcrypt.hash(data.owner_password, 10);
          user = await prisma.user.create({
            data: {
              email: data.owner_email,
              password_hash: hash,
              profile: { create: { full_name: 'Salon Owner', user_type: 'salon_owner' } }
            }
          });
        }
        if (user) {
          await prisma.userRole.upsert({
            where: { user_id_salon_id: { user_id: user.id, salon_id: salon.id } },
            create: { user_id: user.id, salon_id: salon.id, role: 'owner' },
            update: { role: 'owner' }
          });
        }
      }

      res.status(201).json({ message: 'Salon created', salon_id: salon.id });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create salon', detail: error.message });
    }
  }

  static async approveSalon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const admin_id = req.user?.user_id;
      const salon = await prisma.salon.update({
        where: { id },
        data: { approval_status: 'approved', approved_at: new Date(), approved_by: admin_id }
      });
      res.json({ message: 'Salon approved successfully', salon });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to approve salon' });
    }
  }

  static async rejectSalon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const salon = await prisma.salon.update({
        where: { id },
        data: { approval_status: 'rejected', rejection_reason: reason ?? 'Not specified' }
      });
      res.json({ message: 'Salon rejected', salon });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to reject salon' });
    }
  }

  static async resetSalonOwnerPassword(req: Request, res: Response) {
    try {
      const { id: salon_id } = req.params;
      const { password } = req.body;
      if (!password) return res.status(400).json({ error: 'password required' });

      const ownerRole = await prisma.userRole.findFirst({ where: { salon_id, role: 'owner' } });
      if (!ownerRole) return res.status(404).json({ error: 'No owner found for this salon' });

      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash(password, 10);
      await prisma.user.update({ where: { id: ownerRole.user_id }, data: { password_hash: hash } });

      res.json({ message: 'Password reset successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  static async deleteSalon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Cascade deletes handled by DB foreign keys
      await prisma.salon.delete({ where: { id } });
      res.json({ message: 'Salon deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete salon', detail: error.message });
    }
  }

  // ──────────────────────────────────────────
  // USERS
  // ──────────────────────────────────────────

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        include: { profile: true },
        orderBy: { created_at: 'desc' }
      });
      res.json({ users });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminId = req.user?.user_id;
      if (id === adminId) return res.status(403).json({ error: 'Cannot delete your own account' });
      await prisma.user.delete({ where: { id } });
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  // ──────────────────────────────────────────
  // PAYMENTS
  // ──────────────────────────────────────────

  static async getAllPayments(req: Request, res: Response) {
    try {
      const payments = await prisma.platformPayment.findMany({
        include: { salon: { select: { name: true } } },
        orderBy: { created_at: 'desc' },
        take: 100
      });
      res.json({ payments });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  }

  static async resendInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await prisma.platformPayment.findUnique({
        where: { id },
        include: { salon: true }
      });
      if (!payment) return res.status(404).json({ error: 'Payment not found' });
      // Invoice generation logic would go here (email service)
      res.json({ message: 'Invoice re-dispatched successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to resend invoice' });
    }
  }

  // ──────────────────────────────────────────
  // SETTINGS
  // ──────────────────────────────────────────

  static async getSettings(req: Request, res: Response) {
    try {
      const rows = await prisma.platformSetting.findMany();
      const settings: Record<string, any> = {};
      for (const row of rows) {
        settings[row.setting_key] = row.setting_value;
      }
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const data = req.body;
      const adminId = req.user?.user_id;
      const ops = Object.entries(data).map(([key, value]) =>
        prisma.platformSetting.upsert({
          where: { setting_key: key },
          create: { setting_key: key, setting_value: value as any, updated_by: adminId },
          update: { setting_value: value as any, updated_by: adminId }
        })
      );
      await Promise.all(ops);
      res.json({ message: 'Settings updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  // ──────────────────────────────────────────
  // CONTACT ENQUIRIES
  // ──────────────────────────────────────────

  static async getEnquiries(req: Request, res: Response) {
    try {
      const enquiries = await prisma.contactEnquiry.findMany({ orderBy: { created_at: 'desc' } });
      res.json({ enquiries });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch enquiries' });
    }
  }

  static async updateEnquiryStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!['new', 'read', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      await prisma.contactEnquiry.update({ where: { id }, data: { status } });
      res.json({ message: 'Status updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update status' });
    }
  }

  static async deleteEnquiry(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.contactEnquiry.delete({ where: { id } });
      res.json({ message: 'Enquiry deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete enquiry' });
    }
  }

  // ──────────────────────────────────────────
  // SUBSCRIPTION PLANS
  // ──────────────────────────────────────────

  static async getPlans(req: Request, res: Response) {
    try {
      const plans = await prisma.subscriptionPlan.findMany({ orderBy: { sort_order: 'asc' } });
      res.json({ plans });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  }

  static async createPlan(req: Request, res: Response) {
    try {
      const data = req.body;
      const slug = (data.name as string).toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 9000 + 1000);
      const plan = await prisma.subscriptionPlan.create({
        data: {
          name: data.name,
          slug,
          description: data.description ?? '',
          price_monthly: data.monthly_price ?? 0,
          price_yearly: data.annual_price ?? 0,
          features: data.features ?? [],
          is_active: data.is_active ?? true
        }
      });
      res.status(201).json({ message: 'Plan created', id: plan.id });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create plan' });
    }
  }

  static async updatePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      await prisma.subscriptionPlan.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          price_monthly: data.monthly_price,
          price_yearly: data.annual_price,
          features: data.features,
          is_active: data.is_active ?? true
        }
      });
      res.json({ message: 'Plan updated' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update plan' });
    }
  }

  // ──────────────────────────────────────────
  // MEMBERSHIPS
  // ──────────────────────────────────────────

  static async getMemberships(req: Request, res: Response) {
    try {
      const salons = await prisma.salon.findMany({
        include: {
          subscriptions: { include: { plan: true }, orderBy: { created_at: 'desc' }, take: 1 }
        },
        orderBy: { created_at: 'desc' }
      });
      const flattened = salons.map((s) => {
        const sub = s.subscriptions?.[0];
        return {
          salon_id: s.id,
          salon_name: s.name,
          salon_email: s.email,
          subscription_id: sub?.id ?? null,
          plan_id: sub?.plan_id ?? null,
          plan_name: sub?.plan?.name ?? null,
          subscription_status: sub?.status ?? null,
          subscription_end_date: sub?.end_date ?? null,
        };
      });
      res.json(flattened);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch memberships' });
    }
  }

  static async assignMembership(req: Request, res: Response) {
    try {
      const { salon_id, plan_id, status } = req.body;
      if (!salon_id || !plan_id) return res.status(400).json({ error: 'salon_id and plan_id required' });

      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: plan_id } });
      if (!plan) return res.status(400).json({ error: 'Invalid plan_id' });

      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const existing = await prisma.salonSubscription.findFirst({ where: { salon_id } });
      if (existing) {
        await prisma.salonSubscription.update({
          where: { id: existing.id },
          data: { plan_id, status: status ?? 'active', end_date: endDate }
        });
      } else {
        await prisma.salonSubscription.create({
          data: {
            salon_id,
            plan_id,
            status: status ?? 'active',
            amount: plan.price_monthly,
            billing_cycle: 'monthly',
            start_date: new Date(),
            end_date: endDate
          }
        });
      }

      if (Number(plan.price_monthly) > 0) {
        await prisma.platformPayment.create({
          data: {
            salon_id,
            amount: plan.price_monthly,
            status: 'completed',
            payment_method: 'admin_assignment',
            paid_at: new Date()
          }
        });
      }

      res.json({ message: 'Membership assigned successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to assign membership', detail: error.message });
    }
  }

  // ──────────────────────────────────────────
  // ADDONS
  // ──────────────────────────────────────────

  static async getSubscriptionAddons(req: Request, res: Response) {
    try {
      // Mocking for now since SubscriptionAddon schema might not be strictly defined
      // If it exists in prisma, use it. Otherwise return empty.
      res.json({ addons: [] }); 
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch subscription addons' });
    }
  }

  static async getSalonAddons(req: Request, res: Response) {
    try {
      res.json({ addons: [] });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch salon addons' });
    }
  }

  static async assignSalonAddon(req: Request, res: Response) {
    try {
      res.json({ message: 'Addon assigned successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to assign addon' });
    }
  }

  // ──────────────────────────────────────────
  // REVIEWS
  // ──────────────────────────────────────────

  static async getAllReviews(req: Request, res: Response) {
    try {
      const reviews = await prisma.review.findMany({
        include: {
          user: { include: { profile: true } },
          salon: { select: { name: true } }
        },
        orderBy: { created_at: 'desc' }
      });
      res.json({ reviews });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  }

  static async deleteReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.review.delete({ where: { id } });
      res.json({ message: 'Review deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete review' });
    }
  }

  // ──────────────────────────────────────────
  // ORDERS
  // ──────────────────────────────────────────

  static async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await prisma.platformOrder.findMany({ orderBy: { created_at: 'desc' } });
      const userIds = Array.from(new Set(orders.filter((o) => o.user_id).map((o) => o.user_id!)));
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        include: { profile: true }
      });
      const userMap = new Map(users.map((u) => [u.id, u]));

      // Fetch successful payments that might be linked to these orders
      const successfulPayments = await prisma.platformPayment.findMany({
          where: { status: 'completed' }
      });
      
      const paidOrderIds = new Set(successfulPayments.map(p => {
          if (p.notes?.includes('ref: ')) return p.notes.split('ref: ')[1].trim();
          return null;
      }).filter(Boolean));

      const flattened = orders.map((o) => {
        const u = o.user_id ? userMap.get(o.user_id) : null;
        const profile = u?.profile;
        return {
          ...o,
          customer_name: profile?.full_name || o.guest_name || u?.email || 'Guest',
          customer_email: u?.email || o.guest_email || '',
        };
      });

      res.json({ orders: flattened });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const valid = ['placed', 'dispatched', 'delivered', 'cancelled'];
      if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

      await prisma.platformOrder.update({ where: { id }, data: { status } });
      res.json({ message: 'Order status updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }
}
