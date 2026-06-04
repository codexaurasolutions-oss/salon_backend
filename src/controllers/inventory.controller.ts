import { Request, Response } from 'express';
import { prisma } from '../server';

export class InventoryController {
  
  static async getInventory(req: Request, res: Response) {
    try {
      const salon_id = (req.query.salon_id || req.body.salon_id) as string;
      const items = await prisma.inventoryItem.findMany({
        where: { salon_id },
        orderBy: { name: 'asc' }
      });
      res.json({ items });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  }

  static async addInventoryItem(req: Request, res: Response) {
    try {
      const salon_id = (req.body.salon_id || req.query.salon_id) as string;
      const { name, sku, stock, price } = req.body;
      const item = await prisma.inventoryItem.create({
        data: { salon_id, name, sku, stock, price }
      });
      res.status(201).json({ message: 'Item added to inventory', data: item });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to add inventory item' });
    }
  }

  static async updateInventoryItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, sku, stock, price } = req.body;
      const item = await prisma.inventoryItem.update({
        where: { id },
        data: { name, sku, stock, price }
      });
      res.json({ message: 'Inventory updated', data: item });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update inventory item' });
    }
  }

  static async deleteInventoryItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.inventoryItem.delete({ where: { id } });
      res.json({ message: 'Item deleted' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete inventory item' });
    }
  }
}
