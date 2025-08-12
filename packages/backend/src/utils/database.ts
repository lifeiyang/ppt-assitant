import pool from '../config/database';

/**
 * Execute a transaction with automatic rollback on error
 */
export const executeTransaction = async <T>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Check if a table exists in the database
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  const query = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `;
  
  const result = await pool.query(query, [tableName]);
  return result.rows[0].exists;
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async (): Promise<{
  userCount: number;
  themeCount: number;
  generationCount: number;
  completedGenerations: number;
}> => {
  const queries = [
    'SELECT COUNT(*) as count FROM users WHERE is_active = true',
    'SELECT COUNT(*) as count FROM ppt_themes WHERE is_active = true',
    'SELECT COUNT(*) as count FROM generation_history',
    'SELECT COUNT(*) as count FROM generation_history WHERE status = \'completed\''
  ];

  const results = await Promise.all(
    queries.map(query => pool.query(query))
  );

  return {
    userCount: parseInt(results[0].rows[0].count),
    themeCount: parseInt(results[1].rows[0].count),
    generationCount: parseInt(results[2].rows[0].count),
    completedGenerations: parseInt(results[3].rows[0].count)
  };
};