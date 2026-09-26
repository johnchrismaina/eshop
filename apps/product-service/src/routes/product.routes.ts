import express, { Router } from 'express';
import {
  createDiscountCodes,
  createDeal,
  createProduct,
  deleteDeal,
  deleteDiscountCode,
  deleteProduct,
  deleteProductImage,
  getAllDeals,
  getAllProducts,
  getCategories,
  getDiscountCodes,
  getFilteredProducts,
  getFilteredShops,
  getProductDetails,
  getShopDeals,
  getShopProducts,
  getStripeAccount,
  restoreDeal,
  // getStripeAccount,
  restoreProduct,
  searchProducts,
  topShops,
  updateShopDetails,
  uploadProductImage,
  getFilteredDeals,
  getProductBySlug,
  updateProductBySlug,
  redeemDiscountHandler,
  uploadVariantImage,
  getTrendingProducts,
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
router.post('/redeem-discount', isAuthenticated, redeemDiscountHandler);
// router.post('/upload-product-image', isAuthenticated, uploadProductImage);
router.post(
  '/upload-product-image',
  upload.single('image'),
  isAuthenticated,
  uploadProductImage
);
router.post(
  '/upload-variant-image',
  upload.single('image'),
  isAuthenticated,
  uploadVariantImage
);
router.delete('/delete-product-image', isAuthenticated, deleteProductImage);
router.post('/create-product', isAuthenticated, createProduct);
router.post('/create-deal', isAuthenticated, createDeal);
router.get('/get-shop-products', isAuthenticated, getShopProducts);
// router.get('/get-product', isAuthenticated, getProductBySlug);
router.get('/product/get-product/:slug', isAuthenticated, getProductBySlug);
router.get('/get-shop-deals', isAuthenticated, getShopDeals);

router.delete('/delete-product/:id', isAuthenticated, deleteProduct);
router.put('/restore-product/:id', isAuthenticated, restoreProduct);
router.delete('/delete-deal/:id', isAuthenticated, deleteDeal);
router.put('/restore-deal/:id', isAuthenticated, restoreDeal);

router.get('/get-stripe-account', isAuthenticated, isSeller, getStripeAccount);
router.get('/get-all-products', getAllProducts);
router.get('/get-all-deals', getAllDeals);
router.get('/get-product/:slug', getProductDetails); // Used by edit page
router.put('/update-product/:slug', updateProductBySlug);
router.get('/product/get-trending-products', getTrendingProducts);
router.get('/get-filtered-products', getFilteredProducts);
router.get('/get-filtered-deals', getFilteredDeals);
router.get('/get-filtered-shops', getFilteredShops);
router.get('/search-products', searchProducts);
router.get('/top-shops', topShops);
router.post('/update-shop-details', updateShopDetails);

export default router;
