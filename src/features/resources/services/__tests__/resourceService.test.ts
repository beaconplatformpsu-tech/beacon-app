import { ResourceService } from '../resourceService';
import { get, ref } from 'firebase/database';
import { db } from '@/lib/firebase/config';

import * as types from '../../types';

jest.mock('@/lib/validation', () => ({
  ...jest.requireActual('@/lib/validation'),
  resourceSchema: {
    safeParse: jest.fn((data: any) => ({ success: true, data }))
  }
}));

const mockResource1 = {
  id: 'r1',
  slug: 'react-basics',
  title: 'React Basics',
  description: 'A basic course on React.',
  url: 'https://react.dev',
  provider: 'Meta',
  resourceType: 'Course',
  sourceType: 'external',
  difficultyLevel: 'Beginner',
  skillIds: ['s1'],
  careerPathIds: ['cp1'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockResource2 = {
  id: 'r2',
  slug: 'advanced-typescript',
  title: 'Advanced Typescript',
  description: 'An advanced course on TS.',
  url: 'https://typescriptlang.org',
  provider: 'Microsoft',
  resourceType: 'Course',
  sourceType: 'external',
  difficultyLevel: 'Advanced',
  skillIds: ['s2'],
  careerPathIds: ['cp1'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('ResourceService Filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getResourcesByType', () => {
    it('fetches resources using the resource_by_type index', async () => {
      // Mock index response
      (get as jest.Mock).mockImplementation(async (queryRef) => {
        const path = typeof queryRef === 'string' ? queryRef : queryRef?.mockPath;
        if (!path) return { exists: () => false };
        
        // Mock the index get
        if (path.includes('resource_by_type')) {
          return {
            exists: () => true,
            val: () => ({ r1: true, r2: true })
          };
        }
        
        // Mock individual resource gets
        if (path.includes('resources/r1')) {
          return { exists: () => true, val: () => mockResource1 };
        }
        if (path.includes('resources/r2')) {
          return { exists: () => true, val: () => mockResource2 };
        }
        
        return { exists: () => false };
      });

      // Quick hack to attach mockPath to ref calls for our mock logic
      (ref as jest.Mock).mockImplementation((db, path) => ({ mockPath: path }));

      const result = await ResourceService.getResourcesByType('Video');
      
      expect(get).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns empty array when index does not exist', async () => {
      (ref as jest.Mock).mockImplementation((db, path) => ({ mockPath: path }));
      (get as jest.Mock).mockResolvedValue({ exists: () => false });

      const result = await ResourceService.getResourcesByType('NonExistent');
      expect(result).toEqual([]);
    });
  });

  describe('getResourcesByLevel', () => {
    it('fetches resources using the resource_by_level index', async () => {
      (ref as jest.Mock).mockImplementation((db, path) => ({ mockPath: path }));
      (get as jest.Mock).mockImplementation(async (queryRef) => {
        const path = typeof queryRef === 'string' ? queryRef : queryRef?.mockPath;
        if (!path) return { exists: () => false };
        
        if (path.includes('resource_by_level')) {
          return {
            exists: () => true,
            val: () => ({ r1: true })
          };
        }
        if (path.includes('resources/r1')) {
          return { exists: () => true, val: () => mockResource1 };
        }
        return { exists: () => false };
      });

      const result = await ResourceService.getResourcesByLevel('Beginner');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
