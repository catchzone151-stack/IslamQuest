// The Grave (Barzakh) Learning Path
// 12 lessons about death and the life of the grave
// Each lesson: 3 paragraphs (~23 words each), authentic Quranic/hadith evidence, key lesson
// Sources: Qur'an, Sahih Bukhari, Sahih Muslim, Abu Dawud, and Tirmidhi (authentic)

const graveLessons = [
  {
    id: 1,
    title: "Death",
    description: [
      "Every soul will taste death at its appointed time. No one can delay or advance death even by a single moment. Allah alone decides when each person's life will end.",
      "Death is not the end but a transition from this temporary world to the eternal Hereafter. The soul leaves the body and begins a new journey that lasts forever in the next life.",
      "Remembering death frequently keeps our hearts focused on what truly matters. When we remember death often, we prioritize good deeds over worldly pleasures and prepare properly for our inevitable meeting with Allah."
    ],
    evidence: {
      arabic: "كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ",
      translation: "Every soul will taste death.",
      source: "Qur'an 3:185"
    },
    keyLesson: "Death is certain for everyone, so we must prepare through faith and good deeds while we still have time.",
    quizId: 1
  },

  {
    id: 2,
    title: "Angels of Death",
    description: [
      "Allah assigned the Angel of Death and his helpers to take souls when their time comes. These angels know exactly when and where each person will die according to Allah's perfect decree and divine wisdom.",
      "For believers, the angels come with beautiful faces and pleasant fragrance, gently extracting the soul like water flowing from a pitcher. They bring glad tidings of Allah's mercy, Paradise, and eternal peace and happiness.",
      "For disbelievers, the angels come with harsh appearance and take the soul roughly like thorns tearing through wet wool. They bring warnings of Allah's anger, Hellfire, and eternal punishment for their rejection and sins."
    ],
    evidence: {
      arabic: "الَّذِينَ تَتَوَفَّاهُمُ الْمَلَائِكَةُ طَيِّبِينَ ۙ يَقُولُونَ سَلَامٌ عَلَيْكُمُ ادْخُلُوا الْجَنَّةَ بِمَا كُنتُمْ تَعْمَلُونَ",
      translation: "Those whom the angels take in death while they are good, saying, 'Peace be upon you. Enter Paradise for what you used to do.'",
      source: "Qur'an 16:32"
    },
    keyLesson: "The way angels take our soul depends on how we lived, making righteous living essential for a peaceful death.",
    quizId: 2
  },

  {
    id: 3,
    title: "Soul's Journey",
    description: [
      "After death, the believer's soul is taken up through the heavens. At each heaven's gate, the angels welcome it joyfully and open the gates. The soul ascends until it reaches Allah's presence.",
      "The believer's soul is wrapped in fragrant shrouds from Paradise and carried upward by angels. Every angel in the heavens asks whose blessed soul this is, and the angels reply with the person's best name and titles.",
      "The disbeliever's soul is rejected at the first heaven's gate and thrown back down to earth violently. It is returned to the body in the grave to face questioning and punishment for its disbelief and evil deeds."
    ],
    evidence: {
      arabic: "إِنَّ الَّذِينَ كَذَّبُوا بِآيَاتِنَا وَاسْتَكْبَرُوا عَنْهَا لَا تُفَتَّحُ لَهُمْ أَبْوَابُ السَّمَاءِ",
      translation: "Indeed, those who deny Our verses and are arrogant toward them - the gates of Heaven will not be opened for them.",
      source: "Qur'an 7:40"
    },
    keyLesson: "Our deeds determine whether our soul ascends to honor in Heaven or descends to humiliation in the grave.",
    quizId: 3
  },

  {
    id: 4,
    title: "Questioning (Munkar & Nakīr)",
    description: [
      "Two angels named Munkar and Nakīr come to question every person in the grave shortly after burial. They ask three critical questions: Who is your Lord? What is your religion? Who is your Prophet?",
      "The believer who lived with sincere faith answers confidently and correctly: My Lord is Allah, my religion is Islam, and my Prophet is Muhammad. The angels make the grave spacious, comfortable, and filled with light.",
      "The hypocrite and disbeliever struggle to answer, saying they don't know or just followed others blindly. The angels make their grave tight and dark, squeezing them painfully. This is the beginning of their grave's punishment."
    ],
    evidence: {
      arabic: "يُثَبِّتُ اللَّهُ الَّذِينَ آمَنُوا بِالْقَوْلِ الثَّابِتِ فِي الْحَيَاةِ الدُّنْيَا وَفِي الْآخِرَةِ",
      translation: "Allah keeps firm those who believe, with the firm word, in this worldly life and in the Hereafter.",
      source: "Qur'an 14:27"
    },
    keyLesson: "We must live our faith sincerely every day so we can answer the grave's questions with complete confidence.",
    quizId: 4
  },

  {
    id: 5,
    title: "Life of Barzakh",
    description: [
      "Barzakh is the barrier world between death and the Day of Judgment where souls wait for resurrection. It is neither this life nor the complete Hereafter but a transitional realm where souls experience reward or punishment.",
      "The soul remains aware and conscious in Barzakh, experiencing either comfort or torment based on its earthly deeds. Time passes differently there, and the soul awaits the Day when everyone will be resurrected for final judgment.",
      "No one can return from Barzakh to this world to fix their mistakes or do more good deeds. Once death comes, our record is sealed permanently. This makes using our time wisely before death absolutely essential."
    ],
    evidence: {
      arabic: "وَمِن وَرَائِهِم بَرْزَخٌ إِلَىٰ يَوْمِ يُبْعَثُونَ",
      translation: "And before them is a barrier until the Day they are resurrected.",
      source: "Qur'an 23:100"
    },
    keyLesson: "Barzakh is the waiting period between death and resurrection where our eternal fate becomes clearer each moment.",
    quizId: 5
  },

  {
    id: 6,
    title: "Punishment of the Grave",
    description: [
      "The grave punishes those who died in disbelief or with major unrepented sins. The punishment includes tightness squeezing the body, scorching heat or freezing cold, beatings from iron rods, and terrifying visions of Hellfire.",
      "Some people are punished for specific sins like backbiting, lying, not cleaning properly after using the bathroom, or abandoning prayer. The Prophet Muhammad ﷺ saw some of these punishments during his night journey and warned us about them.",
      "This punishment continues until the Day of Judgment for disbelievers. For sinful believers, it may last until their sins are cleansed or until people's prayers and charity reach them. Repenting before death saves us from this torment."
    ],
    evidence: {
      arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ",
      translation: "O Allah, I seek refuge in You from the punishment of the grave.",
      source: "Sahih Bukhari 1377"
    },
    keyLesson: "The grave's punishment is real and severe, so we must repent from sins and live righteously before death comes.",
    quizId: 6
  },

  {
    id: 7,
    title: "Bliss of the Grave",
    description: [
      "The righteous believer's grave becomes a garden from Paradise's gardens, spacious and comfortable. A window opens to Paradise showing them their future home, filling the grave with beautiful fragrance and refreshing breezes.",
      "Angels visit the believer with glad tidings and companionship, bringing peace and comfort. The grave's earth becomes soft like silk, and a pleasant light shines within. Time passes quickly in this blissful state of anticipation.",
      "The believer's soul visits Paradise, meets other righteous souls, and receives honored treatment. They rest peacefully, eagerly awaiting the Day of Judgment when they will enter Paradise forever. This is the reward for sincere faith."
    ],
    evidence: {
      arabic: "إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا تَتَنَزَّلُ عَلَيْهِمُ الْمَلَائِكَةُ أَلَّا تَخَافُوا وَلَا تَحْزَنُوا وَأَبْشِرُوا بِالْجَنَّةِ الَّتِي كُنتُمْ تُوعَدُونَ",
      translation: "Indeed, those who have said, 'Our Lord is Allah' and then remained steadfast - the angels will descend upon them, saying, 'Do not fear and do not grieve but receive good tidings of Paradise.'",
      source: "Qur'an 41:30"
    },
    keyLesson: "The grave becomes Paradise's garden for those who lived with true faith and righteousness in this world.",
    quizId: 7
  },

  {
    id: 8,
    title: "Souls Meeting",
    description: [
      "The souls of believers meet each other in Barzakh and recognize one another from their earthly lives. They gather in groups according to their levels of righteousness, discussing their past lives and sharing their experiences of death.",
      "When a righteous person dies, the souls of deceased believers ask about their loved ones still living on earth. They inquire about family and friends, hoping to hear they remained faithful and righteous until their own deaths arrived.",
      "The souls feel joy when learning a loved one died in faith and sorrow when someone died astray. They pray for their living loved ones to die as believers. These meetings continue until everyone is resurrected on Judgment Day."
    ],
    evidence: {
      arabic: "الْأَرْوَاحُ جُنُودٌ مُجَنَّدَةٌ، فَمَا تَعَارَفَ مِنْهَاائْتَلَفَ، وَمَا تَنَاكَرَ مِنْهَا اخْتَلَفَ",
      translation: "Souls are like armies gathered together; those who knew each other in this world will be close in the next, and those who did not know each other will be apart.",
      source: "Sahih Bukhari 3336"
    },
    keyLesson: "Righteous souls maintain their bonds of love in Barzakh, reuniting with beloved friends and family who also believed.",
    quizId: 8
  },

  {
    id: 9,
    title: "Visiting Graves (Adab)",
    description: [
      "Visiting graves reminds us of death and the Hereafter, softening our hearts and reducing attachment to worldly things. The Prophet Muhammad ﷺ encouraged visiting graves to remember our inevitable end and prepare for it.",
      "When visiting, we greet the deceased with peace: 'Peace be upon you, O inhabitants of the graves, from among the believers and Muslims. We will surely join you. We ask Allah for well-being for us and you.'",
      "We should make sincere prayers for the deceased, asking Allah to forgive them and grant them mercy. Visiting should increase our own good deeds and remind us to prepare for death. We must not wail loudly or act disrespectfully."
    ],
    evidence: {
      arabic: "زُورُوا الْقُبُورَ فَإِنَّهَا تُذَكِّرُكُمُ الْآخِرَةَ",
      translation: "Visit the graves, for they remind you of the Hereafter.",
      source: "Sahih Muslim 976"
    },
    keyLesson: "Visiting graves with proper manners reminds us of death and motivates us to increase our good deeds.",
    quizId: 9
  },

  {
    id: 10,
    title: "Protection from Punishment",
    description: [
      "The Prophet Muhammad ﷺ taught us specific actions that protect from the grave's punishment. These include sincere faith in Allah, dying as a martyr, dying on Friday, dying while guarding Islam's borders, and reciting Surah Al-Mulk regularly.",
      "Seeking refuge from the grave's punishment in every prayer is essential. We should say after every prayer: 'O Allah, I seek refuge in You from the punishment of the grave and the trial of the Dajjal.'",
      "Living righteously protects us from punishment: praying five daily prayers properly, being honest, avoiding backbiting and gossip, cleaning properly after using the bathroom, honoring parents, and maintaining good character throughout life. Good deeds are our best shield."
    ],
    evidence: {
      arabic: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ",
      translation: "Blessed is He in whose hand is dominion (Surah Al-Mulk protects from grave punishment).",
      source: "Tirmidhi 2891"
    },
    keyLesson: "We protect ourselves from grave punishment through sincere faith, regular worship, and consistently good character and deeds.",
    quizId: 10
  },

  {
    id: 11,
    title: "Martyrs in the Grave",
    description: [
      "Those who die as martyrs fighting in Allah's cause or defending Islam receive special honors. They do not experience the grave's trial or questioning. Their souls go directly to Paradise without waiting in Barzakh.",
      "The martyrs' souls live inside green birds that freely roam Paradise, eating its fruits and drinking from its rivers. They experience Paradise's joys immediately while their bodies rest in their graves without decay or punishment.",
      "Martyrs do not feel the pain of death except like a small pinch. Allah forgives all their sins instantly when the first drop of blood is shed. They wish they could return to earth to be martyred again because of the tremendous honor."
    ],
    evidence: {
      arabic: "وَلَا تَحْسَبَنَّ الَّذِينَ قُتِلُوا فِي سَبِيلِ اللَّهِ أَمْوَاتًا ۚ بَلْ أَحْيَاءٌ عِندَ رَبِّهِمْ يُرْزَقُونَ",
      translation: "And do not think of those who have been killed in the cause of Allah as dead. Rather, they are alive with their Lord, receiving provision.",
      source: "Qur'an 3:169"
    },
    keyLesson: "Martyrs receive special mercy and immediate Paradise, bypassing the grave's normal trials and experiencing instant divine reward.",
    quizId: 11
  },

  {
    id: 12,
    title: "Hope & Reflection",
    description: [
      "Although the grave's punishment is real and frightening, Allah's mercy is greater than His punishment. Sincere repentance before death erases sins completely. Even major sinners who died believing will eventually enter Paradise after purification.",
      "Reflecting on death and the grave should motivate us toward good deeds, not paralyze us with fear. We balance hope in Allah's mercy with fear of His punishment. This balance keeps us striving to improve constantly.",
      "Every day is an opportunity to prepare for the grave through prayer, charity, good character, and seeking forgiveness. We should live as if we might die tomorrow but prepare as if we will live long. This mindset leads to the best life."
    ],
    evidence: {
      arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
      translation: "Say, 'O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.'",
      source: "Qur'an 39:53"
    },
    keyLesson: "We balance fear of the grave with hope in Allah's infinite mercy, using both to motivate righteous living.",
    quizId: 12
  }
];

export default graveLessons;
