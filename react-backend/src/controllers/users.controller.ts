import { Request, Response } from 'express';
import { prisma } from '../server';

export class UsersController {
  
  static async getRoles(req: Request, res: Response) {
    try {
      const { user_id, salon_id } = req.query;
      const targetUser = user_id || req.user?.user_id;

      let whereClause: any = { user_id: targetUser };
      if (salon_id) whereClause.salon_id = salon_id;

      const roles = await prisma.userRole.findMany({
        where: whereClause,
        include: { salon: { select: { name: true } } }
      });
      res.json({ roles });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch user roles' });
    }
  }

  static async getMe(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      const user = await prisma.user.findUnique({
        where: { id: user_id },
        include: { profile: true }
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      const { password_hash, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  static async updateMe(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      const data = req.body;

      const profile = await prisma.profile.upsert({
        where: { user_id },
        update: {
          full_name: data.full_name,
          phone: data.phone_number || data.phone,
          avatar_url: data.avatar_url
        },
        create: {
          user_id: user_id!,
          full_name: data.full_name || 'User',
          phone: data.phone_number || data.phone,
          avatar_url: data.avatar_url
        }
      });

      res.json({ message: 'Profile updated', profile });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const current_user = req.user?.user_id;
      const user_type = req.user?.role;

      if (current_user !== id && user_type === 'customer') {
        return res.status(403).json({ error: 'Forbidden. You do not have permission to update this user.' });
      }

      const profile = await prisma.profile.upsert({
        where: { user_id: id },
        update: {
          full_name: data.full_name,
          phone: data.phone_number || data.phone,
          avatar_url: data.avatar_url
        },
        create: {
          user_id: id,
          full_name: data.full_name || 'User',
          phone: data.phone_number || data.phone,
          avatar_url: data.avatar_url
        }
      });

      res.json({ message: 'User updated', profile });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        include: { profile: true }
      });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const { password_hash, ...safeUser } = user;
      res.json({ profile: safeUser });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
}
