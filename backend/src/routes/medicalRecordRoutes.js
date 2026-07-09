import express from 'express';
import { 
  createMedicalRecord, 
  getPatientMedicalHistory 
} from '../controllers/medicalRecordController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Protect all medical record history endpoints
router.use(protect);

// Doctors can create medical records with up to 5 medical scans/imaging attachments
router.post(
  '/', 
  restrictTo('doctor'), 
  upload.array('attachments', 5), 
  createMedicalRecord
);

// Retrieves history for a specific patient ID (Admins/Doctors can see all; Patients can see only their own)
router.get('/patient/:patientId', getPatientMedicalHistory);

export default router;
