import { Request, Response } from 'express';
import { prisma } from '../server';

export class CustomerPurchasesController {
  
  static async getPurchases(req: Request, res: Response) {
    try {
      const salon_id = (req.query.salon_id || req.body.salon_id) as string;
      const user_id = req.query.user_id as string;
      
      const where: any = { salon_id };
      if (user_id) where.user_id = user_id;

      const purchases = await prisma.customerPurchase.findMany({
        where,
        orderBy: { purchase_date: 'desc' }
      });
      res.json({ purchases });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch customer purchases' });
    }
  }

  static async recordPurchase(req: Request, res: Response) {
    try {
      const { user_id, salon_id, product_name, price, purchase_date, inventory_id, quantity = 1 } = req.body;
      
      const purchase = await prisma.customerPurchase.create({
        data: { 
          user_id,
          salon_id,
          product_name,
          price,
          quantity,
          purchase_date: purchase_date ? new Date(purchase_date) : new Date(),
          inventory_id: inventory_id || null
        }
      });

      // Optionally deduct stock if linked to inventory
      if (inventory_id) {
        await prisma.inventoryItem.update({
          where: { id: inventory_id },
          data: { stock: { decrement: quantity } }
        });
      }

      res.status(201).json({ message: 'Customer purchase recorded', data: purchase });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Failed to record customer purchase' });
    }
  }
}
