const { resourceSchema } = require('./src/lib/validation');

const mockResource1 = {
  id: 'r1',
  title: 'React Basics',
  slug: 'react-basics',
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

const result = resourceSchema.safeParse(mockResource1);
if (!result.success) {
  console.log(result.error.format());
} else {
  console.log("Success!");
}
