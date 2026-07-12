import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifyFirebaseAuth } from "../_shared/verifyFirebaseAuth.ts";
import { firebaseDbGet, firebaseDbPut, firebaseDbPost } from "../_shared/firebaseAdminRest.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authResult = await verifyFirebaseAuth(req);
    if (authResult.error || !authResult.payload) {
      return new Response(JSON.stringify({ error: authResult.error }), { headers: corsHeaders, status: authResult.status });
    }

    const callerUid = authResult.payload.uid as string;
    const meta: any = await firebaseDbGet(`user_admin_meta/${callerUid}`);
    if (!meta || (meta.role !== "admin" && meta.role !== "super_admin")) {
      return new Response(JSON.stringify({ error: "Only admins can rebuild indexes." }), { headers: corsHeaders, status: 403 });
    }

    const timestamp = new Date().toISOString();
    const content = await firebaseDbGet("public_content");
    
    if (!content) {
      return new Response(JSON.stringify({ success: true, message: "No public content found." }), { headers: corsHeaders, status: 200 });
    }

    const newIndexes: Record<string, any> = {
      resources_by_skill: {}, resources_by_career_path: {}, resources_by_academic_category: {},
      resources_by_type: {}, resources_by_level: {}, skills_by_category: {},
      career_paths_by_category: {}, learning_paths_by_career_path: {}, practice_tasks_by_skill: {},
      projects_by_skill: {}, projects_by_career_path: {}, quizzes_by_skill: {}
    };

    const usersSnap = await firebaseDbGet("users?shallow=true");
    const usersCount = usersSnap ? Object.keys(usersSnap).length : 0;

    const newStats: Record<string, any> = {
      updatedAt: timestamp, usersCount, resourcesCount: 0, skillsCount: 0, careerPathsCount: 0,
      learningPathsCount: 0, practiceTasksCount: 0, projectsCount: 0, quizzesCount: 0,
    };

    const addToIndex = (indexName: string, key: string, id: string, value: any = true) => {
      if (!newIndexes[indexName][key]) newIndexes[indexName][key] = {};
      newIndexes[indexName][key][id] = value;
    };

    if (content.skills) Object.entries(content.skills).forEach(([id, skill]: any) => {
      newStats.skillsCount++; if (skill.categoryId) addToIndex("skills_by_category", skill.categoryId, id);
    });

    if (content.career_paths) Object.entries(content.career_paths).forEach(([id, path]: any) => {
      newStats.careerPathsCount++; if (path.categoryId) addToIndex("career_paths_by_category", path.categoryId, id);
    });

    if (content.learning_paths) Object.entries(content.learning_paths).forEach(([id, path]: any) => {
      newStats.learningPathsCount++; if (path.careerPathId) addToIndex("learning_paths_by_career_path", path.careerPathId, id);
    });

    if (content.resources) Object.entries(content.resources).forEach(([id, res]: any) => {
      newStats.resourcesCount++;
      if (res.resourceType) addToIndex("resources_by_type", res.resourceType, id);
      if (res.difficultyLevel) addToIndex("resources_by_level", res.difficultyLevel, id);
      res.skillIds?.forEach((sId: string) => addToIndex("resources_by_skill", sId, id));
      res.careerPathIds?.forEach((cId: string) => addToIndex("resources_by_career_path", cId, id));
      res.academicCategoryIds?.forEach((acId: string) => addToIndex("resources_by_academic_category", acId, id));
    });

    if (content.practice_tasks) Object.entries(content.practice_tasks).forEach(([id, pt]: any) => {
      newStats.practiceTasksCount++; pt.skillIds?.forEach((sId: string) => addToIndex("practice_tasks_by_skill", sId, id));
    });

    if (content.projects) Object.entries(content.projects).forEach(([id, proj]: any) => {
      newStats.projectsCount++;
      proj.skillIds?.forEach((sId: string) => addToIndex("projects_by_skill", sId, id));
      proj.careerPathIds?.forEach((cId: string) => addToIndex("projects_by_career_path", cId, id));
    });

    if (content.quizzes) Object.entries(content.quizzes).forEach(([id, quiz]: any) => {
      newStats.quizzesCount++; quiz.skillIds?.forEach((sId: string) => addToIndex("quizzes_by_skill", sId, id));
    });

    await firebaseDbPut("indexes", newIndexes);
    await firebaseDbPut("stats", newStats);

    await firebaseDbPost(`system/admin_logs`, {
      adminUid: callerUid, action: "REBUILD_INDEXES", targetType: "system", targetId: "indexes_and_stats",
      createdAt: timestamp, metadata: { stats: newStats }
    });

    return new Response(JSON.stringify({ success: true, stats: newStats }), { headers: corsHeaders, status: 200 });
  } catch (error: any) {
    console.error("Rebuild Indexes Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { headers: corsHeaders, status: 500 });
  }
});
