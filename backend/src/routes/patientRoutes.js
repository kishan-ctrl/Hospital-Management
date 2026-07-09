import express from 'express';
import { 
  getAllPatients, 
  getPatientById, 
  getMyPatientProfile, 
  updateMyPatientProfile, 
  updatePatientProfileById 
} from '../controllers/patientController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected by login authentication
router.use(protect);

// Clinicians fetch all patients or individual by id
router.get('/', restrictTo('admin', 'doctor'), getAllPatients);
router.get('/:id', restrictTo('admin', 'doctor'), getPatientById);
router.put('/:id', restrictTo('admin', 'doctor'), updatePatientProfileById);

// Patients view and update their own demographics profile
router.get('/profile/me', restrictTo('patient'), getMyPatientProfile);
router.put('/profile/me', restrictTo('patient'), updateMyPatientProfile);

export default router;
