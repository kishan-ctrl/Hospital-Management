import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

/**
 * Book an Appointment
 * Access: Patient, Admin, Staff ('user')
 */
export const bookAppointment = async (req, res, next) => {
  try {
    const { doctor, date, timeSlot, symptoms, notes, billingStatus } = req.body;
    let patientId = req.user._id;

    // Admins and Staff can book on behalf of any Patient
    if (req.user.role === 'admin' || req.user.role === 'user') {
      if (!req.body.patient) {
        return next(new AppError('For admin/staff booking, the patient field is required.', 400));
      }
      patientId = req.body.patient;
    }

    // 1. Verify Patient user exists and has 'patient' role
    const patientUser = await User.findById(patientId);
    if (!patientUser || patientUser.role !== 'patient') {
      return next(new AppError('Selected patient account is invalid or does not exist.', 400));
    }

    // 2. Verify Doctor user exists and has 'doctor' role
    const doctorUser = await User.findById(doctor);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return next(new AppError('Selected doctor account is invalid or does not exist.', 400));
    }

    // 3. Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor,
      date,
      timeSlot,
      symptoms,
      notes,
      billingStatus: billingStatus || 'pending',
    });

    res.status(201).json({
      status: 'success',
      data: {
        appointment,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Appointments List (Filtered by Role permissions)
 * Access: Protected (All Roles)
 */
export const getAllAppointments = async (req, res, next) => {
  try {
    let filter = {};

    // Apply filters based on roles
    if (req.user.role === 'patient') {
      filter.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user._id;
    }
    // Admins and Staff see all appointments

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: {
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Appointment Details or Status
 * Access: Protected (All Roles with ownership checks)
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, date, timeSlot, notes, billingStatus } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new AppError('No appointment found with that ID.', 404));
    }

    // Role-based authorization check
    if (req.user.role === 'patient') {
      // Patients can only cancel their own appointments
      if (!appointment.patient.equals(req.user._id)) {
        return next(new AppError('Unauthorized. You can only cancel your own appointments.', 403));
      }
      if (status && status !== 'cancelled') {
        return next(new AppError('Unauthorized. Patients can only update status to cancelled.', 400));
      }
      appointment.status = 'cancelled';
    } else if (req.user.role === 'doctor') {
      // Doctors can only manage their assigned appointments
      if (!appointment.doctor.equals(req.user._id)) {
        return next(new AppError('Unauthorized. You can only update appointments assigned to you.', 403));
      }
      if (status) appointment.status = status;
      if (notes) appointment.notes = notes;
    } else {
      // Admins and Staff can change everything
      if (status) appointment.status = status;
      if (date) appointment.date = date;
      if (timeSlot) appointment.timeSlot = timeSlot;
      if (notes) appointment.notes = notes;
      if (billingStatus) appointment.billingStatus = billingStatus;
    }

    await appointment.save();

    res.status(200).json({
      status: 'success',
      data: {
        appointment,
      },
    });
  } catch (error) {
    next(error);
  }
};
