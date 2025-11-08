// /src/data/quizEngine.js
// Handles all quiz data + XP/coin calculation for the Names of Allah path

// ---------------------------------------------------------------------
//  QUIZ DATA – Names of Allah (first 5 fully written, rest placeholders)
// ---------------------------------------------------------------------

export const namesOfAllahQuizzes = {
  lesson1: [
    {
      id: 1,
      text: "What does the name 'Ar-Rahman' mean?",
      options: [
        "The Most Merciful",
        "The All-Knowing",
        "The Most Forgiving",
        "The Creator",
      ],
      correctIndex: 0,
    },
    {
      id: 2,
      text: "What does 'Rahmah' refer to in this lesson?",
      options: [
        "Mercy and kindness from Allah",
        "Power and strength",
        "Knowledge of all things",
        "Forgiveness of sins",
      ],
      correctIndex: 0,
    },
    {
      id: 3,
      text: "How should a Muslim show mercy?",
      options: [
        "By being kind and gentle with others",
        "By ignoring others’ feelings",
        "By being proud of their good deeds",
        "By staying silent always",
      ],
      correctIndex: 0,
    },
    {
      id: 4,
      text: "What is one way to earn Allah’s mercy?",
      options: [
        "Show mercy to others",
        "Speak harshly to sinners",
        "Boast about worship",
        "Avoid helping others",
      ],
      correctIndex: 0,
    },
  ],

  lesson2: [
    {
      id: 1,
      text: "What does the name 'Ar-Raheem' mean?",
      options: [
        "The Especially Merciful",
        "The All-Powerful",
        "The Forgiving",
        "The Provider",
      ],
      correctIndex: 0,
    },
    {
      id: 2,
      text: "How is Ar-Raheem different from Ar-Rahman?",
      options: [
        "It shows Allah’s mercy to the believers specifically",
        "It means the same as Ar-Rahman",
        "It refers only to forgiveness",
        "It means powerful and strong",
      ],
      correctIndex: 0,
    },
    {
      id: 3,
      text: "What can we do to receive Allah’s mercy?",
      options: [
        "Obey Allah and do good deeds",
        "Ignore the Qur’an",
        "Be proud of our faith",
        "Avoid prayer",
      ],
      correctIndex: 0,
    },
    {
      id: 4,
      text: "When should we remember Ar-Raheem?",
      options: [
        "When we seek comfort and forgiveness",
        "Only when we are happy",
        "Only in Ramadan",
        "Only at the mosque",
      ],
      correctIndex: 0,
    },
  ],

  lesson3: [
    {
      id: 1,
      text: "What does the name 'Al-Malik' mean?",
      options: [
        "The King and Owner of everything",
        "The Most Forgiving",
        "The Most Kind",
        "The All-Hearing",
      ],
      correctIndex: 0,
    },
    {
      id: 2,
      text: "How should we act knowing Allah is Al-Malik?",
      options: [
        "Be humble and thankful for what we have",
        "Be proud and demand more",
        "Ignore blessings",
        "Think we control everything",
      ],
      correctIndex: 0,
    },
    {
      id: 3,
      text: "What belongs to Al-Malik?",
      options: [
        "Everything in the heavens and earth",
        "Only humans",
        "Only angels",
        "Only the world of jinn",
      ],
      correctIndex: 0,
    },
    {
      id: 4,
      text: "How can we show gratitude to Al-Malik?",
      options: [
        "By using what He gave us in good ways",
        "By wasting our blessings",
        "By ignoring others",
        "By being ungrateful",
      ],
      correctIndex: 0,
    },
  ],

  lesson4: [
    {
      id: 1,
      text: "What does the name 'Al-Quddus' mean?",
      options: [
        "The Most Pure and Perfect",
        "The Forgiving",
        "The Provider",
        "The Powerful",
      ],
      correctIndex: 0,
    },
    {
      id: 2,
      text: "Why is Allah called Al-Quddus?",
      options: [
        "Because He is free from all faults or weakness",
        "Because He gives wealth",
        "Because He forgives people",
        "Because He created angels",
      ],
      correctIndex: 0,
    },
    {
      id: 3,
      text: "How can we reflect the name Al-Quddus?",
      options: [
        "Keep our hearts and actions clean from sin",
        "Judge others quickly",
        "Avoid repentance",
        "Stay proud and stubborn",
      ],
      correctIndex: 0,
    },
    {
      id: 4,
      text: "When we say SubhanAllah, what are we declaring?",
      options: [
        "That Allah is free from all imperfection",
        "That we are perfect",
        "That angels are holy",
        "That we are thankful for food",
      ],
      correctIndex: 0,
    },
  ],

  lesson5: [
    {
      id: 1,
      text: "What does the name 'As-Salam' mean?",
      options: [
        "The Source of Peace and Safety",
        "The Forgiver",
        "The Judge",
        "The Wise",
      ],
      correctIndex: 0,
    },
    {
      id: 2,
      text: "Why is Allah As-Salam?",
      options: [
        "Because He gives peace to hearts and removes fear",
        "Because He forgives sins",
        "Because He judges between people",
        "Because He provides food",
      ],
      correctIndex: 0,
    },
    {
      id: 3,
      text: "How can we live by the name As-Salam?",
      options: [
        "Spread peace and kindness wherever we go",
        "Argue and fight often",
        "Avoid greeting people",
        "Stay angry with others",
      ],
      correctIndex: 0,
    },
    {
      id: 4,
      text: "What greeting comes from As-Salam?",
      options: [
        "As-Salaamu ‘Alaykum",
        "Allahu Akbar",
        "Bismillah",
        "SubhanAllah",
      ],
      correctIndex: 0,
    },
  ],

  // Placeholders for lesson6–lesson104
};

for (let i = 6; i <= 104; i++) {
  namesOfAllahQuizzes[`lesson${i}`] = [];
}

// ---------------------------------------------------------------------
//  FUNCTIONS
// ---------------------------------------------------------------------

// Fetch quiz for a specific lesson
export const getQuizForLesson = (lessonId) => {
  return namesOfAllahQuizzes[`lesson${lessonId}`] || [];
};

// Calculate results, XP, and coins
export const calculateResults = (answers) => {
  const total = answers.length;
  const correct = answers.filter((a) => a.correct).length;
  const passed = correct >= 3;

  // XP / Coins system
  const baseXP = correct * 20;
  const bonusXP = passed ? 40 : 0;
  const perfectXP = correct === total ? 20 : 0;
  const totalXP = baseXP + bonusXP + perfectXP;

  const baseCoins = correct * 5;
  const bonusCoins = passed ? 10 : 0;
  const totalCoins = baseCoins + bonusCoins;

  return {
    total,
    correct,
    passed,
    xp: totalXP,
    coins: totalCoins,
  };
};
