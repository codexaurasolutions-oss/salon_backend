import { Request, Response } from 'express';
import { prisma } from '../server';

export class CouponsController {
  
  static async validateCoupon(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const { salon_id } = req.query;

      const where: any = { code: code.toUpperCase(), is_active: true };
      where.OR = [
        { start_date: { lte: new Date() }, end_date: { gte: new Date() } },
        { start_date: { lte: new Date() }, end_date: null },
        { start_date: null, end_date: { gte: new Date() } },
        { start_date: null, end_date: null }
      ];
      if (salon_id) {
        where.salon_id = salon_id;
      }

      const offer = await prisma.platformOffer.findFirst({ where });

      if (!offer) {
        return res.status(400).json({ error: 'Invalid or expired coupon code' });
      }

      if (offer.max_uses && (offer.used_count ?? 0) >= offer.max_uses) {
        return res.status(400).json({ error: 'This coupon has reached its maximum usage limit' });
      }

      res.json({
        valid: true,
        code: offer.code,
        discount_value: Number(offer.discount_value),
        discount_type: offer.discount_type,
        name: offer.name,
        is_active: true
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to validate coupon' });
    }
  }
}
