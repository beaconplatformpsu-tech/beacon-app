import { z } from "zod";

export function validateSeedPayload(payload: Record<string, any>): boolean {
  console.log(`\n⏳ Validating professional seed payload (${Object.keys(payload).length} nodes)...`);
  
  let isValid = true;
  let errorCount = 0;

  const logError = (msg: string) => {
    if (errorCount < 50) console.error(`❌ Validation Error: ${msg}`);
    isValid = false;
    errorCount++;
  };

  const slugs = new Set<string>();

  // Extract maps for relationship checking
  const validSkills = new Set<string>();
  const validCareerPaths = new Set<string>();
  const validAcademicCats = new Set<string>();
  const validSkillCats = new Set<string>();
  const validCareerCats = new Set<string>();
  
  let actualResourcesCount = 0;
  let actualSkillsCount = 0;
  let actualCareerPathsCount = 0;
  let actualAcademicCatsCount = 0;
  let actualCareerCatsCount = 0;
  let actualSkillCatsCount = 0;
  let actualSupportMessagesCount = 0;

  // First pass: collect valid IDs and counts
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    
    // Check for legacy collections
    if (key.startsWith("academic_support_resources") || key.startsWith("career_resources")) {
      logError(`Legacy collection detected: ${key}`);
    }

    if (key.startsWith("public_content/skills/")) {
      validSkills.add(value.id);
      actualSkillsCount++;
    }
    if (key.startsWith("public_content/career_paths/")) {
      validCareerPaths.add(value.id);
      actualCareerPathsCount++;
    }
    if (key.startsWith("public_content/academic_categories/")) {
      validAcademicCats.add(value.id);
      actualAcademicCatsCount++;
    }
    if (key.startsWith("public_content/skill_categories/")) {
      validSkillCats.add(value.id);
      actualSkillCatsCount++;
    }
    if (key.startsWith("public_content/career_categories/")) {
      validCareerCats.add(value.id);
      actualCareerCatsCount++;
    }
    if (key.startsWith("public_content/resources/")) {
      actualResourcesCount++;
    }
    if (key.startsWith("support_messages/")) {
      actualSupportMessagesCount++;
    }
  }

  // Second pass: full validation
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) {
      logError(`Node '${key}' is undefined.`);
      continue;
    }
    
    if (value !== null && typeof value === "object") {
      // Slug uniqueness
      if (value.slug) {
        if (slugs.has(value.slug)) {
          logError(`Duplicate slug found: '${value.slug}' at node '${key}'`);
        }
        slugs.add(value.slug);
      }

      // Fake URL & placeholder check
      if (value.url && (value.url.includes("example.com") || value.url.includes("test.com"))) {
        logError(`Fake URL detected: '${value.url}' at node '${key}'. Use real URLs or sourceType 'internal'.`);
      }
      
      const strVal = JSON.stringify(value);
      if (strVal.includes("admin@example.com") || strVal.includes("portfolio.example.com") || strVal.includes("beacon.example.com")) {
        logError(`Placeholder values detected in node '${key}'.`);
      }

      // Check specific nodes
      if (key.startsWith("relations/career_path_skills/")) {
        const parts = key.split("/");
        const pathId = parts[2];
        const skillId = parts[3];
        if (!validCareerPaths.has(pathId)) logError(`CareerPathSkill relation references missing path: ${pathId}`);
        if (!validSkills.has(skillId)) logError(`CareerPathSkill relation references missing skill: ${skillId}`);
        
        if (!["core", "important", "optional"].includes(value.importanceLevel)) {
          logError(`Invalid importanceLevel in ${key}: ${value.importanceLevel}`);
        }
        if (!["beginner", "intermediate", "advanced"].includes(value.minimumProficiencyLevel)) {
          logError(`Invalid minimumProficiencyLevel in ${key}: ${value.minimumProficiencyLevel}`);
        }
      }

      if (key.startsWith("public_content/resources/")) {
        if (value.id && value.id.startsWith("res_dummy")) logError(`Dummy resource ID detected: ${key}`);
        if (value.title && value.title.includes("Advanced Academic Topic")) logError(`Dummy resource title detected: ${key}`);

        if (value.sourceType === "external" && !value.url) logError(`External resource missing URL: ${key}`);
        if (value.sourceType === "internal" && value.url) logError(`Internal resource should not have URL: ${key}`);
        
        if (Array.isArray(value.skillIds)) {
          value.skillIds.forEach((id: string) => {
            if (!validSkills.has(id)) logError(`Resource ${key} references missing skill: ${id}`);
            if (!payload[`indexes/resources_by_skill/${id}/${value.id}`]) logError(`Missing index for resource ${key} by skill ${id}`);
          });
        }
        if (Array.isArray(value.careerPathIds)) {
          value.careerPathIds.forEach((id: string) => {
            if (!validCareerPaths.has(id)) logError(`Resource ${key} references missing career path: ${id}`);
            if (!payload[`indexes/resources_by_career_path/${id}/${value.id}`]) logError(`Missing index for resource ${key} by path ${id}`);
          });
        }
        if (Array.isArray(value.academicCategoryIds)) {
          value.academicCategoryIds.forEach((id: string) => {
            if (!validAcademicCats.has(id)) logError(`Resource ${key} references missing academic category: ${id}`);
            if (!payload[`indexes/resources_by_academic_category/${id}/${value.id}`]) logError(`Missing index for resource ${key} by academic category ${id}`);
          });
        }
      }

      if (key.startsWith("public_content/skills/")) {
        if (value.categoryId && !validSkillCats.has(value.categoryId)) {
          logError(`Skill ${key} references missing skill category: ${value.categoryId}`);
        }
      }

      if (key.startsWith("public_content/career_paths/")) {
        if (value.categoryId && !validCareerCats.has(value.categoryId)) {
          logError(`Career path ${key} references missing career category: ${value.categoryId}`);
        }
      }
    }
  }

  // Validate Stats
  if (payload["stats/resourcesCount"] !== actualResourcesCount) logError(`stats/resourcesCount mismatch: ${payload["stats/resourcesCount"]} != ${actualResourcesCount}`);
  if (payload["stats/skillsCount"] !== actualSkillsCount) logError(`stats/skillsCount mismatch: ${payload["stats/skillsCount"]} != ${actualSkillsCount}`);
  if (payload["stats/careerPathsCount"] !== actualCareerPathsCount) logError(`stats/careerPathsCount mismatch: ${payload["stats/careerPathsCount"]} != ${actualCareerPathsCount}`);
  if (payload["stats/academicCategoriesCount"] !== actualAcademicCatsCount) logError(`stats/academicCategoriesCount mismatch: ${payload["stats/academicCategoriesCount"]} != ${actualAcademicCatsCount}`);
  if (payload["stats/careerCategoriesCount"] !== actualCareerCatsCount) logError(`stats/careerCategoriesCount mismatch: ${payload["stats/careerCategoriesCount"]} != ${actualCareerCatsCount}`);
  if (payload["stats/skillCategoriesCount"] !== actualSkillCatsCount) logError(`stats/skillCategoriesCount mismatch: ${payload["stats/skillCategoriesCount"]} != ${actualSkillCatsCount}`);
  if (payload["stats/supportMessagesCount"] !== actualSupportMessagesCount) logError(`stats/supportMessagesCount mismatch: ${payload["stats/supportMessagesCount"]} != ${actualSupportMessagesCount}`);

  if (errorCount > 50) {
    console.error(`...and ${errorCount - 50} more validation errors.`);
  }

  if (isValid) {
    console.log("✅ Payload successfully validated.");
  } else {
    console.error(`❌ Payload validation failed with ${errorCount} errors.`);
  }

  return isValid;
}
