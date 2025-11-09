import express, { Router } from 'express';
import {
  createDiscountCodes,
  deleteDiscountCode,
  deleteProductImage,
  getCategories,
  getDiscountCodes,
  uploadProductImage,
} from '../controllers/product.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { upload } from '@packages/middleware/multer';

const router: Router = express.Router();

router.get('/get-categories', getCategories);
router.post('/create-discount-code', isAuthenticated, createDiscountCodes);
router.get('/get-discount-codes', isAuthenticated, getDiscountCodes);
router.delete('/delete-discount-code/:id', isAuthenticated, deleteDiscountCode);
// router.post('/upload-product-image', isAuthenticated, uploadProductImage);
router.post(
  '/upload-product-image',
  upload.single('image'),
  isAuthenticated,
  uploadProductImage
);
router.delete('/delete-product-image', isAuthenticated, deleteProductImage);

export default router;
