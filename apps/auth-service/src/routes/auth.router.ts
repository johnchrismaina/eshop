import express, { Router } from 'express';
import {
  loginUser,
  resetUserPassword,
  // userForgotPassword,
  userRegistration,
  verifyUser,
} from '../controller/auth.controller';
import {
  handleForgotPassword,
  verifyForgotPasswordOtp,
} from '@auth/utils/auth.helper';

const router: Router = express.Router();

router.post('/user-registration', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', loginUser);
router.post('/forgot-password-user', handleForgotPassword);
router.post('/reset-password-user', resetUserPassword);
router.post('/verify-forgot-password-user', verifyForgotPasswordOtp);

export default router;
