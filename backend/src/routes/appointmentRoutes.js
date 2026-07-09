import express from 'express';
import { 
  bookAppointment, 
  getAllAppointments, 
  updateAppointmentStatus 
} from '../controllers/appointmentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All scheduling routes are protected by login verification
router.use(protect);

// Allow patients, admins, and staff (labeled 'user') to book appointments
router.post('/', restrictTo('patient', 'admin', 'user'), bookAppointment);

// Lists appointments (internally filters based on role)
router.get('/', getAllAppointments);

// Cancel or update appointment status (internally verified for ownership)
router.patch('/:id', updateAppointmentStatus);

export default router;
