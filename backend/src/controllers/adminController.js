import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import AppError from '../utils/AppError.js';
import { createUserSchema } from '../validators/authValidator.js';

/**
 * Admin Creates Other Users (Admins, Doctors, Patients, Staff)
 */
export const createUser = async (req, res, next) => {
  try {
    // 1. Validate payload
    const validationResult = createUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((e) => e.message).join(', ');
      return next(new AppError(`Validation Failure: ${errorMsg}`, 400));
    }

    const data = validationResult.data;

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return next(new AppError('A user with this email address already exists.', 400));
    }

    // 3. Create core user profile
    const newUser = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    });

    try {
      // 4. Conditionally create associated records
      if (data.role === 'patient') {
        // Ensure necessary fields are provided
        if (!data.dateOfBirth || !data.gender || !data.phoneNumber || !data.address || !data.emergencyContact) {
          throw new Error('Clinical demographics (dateOfBirth, gender, phoneNumber, address, emergencyContact) are required for Patient role.');
        }

        await Patient.create({
          user: newUser._id,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          phoneNumber: data.phoneNumber,
          address: data.address,
          bloodGroup: data.bloodGroup,
          allergies: data.allergies,
          emergencyContact: data.emergencyContact,
        });
      } else if (data.role === 'doctor') {
        // Ensure necessary fields are provided
        if (!data.specialization || !data.qualifications || data.experienceYears === undefined || data.consultationFee === undefined) {
          throw new Error('Professional specs (specialization, qualifications, experienceYears, consultationFee) are required for Doctor role.');
        }

        await Doctor.create({
          user: newUser._id,
          specialization: data.specialization,
          qualifications: data.qualifications,
          experienceYears: data.experienceYears,
          consultationFee: data.consultationFee,
          availability: data.availability || [],
          profilePhoto: data.profilePhoto || undefined,
        });
      }
    } catch (profileErr) {
      // Rollback Core User registration on Profile Creation error
      await User.findByIdAndDelete(newUser._id);
      return next(new AppError(`Profile Creation Failed: ${profileErr.message}`, 400));
    }

    // Hide password
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Lists All Users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Deactivates / Soft-Deletes a User account
 */
export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('No user found with that ID.', 404));
    }

    // Admins cannot deactivate themselves
    if (user._id.equals(req.user._id)) {
      return next(new AppError('You cannot deactivate your own account.', 400));
    }

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    // Also deactivate patient profile details if they are patient
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ user: user._id });
      if (patient) {
        patient.isActive = false;
        await patient.save();
      }
    }

    res.status(200).json({
      status: 'success',
      message: `User account ${user.email} successfully deactivated.`,
    });
  } catch (error) {
    next(error);
  }
};
