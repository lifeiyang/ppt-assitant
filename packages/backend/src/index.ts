import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import config, { validateConfig } from './config';
import { testConnection, closeDatabase, checkDatabaseHealth } from './config/database';
import logger from './utils/logger';
import { 
  requestId, 
  requestLogger, 
  rateLimit, 
  healthCheck, 
  corsOptions 
} from './middleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Validate configuration on startup (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  try {
    validateConfig();
    logger.info('Configuration validated successfully');
  } catch (error) {
    logger.error('Configuration validation failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    process.exit(1);
  }
}

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS middleware
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Request middleware
app.use(requestId);
app.use(requestLogger);

// Rate limiting
app.use('/api', rateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes for API routes
app.use('/auth', rateLimit(15 * 60 * 1000, 20));  // 20 requests per 15 minutes for auth routes

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoints
app.get('/health', healthCheck);
app.get('/health/detailed', async (_req, res) => {
  const dbHealth = await checkDatabaseHealth();
  
  res.json({
    status: dbHealth.status === 'healthy' ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealth,
      server: {
        status: 'healthy',
        uptime: `${Math.floor(process.uptime())}s`,
        memory: {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        },
      },
    },
    environment: config.server.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Basic route
app.get('/', (_req, res) => {
  res.json({ 
    message: 'AI PowerPoint Generator API Server',
    version: process.env.npm_package_version || '1.0.0',
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// API routes placeholder
app.use('/api', (_req, res) => {
  res.json({
    message: 'API routes will be implemented in subsequent tasks',
    availableEndpoints: [
      'GET /health - Health check',
      'GET /health/detailed - Detailed health check',
      'POST /api/auth/register - User registration (coming soon)',
      'POST /api/auth/login - User login (coming soon)',
      'POST /api/generate/content - Content generation (coming soon)',
      'POST /api/ppt/generate - PPT generation (coming soon)',
    ],
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
  
  // Close database connections
  await closeDatabase();
  
  // Close server
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database, exiting');
      process.exit(1);
    }

    // Start HTTP server
    const server = app.listen(config.server.port, () => {
      logger.info(`Server started successfully`, {
        port: config.server.port,
        environment: config.server.nodeEnv,
        nodeVersion: process.version,
        pid: process.pid,
      });
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.server.port} is already in use`);
      } else {
        logger.error('Server error', { error: error.message });
      }
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
};

// Start the server (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;