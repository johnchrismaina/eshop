import express, { Router } from 'express';
import {
  loginUser,
  refreshToken,
  resetUserPassword,
  // userForgotPassword,
  userRegistration,
  verifyUser,
  verifyUserForgotPassword,
} from '../controller/auth.controller';
import { handleForgotPassword } from '@auth/utils/auth.helper';
import isAuthenticated from '@packages/middleware/isAuthenticated';

const router: Router = express.Router();

router.post('/user-registration', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', loginUser);
router.post('/refresh-token-user', refreshToken);
router.post('/logged-in-user', isAuthenticated,);
router.post('/forgot-password-user', handleForgotPassword);
router.post('/reset-password-user', resetUserPassword);
router.post('/verify-forgot-password-user', verifyUserForgotPassword);

export default router;
