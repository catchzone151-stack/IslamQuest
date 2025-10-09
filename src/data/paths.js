import aqeedahData from "./paths/aqeedah_pillars.json";

const unlocked = [
  { id: "names-of-allah", title: "Names of Allah", progress: 0.35 },
  {
    id: "aqeedah-pillars",
    title: "Six Pillars of Belief",
    progress: 0.2,
    lessons: aqeedahData.lessons.length,
    freeLessons: aqeedahData.free_lessons,
    certificate: aqeedahData.certificate_title,
    data: aqeedahData,
  },
  { id: "stories-of-prophets", title: "Stories of Prophets", progress: 0.1 },
  { id: "life-of-muhammad", title: "Life of Muhammad ﷺ", progress: 0 },
  { id: "ten-promised-paradise", title: "Ten Promised Paradise", progress: 0 },
  { id: "four-greatest-women", title: "Four Greatest Women", progress: 0 },
];
const locked = [
  { id: "minor-signs", title: "Minor Signs" },
  { id: "major-signs", title: "Major Signs" },
  { id: "the-grave", title: "The Grave" },
  { id: "day-of-judgement", title: "Day of Judgement" },
  { id: "hellfire", title: "Hellfire" },
  { id: "paradise", title: "Paradise" },
];
const learningPaths = [
  ...unlocked.map((p) => ({ ...p, locked: false })),
  ...locked.map((p) => ({ ...p, locked: true })),
];
export const pathways = learningPaths;
