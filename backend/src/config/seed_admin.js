import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User.js';

// Configure dotenv
dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("MONGODB_URI is not defined in env configuration.");
      process.exit(1);
    }
    
    console.log("Connecting to Database...");
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully.");

    const email = 'admin@hospital.com';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin user already exists in the database.");
    } else {
      await User.create({
        name: "HMS Admin",
        email,
        password: "adminpassword123",
        role: "admin",
      });
      console.log("Default Admin user (admin@hospital.com / adminpassword123) successfully seeded.");
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
};

seedAdmin();
