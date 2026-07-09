import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient must be linked to a registered User.'],
      unique: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Patient must have a date of birth.'],
    },
    gender: {
      type: String,
      required: [true, 'Patient must have a gender defined.'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: 'Gender must be either: Male, Female, or Other.',
      },
    },
    phoneNumber: {
      type: String,
      required: [true, 'Patient phone number is required.'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Patient residential address is required.'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: 'Blood group must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-.',
      },
    },
    emergencyContact: {
      name: {
        type: String,
        required: [true, 'Emergency contact name is required.'],
        trim: true,
      },
      relationship: {
        type: String,
        required: [true, 'Emergency contact relationship is required.'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Emergency contact phone number is required.'],
        trim: true,
      },
    },
    allergies: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
