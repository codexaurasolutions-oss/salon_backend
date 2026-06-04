import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Apply admin requirement to all admin routes
router.use(authenticateToken, requireRole(['super_admin', 'admin']));

// Stats & Reports
router.get('/stats', AdminController.getPlatformStats);
router.get('/reports', AdminController.getReports);

// Bookings
router.get('/bookings', AdminController.getAllBookings);

// Salons
router.get('/salons', AdminController.getAllSalons);
router.post('/salons', AdminController.createSalon);
router.put('/salons/:id/approve', AdminController.approveSalon);
router.put('/salons/:id/reject', AdminController.rejectSalon);
router.post('/salons/:id/reset-password', AdminController.resetSalonOwnerPassword);
router.delete('/salons/:id', AdminController.deleteSalon);

// Users
router.get('/users', AdminController.getAllUsers);
router.delete('/users/:id', AdminController.deleteUser);

// Payments
router.get('/payments', AdminController.getAllPayments);
router.post('/payments/:id/resend-invoice', AdminController.resendInvoice);

// Settings
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

// Contact Enquiries
router.get('/contact-enquiries', AdminController.getEnquiries);
router.put('/contact-enquiries/:id/status', AdminController.updateEnquiryStatus);
router.delete('/contact-enquiries/:id', AdminController.deleteEnquiry);

// Subscriptions & Plans
router.get('/subscriptions/plans', AdminController.getPlans);
router.post('/subscriptions/plans', AdminController.createPlan);
router.put('/subscriptions/plans/:id', AdminController.updatePlan);

// Memberships (Salon Subscriptions)
router.get('/memberships', AdminController.getMemberships);
router.post('/memberships/assign', AdminController.assignMembership);

// Addons
router.get('/subscriptions/addons', AdminController.getSubscriptionAddons);
router.get('/salons/addons', AdminController.getSalonAddons);
router.post('/salons/addons/assign', AdminController.assignSalonAddon);

// Reviews
router.get('/reviews', AdminController.getAllReviews);
router.delete('/reviews/:id', AdminController.deleteReview);

// Orders
router.get('/orders', AdminController.getAllOrders);
router.put('/orders/:id/status', AdminController.updateOrderStatus);

export default router;
