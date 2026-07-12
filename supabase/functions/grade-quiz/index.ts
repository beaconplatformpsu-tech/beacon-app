import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifyFirebaseAuth } from "../_shared/verifyFirebaseAuth.ts";
import { firebaseDbGet, firebaseDbPatch, firebaseDbPost } from "../_shared/firebaseAdminRest.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authResult = await verifyFirebaseAuth(req, { requireEmailVerified: true });
    if (authResult.error || !authResult.payload) {
      return new Response(JSON.stringify({ error: authResult.error }), { headers: corsHeaders, status: authResult.status });
    }

    const callerUid = authResult.payload.uid as string;
    
    const body = await req.json();
    const { quizId, answers } = body;

    if (!quizId || !answers || typeof answers !== "object") {
      return new Response(JSON.stringify({ error: "Invalid parameters." }), { headers: corsHeaders, status: 400 });
    }

    // 1. Fetch Answer Key securely from RTDB
    const answerKey = await firebaseDbGet(`system/quiz_answer_keys/${quizId}`);
    if (!answerKey || !answerKey.answers) {
      return new Response(JSON.stringify({ error: "Quiz answer key not found." }), { headers: corsHeaders, status: 404 });
    }

    // 2. Grade the quiz
    const correctAnswers = answerKey.answers;
    const questionsCount = Object.keys(correctAnswers).length;
    let score = 0;
    const results: Record<string, boolean> = {};

    for (const [qId, correctOptionIndex] of Object.entries(correctAnswers)) {
      const studentAnswer = answers[qId];
      if (studentAnswer === correctOptionIndex) {
        score++;
        results[qId] = true;
      } else {
        results[qId] = false;
      }
    }

    const percentage = Math.round((score / questionsCount) * 100);
    const passed = percentage >= (answerKey.passingPercentage || 70);

    const attemptRecord = {
      score,
      percentage,
      passed,
      questionsCount,
      results, // true/false per question, without revealing correct answer
      completedAt: new Date().toISOString()
    };

    // 3. Save attempt to user_private
    await firebaseDbPatch(`user_private/${callerUid}/quiz_attempts/${quizId}`, attemptRecord);

    return new Response(JSON.stringify({ success: true, attempt: attemptRecord }), { headers: corsHeaders, status: 200 });
  } catch (error: any) {
    console.error("Grade Quiz Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { headers: corsHeaders, status: 500 });
  }
});
