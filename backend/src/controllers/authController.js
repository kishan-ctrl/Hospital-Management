import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import AppError from '../utils/AppError.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/tokenUtils.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

/**
 * Helper function to send tokens and user data in response
 */
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store the refresh token in the user record
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    accessToken,
    refreshToken,
    data: {
      user,
    },
  });
};

/**
 * Public User Self-Registration (always registers as 'patient')
 */
export const register = async (req, res, next) => {
  try {
    // 1. Parse and validate input payload
    const validationResult = registerSchema.safeParse(req.body);
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

    // 3. Create the User account (role is fixed to 'patient')
    const newUser = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'patient',
    });

    try {
      // 4. Create the linked Patient clinical demographics record
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
    } catch (patientErr) {
      // Clean up the created User if Patient record creation fails (Rollback)
      await User.findByIdAndDelete(newUser._id);
      return next(new AppError(`Patient Profile Creation Failed: ${patientErr.message}`, 500));
    }

    // 5. Send tokens
    await sendTokenResponse(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * User Login
 */
export const login = async (req, res, next) => {
  try {
    // 1. Validate payload
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((e) => e.message).join(', ');
      return next(new AppError(`Validation Failure: ${errorMsg}`, 400));
    }

    const { email, password } = validationResult.data;

    // 2. Find user & select password explicitly
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // 3. Check if user account is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    // 4. Check if password matches
    const isMatch = await user.comparePassword(password, user.password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // 5. Success -> send tokens
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * Regenerate Access Token using a Refresh Token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.headers['x-refresh-token'];
    
    if (!token) {
      return next(new AppError('Refresh token is missing.', 400));
    }

    // 1. Verify token signature
    let decoded;
    try {
      decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_1122334455');
    } catch (err) {
      return next(new AppError('Invalid or expired refresh token. Please login again.', 401));
    }

    // 2. Find user by id and check if their stored token matches
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || !user.isActive || user.refreshToken !== token) {
      return next(new AppError('Authentication failed. Token is invalid or user is inactive.', 401));
    }

    // 3. Generate a new access token
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      status: 'success',
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Authenticated User Profile
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user has been loaded by protect middleware
    let details = null;

    if (req.user.role === 'patient') {
      details = await Patient.findOne({ user: req.user._id });
    } else if (req.user.role === 'doctor') {
      details = await Doctor.findOne({ user: req.user._id });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
        profileDetails: details,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public endpoint to retrieve all active Doctor profiles
 */
export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate({
        path: 'user',
        match: { isActive: true },
        select: 'name email role',
      });

    // Filter out records where user is soft-deleted/inactive (match returns null)
    const activeDoctors = doctors.filter((doc) => doc.user !== null);

    res.status(200).json({
      status: 'success',
      results: activeDoctors.length,
      data: {
        doctors: activeDoctors,
      },
    });
  } catch (error) {
    next(error);
  }
};
