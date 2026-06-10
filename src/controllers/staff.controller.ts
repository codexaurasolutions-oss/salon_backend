import { Request, Response } from 'express';
import { prisma } from '../server';
import crypto from 'crypto';

function formatBookingTime(t: any): string {
  if (!t) return '00:00';
  if (typeof t === 'string') { const m = t.match(/T(\d{2}):(\d{2})/); if (m) return `${m[1]}:${m[2]}`; if (/^\d{2}:\d{2}/.test(t)) return t.substring(0, 5); return '00:00'; }
  if (typeof t === 'object' && typeof t.getTime === 'function') { return `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`; }
  return '00:00';
}

export class StaffController {

  static async getStaffBySalon(req: Request, res: Response) {
    try {
      const salon_id = req.params.salon_id || req.query.salon_id;
      if (!salon_id) return res.status(400).json({ error: 'salon_id is required' });

      const staff = await prisma.staffProfile.findMany({
        where: { salon_id: salon_id as string },
        include: {
          salon: { select: { name: true } },
          _count: { select: { bookings: true } }
        },
        orderBy: { created_at: 'desc' }
      });

      // Fetch assigned services (manual aggregation since Prisma doesn't have a direct relation back from StaffService to StaffProfile via the schema directly right now if not specified)
      // Actually, StaffService is available but not linked to StaffProfile directly in schema.
      // Wait, let's fetch staff_services for these staff members
      const staffIds = staff.map(s => s.id);
      const staffServices = await prisma.staffService.findMany({
        where: { staff_id: { in: staffIds } }
      });

      const staffWithServices = staff.map(s => ({
        ...s,
        assigned_services: staffServices.filter(ss => ss.staff_id === s.id).map(ss => ss.service_id)
      }));

      res.json({ staff: staffWithServices });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch staff' });
    }
  }

  static async getAvailableSpecialists(req: Request, res: Response) {
    try {
      const { salon_id, service_id, date, time } = req.query;
      if (!salon_id) return res.status(400).json({ error: 'salon_id is required' });

      let staffQuery: any = { salon_id: salon_id as string, is_active: true };

      if (service_id) {
        // Find staff who provide this service
        const staffServices = await prisma.staffService.findMany({
          where: { service_id: service_id as string }
        });
        const staffIdsWithService = staffServices.map(ss => ss.staff_id);
        
        // Also include staff with NO specific services assigned (assuming they can do everything if not specified)
        const allStaffServices = await prisma.staffService.findMany({ where: { staff_id: { not: '' } } });
        const staffIdsWithAnyService = [...new Set(allStaffServices.map(ss => ss.staff_id))];

        staffQuery.OR = [
          { id: { in: staffIdsWithService } },
          { id: { notIn: staffIdsWithAnyService } }
        ];
      }

      let staff = await prisma.staffProfile.findMany({ where: staffQuery });

      if (date && time) {
        const bookingDate = new Date(date as string);
        const bookingTime = new Date(`1970-01-01T${time as string}Z`);

        // Check bookings
        const busyBookings = await prisma.booking.findMany({
          where: {
            salon_id: salon_id as string,
            booking_date: bookingDate,
            booking_time: bookingTime,
            status: { not: 'cancelled' },
            staff_id: { not: null }
          }
        });
        const busyStaffIds = busyBookings.map(b => b.staff_id!);

        // Check leaves
        const activeLeaves = await prisma.staffLeave.findMany({
          where: {
            salon_id: salon_id as string,
            status: 'approved',
            start_date: { lte: bookingDate },
            end_date: { gte: bookingDate }
          }
        });
        const onLeaveStaffIds = activeLeaves.map(l => l.staff_id);

        const unavailableStaffIds = new Set([...busyStaffIds, ...onLeaveStaffIds]);

        staff = staff.filter(s => !unavailableStaffIds.has(s.id));
      }

      res.json({ specialists: staff });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch available specialists', detail: error.message });
    }
  }

