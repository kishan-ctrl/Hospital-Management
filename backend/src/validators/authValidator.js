import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  // Demographics required for Patient registration
  dateOfBirth: z.string({ required_error: 'Date of birth is required' }).datetime({ message: "Invalid date format, expect ISO-8601" }).or(z.string().transform(val => new Date(val))),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
  phoneNumber: z.string({ required_error: 'Phone number is required' }),
  address: z.string({ required_error: 'Address is required' }),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string({ required_error: 'Emergency contact name is required' }),
    relationship: z.string({ required_error: 'Relationship details are required' }),
    phone: z.string({ required_error: 'Emergency contact phone number is required' }),
  }, { required_error: 'Emergency contact details are required' }),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
  password: z.string({ required_error: 'Password is required' }),
});

export const createUserSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'doctor', 'patient', 'user'], { required_error: 'Role is required' }),
  
  // Conditionally optional fields depending on role. Evaluated in controllers but structured here
  dateOfBirth: z.string().or(z.date()).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
  }).optional(),
  
  specialization: z.string().optional(),
  qualifications: z.string().optional(),
  experienceYears: z.number().or(z.string().transform(v => Number(v))).optional(),
  consultationFee: z.number().or(z.string().transform(v => Number(v))).optional(),
  availability: z.array(z.object({
    dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
  profilePhoto: z.string().optional(),
});
