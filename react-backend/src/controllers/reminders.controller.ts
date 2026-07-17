import { Request, Response } from 'express';
import { prisma } from '../server';

export class RemindersController {
  
  static async getUpcomingReminders(req: Request, res: Response) {
    try {
      const salon_id = (req.query.salon_id || req.body.salon_id) as string;
      const user_id = req.query.user_id as string;
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      let whereClause: any = {
        booking_date: {
          gte: new Date(),
          lte: tomorrow
        },
        status: 'confirmed'
      };

      if (salon_id) whereClause.salon_id = salon_id;
      if (user_id) whereClause.user_id = user_id;

      const upcomingBookings = await prisma.booking.findMany({
        where: whereClause,
        include: { user: { select: { email: true, profile: true } } }
      });

      res.json({ reminders: upcomingBookings });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch reminders' });
    }
  }

  static async sendManualReminder(req: Request, res: Response) {
    try {
      const { booking_id } = req.body;
      const booking = await prisma.booking.findUnique({ where: { id: booking_id } });
      if (!booking) return res.status(404).json({ error: 'Booking not found' });

      // In a real system, you would integrate Twilio / SendGrid here
      res.json({ message: 'Reminder sent successfully (Mocked)', booking });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to send reminder' });
    }
  }

  static async createReminder(req: Request, res: Response) {
    try {
       // Mock for creating a custom reminder
       res.status(201).json({ message: 'Reminder created', reminder: req.body });
    } catch (error: any) {
       res.status(500).json({ error: 'Failed to create reminder' });
    }
  }

  static async deleteReminder(req: Request, res: Response) {
    try {
       res.json({ message: 'Reminder deleted' });
    } catch (error: any) {
       res.status(500).json({ error: 'Failed to delete reminder' });
    }
  }
}
