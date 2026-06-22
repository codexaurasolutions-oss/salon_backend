import { Request, Response } from 'express';
import { prisma } from '../server';

export class OffersController {
  
  static async getActiveOffers(req: Request, res: Response) {
    try {
      const salon_id = req.query.salon_id as string | undefined;
      const where: any = { is_active: true };
      if (salon_id) {
        where.OR = [
          { salon_id: salon_id },
          { salon_id: null }
        ];
      }
      const offers = await prisma.platformOffer.findMany({ where });
      res.json(offers);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch offers' });
    }
  }

  static async createOffer(req: Request, res: Response) {
    try {
      const data = req.body;
      const admin_id = req.user?.user_id;

      const offer = await prisma.platformOffer.create({
        data: {
          name: data.name || data.title,
          description: data.description,
          code: data.code,
          discount_type: data.discount_type || data.offer_type || 'percentage',
          discount_value: parseFloat(data.discount_value || data.value) || 0,
          salon_id: data.salon_id || null,
          applicable_to: data.applicable_to || 'all',
          applicable_plan_ids: data.applicable_plan_ids,
          max_uses: data.max_uses || data.max_usage ? parseInt(data.max_uses || data.max_usage) : null,
          start_date: data.start_date ? new Date(data.start_date) : null,
          end_date: data.end_date ? new Date(data.end_date) : null,
          created_by: admin_id
        }
      });
      res.status(201).json(offer);
    } catch (error: any) {
      console.error('Create offer error:', error);
      res.status(500).json({ error: 'Failed to create offer', message: error.message });
    }
  }

  static async updateOffer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const offer = await prisma.platformOffer.update({
        where: { id },
        data: {
          name: data.name || data.title,
          description: data.description,
          code: data.code,
          discount_type: data.discount_type || data.offer_type,
          discount_value: data.discount_value !== undefined ? parseFloat(data.discount_value) : (data.value !== undefined ? parseFloat(data.value) : undefined),
          salon_id: data.salon_id,
          applicable_to: data.applicable_to,
          applicable_plan_ids: data.applicable_plan_ids,
          max_uses: data.max_uses !== undefined ? parseInt(data.max_uses) : (data.max_usage !== undefined ? parseInt(data.max_usage) : undefined),
          is_active: data.is_active,
          start_date: data.start_date ? new Date(data.start_date) : undefined,
          end_date: data.end_date ? new Date(data.end_date) : undefined,
        }
      });
      res.json(offer);
    } catch (error: any) {
      console.error('Update offer error:', error);
      res.status(500).json({ error: 'Failed to update offer', message: error.message });
    }
  }

  static async deleteOffer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.platformOffer.delete({ where: { id } });
      res.json({ message: 'Offer deleted' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete offer' });
    }
  }

  static async getRedemptions(req: Request, res: Response) {
    try {
      // Mocking redemptions. If PlatformOfferRedemption exists, fetch it.
      res.json({ redemptions: [] });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch redemptions' });
    }
  }
}
