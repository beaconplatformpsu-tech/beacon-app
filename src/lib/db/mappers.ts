import type {
  CareerPath,
  BaseSkill,
  Resource,
  Category,
  UserProfile,
  ExtendedCareerPathSkill,
  UserSkill
} from "@/lib/types";

// Helper to safely convert an array-like object or undefined to a true array
export function safeArray<T>(val: unknown): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  // If it's a map/object of true/false or similar (like tags), handle it
  if (typeof val === 'object') {
    return Object.keys(val) as T[];
  }
  return [];
}

export function mapCareerPath(id: string, data: any): CareerPath {
  return {
    id,
    slug: data.slug || id,
    title: data.title || "Untitled Career Path",
    description: data.description || "",
    longDescription: data.longDescription || "",
    categoryId: data.categoryId || "",
    industryDomain: data.industryDomain || "General",
    demandLevel: data.demandLevel || "medium",
    requiredEducation: data.requiredEducation || "Not specified",
    averagePreparationTime: data.averagePreparationTime || "Unknown",
    beginnerFriendly: Boolean(data.beginnerFriendly),
    isActive: data.isActive !== false,
  };
}

export function mapSkill(id: string, data: any): BaseSkill {
  return {
    id,
    slug: data.slug || id,
    title: data.title || data.name || "Untitled Skill",
    name: data.title || data.name || "Untitled Skill",
    description: data.description || "",
    categoryId: data.categoryId || "",
    difficultyLevel: data.difficultyLevel || "all_levels",
    tags: safeArray<string>(data.tags),
    sortOrder: data.sortOrder || 0,
    isActive: data.isActive !== false,
  };
}

export function mapCategory(id: string, data: any): Category {
  return {
    id,
    slug: data.slug || id,
    title: data.title || "Untitled Category",
    description: data.description || "",
    sortOrder: data.sortOrder || 0,
    isActive: data.isActive !== false,
  };
}

export function mapResource(id: string, data: any): Resource {
  return {
    id,
    slug: data.slug || id,
    title: data.title || "Untitled Resource",
    description: data.description || "",
    longDescription: data.longDescription || "",
    provider: data.provider || "Unknown",
    url: data.url || "",
    sourceType: data.sourceType || "external",
    resourceType: data.resourceType || "article",
    language: data.language || "en",
    difficultyLevel: data.difficultyLevel || "all_levels",
    estimatedDuration: data.estimatedDuration || "",
    isFree: Boolean(data.isFree),
    isActive: data.isActive !== false,
    qualityScore: data.qualityScore || 0,
    skillIds: safeArray<string>(data.skillIds),
    careerPathIds: safeArray<string>(data.careerPathIds),
    academicCategoryIds: safeArray<string>(data.academicCategoryIds),
    tags: safeArray<string>(data.tags),
  };
}

export function mapExtendedCareerPathSkill(careerPathId: string, skillId: string, data: any): ExtendedCareerPathSkill {
  return {
    careerPathId,
    skillId,
    importanceLevel: data.importanceLevel || "optional",
    minimumProficiencyLevel: data.minimumProficiencyLevel || "beginner",
  };
}

export function mapUserProfile(uid: string, data: any): UserProfile {
  return {
    uid,
    email: data.email || "",
    displayName: data.displayName || "",
    bio: data.bio || "",
    major: data.major || "",
    academicLevel: data.academicLevel || "",
    graduationYear: data.graduationYear || new Date().getFullYear() + 4,
    preferredCareerPathId: data.preferredCareerPathId || undefined,
    github: data.github || "",
    linkedin: data.linkedin || "",
    photoURL: data.photoURL || "",
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

export function mapUserSkill(id: string, data: any): UserSkill {
  return {
    id,
    skillId: data.skillId || id,
    name: data.name || "Unknown Skill",
    category: data.category || "General",
    proficiency: data.proficiency || "Beginner",
    progress: data.progress || 0,
    lastPracticed: data.lastPracticed || new Date().toISOString(),
    createdAt: data.createdAt || new Date().toISOString(),
  };
}
