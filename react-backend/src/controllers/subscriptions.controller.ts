import { Request, Response } from 'express';
import { prisma } from '../server';

export class SubscriptionsController {
  
  static async getPlans(req: Request, res: Response) {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { is_active: true },
        orderBy: { sort_order: 'asc' }
      });
      res.json({ plans });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }
  }

  static async getMySubscription(req: Request, res: Response) {
    try {
      const salon_id = req.params.salon_id || req.query.salon_id;
      if (!salon_id) return res.status(400).json({ error: 'salon_id is required' });

      const subscription = await prisma.salonSubscription.findFirst({
        where: { salon_id: salon_id as string, status: 'active' },
        include: { plan: true }
      });
      res.json({ subscription });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  }

  static async subscribeToPlan(req: Request, res: Response) {
    try {
      const salon_id = req.params.salon_id || req.body.salon_id || req.query.salon_id;
      if (!salon_id) return res.status(400).json({ error: 'salon_id is required' });

      const { plan_id, billing_cycle } = req.body;

      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: plan_id } });
      if (!plan) return res.status(404).json({ error: 'Plan not found' });

      // Calculate end date based on billing_cycle
      const end_date = new Date();
      if (billing_cycle === 'monthly') end_date.setMonth(end_date.getMonth() + 1);
      else end_date.setFullYear(end_date.getFullYear() + 1);

      const amount = billing_cycle === 'monthly' ? plan.price_monthly : (plan.price_yearly || plan.price_monthly);

      // In a real app, this would integrate with Stripe or ToyyibPay
      // We are creating an active subscription directly for now.
      const subscription = await prisma.salonSubscription.create({
        data: {
          salon_id,
          plan_id,
          amount,
          billing_cycle,
          status: 'active',
          end_date
        }
      });

      // Update salon's active plan
      await prisma.salon.update({
        where: { id: salon_id },
        data: { subscription_plan_id: plan_id, subscription_status: 'active' }
      });

      res.status(201).json({ message: 'Subscribed successfully', subscription });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to subscribe' });
    }
  }
}
