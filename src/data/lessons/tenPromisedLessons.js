// Ten Companions Promised Jannah Learning Path
// Based on authentic Islamic sources and Sahih hadith
// 10 lessons covering each of the ten companions promised Paradise
// Each lesson: 3 paragraphs (~23 words each), authentic evidence, Key Lesson
// Sources: Qur'an, Sahih Bukhari, Sahih Muslim

const tenPromisedLessons = [
  {
    id: 1,
    title: "Abu Bakr as-Siddiq",
    description: [
      "Abu Bakr was the Prophet's ﷺ closest companion and first adult man to accept Islam. He believed immediately, showing unwavering trust in Allah ﷾'s message through hardships.",
      "When the Prophet ﷺ described his Night Journey, people mocked him. Abu Bakr believed instantly, earning the title 'As-Siddiq' meaning 'The Truthful One.' He freed enslaved Muslims.",
      "As first Caliph, Abu Bakr united Muslims during crisis. He preserved the Quran and expanded Islam. The Prophet ﷺ said Paradise yearns for Abu Bakr."
    ],
    evidence: {
      arabic: "وَالَّذِي جَاءَ بِالصِّدْقِ وَصَدَّقَ بِهِ",
      translation: "And the one who brought the truth and believed in it.",
      source: "Qur'an 39:33"
    },
    keyLesson: "True friendship means believing, supporting, and sacrificing everything for Allah ﷾ and His messenger.",
    quizId: 1
  },

  {
    id: 2,
    title: "Umar ibn al-Khattab",
    description: [
      "Umar fiercely opposed Islam before accepting it. When he converted, Islam gained strength and Muslims could finally pray openly at the Ka'bah. His conversion transformed early Islam's fortunes.",
      "As second Caliph, Umar expanded the Islamic state across three continents while living in poverty himself. He established justice systems that amazed enemies. Even Shaytan feared encountering him.",
      "Umar wept when reciting Quran and held himself strictly accountable. Once hungry, he put pebbles in his mouth to forget hunger rather than use public funds for the poor."
    ],
    evidence: {
      arabic: "يَا أَيُّهَا النَّبِيُّ حَسْبُكَ اللَّهُ وَمَنِ اتَّبَعَكَ مِنَ الْمُؤْمِنِينَ",
      translation: "O Prophet, sufficient for you is Allah ﷾ and whoever follows you of the believers.",
      source: "Qur'an 8:64"
    },
    keyLesson: "True leadership combines strength with justice, and power with humility before Allah ﷾.",
    quizId: 2
  },

  {
    id: 3,
    title: "Uthman ibn Affan",
    description: [
      "Uthman was known for his modesty, generosity, and shyness. He married two daughters of the Prophet ﷺ, earning the title 'Possessor of Two Lights.' Angels felt modest before him.",
      "When Muslims faced hardship, Uthman bought a well and made it free for all Muslims forever. He equipped the entire Army of Hardship when others had nothing to give.",
      "As third Caliph, Uthman compiled the Quran into one standardized text, preserving it perfectly for all generations. He was martyred while reading Quran, blood staining blessed pages."
    ],
    evidence: {
      arabic: "مَنْ جَهَّزَ جَيْشَ الْعُسْرَةِ فَلَهُ الْجَنَّةُ",
      translation: "Whoever equips the Army of Hardship will have Paradise.",
      source: "Sahih Bukhari 2778"
    },
    keyLesson: "Generosity for Allah ﷾'s sake and modesty in character are marks of true nobility and faith.",
    quizId: 3
  },

  {
    id: 4,
    title: "Ali ibn Abi Talib",
    description: [
      "Ali was the Prophet's ﷺ cousin and among the first children to accept Islam. He was raised in the Prophet's household and learned directly from him since childhood.",
      "On the night of Hijrah when assassins surrounded the Prophet's house, Ali bravely slept in his bed. He risked his life so the Prophet ﷺ could escape safely to Madinah.",
      "The Prophet ﷺ said Ali's position to him was like Harun to Musa. Ali married Fatimah and became fourth Caliph. His knowledge and bravery inspired all believers deeply."
    ],
    evidence: {
      arabic: "أَنتَ مِنِّي بِمَنْزِلَةِ هَارُونَ مِنْ مُوسَى إِلاَّ أَنَّهُ لاَ نَبِيَّ بَعْدِي",
      translation: "You are to me like Harun was to Musa, except there will be no prophet after me.",
      source: "Sahih Bukhari 4416"
    },
    keyLesson: "True courage means sacrificing yourself for Allah ﷾'s cause and protecting those who carry His message.",
    quizId: 4
  },

  {
    id: 5,
    title: "Talhah ibn Ubaydullah",
    description: [
      "Talhah accepted Islam early through Abu Bakr's invitation and faced severe torture for his faith. Despite brutal persecution, he remained steadfast and never renounced Islam whatsoever.",
      "At the Battle of Uhud, when enemies surrounded the Prophet ﷺ, Talhah used his body as a shield. He received over seventy wounds protecting the beloved Messenger of Allah ﷾.",
      "The Prophet ﷺ said, 'Paradise became obligatory for Talhah today.' Known for generosity, Talhah distributed his entire wealth to the poor, keeping nothing for himself despite riches."
    ],
    evidence: {
      arabic: "أَوْجَبَ طَلْحَةُ",
      translation: "Talhah has become deserving of Paradise.",
      source: "Sahih Bukhari"
    },
    keyLesson: "Protecting others and sacrificing your comfort for Allah ﷾'s sake guarantees eternal reward.",
    quizId: 5
  },

  {
    id: 6,
    title: "Zubayr ibn al-Awwam",
    description: [
      "Zubayr accepted Islam at age eight. His uncle tortured him by hanging him in smoke-filled mats, trying to force him to renounce Islam. Young Zubayr courageously refused every time.",
      "The Prophet ﷺ called Zubayr his disciple, saying every prophet has a disciple and Zubayr was his. At the Battle of Khandaq, Zubayr volunteered for the most dangerous mission.",
      "Zubayr was the Prophet's cousin and married Asma, Abu Bakr's daughter. He combined physical courage with deep faith. His battlefield bravery was legendary throughout Arabia and beyond."
    ],
    evidence: {
      arabic: "لِكُلِّ نَبِيٍّ حَوَارِيٌّ وَحَوَارِيَّ الزُّبَيْرُ",
      translation: "Every prophet has a disciple, and my disciple is Zubayr.",
      source: "Sahih Bukhari 3719"
    },
    keyLesson: "Unwavering faith from childhood and willingness to face any danger for Islam defines true discipleship.",
    quizId: 6
  },

  {
    id: 7,
    title: "Abd al-Rahman ibn Awf",
    description: [
      "Abd al-Rahman was a successful merchant who accepted Islam early and endured persecution. When he migrated to Madinah with nothing, he refused charity and requested the marketplace instead.",
      "Through hard work and Allah ﷾'s blessings, he rebuilt his wealth quickly. He once donated an entire caravan of 700 camels loaded with supplies for the Muslim army without hesitation.",
      "Despite immense wealth, Abd al-Rahman lived simply and gave generously. He supported widows, orphans, and the poor throughout his life. The Prophet ﷺ praised his sincere charitable spending."
    ],
    evidence: {
      arabic: "نِعْمَ الْمَالُ الصَّالِحُ لِلرَّجُلِ الصَّالِحِ",
      translation: "How excellent is righteous wealth for a righteous person.",
      source: "Musnad Ahmad"
    },
    keyLesson: "Wealth is a test, and righteous people use it generously for Allah ﷾'s cause without attachment or pride.",
    quizId: 7
  },

  {
    id: 8,
    title: "Saad ibn Abi Waqqas",
    description: [
      "Saad accepted Islam at age seventeen. When his mother threatened to starve herself unless he renounced Islam, Saad remained firm. He refused to abandon Islam.",
      "Saad was first to shoot an arrow defending Islam and a master archer. At Uhud, the Prophet ﷺ gave him arrows saying, 'May my parents be sacrificed for you!'",
      "The Prophet ﷺ said Saad's supplication was always answered. Once he prayed against someone who insulted companions, and that person immediately went blind. He led Persia's conquest."
    ],
    evidence: {
      arabic: "ارْمِ فِدَاكَ أَبِي وَأُمِّي",
      translation: "Shoot! May my father and mother be sacrificed for you.",
      source: "Sahih Bukhari 4055"
    },
    keyLesson: "Standing firm in faith despite family pressure and defending Islam earns Allah ﷾'s pleasure and acceptance of your prayers.",
    quizId: 8
  },

  {
    id: 9,
    title: "Saeed ibn Zayd",
    description: [
      "Saeed accepted Islam before the Prophet ﷺ even entered Dar al-Arqam to teach secretly. He and his wife Fatimah were among the earliest Muslims, showing incredible courage.",
      "When Umar discovered them reading Quran and struck his sister, their steadfastness helped lead to Umar's conversion to Islam. Saeed participated in all major battles except Badr.",
      "Once falsely accused of stealing land, Saeed made a powerful supplication against the liar. He prayed that if she was lying, Allah ﷾ would blind her. Both blindness and punishment came exactly as prayed."
    ],
    evidence: {
      arabic: "عَشَرَةٌ فِي الْجَنَّةِ",
      translation: "Ten are in Paradise.",
      source: "Sahih Muslim 2409"
    },
    keyLesson: "Early acceptance of Islam and unwavering commitment through all trials guarantees eternal success.",
    quizId: 9
  },

  {
    id: 10,
    title: "Abu Ubaydah ibn al-Jarrah",
    description: [
      "Abu Ubaydah was known as the 'Trustworthy One of this Ummah.' The Prophet ﷺ said every nation has a trustworthy person, and this nation's is Abu Ubaydah.",
      "At the Battle of Uhud, two rings from the Prophet's helmet pierced his blessed face. Abu Ubaydah removed them with his teeth, losing two front teeth protecting him.",
      "As a military commander, Abu Ubaydah led Syria's conquest with wisdom and justice. When plague struck, he chose to stay with his people rather than escape, dying as a martyr."
    ],
    evidence: {
      arabic: "لِكُلِّ أُمَّةٍ أَمِينٌ وَأَمِينُ هَذِهِ الأُمَّةِ أَبُو عُبَيْدَةَ بْنُ الْجَرَّاحِ",
      translation: "Every nation has a trustworthy person, and the trustworthy one of this nation is Abu Ubaydah ibn al-Jarrah.",
      source: "Sahih Bukhari 4382"
    },
    keyLesson: "Trustworthiness and selfless service to the Muslim community are among the highest qualities of a believer.",
    quizId: 10
  }
];

export default tenPromisedLessons;
