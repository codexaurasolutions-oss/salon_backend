import { Request, Response } from 'express';
import { prisma } from '../server';

export class SearchController {
  
  static async searchSalons(req: Request, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string' || q.trim().length < 2) {
          return res.json({ suggestions: [], products: [], salons: [], services: [] });
      }

      const queryStr = String(q).trim();

      // 1. Search Salons
      const salons = await prisma.salon.findMany({
          where: {
              is_active: true,
              approval_status: 'approved',
              OR: [
                  { name: { contains: queryStr } },
                  { description: { contains: queryStr } },
                  { city: { contains: queryStr } },
                  { state: { contains: queryStr } }
              ]
          },
          take: 10
      });

      // 2. Search Products
      const products = await prisma.platformProduct.findMany({
          where: {
              is_active: true,
              OR: [
                  { name: { contains: queryStr } },
                  { description: { contains: queryStr } },
                  { category: { contains: queryStr } },
                  { brand: { contains: queryStr } }
              ]
          },
          take: 10
      });

      // 3. Search Services
      const services = await prisma.service.findMany({
          where: {
              is_active: true,
              OR: [
                  { name: { contains: queryStr } },
                  { description: { contains: queryStr } },
                  { category: { contains: queryStr } }
              ]
          },
          include: {
              salon: true
          },
          take: 10
      });

      // Format services to match what frontend expects
      const formattedServices = services.map(srv => ({
          id: srv.id,
          name: srv.name,
          price: srv.price,
          image_url: srv.image_url,
          salon_name: srv.salon?.name || 'Salon'
      }));

      // 4. Generate Suggestions
      const suggestionsSet = new Set<string>();
      
      // Add first few matching salon names
      salons.slice(0, 3).forEach(s => suggestionsSet.add(s.name));
      // Add first few matching product names
      products.slice(0, 3).forEach(p => suggestionsSet.add(p.name));
      // Add first few matching service names
      services.slice(0, 3).forEach(s => suggestionsSet.add(s.name));
      
      const suggestions = Array.from(suggestionsSet).slice(0, 5);

      res.json({
          suggestions,
          products,
          salons,
          services: formattedServices
      });
    } catch (error: any) {
      console.error('Public Search Error:', error);
      res.status(500).json({ error: 'Failed to perform search' });
    }
  }

  static async dashboardSearch(req: Request, res: Response) {
    try {
      const { q, salon_id } = req.query;
      
      if (!q || typeof q !== 'string' || q.length < 2 || !salon_id) {
          return res.json({ suggestions: [], customers: [], appointments: [], services: [] });
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
          orderBy: { booking_date: 'desc' },
          take: 50
      });

      const uniqueCustomersMap = new Map();
      for (const b of bookingsForCustomers) {
          let name = b.user?.profile?.full_name;
          if (b.notes?.includes('Manual Customer:')) {
             const walkInMatch = b.notes.match(/(?:Walk-in|Manual Customer):\s*([^|,#\n]+)/);
             if (walkInMatch && walkInMatch[1].trim()) name = walkInMatch[1].trim();
             else name = b.notes;
          }
          if (!name) name = b.user?.email || 'Unknown';
          
          const email = b.user?.email || '';
          const key = name.toLowerCase() + email.toLowerCase();
          
          if (!uniqueCustomersMap.has(key)) {
              uniqueCustomersMap.set(key, {
                  id: b.user_id,
                  name,
                  email
              });
          }
      }

      const customers = Array.from(uniqueCustomersMap.values()).slice(0, 5);

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
          suggestions: [],
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
