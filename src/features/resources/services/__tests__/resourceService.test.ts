import { ResourceService } from '../resourceService';
import { get, ref } from 'firebase/database';
import { db } from '@/lib/firebase/config';

import * as types from '../../types';

// Use spyOn to bypass schema validation without module path issues
jest.spyOn(types.resourceSchema, 'safeParse').mockImplementation((data: any) => ({ success: true, data } as any));

const mockResource1 = {
  id: 'r1',
  title: 'React Basics',
  slug: 'react-basics',
  description: 'A basic course on React.',
  url: 'https://react.dev',
  provider: 'Meta',
  resourceType: 'Video',
  audienceLevel: 'Beginner',
  skillIds: ['s1'],
  careerPathIds: ['cp1'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockResource2 = {
  id: 'r2',
  title: 'Advanced Typescript',
  slug: 'advanced-typescript',
  description: 'An advanced course on TS.',
  url: 'https://typescriptlang.org',
  provider: 'Microsoft',
  resourceType: 'Course',
  audienceLevel: 'Advanced',
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
        // We know ref returns a mocked string path or object in our tests,
        // but for simplicity, we simulate the path resolution based on how many times get is called
        if (queryRef === undefined) return { exists: () => false };
        
        // Mock the index get
        if (queryRef.mockPath?.includes('resource_by_type')) {
          return {
            exists: () => true,
            val: () => ({ r1: true, r2: true })
          };
        }
        
        // Mock individual resource gets
        if (queryRef.mockPath?.includes('resources/r1')) {
          return { exists: () => true, val: () => mockResource1 };
        }
        if (queryRef.mockPath?.includes('resources/r2')) {
          return { exists: () => true, val: () => mockResource2 };
        }
        
        return { exists: () => false };
      });

      // Quick hack to attach mockPath to ref calls for our mock logic
      (ref as jest.Mock).mockImplementation((db, path) => ({ mockPath: path }));

      const result = await ResourceService.getResourcesByType('Video');
      
      expect(get).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('React Basics');
      expect(result[1].title).toBe('Advanced Typescript');
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
        if (queryRef.mockPath?.includes('resource_by_level')) {
          return {
            exists: () => true,
            val: () => ({ r1: true })
          };
        }
        if (queryRef.mockPath?.includes('resources/r1')) {
          return { exists: () => true, val: () => mockResource1 };
        }
        return { exists: () => false };
      });

      const result = await ResourceService.getResourcesByLevel('Beginner');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('React Basics');
    });
  });
});
