import { z } from "zod";
import { resourceSchema } from "./schemas/resourceSchema";

export type Resource = z.infer<typeof resourceSchema>;
export type ResourceType = Resource["resourceType"];
export { resourceSchema };
