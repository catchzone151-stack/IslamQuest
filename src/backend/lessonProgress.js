import { supabase } from "../lib/supabaseClient.js";

export async function logLessonStart(userId, lessonId) {
  const now = Date.now();
  const { error } = await supabase.from("lesson_progress").insert({
    user_id: userId,
    lesson_id: lessonId,
    event_type: "start",
    timestamp: now,
  });
  if (error) {
    console.error("[LessonProgress] logLessonStart error:", error);
  } else {
    console.log("[LessonProgress] logLessonStart success:", lessonId);
  }
}

export async function logLessonComplete(userId, lessonId, accuracy, mistakes) {
  const now = Date.now();
  const { error } = await supabase.from("lesson_progress").insert({
    user_id: userId,
    lesson_id: lessonId,
    event_type: "complete",
    timestamp: now,
    accuracy,
    mistakes,
  });
  if (error) {
    console.error("[LessonProgress] logLessonComplete error:", error);
  } else {
    console.log("[LessonProgress] logLessonComplete success:", lessonId, accuracy, mistakes);
  }
}

export async function logLessonExit(userId, lessonId) {
  const now = Date.now();
  const { error } = await supabase.from("lesson_progress").insert({
    user_id: userId,
    lesson_id: lessonId,
    event_type: "exit",
    timestamp: now,
  });
  if (error) {
    console.error("[LessonProgress] logLessonExit error:", error);
  } else {
    console.log("[LessonProgress] logLessonExit success:", lessonId);
  }
}
