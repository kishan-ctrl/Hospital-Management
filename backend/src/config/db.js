import mongoose from 'mongoose';
import logger from './logger.js';
import User from '../models/User.js';

const maxRetries = 5;
let retryCount = 0;

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    logger.error('Database connection URI MONGODB_URI is undefined in environment configuration.');
    process.exit(1);
  }

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    logger.info('Attempting database connection to MongoDB Atlas...');
    await mongoose.connect(mongoUri, options);
    logger.info('Database connection established successfully.');
    retryCount = 0;

    // Auto-seed default admin 
    try {
      const email = 'admin@hospital.com';
      const existingAdmin = await User.findOne({ email });
      if (!existingAdmin) {
        await User.create({
          name: 'HMS Admin',
          email,
          password: 'adminpassword123',
          role: 'admin',
        });
        logger.info('Default Admin user (admin@hospital.com / adminpassword123) successfully seeded.');
      }
    } catch (seedError) {
      logger.error('Error during auto-seeding admin user:', seedError);
    }
  } catch (error) {
    retryCount++;
    logger.error(`Database connection failure (Attempt ${retryCount}/${maxRetries}):`, error);

    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000;
      logger.info(`Reattempting database connection in ${delay / 1000} seconds...`);
      setTimeout(connectDatabase, delay);
    } else {
      logger.error('Critical database connection attempts exhausted. Exiting process.');
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose connection disconnected. Attempting automatic recovery...');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose collection listener encountered error:', err);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Mongoose connections closed due to app termination (SIGINT).');
  process.exit(0);
});

export default connectDatabase;