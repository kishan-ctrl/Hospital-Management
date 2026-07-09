class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Status code starting with 4 is fail, starting with 5 is error
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Mark as operational error (distinguishable from system/programmer errors)
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
