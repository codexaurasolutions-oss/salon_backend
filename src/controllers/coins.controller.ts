import { Request, Response } from 'express';
import { prisma } from '../server';

export class CoinsController {
  
  static async getMyCoins(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      
      const transactions = await prisma.coinTransaction.findMany({
        where: { user_id },
        orderBy: { created_at: 'desc' }
      });

      // Calculate total coins
      const balance = transactions.reduce((acc, tx) => {
          if (tx.transaction_type === 'earned' || tx.transaction_type === 'refunded') {
              return acc + Number(tx.amount);
          }
          if (tx.transaction_type === 'spent') {
              return acc - Number(tx.amount);
          }
          return acc;
      }, 0);

      res.json({ balance, transactions });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch coin transactions' });
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
