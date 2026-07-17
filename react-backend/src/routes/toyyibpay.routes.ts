import { Router } from 'express';
import { ToyyibPayController } from '../controllers/toyyibpay.controller';

const router = Router();

router.post('/create-bill', ToyyibPayController.createBill);
router.post('/callback', ToyyibPayController.callback); // Webhook callback from ToyyibPay

export default router;
