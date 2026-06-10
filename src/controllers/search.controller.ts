import { Request, Response } from 'express';
import { prisma } from '../server';

export class SearchController {
  
  static async searchSalons(req: Request, res: Response) {
    try {
      const { q, city, category } = req.query;
      
      const filters: any = { is_active: true, approval_status: 'approved' };
      
      if (q) {
          filters.OR = [
              { name: { contains: String(q) } },
              { description: { contains: String(q) } }
          ];
      }
      
      if (city) {
          filters.city = { contains: String(city) };
      }

      const salons = await prisma.salon.findMany({
          where: filters,
          include: {
              services: category ? { where: { category: String(category) } } : false
          }
      });

      res.json({ results: salons });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to perform search' });
    }
  }

  static async dashboardSearch(req: Request, res: Response) {
    try {
      const { q, salon_id } = req.query;
      
      if (!q || typeof q !== 'string' || q.length < 2 || !salon_id) {
          return res.json({ customers: [], appointments: [], services: [] });
      }

      const bookingsForCustomers = await prisma.booking.findMany({
          where: {
              salon_id: String(salon_id),
              OR: [
                  { user: { profile: { full_name: { contains: String(q) } } } },
                  { user: { email: { contains: String(q) } } },
                  { user: { profile: { phone: { contains: String(q) } } } },
                  { notes: { contains: String(q) } }
              ]
          },
          include: { user: { include: { profile: true } } },
          distinct: ['user_id'],
          take: 5
      });

      const customers = bookingsForCustomers
        .map(b => ({
          id: b.user_id,
          name: b.notes || b.user?.profile?.full_name || 'Unknown',
          email: b.user?.email || ''
      }));

      const services = await prisma.service.findMany({
          where: {
              salon_id: String(salon_id),
              OR: [
                  { name: { contains: String(q) } }
              ]
          },
          take: 5
      });

      const appointments = await prisma.booking.findMany({
          where: {
              salon_id: String(salon_id),
              OR: [
                  { user: { profile: { full_name: { contains: String(q) } } } },
                  { user: { profile: { phone: { contains: String(q) } } } },
                  { notes: { contains: String(q) } },
                  { service: { name: { contains: String(q) } } }
              ]
          },
          include: {
              user: { include: { profile: true } },
              service: true
          },
          take: 5
      });

      const formattedAppointments = appointments.map(apt => ({
          id: apt.id,
          customer_name: apt.notes || apt.user?.profile?.full_name || 'Walk-in',
          service_name: apt.service?.name,
          date: apt.booking_time
      }));

      res.json({
          customers,
          services,
          appointments: formattedAppointments
      });
    } catch (error: any) {
        console.error('Dashboard Search Error:', error);
        res.status(500).json({ error: 'Failed to perform dashboard search' });
    }
  }
}
