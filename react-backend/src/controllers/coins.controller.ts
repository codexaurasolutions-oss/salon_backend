import { Request, Response } from 'express';
import { prisma } from '../server';

const defaultCoinSettings = {
  min_redemption: 0,
  max_discount_percent: 100,
  earning_rate: 10,
};

export class CoinsController {
  private static async buildCoinPayload(user_id?: string) {
    const transactions = await prisma.coinTransaction.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' }
    });

    const balance = transactions.reduce((acc, tx) => {
      if (tx.transaction_type === 'earned' || tx.transaction_type === 'refunded') {
        return acc + Number(tx.amount);
      }
      if (tx.transaction_type === 'spent') {
        return acc - Number(tx.amount);
      }
      return acc;
    }, 0);

    return {
      balance,
      transactions,
      price: 1,
      settings: defaultCoinSettings,
    };
  }
  
  static async getMyCoins(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      res.json(await CoinsController.buildCoinPayload(user_id));
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch coin transactions' });
    }
  }

  static async handleLegacyAction(req: Request, res: Response) {
    try {
      const action = String(req.query.action || '');
      const user_id = req.user?.user_id;

      if (action === 'get-balance' || action === 'get-transactions') {
        return res.json(await CoinsController.buildCoinPayload(user_id));
      }

      if (action === 'admin-get-price') {
        return res.json({ price: 1, settings: defaultCoinSettings });
      }

      if (action === 'admin-set-price') {
        return res.json({
          price: Number(req.body?.price || 1),
          settings: defaultCoinSettings,
        });
      }

      if (action === 'admin-adjust') {
        return CoinsController.awardCoins(req, res);
      }

      return res.status(404).json({ error: 'Route not found' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to process coin request' });
    }
  }

  static async awardCoins(req: Request, res: Response) {
    try {
      const { user_id, amount, description } = req.body;
      const tx = await prisma.coinTransaction.create({
        data: {
            user_id,
            amount,
            transaction_type: 'admin_adjustment',
            description
        }
      });
      res.status(201).json({ message: 'Coins awarded', data: tx });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to award coins' });
    }
  }
}
