import express from 'express';
import {
  register,
  login,
  getMe,
  verifyOtp,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/forgotpassword', authLimiter, forgotPassword);
router.put('/resetpassword', authLimiter, resetPassword);
router.get('/me', protect, getMe);

export default router;
