import { useState, useEffect } from "react";
import { ref, get, onValue, off } from "firebase/database";
import { db } from "@/lib/firebase/config";
import {
  mapCareerPath,
  mapSkill,
  mapResource,
  mapExtendedCareerPathSkill,
  mapCategory,
} from "../mappers";
import type { CareerPath, BaseSkill, Resource, ExtendedCareerPathSkill, Category } from "@/lib/types";

// Generic hook for public data (fetches once, no live updates needed for public data)
export function usePublicContent<T>(
  path: string,
  mapper: (id: string, data: any) => T,
  fetchOnce: boolean = true
) {
  const [data, setData] = useState<Record<string, T>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const dbRef = ref(db, path);
    setLoading(true);

    if (fetchOnce) {
      get(dbRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const rawData = snapshot.val();
            const mappedData: Record<string, T> = {};
            Object.keys(rawData).forEach((key) => {
              mappedData[key] = mapper(key, rawData[key]);
            });
            setData(mappedData);
          } else {
            setData({});
          }
        })
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
    } else {
      const unsubscribe = onValue(
        dbRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const rawData = snapshot.val();
            const mappedData: Record<string, T> = {};
            Object.keys(rawData).forEach((key) => {
              mappedData[key] = mapper(key, rawData[key]);
            });
            setData(mappedData);
          } else {
            setData({});
          }
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [path, fetchOnce, mapper]);

  return { data, loading, error };
}

export function usePublicCareerPaths() {
  const { data, loading, error } = usePublicContent("public_content/career_paths", mapCareerPath);
  return { careerPaths: Object.values(data), loading, error };
}

export function usePublicSkills() {
  const { data, loading, error } = usePublicContent("public_content/skills", mapSkill);
  return { skillsMap: data, skills: Object.values(data), loading, error };
}

export function usePublicResources() {
  const { data, loading, error } = usePublicContent("public_content/resources", mapResource);
  return { resourcesMap: data, resources: Object.values(data), loading, error };
}

export function useCareerCategories() {
  const { data, loading, error } = usePublicContent("public_content/career_categories", mapCategory);
  return { careerCategories: Object.values(data), loading, error };
}

export function useSkillCategories() {
  const { data, loading, error } = usePublicContent("public_content/skill_categories", mapCategory);
  return { skillCategories: Object.values(data), loading, error };
}

export function useCareerPathSkills() {
  const [data, setData] = useState<Record<string, ExtendedCareerPathSkill>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    get(ref(db, "relations/career_path_skills"))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          const flatCpSkills: Record<string, ExtendedCareerPathSkill> = {};
          Object.keys(rawData).forEach((pathId) => {
            Object.keys(rawData[pathId]).forEach((skillId) => {
              flatCpSkills[`${pathId}_${skillId}`] = mapExtendedCareerPathSkill(
                pathId,
                skillId,
                rawData[pathId][skillId]
              );
            });
          });
          setData(flatCpSkills);
        } else {
          setData({});
        }
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { careerPathSkills: data, loading, error };
}
