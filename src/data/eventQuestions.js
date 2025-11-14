// Global Events Question Banks
// Each event has 10 hard MCQs from assigned paths
// Questions are harder than regular quizzes with detailed options

export const EVENT_QUESTIONS = {
  // 🕌 Pillar Clash - Foundations of Islam (Path 2)
  pillar_clash: [
    {
      id: "pc_1",
      question: "What are the three fundamental questions asked in the grave according to authentic hadith?",
      options: [
        "Who is your Lord? What is your religion? Who is your Prophet?",
        "What did you worship? What book did you follow? Who was your leader?",
        "Do you believe in Allah? Did you pray? Did you give charity?",
        "Why did you live? What good did you do? Who taught you Islam?"
      ],
      correct: 0,
      evidence: "Narrated in Sunan At-Tirmidhi and Musnad Ahmad"
    },
    {
      id: "pc_2",
      question: "Which pillar of Islam is mentioned most frequently in the Qur'an alongside Salah?",
      options: [
        "Zakah (charity)",
        "Sawm (fasting)",
        "Hajj (pilgrimage)",
        "Shahada (testimony)"
      ],
      correct: 0,
      evidence: "Zakah is mentioned with Salah over 80 times in the Qur'an"
    },
    {
      id: "pc_3",
      question: "What percentage of one's wealth is due for Zakah on gold, silver, and cash savings?",
      options: [
        "2.5% annually",
        "5% annually",
        "10% at harvest",
        "20% of profit"
      ],
      correct: 0,
      evidence: "2.5% is the nisab rate mentioned in authentic hadith collections"
    },
    {
      id: "pc_4",
      question: "Which surah contains the verse 'This day I have perfected your religion for you'?",
      options: [
        "Surah Al-Ma'idah",
        "Surah Al-Baqarah",
        "Surah Al-Fatiha",
        "Surah Al-Ikhlas"
      ],
      correct: 0,
      evidence: "Revealed in Surah Al-Ma'idah (5:3) during the Farewell Pilgrimage"
    },
    {
      id: "pc_5",
      question: "How many obligatory (fard) units (rak'ahs) are in the five daily prayers combined?",
      options: [
        "17 rak'ahs",
        "20 rak'ahs",
        "25 rak'ahs",
        "12 rak'ahs"
      ],
      correct: 0,
      evidence: "Fajr(2) + Dhuhr(4) + Asr(4) + Maghrib(3) + Isha(4) = 17"
    },
    {
      id: "pc_6",
      question: "What is the minimum amount of gold (nisab) one must possess for Zakah to become obligatory?",
      options: [
        "85 grams (approximately 3 ounces)",
        "100 grams (approximately 3.5 ounces)",
        "200 grams (approximately 7 ounces)",
        "50 grams (approximately 1.75 ounces)"
      ],
      correct: 0,
      evidence: "Based on authentic hadith about 20 dinars worth of gold"
    },
    {
      id: "pc_7",
      question: "Which night is better than a thousand months according to the Qur'an?",
      options: [
        "Laylat al-Qadr (Night of Decree)",
        "Laylat al-Isra (Night Journey)",
        "Laylat al-Bara'ah (Night of Forgiveness)",
        "Laylat al-Mi'raj (Night of Ascension)"
      ],
      correct: 0,
      evidence: "Surah Al-Qadr (97:3) - 'Better than a thousand months'"
    },
    {
      id: "pc_8",
      question: "What are the three types of Tawheed (Islamic monotheism)?",
      options: [
        "Tawheed ar-Rububiyyah, Tawheed al-Uluhiyyah, Tawheed al-Asma wa's-Sifat",
        "Belief in Allah, Angels, and Books",
        "Prayer, Fasting, and Charity",
        "Knowledge, Action, and Sincerity"
      ],
      correct: 0,
      evidence: "Classical Islamic scholarship classification of monotheism"
    },
    {
      id: "pc_9",
      question: "Which companion is mentioned by name in the Qur'an?",
      options: [
        "Zayd ibn Harithah (RA)",
        "Abu Bakr (RA)",
        "Umar ibn Al-Khattab (RA)",
        "Ali ibn Abi Talib (RA)"
      ],
      correct: 0,
      evidence: "Mentioned in Surah Al-Ahzab (33:37) regarding adoption laws"
    },
    {
      id: "pc_10",
      question: "What are the six articles of faith (Iman) in Islam?",
      options: [
        "Belief in Allah, Angels, Books, Messengers, Last Day, and Divine Decree",
        "Prayer, Fasting, Charity, Pilgrimage, Jihad, and Knowledge",
        "Quran, Sunnah, Ijma, Qiyas, Istihsan, and Maslahah",
        "Tawheed, Salah, Sawm, Zakah, Hajj, and Dawah"
      ],
      correct: 0,
      evidence: "Mentioned in Sahih Muslim - Hadith of Jibreel"
    }
  ],

  // ✨ Names of Allah Mastery - Names of Allah (Path 1)
  names_mastery: [
    {
      id: "nm_1",
      question: "Al-Qahhar means 'The Subduer.' Which name pairs with it to show Allah's complete authority?",
      options: [
        "Al-Jabbar (The Compeller)",
        "Ar-Rahman (The Most Merciful)",
        "Al-Latif (The Subtle)",
        "Al-Halim (The Forbearing)"
      ],
      correct: 0,
      evidence: "Both emphasize Allah's absolute power and authority"
    },
    {
      id: "nm_2",
      question: "Which Beautiful Name means 'The Watchful Guardian' who never sleeps?",
      options: [
        "Al-Raqib",
        "Al-Hafiz",
        "Al-Muhaymin",
        "Al-Wakil"
      ],
      correct: 0,
      evidence: "From Surah Al-Ma'idah (5:117) - 'You are ever Watchful'"
    },
    {
      id: "nm_3",
      question: "Ar-Razzaq means 'The Provider.' What is the difference between Ar-Razzaq and Ar-Raziq?",
      options: [
        "Ar-Razzaq emphasizes continuous abundant provision for all creation",
        "They mean exactly the same with no difference",
        "Ar-Raziq only provides for believers",
        "Ar-Razzaq only provides spiritual guidance"
      ],
      correct: 0,
      evidence: "Ar-Razzaq (intensive form) shows constant universal provision"
    },
    {
      id: "nm_4",
      question: "Which name pair shows Allah is both 'The Most Gentle' and 'The All-Aware'?",
      options: [
        "Al-Latif, Al-Khabir",
        "Ar-Ra'uf, Al-Hakim",
        "Al-Halim, Al-Alim",
        "Al-Wadud, Al-Basir"
      ],
      correct: 0,
      evidence: "Mentioned together in Surah Luqman (31:16) and elsewhere"
    },
    {
      id: "nm_5",
      question: "Al-Muhaimin means 'The Guardian.' In which surah is this name mentioned?",
      options: [
        "Surah Al-Hashr (The Exile)",
        "Surah Al-Fatiha (The Opening)",
        "Surah Al-Ikhlas (The Sincerity)",
        "Surah An-Nas (Mankind)"
      ],
      correct: 0,
      evidence: "Mentioned in Surah Al-Hashr (59:23) among Allah's names"
    },
    {
      id: "nm_6",
      question: "What does Al-Muntaqim mean, and how does it relate to divine justice?",
      options: [
        "The Avenger who takes retribution from oppressors with perfect justice",
        "The Forgiver who pardons all sins without accountability",
        "The Patient One who delays all punishment forever",
        "The Merciful who never punishes anyone"
      ],
      correct: 0,
      evidence: "Balanced with mercy, used for those who persist in wrongdoing"
    },
    {
      id: "nm_7",
      question: "Al-Awwal and Al-Akhir mean 'The First' and 'The Last.' In which famous verse are they mentioned together?",
      options: [
        "Ayat al-Kursi extension in Surah Al-Hadid",
        "The opening of Surah Al-Fatiha",
        "The conclusion of Surah Al-Ikhlas",
        "The beginning of Surah Al-Baqarah"
      ],
      correct: 0,
      evidence: "Surah Al-Hadid (57:3) - 'He is the First and the Last'"
    },
    {
      id: "nm_8",
      question: "Which Beautiful Name means 'The Responsive' who answers every sincere supplication?",
      options: [
        "Al-Mujib",
        "As-Sami",
        "Al-Basir",
        "Al-Karim"
      ],
      correct: 0,
      evidence: "From Surah Hud (11:61) - 'Indeed my Lord is ever responsive'"
    },
    {
      id: "nm_9",
      question: "Al-Haqq means 'The Truth.' Which verse emphasizes that Allah is the only Haqq?",
      options: [
        "That is because Allah is the Truth, and what they call upon besides Him is falsehood (22:62)",
        "Say He is Allah, the One (112:1)",
        "There is no god but He (2:255)",
        "Allah is the Creator of all things (39:62)"
      ],
      correct: 0,
      evidence: "Surah Al-Hajj (22:62) directly states this"
    },
    {
      id: "nm_10",
      question: "How many Beautiful Names of Allah are commonly known from authentic hadith?",
      options: [
        "99 names, though Allah has more names unknown to us",
        "Exactly 99 names with no more",
        "100 names including Al-A'zam",
        "70 names mentioned in the Qur'an"
      ],
      correct: 0,
      evidence: "Sahih Bukhari & Muslim - '99 names, whoever memorizes them enters Paradise'"
    }
  ],

  // 🌙 Faith Test - Akhirah paths (Angels, Grave, Day of Judgement, Hellfire, Paradise)
  faith_test: [
    {
      id: "ft_1",
      question: "Which angel will blow the Trumpet (Sur) to signal the Day of Resurrection?",
      options: [
        "Israfil (AS)",
        "Mikail (AS)",
        "Jibril (AS)",
        "Azrael (AS)"
      ],
      correct: 0,
      evidence: "Authentic hadith identify Israfil as the angel of the Trumpet"
    },
    {
      id: "ft_2",
      question: "What are the names of the two angels who question people in the grave?",
      options: [
        "Munkar and Nakir",
        "Raqib and Atid",
        "Kiraman Katibin",
        "Haroot and Maroot"
      ],
      correct: 0,
      evidence: "Named in authentic hadith collections"
    },
    {
      id: "ft_3",
      question: "How many levels (gates) does Paradise have according to authentic hadith?",
      options: [
        "Eight gates with specific names",
        "Seven gates for seven good deeds",
        "Twelve gates for each month",
        "Countless gates for every good deed"
      ],
      correct: 0,
      evidence: "Sahih Bukhari mentions eight gates including Ar-Rayyan for those who fast"
    },
    {
      id: "ft_4",
      question: "What is the name of the bridge over Hellfire that everyone must cross on Judgment Day?",
      options: [
        "As-Sirat",
        "Al-Mizan",
        "Al-Kawthar",
        "Al-Hawd"
      ],
      correct: 0,
      evidence: "Described in Sahih Muslim as thinner than hair and sharper than sword"
    },
    {
      id: "ft_5",
      question: "Which angel is responsible for taking souls at the time of death?",
      options: [
        "The Angel of Death (commonly called Azrael, though not mentioned in Qur'an)",
        "Jibril (AS)",
        "Mikail (AS)",
        "Israfil (AS)"
      ],
      correct: 0,
      evidence: "Qur'an (32:11) mentions 'Angel of Death' without specific name"
    },
    {
      id: "ft_6",
      question: "What is the lowest level of Paradise called?",
      options: [
        "The lowest level is still 10 times better than the entire world",
        "Dar as-Salam",
        "Jannat al-Firdaws",
        "Jannat al-Adn"
      ],
      correct: 0,
      evidence: "Sahih Bukhari describes even the lowest Paradise dweller's rewards"
    },
    {
      id: "ft_7",
      question: "How wide is Hellfire according to the Qur'an?",
      options: [
        "As wide as the heavens and earth (metaphor for vast size)",
        "7 levels of equal size",
        "Wider than all oceans combined",
        "Beyond human measurement"
      ],
      correct: 0,
      evidence: "Similar expression used in Qur'an (57:21) for Paradise width"
    },
    {
      id: "ft_8",
      question: "On the Day of Judgment, what will testify against or for a person?",
      options: [
        "Their limbs, skin, and even the earth itself",
        "Only the angels who recorded their deeds",
        "Only other people who witnessed their actions",
        "Only their own admission"
      ],
      correct: 0,
      evidence: "Surah Fussilat (41:20-21) - limbs will testify"
    },
    {
      id: "ft_9",
      question: "What is the highest level of Paradise called, and who dwells there?",
      options: [
        "Al-Firdaws, for the most righteous believers",
        "Jannat al-Adn, for all believers equally",
        "Jannat an-Na'im, for martyrs only",
        "Dar as-Salam, for prophets only"
      ],
      correct: 0,
      evidence: "Mentioned in Surah Al-Kahf (18:107) and authentic hadith"
    },
    {
      id: "ft_10",
      question: "What happens during the 'punishment of the grave' (Adhab al-Qabr)?",
      options: [
        "The soul experiences punishment or bliss in Barzakh while the body remains",
        "The physical body is tortured continuously",
        "Nothing happens until the Day of Judgment",
        "Only disbelievers experience anything"
      ],
      correct: 0,
      evidence: "Explained in Sahih Bukhari and Muslim regarding the intermediate realm"
    }
  ],

  // 📖 Seerah Challenge - Life of Muhammad ﷺ (Path 4 - Sealed Nectar)
  seerah_challenge: [
    {
      id: "sc_1",
      question: "In which year was the Prophet ﷺ born, known as the Year of the Elephant?",
      options: [
        "570 CE (approximately)",
        "610 CE",
        "571 CE exactly",
        "600 CE"
      ],
      correct: 0,
      evidence: "The Sealed Nectar - Year Abraha attacked Makkah with elephants"
    },
    {
      id: "sc_2",
      question: "Who was the Prophet's ﷺ wet nurse who took him to live in the desert?",
      options: [
        "Halimah As-Sa'diyyah",
        "Barakah (Umm Ayman)",
        "Thuwaybah",
        "Aminah bint Wahb"
      ],
      correct: 0,
      evidence: "Raised him for four years among Banu Sa'd tribe"
    },
    {
      id: "sc_3",
      question: "What significant event happened to the Prophet ﷺ at age 40?",
      options: [
        "He received the first revelation in Cave Hira",
        "He married Khadijah (RA)",
        "He became a successful merchant",
        "He rebuilt the Kaaba"
      ],
      correct: 0,
      evidence: "610 CE - Revelation of first verses of Surah Al-Alaq"
    },
    {
      id: "sc_4",
      question: "Which treaty allowed Muslims to perform Umrah but was seemingly unfavorable at first?",
      options: [
        "Treaty of Hudaybiyyah",
        "Pact of Al-Aqabah",
        "Constitution of Madinah",
        "Treaty of Ta'if"
      ],
      correct: 0,
      evidence: "6 AH - Allah called it 'a clear victory' in Surah Al-Fath"
    },
    {
      id: "sc_5",
      question: "Who was the first male to accept Islam?",
      options: [
        "Abu Bakr As-Siddiq (RA)",
        "Ali ibn Abi Talib (RA)",
        "Zayd ibn Harithah (RA)",
        "Umar ibn Al-Khattab (RA)"
      ],
      correct: 0,
      evidence: "First free adult male; Ali was a child, Zayd was freed slave"
    },
    {
      id: "sc_6",
      question: "What miracle occurred during the Battle of Badr that helped the Muslims?",
      options: [
        "Allah sent angels to fight alongside Muslims and caused drowsiness to give them rest",
        "The sun stood still in the sky",
        "Rain fell only on the enemy",
        "A massive earthquake struck"
      ],
      correct: 0,
      evidence: "Mentioned in Surah Al-Anfal (8:9-11) and authentic hadith"
    },
    {
      id: "sc_7",
      question: "How long did the Prophet ﷺ receive revelation?",
      options: [
        "23 years (13 in Makkah, 10 in Madinah)",
        "20 years equally divided",
        "25 years total",
        "15 years in Makkah only"
      ],
      correct: 0,
      evidence: "From age 40 to 63 - historical consensus"
    },
    {
      id: "sc_8",
      question: "What was the name of the Prophet's ﷺ grandfather who raised him?",
      options: [
        "Abdul-Muttalib",
        "Abu Talib",
        "Abdullah",
        "Abu Lahab"
      ],
      correct: 0,
      evidence: "Raised him after his mother's death until age 8"
    },
    {
      id: "sc_9",
      question: "During the Night Journey (Isra and Mi'raj), from which location did the Prophet ﷺ ascend to the heavens?",
      options: [
        "Masjid Al-Aqsa in Jerusalem",
        "The Kaaba in Makkah",
        "Masjid Quba in Madinah",
        "Mount Sinai"
      ],
      correct: 0,
      evidence: "Surah Al-Isra (17:1) - 'from Al-Masjid Al-Haram to Al-Masjid Al-Aqsa'"
    },
    {
      id: "sc_10",
      question: "Which battle is called the 'Battle of the Confederates' or 'Battle of the Trench'?",
      options: [
        "Battle of Al-Ahzab (Khandaq)",
        "Battle of Uhud",
        "Battle of Hunayn",
        "Battle of Tabuk"
      ],
      correct: 0,
      evidence: "5 AH - Defensive trench strategy suggested by Salman Al-Farsi (RA)"
    }
  ]
};

// Utility function to get randomized questions for an event
export function getEventQuestions(eventId, count = 10) {
  const questions = EVENT_QUESTIONS[eventId] || [];
  
  // Shuffle questions
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  
  // Take requested count and randomize answer order
  return shuffled.slice(0, count).map(q => ({
    ...q,
    options: randomizeOptions(q.options, q.correct)
  }));
}

// Randomize answer options but track correct answer
function randomizeOptions(options, correctIndex) {
  const correctAnswer = options[correctIndex];
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  
  return {
    options: shuffled,
    correct: shuffled.indexOf(correctAnswer)
  };
}
