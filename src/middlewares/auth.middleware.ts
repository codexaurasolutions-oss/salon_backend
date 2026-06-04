import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

interface JwtPayload {
  user_id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Extend Express Request object
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { salon_id?: string; salon_role?: string };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    
    // Attach user payload
    req.user = decoded;

    // Fetch salon role if not super_admin
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
        const userRole = await prisma.userRole.findFirst({
            where: { user_id: decoded.user_id }
        });
        
        if (userRole) {
            req.user.salon_id = userRole.salon_id;
            req.user.salon_role = userRole.role;
        }
    } else {
       req.user.salon_role = 'super_admin';
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    req.user = decoded;
  } catch {
    // Token invalid but don't block
  }
  next();
};
