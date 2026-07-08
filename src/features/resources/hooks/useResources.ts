import { useState, useEffect } from "react";
import { Resource } from "../types";
import { ResourceService } from "../services/resourceService";

interface UseResourcesProps {
  skillId?: string;
  careerPathId?: string;
  academicCategoryId?: string;
}

export const useResources = ({ skillId, careerPathId, academicCategoryId }: UseResourcesProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchResources = async () => {
      try {
        setLoading(true);
        let results: Resource[] = [];
        
        if (skillId) {
          results = await ResourceService.getResourcesBySkill(skillId);
        } else if (careerPathId) {
          results = await ResourceService.getResourcesByCareerPath(careerPathId);
        } else if (academicCategoryId) {
          results = await ResourceService.getResourcesByAcademicCategory(academicCategoryId);
        }
        
        if (mounted) {
          setResources(results);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchResources();
    return () => { mounted = false; };
  }, [skillId, careerPathId, academicCategoryId]);

  return { resources, loading, error };
};
