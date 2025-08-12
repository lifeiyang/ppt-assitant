import pool from '../config/database';

export interface Migration {
  id: string;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export class MigrationRunner {
  async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
  }

  async hasBeenExecuted(migrationId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT id FROM migrations WHERE id = $1',
      [migrationId]
    );
    return result.rows.length > 0;
  }

  async markAsExecuted(migration: Migration): Promise<void> {
    await pool.query(
      'INSERT INTO migrations (id, name) VALUES ($1, $2)',
      [migration.id, migration.name]
    );
  }

  async runMigration(migration: Migration): Promise<void> {
    await this.createMigrationsTable();
    
    if (await this.hasBeenExecuted(migration.id)) {
      console.log(`Migration ${migration.name} already executed, skipping...`);
      return;
    }

    console.log(`Running migration: ${migration.name}`);
    try {
      await migration.up();
      await this.markAsExecuted(migration);
      console.log(`Migration ${migration.name} completed successfully`);
    } catch (error) {
      console.error(`Migration ${migration.name} failed:`, error);
      throw error;
    }
  }

  async runMigrations(migrations: Migration[]): Promise<void> {
    for (const migration of migrations) {
      await this.runMigration(migration);
    }
  }
}