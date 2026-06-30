import { Request, Response } from 'express';
import { prisma } from '../server';

export class ServicesController {
  
  static async getServicesBySalon(req: Request, res: Response) {
    try {
      const salon_id = (req.params.salon_id || req.query.salon_id) as string;
      const featured = req.query.featured === '1';

      let whereClause: any = { is_active: true };
      if (salon_id) whereClause.salon_id = salon_id;
      // Note: If featured logic was in DB, add it to whereClause. For now we just return all matching.

      const services = await prisma.service.findMany({
        where: whereClause
      });
      res.json({ services });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const services = await prisma.service.findMany({
        where: { is_active: true },
        select: { category: true },
        distinct: ['category']
      });
      const categories = services.map((s: { category: string | null }) => s.category).filter(Boolean);
      res.json({ categories });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  static async getServiceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await prisma.service.findUnique({
        where: { id },
        include: { salon: true }
      });
      if (!service) return res.status(404).json({ error: 'Service not found' });
      
      const formattedService = {
        ...service,
        salon_name: service.salon?.name,
        salon_address: service.salon?.address,
        salon_city: service.salon?.city,
        salon_logo_url: service.salon?.logo_url,
        salon_phone: service.salon?.phone,
        salon_email: service.salon?.email,
        salon_pincode: service.salon?.pincode,
      };

      res.json({ service: formattedService });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch service' });
    }
  }

  static async addService(req: Request, res: Response) {
    try {
      const salon_id = req.params.salon_id || req.body.salon_id;
      const data = req.body;

      if (!salon_id) {
        return res.status(400).json({ error: 'salon_id is required' });
      }

      const service = await prisma.service.create({
        data: {
          salon_id,
          name: data.name,
          description: data.description,
          price: data.price,
          duration_minutes: data.duration_minutes,
          category: data.category,
          image_url: data.image_url || null,
          is_active: data.is_active ?? true
        }
      });
      res.status(201).json({ message: 'Service added successfully', service });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to add service' });
    }
  }

  static async updateService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const service = await prisma.service.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          duration_minutes: data.duration_minutes,
          category: data.category,
          is_active: data.is_active
        }
      });
      res.json({ message: 'Service updated successfully', service });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update service' });
    }
  }

  static async deleteService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.service.delete({ where: { id } });
      res.json({ message: 'Service removed successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete service' });
    }
  }
}
