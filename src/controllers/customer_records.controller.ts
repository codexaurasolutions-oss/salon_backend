import { Request, Response } from 'express';
import { prisma } from '../server';

export class CustomerRecordsController {

  static async getConsolidatedProfile(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const current_user = req.user?.user_id;

      if (user_id !== current_user) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const profiles = await prisma.customerSalonProfile.findMany({
        where: { user_id },
        orderBy: { updated_at: 'desc' }
      });

      const consolidated = {
        skin_type: 'Not Specified',
        allergies: 'None Reported',
        medical_conditions: 'None Reported',
        records_count: profiles.length
      };

      if (profiles.length > 0) {
        consolidated.skin_type = profiles.find(p => p.skin_type)?.skin_type || 'Not Specified';

        const allAllergies = profiles.flatMap(p => p.allergy_records ? p.allergy_records.split(',').map(s => s.trim()) : []);
        const allConditions = profiles.flatMap(p => p.medical_conditions ? p.medical_conditions.split(',').map(s => s.trim()) : []);

        const uniqueAllergies = [...new Set(allAllergies.filter(Boolean))];
        const uniqueConditions = [...new Set(allConditions.filter(Boolean))];

        if (uniqueAllergies.length > 0) consolidated.allergies = uniqueAllergies.join(', ');
        if (uniqueConditions.length > 0) consolidated.medical_conditions = uniqueConditions.join(', ');
      }

      res.json({ profile: consolidated });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch consolidated profile' });
    }
  }

  static async getCustomerProfileBySalon(req: Request, res: Response) {
    try {
      const { user_id, salon_id } = req.params;
      const profile = await prisma.customerSalonProfile.findUnique({
        where: { user_id_salon_id: { user_id, salon_id } }
      });
      res.json({ profile });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  static async upsertCustomerProfile(req: Request, res: Response) {
    try {
      const data = req.body;
      const { user_id, salon_id } = data;
      const current_user = req.user?.user_id;

      if (!user_id || !salon_id) return res.status(400).json({ error: 'user_id and salon_id required' });

      let hasAccess = user_id === current_user;
      if (!hasAccess) {
        const role = await prisma.userRole.findFirst({ where: { user_id: current_user, salon_id } });
        const admin = await prisma.platformAdmin.findUnique({ where: { user_id: current_user } });
        if (role || admin) hasAccess = true;
      }
      if (!hasAccess) return res.status(403).json({ error: 'Forbidden' });

      const profile = await prisma.customerSalonProfile.upsert({
        where: { user_id_salon_id: { user_id, salon_id } },
        update: {
          date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
          skin_type: data.skin_type,
          skin_issues: Array.isArray(data.skin_issues) ? data.skin_issues.join(', ') : data.skin_issues,
          allergy_records: Array.isArray(data.allergy_records) ? data.allergy_records.join(', ') : (data.allergy_records || data.allergies),
          medical_conditions: Array.isArray(data.medical_conditions) ? data.medical_conditions.join(', ') : data.medical_conditions,
          notes: data.notes,
          concern_photo_url: data.concern_photo_url,
          concern_photo_public_id: data.concern_photo_public_id
        },
        create: {
          user_id, salon_id,
          date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
          skin_type: data.skin_type,
          skin_issues: Array.isArray(data.skin_issues) ? data.skin_issues.join(', ') : data.skin_issues,
          allergy_records: Array.isArray(data.allergy_records) ? data.allergy_records.join(', ') : (data.allergy_records || data.allergies),
          medical_conditions: Array.isArray(data.medical_conditions) ? data.medical_conditions.join(', ') : data.medical_conditions,
          notes: data.notes,
          concern_photo_url: data.concern_photo_url,
          concern_photo_public_id: data.concern_photo_public_id
        }
      });

      res.json({ success: true, profile });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to save profile' });
    }
  }

  static async getTreatmentRecord(req: Request, res: Response) {
    try {
      const { booking_id } = req.params;
      const record = await prisma.treatmentRecord.findFirst({ where: { booking_id } });
      res.json({ record });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch treatment record' });
    }
  }

  static async getAllTreatments(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const { salon_id } = req.query;

      const treatments = await prisma.treatmentRecord.findMany({
        where: salon_id ? { user_id, salon_id: salon_id as string } : { user_id },
        include: { booking: { include: { service: true } } },
        orderBy: { created_at: 'desc' }
      });
      res.json({ treatments });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch treatments' });
    }
  }

  static async upsertTreatmentRecord(req: Request, res: Response) {
    try {
      const data = req.body;
      const current_user = req.user?.user_id;

      let booking_id = data.booking_id;
      let salon_id = data.salon_id;
      let user_id = data.user_id;

      if (!booking_id && (!salon_id || !user_id)) {
        return res.status(400).json({ error: 'Booking ID or (Salon ID and User ID) required' });
      }

      if (booking_id) {
        const booking = await prisma.booking.findUnique({ where: { id: booking_id } });
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        salon_id = booking.salon_id;
        user_id = booking.user_id;
      }

      let hasAccess = user_id === current_user;
      if (!hasAccess) {
        const role = await prisma.userRole.findFirst({ where: { user_id: current_user, salon_id } });
        const admin = await prisma.platformAdmin.findUnique({ where: { user_id: current_user } });
        if (role || admin) hasAccess = true;
      }

      if (!hasAccess) return res.status(403).json({ error: 'Forbidden' });

      const recordId = data.id || undefined;
      const existing = booking_id ? await prisma.treatmentRecord.findFirst({ where: { booking_id } }) : null;
      const targetId = existing?.id || recordId;

      const payload = {
        booking_id, user_id, salon_id,
        service_name_manual: data.service_name_manual,
        record_date: data.record_date ? new Date(data.record_date) : undefined,
        treatment_details: data.treatment_details,
        products_used: data.products_used,
        skin_reaction: data.skin_reaction,
        improvement_notes: data.improvement_notes,
        recommended_next_treatment: data.recommended_next_treatment,
        post_treatment_instructions: data.post_treatment_instructions,
        follow_up_reminder_date: data.follow_up_reminder_date ? new Date(data.follow_up_reminder_date) : undefined,
        marketing_notes: data.marketing_notes,
        before_photo_url: data.before_photo_url,
        before_photo_public_id: data.before_photo_public_id,
        after_photo_url: data.after_photo_url,
        after_photo_public_id: data.after_photo_public_id
      };

      if (targetId) {
        const { booking_id, user_id, salon_id, ...updatePayload } = payload;
        await prisma.treatmentRecord.update({ where: { id: targetId }, data: updatePayload });
      } else {
        await prisma.treatmentRecord.create({ data: payload });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to save treatment record', detail: error.message });
    }
  }

  static async getTransformations(req: Request, res: Response) {
    try {
      const records = await prisma.treatmentRecord.findMany({
        where: { before_photo_url: { not: null }, after_photo_url: { not: null } },
        include: {
          user: { include: { profile: true } },
          booking: { include: { service: true, review: true } }
        },
        orderBy: { created_at: 'desc' }
      });

      const transformations = records.map(tr => ({
        id: tr.id,
        before_image: tr.before_photo_url,
        after_image: tr.after_photo_url,
        comment: tr.treatment_details,
        customer_name: tr.user.profile?.full_name || tr.user.email.split('@')[0],
        treatment_name: tr.booking?.service?.name || tr.service_name_manual || 'Treatment',
        duration: tr.booking?.service?.duration_minutes ? `${tr.booking.service.duration_minutes} Minutes` : 'Unknown',
        rating: tr.booking?.review?.rating || 5
      }));

      res.json({ transformations });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch transformations' });
    }
  }
}
