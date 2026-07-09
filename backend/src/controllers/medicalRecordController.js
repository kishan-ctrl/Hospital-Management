import MedicalRecord from '../models/MedicalRecord.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

/**
 * Doctor Creates a Medical Record (with optional medical imaging attachments)
 * Access: Doctor
 */
export const createMedicalRecord = async (req, res, next) => {
  try {
    const { patient, diagnosis, treatmentPlan, notes } = req.body;
    const doctorId = req.user._id;

    // 1. Verify Patient user exists and is a patient
    const patientUser = await User.findById(patient);
    if (!patientUser || patientUser.role !== 'patient') {
      return next(new AppError('Selected patient account is invalid or does not exist.', 400));
    }

    // 2. Build attachments array from uploaded files (if any)
    const attachments = [];
    if (req.file) {
      attachments.push({
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
      });
    } else if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        attachments.push({
          name: file.originalname,
          url: `/uploads/${file.filename}`,
        });
      });
    }

    // 3. Create the Medical Record
    const medicalRecord = await MedicalRecord.create({
      patient,
      doctor: doctorId,
      diagnosis,
      treatmentPlan,
      notes,
      attachments,
    });

    res.status(201).json({
      status: 'success',
      data: {
        medicalRecord,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Medical History for a specific Patient
 * Access: Admin, Doctor, or the Patient themselves
 */
export const getPatientMedicalHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Privacy logic: Patient can only view their own history
    if (req.user.role === 'patient' && !req.user._id.equals(patientId)) {
      return next(new AppError('Access Denied. You are only authorized to access your own medical history.', 403));
    }

    // Verify patient user exists
    const patientUser = await User.findById(patientId);
    if (!patientUser) {
      return next(new AppError('No patient account found with that ID.', 404));
    }

    const history = await MedicalRecord.find({ patient: patientId, isActive: true })
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: history.length,
      data: {
        history,
      },
    });
  } catch (error) {
    next(error);
  }
};
