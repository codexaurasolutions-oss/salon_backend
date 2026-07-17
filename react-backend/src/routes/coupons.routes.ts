import { Router } from 'express';
import { CouponsController } from '../controllers/coupons.controller';

const router = Router();

router.get('/validate/:code', CouponsController.validateCoupon);

export default router;
