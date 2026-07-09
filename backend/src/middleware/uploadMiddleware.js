import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AppError from '../utils/AppError.js';

// Define the uploads directory path
const uploadDir = path.join(process.cwd(), 'uploads');

// Synchronously ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDir);
  },
  filename: (req, file, callback) => {
    // Standard filename format: fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  },
});

// File filter logic for imaging (e.g., JPEG, PNG, WEBP, PDF)
const fileFilter = (req, file, callback) => {
  const allowedExtensions = /jpeg|jpg|png|webp|pdf/;
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  const extensionMatch = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimeTypeMatch = allowedMimeTypes.includes(file.mimetype);

  if (extensionMatch && mimeTypeMatch) {
    callback(null, true);
  } else {
    callback(
      new AppError('Format blocked. Only images (JPEG, PNG, WEBP) and PDFs are allowed.', 400),
      false
    );
  }
};

// Create the configured multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

export default upload;
