import { Router } from 'express';
import { CustomerRecordsController } from '../controllers/customer_records.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// General Profile
router.post('/', CustomerRecordsController.upsertCustomerProfile);
router.get('/:user_id/profile', CustomerRecordsController.getConsolidatedProfile);
router.get('/:user_id/salon/:salon_id', CustomerRecordsController.getCustomerProfileBySalon);

// Treatments
router.post('/treatments', CustomerRecordsController.upsertTreatmentRecord);
router.get('/treatments/:booking_id', CustomerRecordsController.getTreatmentRecord);
router.get('/:user_id/treatments', CustomerRecordsController.getAllTreatments);

// Global
router.get('/transformations', CustomerRecordsController.getTransformations);

export default router;
