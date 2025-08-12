import pool from '../config/database';
import { GenerationHistory, CreateGenerationHistoryData, UpdateGenerationHistoryData } from '../models/GenerationHistory';

export class GenerationHistoryRepository {
  async create(data: CreateGenerationHistoryData): Promise<GenerationHistory> {
    const query = `
      INSERT INTO generation_history (user_id, original_outline, selected_theme, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      data.user_id,
      data.original_outline,
      data.selected_theme,
      data.status || 'pending'
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<GenerationHistory | null> {
    const query = 'SELECT * FROM generation_history WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<GenerationHistory[]> {
    const query = `
      SELECT * FROM generation_history 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  async update(id: string, updateData: UpdateGenerationHistoryData): Promise<GenerationHistory | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'generated_content') {
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
      UPDATE generation_history 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    values.push(id);
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async markAsCompleted(id: string, generatedContent: any[], fileUrl?: string): Promise<GenerationHistory | null> {
    const query = `
      UPDATE generation_history 
      SET status = 'completed', 
          generated_content = $1, 
          file_url = $2,
          completed_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [JSON.stringify(generatedContent), fileUrl, id]);
    return result.rows[0] || null;
  }

  async markAsFailed(id: string, errorMessage: string): Promise<GenerationHistory | null> {
    const query = `
      UPDATE generation_history 
      SET status = 'failed', 
          error_message = $1,
          completed_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [errorMessage, id]);
    return result.rows[0] || null;
  }

  async findPendingGenerations(): Promise<GenerationHistory[]> {
    const query = `
      SELECT * FROM generation_history 
      WHERE status = 'pending' 
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  async getStatsByUserId(userId: string): Promise<{ total: number; completed: number; failed: number; pending: number }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
      FROM generation_history 
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  async deleteById(id: string): Promise<boolean> {
    const query = 'DELETE FROM generation_history WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}