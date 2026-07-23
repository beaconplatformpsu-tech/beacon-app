import { taskSchema, noteSchema } from '../validation';

describe('Zod Validation Schemas', () => {
  
  describe('taskSchema', () => {
    it('validates a correct task payload', () => {
      const validTask = {
        id: 't1',
        title: 'Complete assignment',
        description: 'Read chapter 1 and 2',
        dueDate: '2025-12-31T23:59:59Z',
        priority: 'High',
        status: 'Pending',
        courseName: 'CS101',
        progress: 0,
        createdAt: '2023-01-01T00:00:00Z'
      };

      const result = taskSchema.safeParse(validTask);
      expect(result.success).toBe(true);
    });

    it('fails when required fields are missing', () => {
      const invalidTask = {
        title: 'Complete assignment'
      };

      const result = taskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.id?._errors).toBeDefined();
        expect(errors.dueDate?._errors).toBeDefined();
        expect(errors.priority?._errors).toBeDefined();
        expect(errors.status?._errors).toBeDefined();
        expect(errors.courseName?._errors).toBeDefined();
        expect(errors.progress?._errors).toBeDefined();
      }
    });

    it('fails when priority or status are invalid enums', () => {
      const invalidTask = {
        id: 't1',
        title: 'Task',
        dueDate: '2025-12-31T23:59:59Z',
        priority: 'Urgent', // Invalid enum
        status: 'Done', // Invalid enum
        courseName: 'CS101',
        progress: 150 // Invalid range (>100)
      };

      const result = taskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.priority?._errors[0]).toMatch(/Invalid enum value/);
        expect(errors.status?._errors[0]).toMatch(/Invalid enum value/);
        expect(errors.progress?._errors[0]).toMatch(/Number must be less than or equal to 100/);
      }
    });
  });

  describe('noteSchema', () => {
    it('validates a correct note payload', () => {
      const validNote = {
        id: 'n1',
        title: 'Lecture Notes',
        content: 'These are the notes from the lecture.',
        isPinned: true,
        category: 'Study',
        createdAt: '2023-01-01T00:00:00Z'
      };

      const result = noteSchema.safeParse(validNote);
      expect(result.success).toBe(true);
    });

    it('uses default values for isPinned and category', () => {
      const partialNote = {
        id: 'n2',
        title: 'Quick Idea',
        content: 'Must remember to study'
      };

      const result = noteSchema.safeParse(partialNote);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isPinned).toBe(false);
        expect(result.data.category).toBe('General');
      }
    });

    it('fails when title or content exceed limits or are missing', () => {
      const invalidNote = {
        id: 'n3',
        title: '', // Too short
        // missing content
      };

      const result = noteSchema.safeParse(invalidNote);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.title?._errors[0]).toMatch(/String must contain at least 1 character/);
        expect(errors.content?._errors[0]).toBeDefined();
      }
    });
  });

  describe('userProfileSchema', () => {
    const { userProfileSchema } = require('../validation');
    
    it('validates a correct user profile', () => {
      const validProfile = {
        uid: 'u1',
        email: 'test@example.com',
        role: 'student',
        emailVerified: true
      };

      const result = userProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('fails on missing uid', () => {
      const invalidProfile = {
        email: 'test@example.com',
      };

      const result = userProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });
  });

  describe('resourceSchema', () => {
    const { resourceSchema } = require('../validation');

    it('validates a correct resource', () => {
      const validResource = {
        id: 'r1',
        slug: 'learn-react',
        title: 'Learn React',
        url: 'https://react.dev',
        resourceType: 'Documentation',
        sourceType: 'external',
        difficultyLevel: 'Beginner',
        isFree: true
      };

      const result = resourceSchema.safeParse(validResource);
      expect(result.success).toBe(true);
    });

    it('fails on invalid url scheme', () => {
      const invalidResource = {
        id: 'r2',
        slug: 'bad-url',
        title: 'Bad URL Resource',
        url: 'http://react.dev', // Must be https
        sourceType: 'external',
        resourceType: 'Documentation'
      };

      const result = resourceSchema.safeParse(invalidResource);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().url?._errors[0]).toMatch(/HTTPS/);
      }
    });
  });
});
