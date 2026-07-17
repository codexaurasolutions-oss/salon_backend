import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { prisma } from '../server';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
  },
  tls: {
    // This often fixes connection hangs/drops in strict cloud environments like Railway
    rejectUnauthorized: false 
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

export class AuthController {
  private static signResetToken(user_id: string, email: string) {
    return jwt.sign(
      { user_id, email, purpose: 'password_reset' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
  }
  
  static async signup(req: Request, res: Response) {
    try {
      const { email, password, full_name, phone, user_type, salon_name, salon_slug } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Check existing
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const userTypeEnum = user_type || 'customer';

      // Use transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            password_hash,
            profile: {
              create: {
                full_name,
                phone,
                user_type: userTypeEnum,
              }
            }
          },
          include: { profile: true }
        });

        let salonId = null;

        if (userTypeEnum === 'salon_owner' && salon_name) {
           const slug = salon_slug || salon_name.toLowerCase().replace(/[^a-z0-9-]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
           
           const salon = await tx.salon.create({
               data: {
                   name: salon_name,
                   slug,
                   email,
                   phone,
                   approval_status: 'approved',
                   approved_at: new Date()
               }
           });

           salonId = salon.id;

           await tx.userRole.create({
               data: {
                   user_id: user.id,
                   salon_id: salon.id,
                   role: 'owner'
               }
           });
        }

        return { user, salonId };
      });

      const token = jwt.sign(
        { user_id: result.user.id, email: result.user.email, role: userTypeEnum }, 
        process.env.JWT_SECRET || 'secret', 
        { expiresIn: '24h' }
      );

      res.status(201).json({
        user: {
          id: result.user.id,
          email: result.user.email,
          full_name,
          user_type: userTypeEnum
        },
        token
      });

    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create user', message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true, user_roles: true }
      });

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const userType = user.profile?.user_type || 'customer';
      let salonId = null;
      let salonRole: string = userType;

      if (userType === 'salon_owner') {
          const ownerRole = user.user_roles.find(r => r.role === 'owner');
          if (ownerRole) {
              const salon = await prisma.salon.findUnique({ where: { id: ownerRole.salon_id } });
              if (salon?.approval_status === 'rejected') {
                  return res.status(403).json({ error: 'REJECTED', message: 'Your salon account registration has been rejected.' });
              }
              salonId = salon?.id;
              salonRole = 'owner';
          }
      } else if (userType === 'customer') {
          // Check if this customer actually has a staff role assigned
          const staffRole = user.user_roles.find(r => r.role === 'staff' || r.role === 'manager');
          if (staffRole) {
              salonId = staffRole.salon_id;
              salonRole = staffRole.role; // 'staff' or 'manager'
          }
      }

      const token = jwt.sign(
        { user_id: user.id, email: user.email, role: userType },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.profile?.full_name,
          user_type: userType,
          salon_role: salonRole,
          salon_id: salonId
        },
        token
      });

    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Login failed', message: error.message });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const user = await prisma.user.findUnique({
        where: { id: req.user.user_id },
        include: { profile: true }
      });

      res.json({
        user: {
            id: user?.id,
            email: user?.email,
            full_name: user?.profile?.full_name,
            phone: user?.profile?.phone,
            avatar_url: user?.profile?.avatar_url,
            user_type: user?.profile?.user_type,
            salon_role: req.user.salon_role
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({
          error: 'No account exists with this email address.',
        });
      }

      const token = AuthController.signResetToken(user.id, user.email);
      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
      const resetUrl = `${frontendBaseUrl}/reset-password?token=${token}`;

      // Send actual email
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'Password Reset Request - NoamSkin',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1A1A1A; text-align: center;">Password Reset Request</h2>
              <p style="color: #555; line-height: 1.6;">
                Hi ${user.email},
              </p>
              <p style="color: #555; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #1A1A1A; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Reset My Password
                </a>
              </div>
              <p style="color: #999; font-size: 13px; text-align: center;">
                This link expires in 1 hour. If you didn't request this, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #aaa; font-size: 11px; text-align: center;">
                NoamSkin Salon Platform &copy; ${new Date().getFullYear()}
              </p>
            </div>
          `
        });
        console.log(`[Auth] Password reset email sent to ${email}`);
      } catch (emailError: any) {
        console.error('[Auth] Email send failed:', emailError.message);
        // Still return success to not reveal if email exists
      }

      res.json({
        message: 'Password reset instructions have been sent to your email.',
        reset_url: resetUrl,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to process reset request' });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ error: 'Token and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as jwt.JwtPayload;
      if (decoded.purpose !== 'password_reset' || !decoded.user_id) {
        return res.status(400).json({ error: 'Invalid reset token' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: decoded.user_id as string },
        data: { password_hash },
      });

      res.json({ message: 'Password reset successfully' });
    } catch (error: any) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
    }
  }

}
