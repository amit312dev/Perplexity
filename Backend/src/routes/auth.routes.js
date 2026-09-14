import { Router } from 'express';
import {
  registerUser,
  loginUser,
  verifyEmail,
  testEmail,
  mailHealthCheck,
  resendVerificationEmail,
  getMe,
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  registerValidation,
  loginValidation,
  handleValidationErrors,
} from '../validators/auth.validator.js';

const authRouter = Router();

authRouter.post(
  '/register',
  registerValidation,
  handleValidationErrors,
  registerUser
);

authRouter.get('/verify-email', verifyEmail);
authRouter.post('/login', loginValidation, handleValidationErrors, loginUser);
authRouter.post('/resend-verification', resendVerificationEmail);
authRouter.post('/test-email', testEmail);
authRouter.get('/mail-health', mailHealthCheck);
authRouter.get('/me', verifyToken, getMe);

export default authRouter;