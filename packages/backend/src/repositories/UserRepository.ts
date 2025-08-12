import pool from '../config/database';
import { User, CreateUserData, UpdateUserData } from '../models/User';

export class UserRepository {
  async create(userData: CreateUserData): Promise<User> {
    const query = `
      INSERT INTO users (email, name, password_hash, subscription)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      userData.email,
      userData.name,
      userData.password_hash,
      userData.subscription || 'free'
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  async update(id: string, updateData: UpdateUserData): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount} AND is_active = true
      RETURNING *
    `;
    
    values.push(id);
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async incrementUsageCount(id: string): Promise<User | null> {
    const query = `
      UPDATE users 
      SET usage_count = usage_count + 1
      WHERE id = $1 AND is_active = true
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async deactivate(id: string): Promise<boolean> {
    const query = 'UPDATE users SET is_active = false WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    const query = `
      SELECT * FROM users 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }
}