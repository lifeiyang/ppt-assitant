import pool from '../config/database';
import { PptTheme, CreatePptThemeData, UpdatePptThemeData } from '../models/PptTheme';

export class PptThemeRepository {
  async create(data: CreatePptThemeData): Promise<PptTheme> {
    const query = `
      INSERT INTO ppt_themes (
        name, description, preview_image, color_scheme, 
        font_family, layout_templates
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      data.name,
      data.description,
      data.preview_image,
      JSON.stringify(data.color_scheme),
      data.font_family,
      JSON.stringify(data.layout_templates)
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<PptTheme | null> {
    const query = 'SELECT * FROM ppt_themes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByName(name: string): Promise<PptTheme | null> {
    const query = 'SELECT * FROM ppt_themes WHERE name = $1';
    const result = await pool.query(query, [name]);
    return result.rows[0] || null;
  }

  async findAll(activeOnly: boolean = true): Promise<PptTheme[]> {
    let query = 'SELECT * FROM ppt_themes';
    const values = [];
    
    if (activeOnly) {
      query += ' WHERE is_active = true';
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  async findActive(): Promise<PptTheme[]> {
    const query = `
      SELECT * FROM ppt_themes 
      WHERE is_active = true 
      ORDER BY name ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  async update(id: string, updateData: UpdatePptThemeData): Promise<PptTheme | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'color_scheme' || key === 'layout_templates') {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    const query = `
      UPDATE ppt_themes 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    values.push(id);
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async activate(id: string): Promise<PptTheme | null> {
    const query = `
      UPDATE ppt_themes 
      SET is_active = true
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async deactivate(id: string): Promise<PptTheme | null> {
    const query = `
      UPDATE ppt_themes 
      SET is_active = false
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async deleteById(id: string): Promise<boolean> {
    const query = 'DELETE FROM ppt_themes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  async getThemeUsageStats(): Promise<Array<{ theme_name: string; usage_count: number }>> {
    const query = `
      SELECT 
        pt.name as theme_name,
        COUNT(gh.id) as usage_count
      FROM ppt_themes pt
      LEFT JOIN generation_history gh ON pt.name = gh.selected_theme
      WHERE pt.is_active = true
      GROUP BY pt.id, pt.name
      ORDER BY usage_count DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
}