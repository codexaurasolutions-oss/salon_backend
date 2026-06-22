import { Request, Response } from 'express';
import { prisma } from '../server';

export class CouponsController {
  
  static async validateCoupon(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const { salon_id } = req.query;

      // Find the coupon by uppercase code and active status
      const offer = await prisma.platformOffer.findFirst({
        where: {
          code: code.toUpperCase(),
          is_active: true
        }
      });

      if (!offer) {
        return res.status(400).json({ error: 'Invalid or expired coupon code' });
      }

      // Check salon applicability (allow platform-wide offers where salon_id is null)
      if (salon_id && offer.salon_id && offer.salon_id !== salon_id) {
        return res.status(400).json({ error: 'This coupon is not valid for this salon' });
      }

      // Date validation with Malaysia timezone support (UTC+8)
      const now = new Date();
      const localTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);

      if (offer.start_date) {
        if (localTime < new Date(offer.start_date)) {
          return res.status(400).json({ error: 'Invalid or expired coupon code' });
        }
      }

      if (offer.end_date) {
        // Add 24 hours to the end_date to make it valid through the entire end date
        const endDateTime = new Date(offer.end_date).getTime() + 24 * 60 * 60 * 1000;
        if (localTime.getTime() > endDateTime) {
          return res.status(400).json({ error: 'Invalid or expired coupon code' });
        }
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
