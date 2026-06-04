import { Request, Response } from 'express';
import { prisma } from '../server';

export class ProductPurchasesController {
  
  static async getPurchases(req: Request, res: Response) {
    try {
      const salon_id = (req.query.salon_id || req.body.salon_id) as string;
      const purchases = await prisma.productPurchase.findMany({
        where: { salon_id },
        orderBy: { created_at: 'desc' },
        include: { product: true }
      });
      res.json({ purchases });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch product purchases' });
    }
  }

  static async recordPurchase(req: Request, res: Response) {
    try {
      const { product_id, quantity, total_price } = req.body;
      const salon_id = (req.body.salon_id || req.query.salon_id) as string;
      const purchase = await prisma.productPurchase.create({
        data: { salon_id, product_id, quantity, total_price, status: 'completed' }
      });
      res.status(201).json({ message: 'Purchase recorded', data: purchase });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to record purchase' });
    }
  }
}
