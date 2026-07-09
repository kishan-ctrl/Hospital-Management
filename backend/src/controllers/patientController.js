import Patient from '../models/Patient.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

/**
 * Get All Active Patients
 * Access: Admin, Doctor
 */
export const getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find({ isActive: true }).populate('user', 'name email role');
    
    res.status(200).json({
      status: 'success',
      results: patients.length,
      data: {
        patients,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Patient Profile by Patient ID
 * Access: Admin, Doctor
 */
export const getPatientById = async (req, res, next) => {
  try {
    let patient = await Patient.findById(req.params.id).populate('user', 'name email role');
    
    // If not found by Patient ID, fallback to searching by User ID
    if (!patient) {
      patient = await Patient.findOne({ user: req.params.id }).populate('user', 'name email role');
    }

    if (!patient || !patient.isActive) {
      return next(new AppError('No active patient found with that ID.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        patient,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Logged-in Patient's Demographics Profile
 * Access: Patient
 */
export const getMyPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user', 'name email role');
    
    if (!patient) {
      return next(new AppError('No clinical profile found for this user account.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        patient,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Patient Updates Their Own Profile Details
 * Access: Patient
 */
export const updateMyPatientProfile = async (req, res, next) => {
  try {
    // Whitelist editable fields
    const { phoneNumber, address, bloodGroup, allergies, emergencyContact } = req.body;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return next(new AppError('No clinical profile found for this user account.', 404));
    }

    if (phoneNumber) patient.phoneNumber = phoneNumber;
    if (address) patient.address = address;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (allergies) patient.allergies = allergies;
    if (emergencyContact) patient.emergencyContact = emergencyContact;

    await patient.save();

    res.status(200).json({
      status: 'success',
      data: {
        patient,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clinician updates patient demographics
 * Access: Admin, Doctor
 */
export const updatePatientProfileById = async (req, res, next) => {
  try {
    const { phoneNumber, address, bloodGroup, allergies, emergencyContact, dateOfBirth, gender } = req.body;

    let patient = await Patient.findById(req.params.id);
    if (!patient) {
      patient = await Patient.findOne({ user: req.params.id });
    }

    if (!patient) {
      return next(new AppError('No patient profile found with that ID.', 404));
    }

    if (phoneNumber) patient.phoneNumber = phoneNumber;
    if (address) patient.address = address;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (allergies) patient.allergies = allergies;
    if (emergencyContact) patient.emergencyContact = emergencyContact;
    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
    if (gender) patient.gender = gender;

    await patient.save();

    res.status(200).json({
      status: 'success',
      data: {
        patient,
      },
    });
  } catch (error) {
    next(error);
  }
};
