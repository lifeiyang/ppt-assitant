import { Pool, PoolConfig } from 'pg';
import config from './index';
import logger from '../utils/logger';

// Database connection pool configuration
const poolConfig: PoolConfig = {
  connectionString: config.database.url,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  max: config.database.maxConnections,
  idleTimeoutMillis: config.database.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.connectionTimeoutMillis,
};

// Create connection pool
const pool = new Pool(poolConfig);

// Pool event handlers
pool.on('connect', () => {
  logger.debug('New database client connected');
});

pool.on('acquire', () => {
  logger.debug('Database client acquired from pool');
});

pool.on('remove', () => {
  logger.debug('Database client removed from pool');
});

pool.on('error', (err) => {
  logger.error('Database pool error', { error: err.message, stack: err.stack });
});

export default pool;

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    client.release();
    
    logger.info('Database connected successfully', {
      currentTime: result.rows[0].current_time,
      version: result.rows[0].version.split(' ')[0],
      poolSize: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    });
    
    return true;
  } catch (error) {
    logger.error('Database connection failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
};

// Graceful shutdown
export const closeDatabase = async (): Promise<void> => {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing database connection pool', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Health check for database
export const checkDatabaseHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  details: any;
}> => {
  try {
    const start = Date.now();
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as test');
    client.release();
    const duration = Date.now() - start;

    return {
      status: 'healthy',
      details: {
        responseTime: `${duration}ms`,
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingConnections: pool.waitingCount,
        testQuery: result.rows[0].test === 1,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingConnections: pool.waitingCount,
      },
    };
  }
};