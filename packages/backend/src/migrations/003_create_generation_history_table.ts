import pool from '../config/database';
import { Migration } from './Migration';

export const createGenerationHistoryTable: Migration = {
  id: '003',
  name: 'Create generation_history table',
  
  async up(): Promise<void> {
    const query = `
      CREATE TABLE generation_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        original_outline TEXT NOT NULL,
        generated_content JSONB DEFAULT '[]',
        selected_theme VARCHAR(255) NOT NULL,
        file_url VARCHAR(500),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX idx_generation_history_user_id ON generation_history(user_id);
      CREATE INDEX idx_generation_history_status ON generation_history(status);
      CREATE INDEX idx_generation_history_created_at ON generation_history(created_at);
      CREATE INDEX idx_generation_history_completed_at ON generation_history(completed_at);
    `;
    
    await pool.query(query);
  },

  async down(): Promise<void> {
    const query = `
      DROP TABLE IF EXISTS generation_history;
    `;
    
    await pool.query(query);
  }
};