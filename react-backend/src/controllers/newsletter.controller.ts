import { Request, Response } from 'express';
import { prisma } from '../server';

export class NewsletterController {
  
  static async subscribe(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      await prisma.newsletterSubscriber.upsert({
          where: { email },
          update: {},
          create: { email }
      });
      
      res.status(201).json({ message: 'Subscribed to newsletter' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to subscribe' });
    }
  }

  static async getSubscribers(req: Request, res: Response) {
    try {
      const subscribers = await prisma.newsletterSubscriber.findMany();
      res.json({ subscribers });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
  }
}
