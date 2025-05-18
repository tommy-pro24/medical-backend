import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { addNewProduct, updateStock, getAllProduct, updateProduct } from '../controllers/product.controller';

const router = Router();

router.post('/updateStock', authenticate, updateStock);

router.post('/addNewProduct', authenticate, addNewProduct);

router.post('/getAllProduct', getAllProduct);

router.post('/updateProduct', authenticate, updateProduct);

export default router; 