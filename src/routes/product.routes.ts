import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { addNewProduct, updateStock } from '../controllers/product.controller';

const router = Router();

router.post('/updateStock', authenticate, updateStock);

router.post('/addNewProduct', authenticate, addNewProduct);

export default router; 