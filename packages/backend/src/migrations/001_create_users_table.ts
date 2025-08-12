import pool from '../config/database';
import { Migration } from './Migration';

export const createUsersTable: Migration = {
  id: '001',
  name: 'Create users table',
  
  async up(): Promise<void> {
    const query = `
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        subscription VARCHAR(20) DEFAULT 'free' CHECK (subscription IN ('free', 'premium')),
        usage_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_subscription ON users(subscription);
      CREATE INDEX idx_users_created_at ON users(created_at);

      -- Create trigger to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `;
    
    await pool.query(query);
  },

  async down(): Promise<void> {
    const query = `
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      DROP FUNCTION IF EXISTS update_updated_at_column();
      DROP TABLE IF EXISTS users;
    `;
    
    await pool.query(query);
  }
};