// src/data/lessonLoader.js
import namesOfAllahLessonsFull from "./lessons/namesOfAllahLessonsFull.js";
import foundationsLessons from "./lessons/foundationsLessons.js";
import prophetsLessons from "./lessons/prophetsLessons.js";
import prophetLifeLessons from "./lessons/prophetLifeLessons.js";
import wivesLessons from "./lessons/wivesLessons.js";
import tenPromisedLessons from "./lessons/tenPromisedLessons.js";
import fourWomenLessons from "./lessons/fourWomenLessons.js";
import companionsLessons from "./lessons/companionsLessons.js";
import angelsLessons from "./lessons/angelsLessons.js";
import endTimesLessons from "./lessons/endTimesLessons.js";
import graveLessons from "./lessons/graveLessons.js";
import judgementLessons from "./lessons/judgementLessons.js";
import { hellfireLessons } from "./lessons/hellfireLessons.js";
import { paradiseLessons } from "./lessons/paradiseLessons.js";

import { useProgressStore } from "../store/progressStore";

/**
 * 🔒 Get lessons for a specific path.
 * Handles initial unlock and premium flagging.
 */
export function getLessonsForPath(pathId) {
  const numericId = Number(pathId);
  let lessons = [];

  switch (numericId) {
    case 1:
      lessons = namesOfAllahLessonsFull;
      break;
    case 2:
      lessons = foundationsLessons;
      break;
    case 3:
      lessons = prophetsLessons;
      break;
    case 4:
      lessons = prophetLifeLessons;
      break;
    case 5:
      lessons = wivesLessons;
      break;
    case 6:
      lessons = tenPromisedLessons;
      break;
    case 7:
      lessons = fourWomenLessons;
      break;
    case 8:
      lessons = companionsLessons;
      break;
    case 9:
      lessons = angelsLessons;
      break;
    case 10:
      lessons = endTimesLessons;
      break;
    case 11:
      lessons = graveLessons;
      break;
    case 12:
      lessons = judgementLessons;
      break;
    case 13:
      lessons = hellfireLessons;
      break;
    case 14:
      lessons = paradiseLessons;
      break;
    default:
      lessons = [];
  }

  // ✅ Add lesson metadata
  return lessons.map((lesson, index) => ({
    ...lesson,
    id: index + 1,
    unlocked: index === 0, // first lesson always unlocked
    premium: numericId === 1 && index + 1 > 10, // Names of Allah ﷻ premium flag (lesson 11+)
  }));
}

/**
 * Short list helper for cards or summaries
 */
export function getShortLessonList(pathId) {
  const fullLessons = getLessonsForPath(pathId);
  return fullLessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    meaning: lesson.meaning,
    quizId: lesson.quizId,
    unlocked: lesson.unlocked,
    premium: lesson.premium,
  }));
}
