/**
 * Resource schema for the features/resources feature.
 * Re-exports the canonical schema from src/lib/validation.ts
 * to ensure a single source of truth.
 */

export { resourceSchema, resourceTypeSchema } from "@/lib/validation";
export type { ResourceTypeData as Resource } from "@/lib/validation";

import { z } from "zod";
import { resourceSchema } from "@/lib/validation";
export const resourceListSchema = z.array(resourceSchema);
