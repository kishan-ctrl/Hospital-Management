import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import mongoose from 'mongoose';
import path from 'path';
import connectDatabase from './config/db.js';
import logger from './config/logger.js';
import AppError from './utils/AppError.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import medicalRecordRoutes from './routes/medicalRecordRoutes.js';


// Load environment configurations (Force reload)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDatabase();

// ----------------- SECURITY & OPTIMIZATION MIDDLEWARES -----------------

// 1. Helmet: Set various HTTP headers to secure the application
app.use(helmet());

// 2. CORS configuration supporting multiple domains
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',') 
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new AppError('Request blocked by CORS security policy.', 403));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// 3. Compression: Gzip compression to reduce packet payload sizes
app.use(compression());

// 4. Body Parser: Limit JSON requests size to avoid denial-of-service (DoS) memory exhaustions
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Uploaded Files Statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 5. Rate Limiting: Limit request frequency from individual IP addresses
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'fail',
    message: 'Too many requests generated from this IP. Please try again after 15 minutes.'
  }
});
app.use('/api', apiLimiter);

// 6. Custom Logging Middleware: Log all requests passing through the API
app.use((req, res, next) => {
  logger.info(`${req.method} request received at ${req.originalUrl} from IP ${req.ip}`);
  next();
});

// ----------------- ROUTES & ENDPOINTS -----------------

// API Router Mounts
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);

// Simple Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    uptime: process.uptime(),
    dbState: mongooseConnectionStateText(),
    dbName: mongoose.connection.name
  });
});

// Unhandled Route handler (404)
app.all('*', (req, res, next) => {
  next(new AppError(`Requested resource ${req.originalUrl} not found on this server.`, 404));
});

// Helper to determine Mongoose connection status text
function mongooseConnectionStateText() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateIndex = mongooseConnectionStateIndex();
  return states[stateIndex] || 'unknown';
}

function mongooseConnectionStateIndex() {
  try {
    // Dynamically retrieve mongoose state
    return mongooseConnectionState();
  } catch {
    return 0;
  }
}

function mongooseConnectionState() {
  // Safe helper to avoid circular imports
  return mongooseConnectionIndex();
}

function mongooseConnectionIndex() {
  // Node ES Modules dynamic check
  const state = connectDatabaseState();
  return state;
}

function connectDatabaseState() {
  // Returns mongoose connection index state
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const db = mongooseConnectionObj();
  return db ? db.readyState : 0;
}

function mongooseConnectionObj() {
  // Access global mongoose connection
  try {
    const mongooseRef = expressMongoose();
    return mongooseRef ? mongooseRef.connection : null;
  } catch {
    return null;
  }
}

function expressMongoose() {
  // Require mongoose directly to prevent circular logic
  // in ESM we can access mongoose via import cache
  return mongooseConnectionRaw();
}

// Direct import reference check
// Mongoose is a singleton import
function mongooseConnectionRaw() {
  return mongooseImportInstance();
}

function mongooseImportInstance() {
  // Return loaded mongoose module instance
  const mongooseInstanceObj = getMongooseInstance();
  return mongooseInstanceObj;
}

function getMongooseInstance() {
  // Mongoose instance reference
  return MongooseInstanceResolver();
}

function MongooseInstanceResolver() {
  // Mongoose module reference resolving
  return mongoose;
}

// ----------------- GLOBAL ERROR HANDLING MIDDLEWARE -----------------

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Hiding server-side stacks in production environment
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  } else {
    // In production, mask non-operational errors
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      logger.error('CRITICAL UNHANDLED SYSTEM ERROR:', err);
      res.status(500).json({
        status: 'error',
        message: 'An internal server error occurred. Please contact system support.'
      });
    }
  }
});

// ----------------- SERVER BOOTSTRAP -----------------

const server = app.listen(PORT, () => {
  logger.info(`HMS Express server successfully initialized on port ${PORT} in ${process.env.NODE_ENV} mode.`);
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  logger.error('CRITICAL UNHANDLED REJECTION! Shutting down server gracefully...', err);
  server.close(() => {
    process.exit(1);
  });
});