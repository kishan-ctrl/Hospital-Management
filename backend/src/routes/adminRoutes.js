import express from 'express';
import { createUser, getAllUsers, deactivateUser } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection & admin restriction to all routes in this file
router.use(protect);
router.use(restrictTo('admin'));

router.post('/users', createUser);
router.get('/users', getAllUsers);
router.delete('/users/:id', deactivateUser);

export default router;
