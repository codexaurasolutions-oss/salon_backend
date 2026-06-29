import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config();

declare global {
  var __salonPrisma__: PrismaClient | undefined;
}

export const prisma = global.__salonPrisma__ || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  global.__salonPrisma__ = prisma;
}

const app: Express = express();
const port = process.env.PORT || 5000;

const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [];
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      const isNoamskinDomain = /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*noamskin\.com$/.test(origin);
      const isLocalhost = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin);
      
      if (allowedOrigins.includes(origin) || isNoamskinDomain || isLocalhost) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Local-only file serving. Vercel ignores express.static() in production.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'online', message: 'Salon Express API is active' });
});

import authRoutes from './routes/auth.routes';
import salonsRoutes from './routes/salons.routes';
import staffRoutes from './routes/staff.routes';
import servicesRoutes from './routes/services.routes';
import bookingsRoutes from './routes/bookings.routes';
import customerRecordsRoutes from './routes/customer_records.routes';
import adminRoutes from './routes/admin.routes';
import subscriptionsRoutes from './routes/subscriptions.routes';
import loyaltyRoutes from './routes/loyalty.routes';
import ordersRoutes from './routes/orders.routes';
import offersRoutes from './routes/offers.routes';
import uploadsRoutes from './routes/uploads.routes';
import newsletterRoutes from './routes/newsletter.routes';
import toyyibpayRoutes from './routes/toyyibpay.routes';
import usersRoutes from './routes/users.routes';
import profilesRoutes from './routes/profiles.routes';
import messagesRoutes from './routes/messages.routes';
import notificationsRoutes from './routes/notifications.routes';
import contactEnquiriesRoutes from './routes/contact_enquiries.routes';
import knowledgeBaseRoutes from './routes/knowledge_base.routes';
import inventoryRoutes from './routes/inventory.routes';
import platformProductsRoutes from './routes/platform_products.routes';
import productPurchasesRoutes from './routes/product_purchases.routes';
import coinsRoutes from './routes/coins.routes';
import reviewsRoutes from './routes/reviews.routes';
import remindersRoutes from './routes/reminders.routes';
import mailRoutes from './routes/mail.routes';
import searchRoutes from './routes/search.routes';
import couponsRoutes from './routes/coupons.routes';

app.use('/api/auth', authRoutes);
app.use('/api/salons', salonsRoutes);
app.use('/api/salons/:salon_id/staff', staffRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/salons/:salon_id/services', servicesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/customer_records', customerRecordsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/toyyibpay', toyyibpayRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/contact-enquiries', contactEnquiriesRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/salons/:salon_id/inventory', inventoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/platform_products', platformProductsRoutes);
app.use('/api/product_purchases', productPurchasesRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/coins', coinsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/salons/:salon_id/reminders', remindersRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/search', searchRoutes);

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Fatal Error]', err.stack || err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
  });
});

if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

export default app;
