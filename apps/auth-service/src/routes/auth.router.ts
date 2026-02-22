import express, { Router } from 'express';
import {
  addUserAddress,
  createShop,
  createStripeConnectLink,
  deleteUserAddress,
  getAdmin,
  getLayoutData,
  getSeller,
  getUser,
  getUserAddresses,
  loginAdmin,
  loginSeller,
  loginUser,
  logoutUser,
  logoutSeller,
  refreshToken,
  registerSeller,
  resetUserPassword,
  updateUserPassword,
  userForgotPassword,
  // userForgotPassword,
  userRegistration,
  verifySeller,
  verifyUser,
  verifyUserForgotPassword,
} from '../controller/auth.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isAdmin, isSeller } from '@packages/middleware/authorizeRoles';

const router: Router = express.Router();

router.post('/user-registration', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', loginUser);
router.post('/refresh-token', refreshToken);
router.get('/logged-in-user', isAuthenticated, getUser);
router.post('/logout-user', logoutUser);
router.post('/forgot-password-user', userForgotPassword);
router.post('/verify-forgot-password-user', verifyUserForgotPassword);
router.post('/reset-password-user', resetUserPassword);
router.post('/change-password', isAuthenticated, updateUserPassword);
router.post('/seller-registration', registerSeller);
router.post('/verify-seller', verifySeller);
router.post('/login-seller', loginSeller);
router.get('/logged-in-seller', isAuthenticated, isSeller, getSeller);
router.post('/logout-seller', logoutSeller);
router.post('/create-shop', createShop);
router.post('/create-stripe-link', createStripeConnectLink);
router.post('/login-admin', loginAdmin);
router.get('/logged-in-admin', isAuthenticated, isAdmin, getAdmin);
// router.post('/logout-admin', isAuthenticated, logoutAdmin);

router.get('/shipping-addresses', isAuthenticated, getUserAddresses);
router.post('/add-address', isAuthenticated, addUserAddress);
router.delete('/delete-address/:addressId', isAuthenticated, deleteUserAddress);
router.get('/get-layouts', getLayoutData);

export default router;
