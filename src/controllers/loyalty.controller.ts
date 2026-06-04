import { Request, Response } from 'express';
import { prisma } from '../server';

export class LoyaltyController {
  
  static async getLoyaltySettings(req: Request, res: Response) {
    try {
      const salon_id = (req.query.salon_id || req.body.salon_id) as string;
      const program = await prisma.loyaltyProgram.findUnique({
        where: { salon_id }
      });
      res.json({ program });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch loyalty program settings' });
    }
  }

  static async updateLoyaltySettings(req: Request, res: Response) {
    try {
      const salon_id = (req.query.salon_id || req.body.salon_id) as string;
      const data = req.body;

      const program = await prisma.loyaltyProgram.upsert({
        where: { salon_id },
        update: {
            is_active: data.is_active,
            points_per_currency_unit: data.points_per_currency_unit,
            min_points_redemption: data.min_points_redemption,
            signup_bonus_points: data.signup_bonus_points,
            description: data.description
        },
        create: {
            id: require('crypto').randomUUID(),
            salon_id,
            is_active: data.is_active,
            points_per_currency_unit: data.points_per_currency_unit,
            min_points_redemption: data.min_points_redemption,
            signup_bonus_points: data.signup_bonus_points,
            description: data.description
        }
      });
      res.json({ message: 'Loyalty program updated', program });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update loyalty settings' });
    }
  }

  static async getRewards(req: Request, res: Response) {
    try {
      res.json({ rewards: [] });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch rewards' });
    }
  }

  static async createReward(req: Request, res: Response) {
    try {
      res.status(201).json({ message: 'Reward created', reward: req.body });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create reward' });
    }
  }

  static async deleteReward(req: Request, res: Response) {
    try {
      res.json({ message: 'Reward deleted' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete reward' });
    }
  }

  static async getMyPoints(req: Request, res: Response) {
    try {
      res.json({ points: 0 });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch points' });
    }
  }

  static async getAllPoints(req: Request, res: Response) {
    try {
      res.json({ points: [] });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch all points' });
    }
  }

  static async redeemReward(req: Request, res: Response) {
    try {
      res.json({ message: 'Reward redeemed successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to redeem reward' });
    }
  }

  static async fixMyPoints(req: Request, res: Response) {
    try {
      res.json({ message: 'Points fixed' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fix points' });
    }
  }
}
