import { Request, Response } from 'express';
import { prisma } from '../server';

export class MessagesController {
  
  static async getMyMessages(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { receiver_id: user_id },
            { sender_id: user_id }
          ]
        },
        orderBy: { created_at: 'desc' },
        include: { sender: { select: { email: true, profile: true } } }
      });
      res.json({ messages });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  static async sendMessage(req: Request, res: Response) {
    try {
      const sender_id = req.user?.user_id!;
      const { receiver_id, salon_id, subject, body } = req.body;

      const message = await prisma.message.create({
        data: {
          sender_id,
          receiver_id,
          salon_id,
          subject,
          body
        }
      });
      res.status(201).json({ message: 'Message sent', data: message });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const message = await prisma.message.update({
        where: { id },
        data: { is_read: true }
      });
      res.json({ message: 'Marked as read', data: message });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update message' });
    }
  }
}
