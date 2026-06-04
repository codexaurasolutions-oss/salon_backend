import { Request, Response } from 'express';
import { prisma } from '../server';

export class NotificationsController {
  
  static async getMyNotifications(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      const notifications = await prisma.notification.findMany({
        where: { user_id },
        orderBy: { created_at: 'desc' }
      });
      res.json({ notifications });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await prisma.notification.update({
        where: { id },
        data: { is_read: true }
      });
      res.json({ message: 'Marked as read', data: notification });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update notification' });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      await prisma.notification.updateMany({
        where: { user_id, is_read: false },
        data: { is_read: true }
      });
      res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update notifications' });
    }
  }
}
