import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const role = req.user.salon_role || req.user.role;

    // Super Admin can do everything
    if (role === 'super_admin' || role === 'admin') {
      return next();
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: `Forbidden - Insufficient clearance level (Role: ${role})` });
    }

    next();
  };
};

export const requireSalonAccess = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const salon_id = req.params.salon_id || req.query.salon_id || req.body.salon_id;
    
    // Super Admin bypass
    if (req.user.role === 'super_admin' || req.user.role === 'admin') {
        return next();
    }

    if (!salon_id) {
        // If the route doesn't specify a salon_id, let the controller handle it or pass.
        return next();
    }

    // Check if user's salon_id matches requested salon_id
    if (req.user.salon_id !== salon_id) {
        return res.status(403).json({ error: 'Forbidden - You do not have access to this salon.' });
    }

    next();
};
