import { UserRepository, GenerationHistoryRepository, PptThemeRepository } from '../repositories';
import { testConnection } from '../config/database';

describe('Database Models', () => {
  beforeAll(async () => {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
  });

  describe('UserRepository', () => {
    const userRepo = new UserRepository();

    test('should create and find user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'hashed_password_123',
        subscription: 'free' as const
      };

      const createdUser = await userRepo.create(userData);
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(userData.email);
      expect(createdUser.name).toBe(userData.name);

      const foundUser = await userRepo.findById(createdUser.id);
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(userData.email);

      // Clean up
      await userRepo.deactivate(createdUser.id);
    });
  });

  describe('PptThemeRepository', () => {
    const themeRepo = new PptThemeRepository();

    test('should find active themes', async () => {
      const themes = await themeRepo.findActive();
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
      
      // Check that all returned themes are active
      themes.forEach(theme => {
        expect(theme.is_active).toBe(true);
      });
    });
  });

  describe('GenerationHistoryRepository', () => {
    const historyRepo = new GenerationHistoryRepository();
    const userRepo = new UserRepository();

    test('should create generation history', async () => {
      // First create a user
      const userData = {
        email: 'history-test@example.com',
        name: 'History Test User',
        password_hash: 'hashed_password_123'
      };
      const user = await userRepo.create(userData);

      const historyData = {
        user_id: user.id,
        original_outline: 'Test outline for presentation',
        selected_theme: 'Professional Blue'
      };

      const history = await historyRepo.create(historyData);
      expect(history).toBeDefined();
      expect(history.user_id).toBe(user.id);
      expect(history.status).toBe('pending');

      // Clean up
      await historyRepo.deleteById(history.id);
      await userRepo.deactivate(user.id);
    });
  });
});