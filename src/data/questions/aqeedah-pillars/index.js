// src/data/questions/aqeedah-pillars/index.js
export const meta = {
  pathId: 'aqeedah-pillars',
  title: 'Six Pillars of Faith',
  description: 'Belief in Allah, His angels, His books, His messengers, the Last Day, and Divine Decree (Qadar).',
};

export const lessons = [
  { id: '0', title: 'Belief in Allah (Tawhid)' },
  { id: '1', title: 'Belief in the Angels' },
  { id: '2', title: 'Belief in the Books' },
  { id: '3', title: 'Belief in the Messengers' },
  { id: '4', title: 'Belief in the Last Day' },
  { id: '5', title: 'Belief in Qadar (Divine Decree)' },
];

export const config = {
  shuffleQuestions: true,
  shuffleAnswers: true,
  timePerQuestionSec: null,
  passMark: 1.0,
  rewards: { perCorrectXP: 10, perCorrectCoins: 1, perfectBonusXP: 25 },
};
