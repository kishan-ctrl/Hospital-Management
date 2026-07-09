import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  startTime: {
    type: String,
    required: true, // Format: "HH:MM" e.g., "09:00"
  },
  endTime: {
    type: String,
    required: true, // Format: "HH:MM" e.g., "17:00"
  },
}, { _id: false });

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor must be linked to a registered User.'],
      unique: true,
      index: true,
    },
    specialization: {
      type: String,
      required: [true, 'Doctor must have a designated specialization.'],
      trim: true,
    },
    qualifications: {
      type: String,
      required: [true, 'Doctor qualifications must be listed.'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: [true, 'Doctor must define experience years.'],
      min: [0, 'Years of experience cannot be negative.'],
    },
    consultationFee: {
      type: Number,
      required: [true, 'Doctor consultation fee is required.'],
      min: [0, 'Fee cannot be negative.'],
    },
    availability: {
      type: [availabilitySchema],
      default: [],
    },
    profilePhoto: {
      type: String,
      default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
