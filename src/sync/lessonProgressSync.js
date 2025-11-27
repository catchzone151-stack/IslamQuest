import { supabase } from "../lib/supabaseClient.js";

export async function logLessonStart(userId, lessonId) {
  const now = Date.now();
  await supabase.from("lesson_progress").insert({
    user_id: userId,
    lesson_id: lessonId,
    event_type: "start",
    timestamp: now,
  });
}

export async function logLessonComplete(userId, lessonId, accuracy, mistakes) {
  const now = Date.now();
  await supabase.from("lesson_progress").insert({
    user_id: userId,
    lesson_id: lessonId,
    event_type: "complete",
    timestamp: now,
    accuracy,
    mistakes,
  });
}

export async function logLessonExit(userId, lessonId) {
  const now = Date.now();
  await supabase.from("lesson_progress").insert({
    user_id: userId,
    lesson_id: lessonId,
    event_type: "exit",
    timestamp: now,
  });
}
