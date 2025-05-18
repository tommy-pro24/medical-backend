import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { updateStock } from '../controllers/product.controller';

const router = Router();

router.post('/updateStock', authenticate, updateStock);

export default router; 