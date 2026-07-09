import express from 'express';
import { register, login, refreshToken, getMe, getDoctors } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/doctors', getDoctors);

// Protected routes
router.get('/me', protect, getMe);

export default router;