  static async getMeDashboardData(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      const { salon_id } = req.query;

      if (!salon_id) return res.status(400).json({ error: 'salon_id is required' });

      const staff = await prisma.staffProfile.findFirst({
        where: { user_id, salon_id: salon_id as string }
      });

      if (!staff) return res.status(404).json({ error: 'Staff profile not found' });

      // Fetch Assigned Services (Skills)
      const staffServices = await prisma.staffService.findMany({
        where: { staff_id: staff.id },
      });
      
      const assigned_services = await prisma.service.findMany({
        where: { id: { in: staffServices.map(s => s.service_id) } },
        select: { id: true, name: true, duration_minutes: true, price: true, category: true }
      });

      // Active Attendance
      const attendance = await prisma.staffAttendance.findFirst({
        where: { staff_id: staff.id, check_out: null },
        orderBy: { check_in: 'desc' }
      });

      // Today's Bookings
      const today = new Date();
      today.setHours(0,0,0,0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayBookings = await prisma.booking.findMany({
        where: {
          staff_id: staff.id,
          booking_date: { gte: today, lt: tomorrow },
          status: { not: 'cancelled' }
        },
        include: { service: { select: { name: true } }, treatment_records: true },
        orderBy: { booking_time: 'asc' }
      });

      const upcomingBookings = await prisma.booking.findMany({
        where: {
          staff_id: staff.id,
          booking_date: { gte: tomorrow },
          status: { not: 'cancelled' }
        },
        include: { service: { select: { name: true } } },
        orderBy: [{ booking_date: 'asc' }, { booking_time: 'asc' }],
        take: 10
      });

      // Basic Stats (Current Month)
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const monthBookings = await prisma.booking.findMany({
        where: {
          staff_id: staff.id,
          status: 'completed',
          booking_date: { gte: firstDayOfMonth }
        },
        include: { service: { select: { price: true } } }
      });

      const totalCustomers = monthBookings.length;
      const grossRevenue = monthBookings.reduce((sum, b) => sum + Number(b.price_paid ?? b.service?.price ?? 0), 0);
      
      const commissionRate = Number(staff.commission_percentage ?? 30);
      const earnings = grossRevenue * (commissionRate / 100);

      // Attendance Stats
      const attendances = await prisma.staffAttendance.findMany({
        where: {
          staff_id: staff.id,
          check_in: { gte: firstDayOfMonth }
        }
      });

      let totalMinutes = 0;
      for (const a of attendances) {
        const out = a.check_out ? a.check_out.getTime() : Date.now();
        const diff = Math.floor((out - a.check_in.getTime()) / 60000);
        totalMinutes += diff;
      }

      // Unread Messages
      const unreadMessagesCount = await prisma.message.count({
        where: { receiver_id: user_id, is_read: false, salon_id: salon_id as string }
      });

      res.json({
        staff: { ...staff, assigned_services },
        attendance,
        today_bookings: todayBookings.map(b => ({ ...b, booking_time: formatBookingTime(b.booking_time) })),
        upcoming_bookings: upcomingBookings.map(b => ({ ...b, booking_time: formatBookingTime(b.booking_time) })),
        unread_messages: unreadMessagesCount,
        stats: {
          revenue: grossRevenue,
          earnings,
          commission_rate: commissionRate,
          total_customers: totalCustomers,
          total_hours: Math.round((totalMinutes / 60) * 10) / 10
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch dashboard data', detail: error.message });
    }
  }

  static async getStaffProfileStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { month, year } = req.query;
      
      const targetMonth = month ? parseInt(month as string) - 1 : new Date().getMonth();
      const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
      
      const firstDay = new Date(targetYear, targetMonth, 1);
      const lastDay = new Date(targetYear, targetMonth + 1, 0);

      const staff = await prisma.staffProfile.findUnique({ where: { id } });
      if (!staff) return res.status(404).json({ error: 'Staff not found' });

      // Month Bookings
      const monthBookings = await prisma.booking.findMany({
        where: {
          staff_id: id,
          status: 'completed',
          booking_date: { gte: firstDay, lte: lastDay }
        },
        include: { service: { select: { price: true, name: true } }, user: { select: { email: true, profile: true } } },
        orderBy: { booking_date: 'desc' }
      });

      const totalCustomers = monthBookings.length;
      const grossRevenue = monthBookings.reduce((sum, b) => sum + Number(b.price_paid ?? b.service?.price ?? 0), 0);
      const effectiveCommission = Number(staff.commission_percentage ?? 30);
      const earnings = grossRevenue * (effectiveCommission / 100);

      // Attendance
      const attendances = await prisma.staffAttendance.findMany({
        where: { staff_id: id, check_in: { gte: firstDay, lte: lastDay } },
        orderBy: { check_in: 'asc' }
      });

      const uniqueDays = new Set(attendances.map(a => a.check_in.toDateString())).size;
      let totalMinutes = 0;
      for (const a of attendances) {
        const out = a.check_out ? a.check_out.getTime() : Date.now();
        const diff = Math.floor((out - a.check_in.getTime()) / 60000);
        totalMinutes += diff;
      }

      // Leaves
      const leaves = await prisma.staffLeave.findMany({
        where: {
          staff_id: id,
          status: 'approved',
          OR: [
            { start_date: { gte: firstDay, lte: lastDay } },
            { end_date: { gte: firstDay, lte: lastDay } }
          ]
        }
      });
      // Rough estimate of leave days in month
      const leaveDays = leaves.reduce((sum, l) => {
        const start = l.start_date > firstDay ? l.start_date : firstDay;
        const end = l.end_date < lastDay ? l.end_date : lastDay;
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + (diff > 0 ? diff : 0);
      }, 0);

      // Daily Revenue
      const dailyRevenue: Record<number, number> = {};
      for (const b of monthBookings) {
        const day = b.booking_date.getDate();
        dailyRevenue[day] = (dailyRevenue[day] || 0) + Number(b.price_paid ?? b.service?.price ?? 0);
      }
      const dailyRevenueArr = Object.entries(dailyRevenue).map(([day, revenue]) => ({ day: parseInt(day), daily_revenue: revenue }));

      res.json({
        stats: {
          customers: totalCustomers,
          revenue: grossRevenue,
          earnings: earnings,
          commission_rate: effectiveCommission,
          days_worked: uniqueDays,
          total_hours: Math.round((totalMinutes / 60) * 10) / 10,
          leave_days: leaveDays
        },
        recent_customers: monthBookings.slice(0, 100),
        daily_revenue: dailyRevenueArr,
        attendance_logs: attendances
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch staff profile stats', detail: error.message });
    }
  }

  static async getStaffProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const staff = await prisma.staffProfile.findUnique({
        where: { id },
        include: { salon: { select: { name: true } } }
      });
      if (!staff) return res.status(404).json({ error: 'Staff not found' });
      
      const staffServices = await prisma.staffService.findMany({ where: { staff_id: id } });
      
      res.json({ staff: { ...staff, assigned_services: staffServices.map(ss => ss.service_id) } });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch staff profile' });
    }
  }

  static async addStaff(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.salon_id || !data.display_name) return res.status(400).json({ error: 'salon_id and display_name required' });

      // Always create a User account so staff can log in
      const email = data.email || `staff_${crypto.randomUUID()}@salon.local`;
      const password = data.password || crypto.randomUUID().replace(/-/g, '').substring(0, 12);

      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash(password, 10);

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            password_hash: hash,
            // Roles drive staff access; keeping the legacy-compatible profile type
            // avoids enum mismatches on older production schemas.
            profile: { create: { full_name: data.display_name, user_type: 'customer' } }
          }
        });
      } else if (data.password) {
        await prisma.user.update({ where: { id: user.id }, data: { password_hash: hash } });
      }

      const staffUserId = user.id;

      const staff = await prisma.staffProfile.create({
        data: {
          user_id: staffUserId,
          salon_id: data.salon_id,
          display_name: data.display_name,
          email: data.email,
          phone: data.phone,
          specializations: data.specializations,
          commission_percentage: data.commission_percentage,
          is_active: data.is_active ?? true
        }
      });

      await prisma.userRole.upsert({
        where: { user_id_salon_id: { user_id: staffUserId, salon_id: data.salon_id } },
        create: { user_id: staffUserId, salon_id: data.salon_id, role: data.role ?? 'staff' },
        update: { role: data.role ?? 'staff' }
      });

      res.status(201).json({ message: 'Staff added successfully', staff });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to add staff', detail: error.message });
    }
  }

  static async updateStaff(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const staff = await prisma.staffProfile.findUnique({ where: { id } });
      if (!staff) return res.status(404).json({ error: 'Staff not found' });

      let staffUserId = staff.user_id;

      if (data.password && data.email) {
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash(data.password, 10);

        if (staffUserId) {
          await prisma.user.update({ where: { id: staffUserId }, data: { password_hash: hash } });
        } else {
          let user = await prisma.user.findUnique({ where: { email: data.email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: data.email,
                password_hash: hash,
                profile: { create: { full_name: data.display_name ?? staff.display_name, user_type: 'customer' } }
              }
            });
          } else {
            await prisma.user.update({ where: { id: user.id }, data: { password_hash: hash } });
          }
          staffUserId = user.id;

          await prisma.userRole.upsert({
            where: { user_id_salon_id: { user_id: staffUserId, salon_id: staff.salon_id } },
            create: { user_id: staffUserId, salon_id: staff.salon_id, role: data.role ?? 'staff' },
            update: { role: data.role ?? 'staff' }
          });
        }
      }

      const updatedStaff = await prisma.staffProfile.update({
        where: { id },
        data: {
          user_id: staffUserId,
          display_name: data.display_name,
          email: data.email,
          phone: data.phone,
          specializations: data.specializations,
          commission_percentage: data.commission_percentage,
          is_active: data.is_active,
          avatar_url: data.avatar_url
        }
      });

      if (data.role && staffUserId) {
        await prisma.userRole.upsert({
            where: { user_id_salon_id: { user_id: staffUserId, salon_id: staff.salon_id } },
            create: { user_id: staffUserId, salon_id: staff.salon_id, role: data.role },
            update: { role: data.role }
          });
      }

      res.json({ message: 'Staff updated successfully', staff: updatedStaff });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update staff', detail: error.message });
    }
  }

  static async deleteStaff(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.staffProfile.delete({ where: { id } });
      res.json({ message: 'Staff deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete staff' });
    }
  }

  // ──────────────────────────────────────────
  // LEAVES
  // ──────────────────────────────────────────

  static async getLeaves(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const leaves = await prisma.staffLeave.findMany({
        where: { staff_id: id },
        orderBy: { start_date: 'desc' }
      });
      res.json({ leaves });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch leaves' });
    }
  }

  static async createLeave(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const isManager = req.user?.role === 'owner' || req.user?.role === 'manager';

      const leave = await prisma.staffLeave.create({
        data: {
          staff_id: id,
          salon_id: data.salon_id,
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          leave_type: data.leave_type ?? 'casual',
          reason: data.reason,
          status: isManager ? 'approved' : 'pending'
        }
      });
      res.status(201).json({ message: 'Leave request logged', id: leave.id });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create leave request' });
    }
  }

  static async updateLeaveStatus(req: Request, res: Response) {
    try {
      const { leave_id } = req.params;
      const { status } = req.body;
      await prisma.staffLeave.update({
        where: { id: leave_id },
        data: { status }
      });
      res.json({ message: 'Leave status updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update leave status' });
    }
  }

  // ──────────────────────────────────────────
  // ATTENDANCE
  // ──────────────────────────────────────────

  static async getAttendance(req: Request, res: Response) {
    try {
      const { staff_id } = req.params;
      const attendance = await prisma.staffAttendance.findMany({
        where: { staff_id },
        orderBy: { check_in: 'desc' }
      });
      res.json({ attendance });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch attendance' });
    }
  }

  static async checkIn(req: Request, res: Response) {
    try {
      const data = req.body;
      const user_id = req.user?.user_id;

      const staff = await prisma.staffProfile.findFirst({
        where: { user_id, salon_id: data.salon_id }
      });
      if (!staff) return res.status(404).json({ error: 'Staff profile not found' });

      // check if already checked in today and not out
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const existing = await prisma.staffAttendance.findFirst({
        where: {
          staff_id: staff.id,
          check_out: null,
          check_in: { gte: today }
        }
      });
      if (existing) return res.status(400).json({ error: 'Already checked in' });

      const attendance = await prisma.staffAttendance.create({
        data: { staff_id: staff.id, salon_id: data.salon_id }
      });
      res.status(201).json({ message: 'Check-in successful', attendance_id: attendance.id });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to check in' });
    }
  }

  static async checkOut(req: Request, res: Response) {
    try {
      const data = req.body;
      const user_id = req.user?.user_id;

      const staff = await prisma.staffProfile.findFirst({
        where: { user_id, salon_id: data.salon_id }
      });
      if (!staff) return res.status(404).json({ error: 'Staff profile not found' });

      const active = await prisma.staffAttendance.findFirst({
        where: { staff_id: staff.id, check_out: null },
        orderBy: { check_in: 'desc' }
      });
      if (!active) return res.status(400).json({ error: 'No active check-in found' });

      await prisma.staffAttendance.update({
        where: { id: active.id },
        data: { check_out: new Date() }
      });
      res.json({ message: 'Check-out successful' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to check out' });
    }
  }

  // ──────────────────────────────────────────
  // SERVICES
  // ──────────────────────────────────────────

  static async assignServices(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { service_ids } = req.body;
      
      if (!Array.isArray(service_ids)) return res.status(400).json({ error: 'service_ids must be an array' });

      await prisma.$transaction(async (tx) => {
        await tx.staffService.deleteMany({ where: { staff_id: id } });
        if (service_ids.length > 0) {
          await tx.staffService.createMany({
            data: service_ids.map(sid => ({ staff_id: id, service_id: sid }))
          });
        }
      });

      res.json({ message: 'Staff services synchronized successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to sync staff services' });
    }
  }
}
