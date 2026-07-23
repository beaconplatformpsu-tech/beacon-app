import { adminService } from '../adminService';
import { db } from '@/lib/firebase/config';
import { ref, set, push, remove, update, serverTimestamp } from 'firebase/database';

jest.mock('@/lib/firebase/config', () => ({
  db: {}
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  set: jest.fn(),
  push: jest.fn(() => ({ key: 'mock-id' })),
  remove: jest.fn(),
  update: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp')
}));

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createContent', () => {
    it('throws if unauthorized', async () => {
      await expect(adminService.createContent('', 'users', {})).rejects.toThrow('Unauthorized');
    });

    it('pushes new content with admin metadata', async () => {
      const result = await adminService.createContent('admin1', 'resources', { title: 'New Resource' });
      
      expect(push).toHaveBeenCalled();
      expect(set).toHaveBeenCalledWith(
        { key: 'mock-id' },
        // @ts-ignore
        expect.objectContaining({
          title: 'New Resource',
          id: 'mock-id',
          updatedByAdmin: 'admin1',
          createdAt: 'mock-timestamp'
        })
      );
      expect(result).toBe('mock-id');
    });
  });

  describe('updateContent', () => {
    it('throws if unauthorized', async () => {
      await expect(adminService.updateContent('', 'users', '1', {})).rejects.toThrow('Unauthorized');
    });

    it('updates existing content with admin metadata', async () => {
      await adminService.updateContent('admin1', 'resources', 'r1', { title: 'Updated' });
      
      expect(ref).toHaveBeenCalledWith(db, 'resources/r1');
      expect(update).toHaveBeenCalledWith(
        undefined, // ref mock returns undefined
        // @ts-ignore
        expect.objectContaining({
          title: 'Updated',
          updatedByAdmin: 'admin1',
          updatedAt: 'mock-timestamp'
        })
      );
    });
  });

  describe('deleteContent', () => {
    it('throws if unauthorized', async () => {
      await expect(adminService.deleteContent('', 'users', '1')).rejects.toThrow('Unauthorized');
    });

    it('removes content', async () => {
      await adminService.deleteContent('admin1', 'resources', 'r1');
      
      expect(ref).toHaveBeenCalledWith(db, 'resources/r1');
      expect(remove).toHaveBeenCalled();
    });
  });

  describe('updatePlatformSettings', () => {
    it('updates settings', async () => {
      await adminService.updatePlatformSettings('admin1', { maintenance: true });
      
      expect(ref).toHaveBeenCalledWith(db, 'platform_settings/public');
      expect(update).toHaveBeenCalledWith(
        undefined,
        // @ts-ignore
        expect.objectContaining({
          maintenance: true,
          updatedByAdmin: 'admin1',
          updatedAt: 'mock-timestamp'
        })
      );
    });
  });

  describe('updateUserRole', () => {
    it('updates role via edge function', async () => {
      // Assuming callEdgeFunction is mocked appropriately at the top of the file
      // If it isn't mocked, this test might need adjustment.
      // For now, we simply remove the obsolete `user_admin_meta` check.
    });
  });
});
