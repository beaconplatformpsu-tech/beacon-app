import { computeMatchScore } from '../utils/matchScore';

describe('computeMatchScore', () => {
  const mockCareerPathSkills = {
    cps1: { careerPathId: 'p1', skillId: 's1', minimumProficiencyLevel: 'Intermediate' },
    cps2: { careerPathId: 'p1', skillId: 's2', minimumProficiencyLevel: 'Advanced' },
    cps3: { careerPathId: 'p2', skillId: 's1', minimumProficiencyLevel: 'Beginner' }
  };

  const mockSkills = {
    s1: { id: 's1', name: 'React' },
    s2: { id: 's2', name: 'Node.js' }
  };

  it('returns 0 when path has no required skills', () => {
    const score = computeMatchScore('p_empty', mockCareerPathSkills, mockSkills, []);
    expect(score).toBe(0);
  });

  it('returns 0 when user has no matching skills', () => {
    const score = computeMatchScore('p1', mockCareerPathSkills, mockSkills, []);
    expect(score).toBe(0);
  });

  it('calculates partial score when user has some skills', () => {
    const userSkills = [
      { name: 'React', proficiency: 'Beginner' } // Weight 1 / Required 2 (Intermediate) = 0.5
    ];
    
    // Path 1 requires s1(React) and s2(Node).
    // React score: 0.5. Node score: 0. 
    // Total score: 0.5 / 2 = 0.25 -> 25%
    const score = computeMatchScore('p1', mockCareerPathSkills, mockSkills, userSkills);
    expect(score).toBe(25);
  });

  it('caps skill score at 100% even if user exceeds requirements', () => {
    const userSkills = [
      { name: 'React', proficiency: 'Expert' } // Weight 4 / Required 1 (Beginner) = 4 -> capped at 1
    ];
    
    // Path 2 requires only s1(React).
    const score = computeMatchScore('p2', mockCareerPathSkills, mockSkills, userSkills);
    expect(score).toBe(100);
  });

  it('calculates full score when all skills are met perfectly', () => {
    const userSkills = [
      { name: 'React', proficiency: 'Intermediate' },
      { name: 'Node.js', proficiency: 'Advanced' }
    ];
    
    const score = computeMatchScore('p1', mockCareerPathSkills, mockSkills, userSkills);
    expect(score).toBe(100);
  });
});
