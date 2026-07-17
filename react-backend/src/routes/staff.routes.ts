import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole, requireSalonAccess } from '../middlewares/rbac.middleware';

const router = Router({ mergeParams: true });

// Public routes (or basic protected)
router.get('/', authenticateToken, StaffController.getStaffBySalon);
router.get('/available-specialists', authenticateToken, StaffController.getAvailableSpecialists);

// Staff Portal / Dashboard
router.get('/me/dashboard-data', authenticateToken, StaffController.getMeDashboardData);

// Attendance
router.post('/attendance/check-in', authenticateToken, StaffController.checkIn);
router.post('/attendance/check-out', authenticateToken, StaffController.checkOut);
router.get('/attendance/:staff_id', authenticateToken, StaffController.getAttendance);

// Leaves
router.get('/:id/leaves', authenticateToken, StaffController.getLeaves);
router.post('/:id/leaves', authenticateToken, StaffController.createLeave);
router.put('/leaves/:leave_id', authenticateToken, requireRole(['owner', 'manager']), StaffController.updateLeaveStatus);

// Profile Stats
router.get('/:id/profile-stats', authenticateToken, StaffController.getStaffProfileStats);

// Services
router.post('/:id/services', authenticateToken, requireRole(['owner', 'manager']), StaffController.assignServices);

// Basic CRUD
router.get('/:id', authenticateToken, StaffController.getStaffProfile);
router.post('/', authenticateToken, requireRole(['owner', 'manager']), requireSalonAccess, StaffController.addStaff);
router.put('/:id', authenticateToken, requireRole(['owner', 'manager']), requireSalonAccess, StaffController.updateStaff);
router.delete('/:id', authenticateToken, requireRole(['owner', 'manager']), requireSalonAccess, StaffController.deleteStaff);

export default router;
