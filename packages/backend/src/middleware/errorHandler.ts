import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number, code?: string): AppError => {
  return new AppError(message, statusCode, code);
};

// Common error types
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
} as const;

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId?: string;
}

// Global error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] as string;
  
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let details: any = undefined;

  // Handle operational errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || 'OPERATIONAL_ERROR';
  }
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    code = ErrorTypes.VALIDATION_ERROR;
    details = err.message;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = ErrorTypes.AUTHENTICATION_ERROR;
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = ErrorTypes.AUTHENTICATION_ERROR;
  }
  // Handle database errors
  else if (err.message.includes('duplicate key') || err.message.includes('unique constraint')) {
    statusCode = 409;
    message = 'Resource already exists';
    code = ErrorTypes.DATABASE_ERROR;
  }
  else if (err.message.includes('foreign key constraint')) {
    statusCode = 400;
    message = 'Invalid reference';
    code = ErrorTypes.DATABASE_ERROR;
  }
  // Handle file upload errors
  else if (err.message.includes('File too large')) {
    statusCode = 413;
    message = 'File too large';
    code = ErrorTypes.FILE_UPLOAD_ERROR;
  }
  else if (err.message.includes('Unexpected field')) {
    statusCode = 400;
    message = 'Invalid file field';
    code = ErrorTypes.FILE_UPLOAD_ERROR;
  }

  // Log error
  logger.error(`${code}: ${message}`, {
    error: err.message,
    stack: err.stack,
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  }, requestId);

  // Create error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId }),
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// 404 handler
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, ErrorTypes.NOT_FOUND_ERROR);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};