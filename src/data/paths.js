import aqeedahData from "./paths/aqeedah_pillars.json";

const unlocked = [
  { id: 1, title: "Names of Allah", progress: 0.35 },
  {
    id: 2,
    title: "Six Pillars of Belief",
    progress: 0.2,
    lessons: aqeedahData.lessons.length,
    freeLessons: aqeedahData.free_lessons,
    certificate: aqeedahData.certificate_title,
    data: aqeedahData,
  },
  { id: 3, title: "Stories of Prophets", progress: 0.1 },
  { id: 4, title: "Life of Muhammad ﷺ", progress: 0 },
  { id: 5, title: "Ten Promised Paradise", progress: 0 },
  { id: 6, title: "Four Greatest Women", progress: 0 },
];
const locked = [
  { id: 7, title: "Minor Signs" },
  { id: 8, title: "Major Signs" },
  { id: 9, title: "The Grave" },
  { id: 10, title: "Day of Judgement" },
  { id: 11, title: "Hellfire" },
  { id: 12, title: "Paradise" },
];
const learningPaths = [
  ...unlocked.map((p) => ({ ...p, locked: false })),
  ...locked.map((p) => ({ ...p, locked: true })),
];
