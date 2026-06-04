import { Request, Response } from 'express';
import { prisma } from '../server';

export class ReviewsController {
  private static mapPublicReview(review: any) {
    return {
      id: review.id,
      user_id: review.user_id,
      salon_id: review.salon_id,
      booking_id: review.booking_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      user_name: review.user?.profile?.full_name || 'Guest Customer',
      user_avatar: review.user?.profile?.avatar_url || null,
      service_name: review.booking?.service?.name || 'Salon Service',
    };
  }

  static async getReviews(req: Request, res: Response) {
    try {
      const salon_id = req.query.salon_id as string | undefined;
      const service_id = req.query.service_id as string | undefined;

      const reviews = await prisma.review.findMany({
        where: {
          ...(salon_id ? { salon_id } : {}),
          ...(service_id ? { booking: { service_id } } : {}),
        },
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              profile: {
                select: {
                  full_name: true,
                  avatar_url: true,
                },
              },
            },
          },
          booking: {
            select: {
              service: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      res.json({ reviews: reviews.map(ReviewsController.mapPublicReview) });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  }
  
  static async getSalonReviews(req: Request, res: Response) {
    try {
      const { salon_id } = req.params;
      const reviews = await prisma.review.findMany({
        where: { salon_id },
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { profile: { select: { full_name: true, avatar_url: true } } } },
          booking: { select: { service: { select: { name: true } } } },
        }
      });
      res.json({ reviews: reviews.map(ReviewsController.mapPublicReview) });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  }

  static async submitReview(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id!;
      const { salon_id, booking_id, rating, comment } = req.body;
      const review = await prisma.review.create({
        data: { user_id, salon_id, booking_id, rating, comment }
      });
      res.status(201).json({ message: 'Review submitted', data: review });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to submit review' });
    }
  }
}
