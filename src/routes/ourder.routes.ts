import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getOrders } from '../controllers/order.controller';

const router = Router();

router.post('/getAllOrders', authenticate, getOrders);

export default router; 
