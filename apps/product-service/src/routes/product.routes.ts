import express, { Router } from 'express';
import {
  createDiscountCodes,
  createEvent,
  createProduct,
  deleteDiscountCode,
  deleteEvent,
  deleteProduct,
  deleteProductImage,
  getAllEvents,
  getAllProducts,
  getCategories,
  getDiscountCodes,
  getFilteredEvents,
  getFilteredProducts,
  getFilteredShops,
  getProductDetails,
  getShopEvents,
  getShopProducts,
  getStripeAccount,
  restoreEvent,
  // getStripeAccount,
  restoreProduct,
  searchProducts,
  topShops,
  uploadProductImage,
} from '../controllers/product.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { upload } from '@packages/middleware/multer';
import { isSeller } from '@packages/middleware/authorizeRoles';
// import { isSeller } from '@packages/middleware/authorizeRoles';

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
router.post('/create-product', isAuthenticated, createProduct);
router.post('/create-event', isAuthenticated, createEvent);
router.get('/get-shop-products', isAuthenticated, getShopProducts);
router.get('/get-shop-events', isAuthenticated, getShopEvents);
router.delete('/delete-product/:productId', isAuthenticated, deleteProduct);
router.put('/restore-product/:productId', isAuthenticated, restoreProduct);
router.delete('/delete-event/:eventId', isAuthenticated, deleteEvent);
router.put('/restore-event/:eventId', isAuthenticated, restoreEvent);
router.get('/get-stripe-account', isAuthenticated, isSeller, getStripeAccount);
router.get('/get-all-products', getAllProducts);
router.get('/get-all-events', getAllEvents);
router.get('/get-product/:slug', getProductDetails);
router.get('/get-filtered-products', getFilteredProducts);
router.get('/get-filtered-offers', getFilteredEvents);
router.get('/get-filtered-shops', getFilteredShops);
router.get('/search-products', searchProducts);
router.get('/top-shops', topShops);

export default router;
