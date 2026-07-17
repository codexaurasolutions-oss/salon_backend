import { Request, Response } from 'express';
import { prisma } from '../server';
import { EmailService } from '../services/email.service';

export class OrdersController {
  
  static async getMyOrders(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      const orders = await prisma.platformOrder.findMany({
        where: { user_id },
        orderBy: { created_at: 'desc' }
      });
      res.json({ orders });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  static async createOrder(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      if (!user_id) {
        return res.status(401).json({ error: 'Login required to place an order' });
      }

      const { guest_name, guest_email, items, shipping_address, total_amount, email, firstName, lastName } = req.body;
      const normalizedGuestName = guest_name || [firstName, lastName].filter(Boolean).join(' ').trim() || null;
      let normalizedGuestEmail = guest_email || email || null;

      if (!normalizedGuestEmail && user_id) {
        const user = await prisma.user.findUnique({ where: { id: user_id } });
        if (user?.email) {
          normalizedGuestEmail = user.email;
        }
      }

      const order = await prisma.platformOrder.create({
        data: {
          user_id,
          guest_name: normalizedGuestName,
          guest_email: normalizedGuestEmail,
          items,
          shipping_address,
          total_amount,
          status: 'placed'
        }
      });

      // Dispatch Order Confirmation & Invoice Email asynchronously
      if (normalizedGuestEmail) {
        EmailService.sendOrderReceiptEmail(order, normalizedGuestEmail, normalizedGuestName || undefined);
      }
      
      res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to place order' });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await prisma.platformOrder.update({
        where: { id },
        data: { status }
      });
      res.json({ message: 'Order status updated', order });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }
}
