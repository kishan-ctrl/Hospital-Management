import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true, // File path URL (e.g. "/uploads/mri-scan.jpg")
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Medical record must belong to a Patient.'],
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Medical record must be authored by a Doctor.'],
      index: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'A diagnosis description is required.'],
      trim: true,
    },
    treatmentPlan: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    attachments: {
      type: [attachmentSchema],
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

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;
