// Foundations of Islam Learning Path
// 17 lessons divided into 3 sections
// Each lesson: 4 paragraphs of ~30 words each

const foundationsLessons = [
  // ============================================================
  // SECTION 1: The Five Pillars of Islam (Lessons 1-5)
  // ============================================================
  
  {
    id: 1,
    title: "Shahadah",
    arabic: "الشَّهَادَة",
    meaning: "The Declaration of Faith",
    description: [
      "The Shahadah is Islam's foundation. When we declare 'There is no god but Allah, and Muhammad is His Messenger,' we testify Allah alone deserves worship. This opens the door to Islam.",
      "The declaration requires belief in the heart, understanding of meaning, and sincere action. We reject all false gods and obey Allah's commands. Without this belief, worship has no meaning.",
      "The Prophet ﷺ taught that whoever sincerely says the Shahadah and dies upon it will enter Paradise. It purifies the heart, gives life purpose, and frees us from slavery to creation.",
      "Every Muslim should renew their Shahadah daily, reflecting on its deep meaning. From morning until night, this declaration defines who we are as believers and guides our entire lives."
    ],
    evidence: {
      arabic: "مَنْ قَالَ لَا إِلَهَ إِلَّا اللَّهُ وَمَاتَ عَلَى ذَلِكَ دَخَلَ الْجَنَّةَ",
      translation: "Whoever says 'There is no god but Allah' and dies upon that will enter Paradise.",
      source: "Sahih Bukhari"
    },
    reflection: "How does knowing the deep meaning of the Shahadah strengthen your daily worship?",
    quizId: 1
  },

  {
    id: 2,
    title: "Salah",
    arabic: "الصَّلاة",
    meaning: "The Five Daily Prayers",
    description: [
      "Salah is Islam's second pillar. Muslims pray five times daily: Fajr, Dhuhr, Asr, Maghrib, and Isha. These prayers are intimate conversations with Allah, moments of submission, gratitude, and humility.",
      "Prayer is the first thing questioned on Judgment Day. If our prayers are sound, our deeds are sound. Salah cleanses minor sins like bathing five times daily cleanses the body.",
      "When we pray, we leave worldly distractions behind. We bow in humility, prostrate in submission. This physical worship trains us to obey Allah in all aspects of life with discipline and patience.",
      "Salah brings peace to anxious hearts and strength to face challenges. Through prayer, we ask forgiveness, guidance, and blessings. These daily appointments reconnect our hearts and recharge our faith throughout each day."
    ],
    evidence: {
      arabic: "أَقِمِ الصَّلَاةَ لِذِكْرِي",
      translation: "Establish prayer for My remembrance.",
      source: "Qur'an 20:14"
    },
    reflection: "How can you improve the quality and presence of heart in your daily prayers?",
    quizId: 2
  },

  {
    id: 3,
    title: "Zakah",
    arabic: "الزَّكَاة",
    meaning: "Purifying Wealth Through Charity",
    description: [
      "Zakah is Islam's third pillar. Muslims give 2.5% of their wealth yearly to help the poor and needy. It's mandatory charity that purifies wealth and hearts from greed. Everything we own is Allah's trust.",
      "Zakah purifies us from spiritual corruption. When we refuse to share, hearts become hard. When we give for Allah's sake, hearts soften with compassion. Rich and poor are equal before Allah.",
      "The Prophet ﷺ taught that charity never decreases wealth but increases it. When we give sincerely, Allah blesses what remains and multiplies our reward in the Hereafter beyond imagination.",
      "Zakah purifies hearts from materialism and trains us to be generous. It reduces poverty and builds community through mercy and support. On Judgment Day, charity waits as treasure in Paradise for those who gave."
    ],
    evidence: {
      arabic: "خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا",
      translation: "Take from their wealth a charity to purify them and sanctify them with it.",
      source: "Qur'an 9:103"
    },
    reflection: "How does giving Zakah change your relationship with wealth and those in need?",
    quizId: 3
  },

  {
    id: 4,
    title: "Sawm",
    arabic: "الصَّوْم",
    meaning: "Fasting in Ramadan",
    description: [
      "Sawm means fasting during Ramadan. From dawn to sunset, Muslims abstain from food, drink, and desires. Fasting is spiritual training that teaches self-control, patience, gratitude, and God-consciousness called taqwa.",
      "Allah prescribed fasting to make us righteous. It's not just avoiding food, but training ourselves to obey Allah completely. We fast with eyes, tongues, and hearts from everything forbidden and corrupt.",
      "Ramadan is blessed with Qur'an recitation, night prayers, charity, and repentance. Paradise gates open, Hell gates close, devils are chained. Laylatul Qadr is better than a thousand months of worship.",
      "The Prophet ﷺ said whoever fasts Ramadan with faith and hope has all previous sins forgiven. Fasting purifies body and soul, teaches empathy for the hungry, and reminds us our deepest need is Allah."
    ],
    evidence: {
      arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ",
      translation: "O you who believe, fasting is prescribed for you as it was prescribed for those before you, that you may become righteous.",
      source: "Qur'an 2:183"
    },
    reflection: "What spiritual benefits have you gained or hope to gain from fasting?",
    quizId: 4
  },

  {
    id: 5,
    title: "Hajj",
    arabic: "الحَجّ",
    meaning: "The Pilgrimage to Makkah",
    description: [
      "Hajj is Islam's fifth pillar, the sacred journey to Makkah. Muslims perform rituals established by Prophet Ibrahim and completed by Prophet Muhammad ﷺ. Every able Muslim must perform Hajj once in life.",
      "Pilgrims wear simple white Ihram clothing. There are no distinctions of wealth, status, race, or nationality. Kings and beggars stand equal before Allah. This experience teaches humility and breaks down pride and arrogance.",
      "Hajj rituals include circling the Kaaba seven times, standing at Mount Arafat in prayer, walking between Safa and Marwah, and stoning pillars representing Shaytan. Every step connects us to our prophets' legacy.",
      "The Prophet ﷺ taught that sincere Hajj returns pilgrims pure as newborns. This transformative journey offers a complete spiritual reset. Pilgrims return home with changed hearts, strengthened faith, and deeper love for Allah."
    ],
    evidence: {
      arabic: "وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا وَعَلَىٰ كُلِّ ضَامِرٍ يَأْتِينَ مِن كُلِّ فَجٍّ عَمِيقٍ",
      translation: "And proclaim to the people the Hajj; they will come to you on foot and on every lean camel from every distant pass.",
      source: "Qur'an 22:27"
    },
    reflection: "How does the unity shown in Hajj inspire you to live with humility and respect?",
    quizId: 5
  },

  // ============================================================
  // SECTION 2: The Six Pillars of Belief (Īmān) (Lessons 6-11)
  // ============================================================

  {
    id: 6,
    title: "Belief in Allah",
    arabic: "الإِيمَانُ بِاللّٰه",
    meaning: "The First Pillar of Faith",
    description: [
      "Belief in Allah is the foundation of Islamic faith. We believe Allah is absolutely One, with no partners or equals. He created everything and is completely self-sufficient while all creation needs Him.",
      "We believe in Allah's beautiful names and perfect attributes. He is Ar-Rahman, Al-Hakim, Al-Qawiyy, and Al-Aleem. He hears every word, sees every action, and knows what's hidden in hearts. Nothing resembles Him.",
      "Worshipping Allah alone means we don't bow to idols, money, fame, or creation. We direct all worship to Allah alone. This is Tawheed, the core message of every prophet throughout history.",
      "The Prophet ﷺ taught Allah has ninety-nine beautiful names. Learning them helps us understand His mercy, justice, and wisdom. Belief in Allah fills hearts with peace, gratitude, hope, strength, and contentment in all situations."
    ],
    evidence: {
      arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
      translation: "Say, He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.",
      source: "Qur'an 112:1-4"
    },
    reflection: "Which of Allah's names brings you the most comfort and why?",
    quizId: 6
  },

  {
    id: 7,
    title: "Belief in Angels",
    arabic: "الإِيمَانُ بِالْمَلَائِكَة",
    meaning: "The Noble Servants of Allah",
    description: [
      "Angels are noble beings created from light. Unlike humans, they never disobey Allah. They worship constantly without tiring, sleeping, or resting. Angels don't eat, drink, marry, or have children. Their numbers are beyond counting.",
      "Well-known angels include Jibril who brought revelation, Mikail who controls rain and provision, Israfil who will blow the trumpet, and the Angel of Death. Angels of mercy pray for believers while angels of punishment execute justice.",
      "Two angels sit on our shoulders recording every deed. Raqib writes good deeds, Atid writes bad deeds. They record everything we do, say, and intend. On Judgment Day, we'll see our complete record presented.",
      "Angels surround gatherings of remembrance and Qur'an study. The Prophet ﷺ said angels lower their wings for knowledge seekers. Believing in angels reminds us we're never alone and helps us be more conscious of Allah."
    ],
    evidence: {
      arabic: "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ",
      translation: "The Messenger has believed in what was revealed to him from his Lord, and so have the believers. All of them believe in Allah, His angels, His books, and His messengers.",
      source: "Qur'an 2:285"
    },
    reflection: "How does knowing angels record your deeds change your daily actions?",
    quizId: 7
  },

  {
    id: 8,
    title: "Belief in the Revealed Books",
    arabic: "الإِيمَانُ بِالْكُتُب",
    meaning: "The Divine Scriptures",
    description: [
      "Allah sent divine books throughout history to guide humanity. Major books include the Tawrah to Musa, Zabur to Dawud, Injil to Isa, and Qur'an to Muhammad ﷺ. All originally shared one message: worship One God.",
      "The Qur'an is Allah's final, complete revelation. Revealed over twenty-three years through angel Jibril, it contains guidance for all life aspects. Unlike previous scriptures, the Qur'an is universal and timeless for all people.",
      "The Qur'an has been perfectly preserved in Arabic for over fourteen hundred years without change. Allah promises to protect it until Judgment Day. Muslims worldwide recite the exact same Qur'an. Millions have memorized it entirely.",
      "The Prophet ﷺ said the best are those who learn and teach Qur'an. It's not just a book on shelves but a living guide to read, understand, memorize, and live by faithfully every single day."
    ],
    evidence: {
      arabic: "إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ",
      translation: "Indeed, it is We who sent down the Qur'an, and indeed, We will be its guardian.",
      source: "Qur'an 15:9"
    },
    reflection: "How often do you read and reflect on the Qur'an?",
    quizId: 8
  },

  {
    id: 9,
    title: "Belief in the Prophets",
    arabic: "الإِيمَانُ بِالرُّسُل",
    meaning: "The Messengers of Allah",
    description: [
      "Throughout history, Allah sent prophets to every nation teaching Tawheed. These chosen men were the best of humanity, known for honesty, trustworthiness, and strong character. They faced persecution but remained patient and steadfast.",
      "Known prophets include Adam, Nuh, Ibrahim, Musa, Isa, and Muhammad ﷺ. Thousands more existed whose names we don't know. All taught the same core message: worship Allah alone, live righteously, and prepare for Judgment.",
      "Prophet Muhammad ﷺ is the final messenger. No prophet will come after him. He's called the Seal of Prophets. His message is universal for all people and times. Loving and following him is a sign of true faith.",
      "Belief in prophets means respecting all equally without rejection or worship. Prophets were human but were the best examples of righteous living. Studying their lives teaches us patience, courage, honesty, and devotion to Allah."
    ],
    evidence: {
      arabic: "مَّا كَانَ مُحَمَّدٌ أَبَا أَحَدٍ مِّن رِّجَالِكُمْ وَلَٰكِن رَّسُولَ اللَّهِ وَخَاتَمَ النَّبِيِّينَ",
      translation: "Muhammad is not the father of any of your men, but he is the Messenger of Allah and the Seal of the Prophets.",
      source: "Qur'an 33:40"
    },
    reflection: "How can you follow the example of the Prophet ﷺ in your daily life?",
    quizId: 9
  },

  {
    id: 10,
    title: "Belief in the Day of Judgement",
    arabic: "الإِيمَانُ بِالْيَوْمِ الآخِر",
    meaning: "The Final Accountability",
    description: [
      "This world will end when Israfil blows the trumpet. Everything will die instantly. The sun will darken, stars fall, mountains crumble, and oceans boil. Everything will be destroyed. Then Allah will resurrect everyone for judgment.",
      "Each person stands alone before Allah. Our books of deeds will open. Nothing is hidden. Every word, action, and intention will be exposed. Our bodies will testify. The scales will weigh our deeds with perfect precision. Allah will judge with perfect justice.",
      "Those who believed and did good receive records in their right hand and enter Paradise eternally. Those who rejected Allah receive records in their left hand and are thrown into Hellfire eternally. No escaping fate.",
      "Belief in Judgment Day impacts how we live today. Every action has consequences. It motivates good deeds and warns against evil. It gives hope to the oppressed and warns wrongdoers to repent before it's too late."
    ],
    evidence: {
      arabic: "وَإِنَّ الدِّينَ لَوَاقِعٌ",
      translation: "And indeed, the Day of Recompense is to occur.",
      source: "Qur'an 51:6"
    },
    reflection: "How does remembering Judgment Day affect your daily choices?",
    quizId: 10
  },

  {
    id: 11,
    title: "Belief in Divine Decree (Qadr)",
    arabic: "الإِيمَانُ بِالْقَدَر",
    meaning: "Trusting Allah's Perfect Plan",
    description: [
      "Qadr means Allah knows everything that will happen. Before creating the universe, He wrote everything in the Preserved Tablet. Nothing occurs without Allah's knowledge and will. This doesn't remove our free will or responsibility for choices.",
      "Belief in Qadr brings peace and contentment. When good happens, we thank Allah. When difficulty comes, we remain patient, trusting His wisdom. The Prophet ﷺ said the believer's affair is amazing—grateful in ease, patient in hardship.",
      "Qadr doesn't mean sitting passively. We must work hard, plan wisely, and strive with effort. After doing our best, we trust Allah with results. Sometimes what seems bad is good. Only Allah sees the full picture clearly.",
      "Understanding Qadr protects us from arrogance and despair. When we succeed, we don't become proud because everything is from Allah. When we fail, we don't lose hope because Allah has a wise reason. We trust His perfect plan completely."
    ],
    evidence: {
      arabic: "إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ",
      translation: "Indeed, We have created everything in precise measure.",
      source: "Qur'an 54:49"
    },
    reflection: "How does trusting Allah's plan help you through difficult times?",
    quizId: 11
  },

  // ============================================================
  // SECTION 3: Living Islam (Lessons 12-17)
  // ============================================================

  {
    id: 12,
    title: "Sincerity (Ikhlas)",
    arabic: "الإِخْلَاص",
    meaning: "Doing Everything for Allah Alone",
    description: [
      "Ikhlas means performing actions purely for Allah's sake, not seeking praise or recognition from people. The Prophet ﷺ taught that actions are judged by intentions. Without sincerity, even great deeds are worthless in Allah's sight.",
      "Many perform good deeds publicly to impress others or gain fame. If that's the intention, reward is lost. True sincerity means doing what's right whether people see or not, seeking only Allah's pleasure, not human approval.",
      "Maintaining sincerity is difficult because Shaytan whispers, 'What will people think?' These thoughts destroy reward and turn worship into showing off. Constantly check intentions: Am I doing this for Allah or to impress others?",
      "With Ikhlas, even small actions become great in Allah's sight. A sincere smile can outweigh large public acts done for show. Sincerity purifies hearts from pride and brings blessing to everything we do. Seek only Allah's pleasure."
    ],
    evidence: {
      arabic: "وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ",
      translation: "And they were not commanded except to worship Allah, being sincere to Him in religion.",
      source: "Qur'an 98:5"
    },
    reflection: "Are your good deeds done for Allah or to impress others?",
    quizId: 12
  },

  {
    id: 13,
    title: "Good Manners (Akhlaq)",
    arabic: "الأَخْلَاق",
    meaning: "The Character of a Muslim",
    description: [
      "Akhlaq means good character and manners. Islam is not just about praying and fasting, but how we treat people with kindness, respect, and dignity. The Prophet ﷺ said believers with the most complete faith have the best character.",
      "Good manners include truthfulness, kindness, charity, forgiveness, and modesty. It means speaking gently, smiling warmly, helping others without expecting return, and controlling anger. The Prophet ﷺ exemplified perfect character. He's our model in everything.",
      "Bad manners destroy good deeds. A person may pray all night but if they're rude or dishonest, their worship means little. The Prophet ﷺ warned some people's fasting is only hunger because they don't change bad behavior.",
      "Improving Akhlaq is a lifelong journey. We must always strive to be more patient, forgiving, compassionate, and humble. When we make mistakes, we apologize and try again. Good character is the heaviest thing on the scale of deeds."
    ],
    evidence: {
      arabic: "إِنَّ مِنْ أَحَبِّكُمْ إِلَيَّ وَأَقْرَبِكُمْ مِنِّي مَجْلِسًا يَوْمَ الْقِيَامَةِ أَحَاسِنُكُمْ أَخْلَاقًا",
      translation: "The most beloved of you to me and the closest to me on the Day of Resurrection are those with the best character.",
      source: "Jami' at-Tirmidhi"
    },
    reflection: "What is one aspect of your character you can improve this week?",
    quizId: 13
  },

  {
    id: 14,
    title: "Intention (Niyyah)",
    arabic: "النِّيَّة",
    meaning: "The Purpose Behind Every Action",
    description: [
      "Niyyah is the intention in our hearts before any action. The Prophet ﷺ taught that actions are judged by intentions. Two people can do the same deed, but one is rewarded while the other receives nothing due to different intentions.",
      "Every worship requires sincere intention. With the right intention, everyday actions become worship. Eating to gain strength for worship becomes worship. Working to earn halal income becomes worship. Smiling to please Allah becomes worship.",
      "Intention is not said aloud. It's what we feel in our hearts. Simply saying 'I intend to pray' without meaning it doesn't count. The heart must align with the action. Pure intention purifies deeds and multiplies reward.",
      "Renew intention frequently throughout the day. Before studying, intend to gain knowledge for Allah. Before helping someone, intend to earn His pleasure. With right intention, every moment becomes worship and brings immense reward from Allah."
    ],
    evidence: {
      arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
      translation: "Actions are judged by intentions, and every person will be rewarded according to what they intended.",
      source: "Sahih Bukhari & Muslim"
    },
    reflection: "How can you turn your daily routine into acts of worship through intention?",
    quizId: 14
  },

  {
    id: 15,
    title: "Gratitude (Shukr)",
    arabic: "الشُّكْر",
    meaning: "Being Thankful to Allah",
    description: [
      "Shukr means thanking Allah for countless blessings. We have health, family, food, water, and faith. Yet we often take these for granted and forget to thank the One who gave them. We complain about what we lack instead of being grateful.",
      "Gratitude is shown through three ways: recognizing blessings in the heart, praising Allah with the tongue, and using blessings to obey Him. It's not enough to feel grateful—we must express it through words and actions.",
      "Allah promises that if we are grateful, He will increase our blessings. If we are ungrateful, His punishment is severe. Gratitude attracts more blessings. Complaining pushes them away. The more we thank Allah, the more He gives us.",
      "Every night before sleep, reflect on the day's blessings. Say Alhamdulillah for everything—good health, food, family, a bed to sleep in. Gratitude transforms our perspective. Even in hardship, we find blessings. Grateful hearts are happy hearts always."
    ],
    evidence: {
      arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ",
      translation: "If you are grateful, I will surely increase you in favor; but if you deny, indeed, My punishment is severe.",
      source: "Qur'an 14:7"
    },
    reflection: "What are three blessings you often take for granted?",
    quizId: 15
  },

  {
    id: 16,
    title: "Consistency (Istiqamah)",
    arabic: "الاِسْتِقَامَة",
    meaning: "Staying Steadfast on the Straight Path",
    description: [
      "Istiqamah means steadfastness—staying firm on the straight path in all circumstances. The Prophet ﷺ said the most beloved deeds to Allah are those done consistently, even if small. Small, regular deeds are better than large, sporadic ones.",
      "Many people worship enthusiastically in Ramadan but neglect worship afterward. This inconsistency displeases Allah. True faith is shown through consistent worship throughout the year in good times and bad, when easy and when difficult.",
      "Consistency builds discipline and strengthens our relationship with Allah over time. Praying the same voluntary prayers daily becomes strong habit. Reading one page of Qur'an daily finishes it in a year. Small actions compound into mountains of reward.",
      "To stay consistent, start small and build slowly. Don't take on more than you can handle long-term. If you can read one verse daily, do that consistently. Consistency is about commitment, not intensity. Make worship a lifestyle, not a sprint."
    ],
    evidence: {
      arabic: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
      translation: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.",
      source: "Sahih Bukhari & Muslim"
    },
    reflection: "What is one small act of worship you can commit to doing daily?",
    quizId: 16
  },

  {
    id: 17,
    title: "Love for Allah and His Messenger ﷺ",
    arabic: "المَحَبَّة",
    meaning: "The Foundation of True Faith",
    description: [
      "Love for Allah and His Messenger ﷺ is the foundation of true faith. It's not enough to just believe or say we're Muslim. We must love Allah deeply with our hearts more than anything else—parents, children, wealth, or even our own lives.",
      "How do we know if we truly love Allah? By how much we obey Him. Love is proven through obedience, not just feelings. If we love Allah, we follow His commands, avoid prohibitions, and seek to please Him over our own desires.",
      "Love for the Prophet ﷺ means following his example in everything: how he prayed, spoke, ate, treated others, and handled hardship. When we love him, we make his Sunnah a living part of our daily lives. True love means sincere imitation.",
      "This love requires action and commitment. It means putting Allah's pleasure above our desires and the Hereafter above this world. When love for Allah fills the heart, everything falls into place. Life becomes full of purpose, peace, and joy."
    ],
    evidence: {
      arabic: "قُلْ إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ",
      translation: "Say, if you truly love Allah, then follow me; Allah will love you.",
      source: "Qur'an 3:31"
    },
    reflection: "How can you show your love for Allah through your daily actions?",
    quizId: 17
  }
];

export default foundationsLessons;
