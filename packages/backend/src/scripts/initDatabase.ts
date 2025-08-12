import { testConnection } from '../config/database';
import { runMigrations } from '../migrations';
import { runSeeds } from '../seeds';

const initDatabase = async (): Promise<void> => {
  console.log('Initializing database...');
  
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    
    // Run migrations
    console.log('Running database migrations...');
    await runMigrations();
    
    // Run seeds
    console.log('Running database seeds...');
    await runSeeds();
    
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  initDatabase();
}

export { initDatabase };