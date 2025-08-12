import pool from '../config/database';
import { Migration } from './Migration';

export const createPptThemesTable: Migration = {
  id: '002',
  name: 'Create ppt_themes table',
  
  async up(): Promise<void> {
    const query = `
      CREATE TABLE ppt_themes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        preview_image VARCHAR(500),
        color_scheme JSONB NOT NULL,
        font_family VARCHAR(255) NOT NULL,
        layout_templates JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX idx_ppt_themes_name ON ppt_themes(name);
      CREATE INDEX idx_ppt_themes_is_active ON ppt_themes(is_active);
      CREATE INDEX idx_ppt_themes_created_at ON ppt_themes(created_at);

      -- Create trigger to update updated_at timestamp
      CREATE TRIGGER update_ppt_themes_updated_at 
        BEFORE UPDATE ON ppt_themes 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `;
    
    await pool.query(query);
  },

  async down(): Promise<void> {
    const query = `
      DROP TRIGGER IF EXISTS update_ppt_themes_updated_at ON ppt_themes;
      DROP TABLE IF EXISTS ppt_themes;
    `;
    
    await pool.query(query);
  }
};