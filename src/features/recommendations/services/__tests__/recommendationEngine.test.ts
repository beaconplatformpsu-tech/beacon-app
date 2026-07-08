import { recommendationEngine } from '../recommendationEngine';
import { Resource } from '@/features/resources/types';

describe('RecommendationEngine', () => {
  const mockCareerPathSkills = [
    { skillId: 's1', minimumProficiencyLevel: 'Intermediate', priority: 'Core' },
    { skillId: 's2', minimumProficiencyLevel: 'Advanced', priority: 'Core' }
  ];

  const mockSkills = {
    s1: { id: 's1', name: 'React' },
    s2: { id: 's2', name: 'Node.js' }
  };

  const mockUserSkills = [
    { name: 'React', proficiency: 'Beginner' }, // Needs improvement
    // Node.js is missing entirely
  ];

  const mockResources: any[] = [
    {
      id: 'r1', title: 'React for Beginners', resourceType: 'Course',
      audienceLevel: 'Beginner' as any, skillIds: ['s1'],
      url: 'http://r1', slug: 'r1', provider: 'Test', isFree: true, createdAt: '', updatedAt: '', description: ''
    } as Resource,
    {
      id: 'r2', title: 'Advanced React', resourceType: 'Course',
      audienceLevel: 'Advanced' as any, skillIds: ['s1'],
      url: 'http://r2', slug: 'r2', provider: 'Test', isFree: true, createdAt: '', updatedAt: '', description: ''
    } as Resource,
    {
      id: 'r3', title: 'Intro to Node.js', resourceType: 'Documentation',
      audienceLevel: 'Beginner' as any, skillIds: ['s2'],
      url: 'http://r3', slug: 'r3', provider: 'Test', isFree: true, createdAt: '', updatedAt: '', description: ''
    } as Resource
  ];

  it('identifies missing and weak skills correctly', () => {
    const missingSkills = recommendationEngine.findSkillGaps(
      mockUserSkills as any,
      mockCareerPathSkills as any
    );
    expect(missingSkills).toContain('s2'); // node
  });

  it('prioritizes beginner resources for missing/beginner skills', () => {
    const recs = recommendationEngine.findResourcesForGaps(
      ['s1', 's2'],
      mockResources,
      1
    );

    const recIds = recs.map(r => r.id);
    expect(recIds).toContain('r1');
    expect(recIds).toContain('r3');
    expect(recIds).not.toContain('r2');
  });


});
