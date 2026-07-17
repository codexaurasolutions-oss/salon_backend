import { Request, Response } from 'express';
import { prisma } from '../server';

export class ContactEnquiriesController {
  
  static async submitEnquiry(req: Request, res: Response) {
    try {
      const { name, email, phone, subject, message, inquiry_type } = req.body;
      const enquiry = await prisma.contactEnquiry.create({
        data: { name, email, phone, subject, message, inquiry_type }
      });
      res.status(201).json({ message: 'Enquiry submitted', data: enquiry });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to submit enquiry' });
    }
  }

  static async getEnquiries(req: Request, res: Response) {
    try {
      const enquiries = await prisma.contactEnquiry.findMany({
        orderBy: { created_at: 'desc' }
      });
      res.json({ enquiries });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch enquiries' });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const enquiry = await prisma.contactEnquiry.update({
        where: { id },
        data: { status }
      });
      res.json({ message: 'Enquiry updated', data: enquiry });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update enquiry' });
    }
  }
}
