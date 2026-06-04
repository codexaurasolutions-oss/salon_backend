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
}
