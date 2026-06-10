import { Request, Response } from 'express';
import { prisma } from '../server';

const defaultBusinessHours = {
  monday: { open: '11:00', close: '23:00', closed: false },
  tuesday: { open: '11:00', close: '23:00', closed: false },
  wednesday: { open: '11:00', close: '23:00', closed: false },
  thursday: { open: '11:00', close: '23:00', closed: false },
  friday: { open: '11:00', close: '23:00', closed: false },
  saturday: { open: '11:00', close: '23:00', closed: false },
  sunday: { open: '11:00', close: '23:00', closed: false },
};

const withDefaultBusinessHours = <T extends { business_hours?: unknown }>(salon: T) => ({
  ...salon,
  business_hours: salon.business_hours || defaultBusinessHours,
});

export class SalonsController {
  
  static async getAllSalons(req: Request, res: Response) {
    try {
      const salons = await prisma.salon.findMany({
        where: { is_active: true, approval_status: 'approved' },
        include: { services: true }
      });
      res.json({ salons: salons.map(withDefaultBusinessHours) });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch salons' });
    }
  }

  static async getMySalons(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      const userRoles = await prisma.userRole.findMany({
        where: { user_id: userId, role: { in: ['owner', 'manager'] } },
        include: { salon: true }
      });

      const salons = userRoles.map(ur => withDefaultBusinessHours(ur.salon));
      res.json({ salons });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch your salons' });
    }
  }

  static async getSalonById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const salon = await prisma.salon.findUnique({
        where: { id },
        include: { services: true, staff_profiles: true, customer_profiles: true }
      });

      if (!salon) return res.status(404).json({ error: 'Salon not found' });
      res.json({ salon: withDefaultBusinessHours(salon) });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch salon' });
    }
  }

  static async updateSalon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.state !== undefined) updateData.state = data.state;
      if (data.pincode !== undefined) updateData.pincode = data.pincode;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.gst_number !== undefined) updateData.gst_number = data.gst_number;
      if (data.logo_url !== undefined) updateData.logo_url = data.logo_url;
      if (data.logo_public_id !== undefined) updateData.logo_public_id = data.logo_public_id;
      if (data.cover_image_url !== undefined) updateData.cover_image_url = data.cover_image_url;
      if (data.cover_image_public_id !== undefined) updateData.cover_image_public_id = data.cover_image_public_id;
      if (data.business_hours !== undefined) updateData.business_hours = data.business_hours;
      if (data.tax_settings !== undefined) updateData.tax_settings = data.tax_settings;
      if (data.notification_settings !== undefined) updateData.notification_settings = data.notification_settings;
      if (data.upi_id !== undefined) updateData.upi_id = data.upi_id;
      if (data.bank_details !== undefined) updateData.bank_details = data.bank_details;

      const salon = await prisma.salon.update({
        where: { id },
        data: updateData
      });
      
      res.json({ message: 'Salon updated successfully', salon: withDefaultBusinessHours(salon) });
    } catch (error: any) {
      console.error('Update salon error:', error);
      res.status(500).json({ error: 'Failed to update salon' });
    }
  }

  static async createSalon(req: Request, res: Response) {
    try {
      const data = req.body;
      const owner_id = data.owner_id;

      if (!owner_id) {
          return res.status(400).json({ error: 'owner_id is required' });
      }

      const salon = await prisma.$transaction(async (tx) => {
          const newSalon = await tx.salon.create({
              data: {
                  name: data.name,
                  slug: data.slug,
                  description: data.description,
                  address: data.address,
                  city: data.city,
                  state: data.state,
                  pincode: data.pincode,
              phone: data.phone,
              email: data.email,
              logo_url: data.logo_url,
              cover_image_url: data.cover_image_url,
              business_hours: data.business_hours || defaultBusinessHours,
              is_active: data.is_active ?? true,
              approval_status: data.approval_status ?? 'pending'
              }
          });

          await tx.userRole.create({
              data: {
                  user_id: owner_id,
                  salon_id: newSalon.id,
                  role: 'owner'
              }
          });

          return newSalon;
      });

      res.status(201).json({ message: 'Salon created successfully', salon });
    } catch (error: any) {
      console.error('Create salon error:', error);
      res.status(500).json({ error: 'Failed to create salon' });
    }
  }

  static async getAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const salon = await prisma.salon.findUnique({ where: { id } });
      if (!salon) return res.status(404).json({ error: 'Salon not found' });

      // 1. Revenue Monthly - completed bookings grouped by month
      const completedBookings = await prisma.booking.findMany({
        where: { salon_id: id, status: 'completed' },
        include: { service: { select: { price: true, name: true } } }
      });

      const revenueMap: Record<string, { revenue: number; profit: number }> = {};
      completedBookings.forEach((b: any) => {
        const key = b.created_at.toISOString().slice(0, 7);
        const price = Number(b.price_paid ?? b.service?.price ?? 0);
        const commission = price * 0.3;
        if (!revenueMap[key]) revenueMap[key] = { revenue: 0, profit: 0 };
        revenueMap[key].revenue += price;
        revenueMap[key].profit += commission;
      });

      const revenue_monthly = Object.entries(revenueMap)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // 2. Popular Treatments - service usage count
      const serviceCount: Record<string, { name: string; count: number; total_earned: number; total_profit: number }> = {};
      completedBookings.forEach((b: any) => {
        const sId = b.service_id || 'unknown';
        const name = b.service?.name || 'Unknown';
        const price = Number(b.price_paid ?? b.service?.price ?? 0);
        if (!serviceCount[sId]) serviceCount[sId] = { name, count: 0, total_earned: 0, total_profit: 0 };
        serviceCount[sId].count += 1;
        serviceCount[sId].total_earned += price;
        serviceCount[sId].total_profit += price * 0.3;
      });
      const popular_treatments = Object.values(serviceCount).sort((a, b) => b.count - a.count);

      // 3. Customer Ratio - new vs returning
      const customerBookings = await prisma.booking.findMany({
        where: { salon_id: id },
        select: { user_id: true, created_at: true }
      });
      const firstBookingMap: Record<string, Date> = {};
      customerBookings.forEach((b: any) => {
        if (!firstBookingMap[b.user_id] || b.created_at < firstBookingMap[b.user_id]) {
          firstBookingMap[b.user_id] = b.created_at;
        }
      });
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      let newCount = 0;
      let returningCount = 0;
      Object.values(firstBookingMap).forEach(date => {
        if (date >= thirtyDaysAgo) newCount++;
        else returningCount++;
      });
      const customer_ratio = [
        { type: 'New', customer_count: newCount },
        { type: 'Returning', customer_count: returningCount }
      ];

      // 4. Recent Activity - last 10 bookings with user info
      const recentBookings = await prisma.booking.findMany({
        where: { salon_id: id },
        include: {
          service: { select: { name: true } },
          user: { select: { id: true } }
        },
        orderBy: { created_at: 'desc' },
        take: 10
      });

      const recent_activity = await Promise.all(recentBookings.map(async (b: any) => {
        let full_name = 'Unknown';
        try {
          const profile = await prisma.profile.findFirst({
            where: { user_id: b.user_id },
            select: { full_name: true }
          });
          if (profile?.full_name) full_name = profile.full_name;
        } catch {}
        return {
          full_name,
          service_name: b.service?.name || 'Unknown',
          status: b.status,
          booking_date: b.booking_date?.toISOString?.() || b.created_at.toISOString(),
          created_at: b.created_at.toISOString()
        };
      }));

      res.json({ revenue_monthly, popular_treatments, customer_ratio, recent_activity });
    } catch (error: any) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics', detail: error.message });
    }
  }
}
