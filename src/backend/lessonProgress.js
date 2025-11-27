import { supabase } from "../lib/supabaseClient.js";

export async function logLessonStart(userId, pathId, lessonId) {
  const { error } = await supabase.from("lesson_progress").upsert({
    user_id: userId,
    path_id: pathId,
    lesson_id: lessonId,
    completed: false,
    score: 0,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,path_id,lesson_id" });
  if (error) {
    console.error("[LessonProgress] logLessonStart error:", error);
  } else {
    console.log("[LessonProgress] logLessonStart success:", pathId, lessonId);
  }
}

export async function logLessonComplete(userId, pathId, lessonId, score, passed) {
  const { error } = await supabase.from("lesson_progress").upsert({
    user_id: userId,
    path_id: pathId,
    lesson_id: lessonId,
    completed: passed,
    score: score,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,path_id,lesson_id" });
  if (error) {
    console.error("[LessonProgress] logLessonComplete error:", error);
  } else {
    console.log("[LessonProgress] logLessonComplete success:", pathId, lessonId, score, passed);
  }
}

export async function logLessonExit(userId, pathId, lessonId) {
  console.log("[LessonProgress] logLessonExit:", pathId, lessonId);
}
