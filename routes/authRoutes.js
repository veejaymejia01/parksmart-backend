import express from 'express';
import { 
  register, 
  verifyOTP, 
  resendOTP, 
  login, 
  adminLogin, 
  forgotPassword, 
  resetPassword,
  verifyEmailLink
} from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/resend-otp', authLimiter, resendOTP);
router.post('/login', authLimiter, login);
router.post('/admin/login', authLimiter, adminLogin);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/verify-email/:token', authLimiter, verifyEmailLink);

export default router;

