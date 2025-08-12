import { MigrationRunner } from './Migration';
import { createUsersTable } from './001_create_users_table';
import { createPptThemesTable } from './002_create_ppt_themes_table';
import { createGenerationHistoryTable } from './003_create_generation_history_table';

const migrations = [
  createUsersTable,
  createPptThemesTable,
  createGenerationHistoryTable,
];

export const runMigrations = async (): Promise<void> => {
  const runner = new MigrationRunner();
  await runner.runMigrations(migrations);
};

export { migrations };