import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An appointment must have a Patient.'],
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An appointment must have an assigned Doctor.'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required.'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Appointment time slot is required.'], // e.g. "10:30 AM" or "Morning"
    },
    status: {
      type: String,
      enum: {
        values: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
        message: 'Status must be: scheduled, completed, cancelled, or rescheduled.',
      },
      default: 'scheduled',
    },
    symptoms: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    billingStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
