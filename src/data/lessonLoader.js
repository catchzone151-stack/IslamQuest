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
import hellfireLessons from "./lessons/hellfireLessons.js";
import paradiseLessons from "./lessons/paradiseLessons.js";

export function getLessonsForPath(pathId) {
  const numericId = Number(pathId);
  
  switch (numericId) {
    case 1: return namesOfAllahLessonsFull;
    case 2: return foundationsLessons;
    case 3: return prophetsLessons;
    case 4: return prophetLifeLessons;
    case 5: return wivesLessons;
    case 6: return tenPromisedLessons;
    case 7: return fourWomenLessons;
    case 8: return companionsLessons;
    case 9: return angelsLessons;
    case 10: return endTimesLessons;
    case 11: return graveLessons;
    case 12: return judgementLessons;
    case 13: return hellfireLessons;
    case 14: return paradiseLessons;
    default: return [];
  }
}

export function getShortLessonList(pathId) {
  const fullLessons = getLessonsForPath(pathId);
  return fullLessons.map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    meaning: lesson.meaning,
    quizId: lesson.quizId
  }));
}
