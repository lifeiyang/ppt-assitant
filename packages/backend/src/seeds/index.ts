import { seedPptThemes } from './pptThemes';

export const runSeeds = async (): Promise<void> => {
  console.log('Running database seeds...');
  
  try {
    await seedPptThemes();
    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Seed execution failed:', error);
    throw error;
  }
};