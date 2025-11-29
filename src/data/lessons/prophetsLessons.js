// Stories of the Prophets Learning Path
// 24 prophets in chronological order from Qasas al-Anbiya
// 47 total lessons: 23 prophets × 2 parts + Prophet Idris (1 part)
// Each lesson: 4 paragraphs of ~30 words each
// Sources: Qur'an and Sahih Hadith only

const prophetsLessons = [
  // ============================================================
  // SECTION 1: Early Prophets
  // ============================================================

  // Prophet Adam (1 of 2)
  {
    id: 1,
    title: "Prophet Adam عليه السلام - Part 1",
    meaning: "The First Human",
    description: [
      "Allah ﷾ created Adam from clay and breathed life into him. Angels were commanded to prostrate to Adam. All obeyed except Iblis, who refused out of pride and arrogance.",
      "Allah ﷾ taught Adam the names of all things, knowledge the angels didn't possess. This showed Adam's unique position as Allah ﷾'s khalifah on earth, entrusted with responsibility and free will.",
      "Adam lived in Paradise with his wife Hawwa. They enjoyed blessings but were warned not to approach one tree. Iblis whispered lies, deceiving them into eating from the forbidden tree.",
      "When they disobeyed, they felt shame and sought Allah ﷾'s forgiveness. Allah ﷾ taught them words of repentance. He accepted their sincere tawbah and promised to send guidance to their descendants."
    ],
    evidence: {
      arabic: "وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً",
      translation: "And when your Lord said to the angels, 'Indeed, I will make upon the earth a successive authority.'",
      source: "Qur'an 2:30"
    },
    reflection: "What does Adam's story teach us about repentance and Allah ﷾'s mercy?",
    quizId: 1
  },

  // Prophet Adam (2 of 2)
  {
    id: 2,
    title: "Prophet Adam عليه السلام - Part 2",
    meaning: "The First Human",
    description: [
      "Adam and Hawwa descended to earth to begin humanity's journey. They were told that guidance would come from Allah ﷾. Those who follow it would have no fear or grief.",
      "Adam became the first prophet, teaching his children to worship Allah ﷾ alone. His sons Habil and Qabil both offered sacrifices. Allah ﷾ accepted Habil's sincere offering but not Qabil's insincere one.",
      "Out of jealousy, Qabil killed his brother Habil, committing the first murder on earth. He didn't know what to do with the body until a crow showed him how to bury it.",
      "Adam grieved deeply for Habil and warned his descendants against envy and violence. His life teaches us that mistakes don't define us—sincere repentance and obedience to Allah ﷾'s guidance do."
    ],
    evidence: {
      arabic: "فَتَلَقَّىٰ آدَمُ مِن رَّبِّهِ كَلِمَاتٍ فَتَابَ عَلَيْهِ",
      translation: "Then Adam received from his Lord words, and He accepted his repentance.",
      source: "Qur'an 2:37"
    },
    reflection: "How can we apply the lesson of Habil's sincerity in our own worship?",
    quizId: 2
  },

  // Prophet Idris (1 of 1)
  {
    id: 3,
    title: "Prophet Idris عليه السلام",
    meaning: "The Elevated Prophet",
    description: [
      "Idris was a righteous prophet who came after Adam. He was known for his patience, truthfulness, and devotion. Allah ﷾ raised him to a high station because of his purity and worship.",
      "Idris was the first to write with a pen and teach humans the art of writing. He studied the movements of stars and understood the heavens, using knowledge to worship Allah ﷾ better.",
      "He called his people to worship Allah ﷾ alone and abandon false gods. He taught them justice, honesty, and righteous living. Many followed his guidance and left their sinful ways behind.",
      "Allah ﷾ honored Idris by elevating him to a high place in the heavens. He is remembered for his wisdom, knowledge, and unwavering commitment to truth and righteousness throughout his blessed life."
    ],
    evidence: {
      arabic: "وَرَفَعْنَاهُ مَكَانًا عَلِيًّا",
      translation: "And We raised him to a high station.",
      source: "Qur'an 19:57"
    },
    reflection: "How can we use knowledge and learning to draw closer to Allah ﷾ like Idris did?",
    quizId: 3
  },

  // Prophet Nuh (1 of 2)
  {
    id: 4,
    title: "Prophet Nuh عليه السلام - Part 1",
    meaning: "Noah",
    description: [
      "Nuh was sent to a people who worshipped idols named Wadd, Suwa, Yaghuth, Ya'uq, and Nasr. They had abandoned the worship of Allah ﷾, following the ways of their misguided forefathers.",
      "For 950 years, Nuh called them to Allah ﷾ day and night, publicly and privately. He warned them of punishment and promised them Paradise. But they mocked him and refused to listen.",
      "The leaders rejected Nuh because only the poor and weak followed him. They said a prophet should bring wealth and power, not warnings. Their pride and arrogance blinded them to truth.",
      "Nuh never gave up despite constant rejection. He patiently repeated his message, hoping even one more person would believe. His perseverance teaches us to continue doing good even when results seem hopeless."
    ],
    evidence: {
      arabic: "وَلَقَدْ أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِ فَلَبِثَ فِيهِمْ أَلْفَ سَنَةٍ إِلَّا خَمْسِينَ عَامًا",
      translation: "And We certainly sent Noah to his people, and he remained among them a thousand years minus fifty years.",
      source: "Qur'an 29:14"
    },
    reflection: "What can we learn from Nuh's 950 years of patient calling to Allah ﷾?",
    quizId: 4
  },

  // Prophet Nuh (2 of 2)
  {
    id: 5,
    title: "Prophet Nuh عليه السلام - Part 2",
    meaning: "Noah",
    description: [
      "Allah ﷾ commanded Nuh to build a massive ark because a great flood was coming. People mocked him for building a ship on dry land. Nuh obeyed Allah ﷾'s command without questioning or delay.",
      "When the flood came, water burst from the earth and poured from the sky. Nuh boarded the ark with believers and pairs of every animal. His own son refused and drowned with the disbelievers.",
      "The flood destroyed everyone who rejected Allah ﷾'s message. The ark sailed on towering waves until Allah ﷾ commanded the earth to swallow the water. The ark rested on Mount Judi.",
      "Only a handful of believers survived with Nuh. This shows that truth isn't measured by numbers. Nuh's patience and obedience saved him while the arrogant majority faced destruction and regret."
    ],
    evidence: {
      arabic: "فَأَنجَيْنَاهُ وَأَصْحَابَ السَّفِينَةِ وَجَعَلْنَاهَا آيَةً لِّلْعَالَمِينَ",
      translation: "But We saved him and the companions of the ship, and We made it a sign for the worlds.",
      source: "Qur'an 29:15"
    },
    reflection: "How does Nuh's obedience in building the ark inspire us to trust Allah ﷾'s commands?",
    quizId: 5
  },

  // Prophet Hud (1 of 2)
  {
    id: 6,
    title: "Prophet Hud عليه السلام - Part 1",
    meaning: "The Prophet of 'Ad",
    description: [
      "Hud was sent to the people of 'Ad who lived in the region of Ahqaf. They were powerful, wealthy, and built massive structures and lofty towers showing their strength and pride.",
      "Despite their blessings, they worshipped idols and rejected Allah ﷾. Hud called them to worship Allah ﷾ alone and warned them against arrogance. He reminded them everything they had came from Allah ﷾.",
      "They mocked Hud and said their gods would punish him. They relied on their physical strength and wealth, thinking nothing could destroy them. Their pride made them blind to truth and warnings.",
      "Hud warned them that their power and possessions wouldn't save them from Allah ﷾'s punishment. He called them to repent sincerely and return to Allah ﷾ before it was too late. Most refused stubbornly."
    ],
    evidence: {
      arabic: "وَإِلَىٰ عَادٍ أَخَاهُمْ هُودًا ۗ قَالَ يَا قَوْمِ اعْبُدُوا اللَّهَ مَا لَكُم مِّنْ إِلَٰهٍ غَيْرُهُ",
      translation: "And to 'Ad We sent their brother Hud. He said, 'O my people, worship Allah ﷾; you have no deity other than Him.'",
      source: "Qur'an 7:65"
    },
    reflection: "How does the story of 'Ad warn us against arrogance in times of success?",
    quizId: 6
  },

  // Prophet Hud (2 of 2)
  {
    id: 7,
    title: "Prophet Hud عليه السلام - Part 2",
    meaning: "The Prophet of 'Ad",
    description: [
      "The people of 'Ad demanded Hud bring the punishment if he was truthful. Allah ﷾ sent them three years of drought first, testing them and giving them time to repent and change.",
      "Instead of turning to Allah ﷾, they grew more stubborn. Finally, Allah ﷾ sent a fierce wind that howled for seven nights and eight days without stopping, destroying everything in its path completely.",
      "The wind tore apart their mighty buildings and threw their strong bodies like hollow palm trunks. Their strength and towers couldn't protect them. Only Hud and the few believers were saved miraculously.",
      "Their entire civilization vanished, leaving only ruins and lessons. Their story warns us that wealth, power, and intelligence mean nothing without gratitude, humility, and obedience to Allah ﷾'s guidance."
    ],
    evidence: {
      arabic: "فَأَنجَيْنَاهُ وَالَّذِينَ مَعَهُ بِرَحْمَةٍ مِّنَّا",
      translation: "But We saved him and those with him by mercy from Us.",
      source: "Qur'an 7:72"
    },
    reflection: "What does the destruction of 'Ad teach us about true strength and security?",
    quizId: 7
  },

  // Prophet Salih (1 of 2)
  {
    id: 8,
    title: "Prophet Salih عليه السلام - Part 1",
    meaning: "The Prophet of Thamud",
    description: [
      "Salih was sent to the people of Thamud who lived in a place called Al-Hijr. They carved beautiful homes into mountains, feeling secure and boasting about their skills and intelligence.",
      "Like 'Ad before them, they worshipped idols and rejected Allah ﷾. Salih called them to worship Allah ﷾ alone and warned them about the fate of 'Ad. They demanded a miraculous sign to prove him.",
      "Allah ﷾ sent a magnificent she-camel as a sign—she would drink from their well one day, and they would drink the next. This was a clear test of their obedience and faith.",
      "The she-camel was a blessing and a test. If they harmed her, severe punishment would follow. Salih warned them repeatedly not to touch her with evil intentions or disrespect."
    ],
    evidence: {
      arabic: "وَإِلَىٰ ثَمُودَ أَخَاهُمْ صَالِحًا ۗ قَالَ يَا قَوْمِ اعْبُدُوا اللَّهَ مَا لَكُم مِّنْ إِلَٰهٍ غَيْرُهُ",
      translation: "And to Thamud We sent their brother Salih. He said, 'O my people, worship Allah ﷾; you have no deity other than Him.'",
      source: "Qur'an 7:73"
    },
    reflection: "Why do you think Allah ﷾ tested Thamud with something as simple as a camel?",
    quizId: 8
  },

  // Prophet Salih (2 of 2)
  {
    id: 9,
    title: "Prophet Salih عليه السلام - Part 2",
    meaning: "The Prophet of Thamud",
    description: [
      "The she-camel lived peacefully among them for some time. But the arrogant leaders grew jealous of her and plotted to kill her despite Salih's clear warnings about the consequences.",
      "One day, a group of wicked men slaughtered the she-camel brutally. They thought they were powerful enough to escape Allah ﷾'s punishment. Salih gave them three days to repent sincerely before punishment arrived.",
      "They mocked Salih and challenged him to bring the punishment. On the third day, a terrible earthquake shook the earth and a loud blast struck them dead instantly in their homes.",
      "Their carved houses couldn't save them. They were destroyed while sitting in their comfort and pride. Only Salih and the believers were saved. Their ruins remain as a warning to travelers passing by."
    ],
    evidence: {
      arabic: "فَعَقَرُوا النَّاقَةَ وَعَتَوْا عَنْ أَمْرِ رَبِّهِمْ",
      translation: "But they hamstrung the she-camel and were insolent toward the command of their Lord.",
      source: "Qur'an 7:77"
    },
    reflection: "How does the story of Thamud show us the consequences of defying Allah ﷾'s signs?",
    quizId: 9
  },

  // Prophet Ibrahim (1 of 2)
  {
    id: 10,
    title: "Prophet Ibrahim عليه السلام - Part 1",
    meaning: "Abraham",
    description: [
      "Ibrahim grew up in a land where everyone worshipped idols. His own father Azar was an idol-maker. Even as a youth, Ibrahim questioned why people worshipped powerless statues made by human hands.",
      "Ibrahim reflected on the sun, moon, and stars, rejecting each as they set and changed. He declared his worship only to Allah ﷾, the Creator of the heavens and earth who never changes.",
      "To prove idols were powerless, Ibrahim broke them all except the largest one. When questioned, he said perhaps the big idol did it. This exposed the foolishness of worshipping helpless objects.",
      "The people were furious and threw Ibrahim into a massive fire. Allah ﷾ commanded the fire to be cool and safe for Ibrahim. He emerged unharmed, showing Allah ﷾'s complete power and protection."
    ],
    evidence: {
      arabic: "قُلْنَا يَا نَارُ كُونِي بَرْدًا وَسَلَامًا عَلَىٰ إِبْرَاهِيمَ",
      translation: "We said, 'O fire, be coolness and safety upon Ibrahim.'",
      source: "Qur'an 21:69"
    },
    reflection: "What does Ibrahim's courage in breaking the idols teach us about standing for truth?",
    quizId: 10
  },

  // Prophet Ibrahim (2 of 2)
  {
    id: 11,
    title: "Prophet Ibrahim عليه السلام - Part 2",
    meaning: "Abraham",
    description: [
      "Allah ﷾ commanded Ibrahim to leave his homeland and travel to new lands. He was tested repeatedly: leaving his family, settling his wife Hajar and baby Ismail in an empty desert valley.",
      "Ibrahim left Hajar and Ismail in the barren valley of Makkah, trusting Allah ﷾ completely. When Ismail cried from thirst, Hajar ran between Safa and Marwah seeking water. Allah ﷾ sent the Zamzam spring miraculously.",
      "When Ismail grew older, Ibrahim dreamed of sacrificing his beloved son. Both understood this was Allah ﷾'s command. Ismail submitted willingly, showing perfect obedience and trust in Allah ﷾'s wisdom.",
      "As Ibrahim prepared to sacrifice Ismail, Allah ﷾ sent a ram to sacrifice instead. This test showed their complete submission. Ibrahim's legacy of Tawhid and surrender to Allah ﷾ remains for all generations."
    ],
    evidence: {
      arabic: "وَفَدَيْنَاهُ بِذِبْحٍ عَظِيمٍ",
      translation: "And We ransomed him with a great sacrifice.",
      source: "Qur'an 37:107"
    },
    reflection: "How can we develop the level of trust in Allah ﷾ that Ibrahim and Ismail showed?",
    quizId: 11
  },

  // Prophet Lut (1 of 2)
  {
    id: 12,
    title: "Prophet Lut عليه السلام - Part 1",
    meaning: "Lot",
    description: [
      "Lut was sent to a people who committed shameful acts that no other nation had done before. They openly practiced immoral behavior and cut off travelers, engaging in wickedness publicly without shame.",
      "Lut called them to abandon their evil ways and worship Allah ﷾. He warned them that their actions would bring Allah ﷾'s punishment. They ignored him and instead mocked his warnings and teachings.",
      "The people became so bold in their sins that they threatened to expel Lut from the city for speaking against them. They preferred their shameful desires over guidance, truth, and righteousness.",
      "Lut felt helpless against their stubbornness and corruption. He prayed to Allah ﷾ for help and protection. He continued calling them to righteousness despite their threats, mockery, and increasing hostility toward him."
    ],
    evidence: {
      arabic: "أَتَأْتُونَ الْفَاحِشَةَ مَا سَبَقَكُم بِهَا مِنْ أَحَدٍ مِّنَ الْعَالَمِينَ",
      translation: "Do you commit such immorality as no one has preceded you with from among the worlds?",
      source: "Qur'an 7:80"
    },
    reflection: "What does Lut's persistence teach us about speaking truth in difficult environments?",
    quizId: 12
  },

  // Prophet Lut (2 of 2)
  {
    id: 13,
    title: "Prophet Lut عليه السلام - Part 2",
    meaning: "Lot",
    description: [
      "Angels came to Lut in the form of handsome young men. When the townspeople heard of the guests, they rushed to Lut's house with evil intentions. Lut felt distressed and powerless.",
      "Lut tried desperately to protect his guests, even offering his daughters in marriage to the men to show them the lawful way. But they were determined to commit their shameful acts regardless.",
      "The angels revealed their true nature and told Lut to leave the city with his family at night. They warned him not to look back. His wife, who sympathized with the people, would be left behind.",
      "At dawn, Allah ﷾ destroyed the entire city. The ground was flipped upside down, and stones of baked clay rained upon them. Only Lut and his believing daughters were saved from total destruction."
    ],
    evidence: {
      arabic: "فَلَمَّا جَاءَ أَمْرُنَا جَعَلْنَا عَالِيَهَا سَافِلَهَا وَأَمْطَرْنَا عَلَيْهَا حِجَارَةً مِّن سِجِّيلٍ",
      translation: "So when Our command came, We made the highest part of it the lowest and rained upon it stones of layered hard clay.",
      source: "Qur'an 11:82"
    },
    reflection: "How does the story of Lut's people warn us about the dangers of shameless sin?",
    quizId: 13
  },

  // Prophet Ismail (1 of 2)
  {
    id: 14,
    title: "Prophet Ismail عليه السلام - Part 1",
    meaning: "Ishmael",
    description: [
      "Ismail was the first son of Prophet Ibrahim. As a baby, he was left with his mother Hajar in the empty desert of Makkah. Allah ﷾'s wisdom placed them there to establish His sacred house.",
      "When baby Ismail cried from thirst, Hajar ran between Safa and Marwah seven times searching for water or help. Allah ﷾ sent the angel Jibra'il who struck the ground, and Zamzam water gushed forth miraculously.",
      "Ismail grew up in Makkah as the Jurhum tribe settled near the blessed water. He learned their language and married from among them. He was patient, obedient, and loved by all who knew him.",
      "As a young man, Ismail was tested with the ultimate sacrifice when his father Ibrahim saw a dream to sacrifice him. Ismail's response showed perfect submission: 'Father, do what you are commanded.'"
    ],
    evidence: {
      arabic: "فَلَمَّا بَلَغَ مَعَهُ السَّعْيَ قَالَ يَا بُنَيَّ إِنِّي أَرَىٰ فِي الْمَنَامِ أَنِّي أَذْبَحُكَ فَانظُرْ مَاذَا تَرَىٰ ۚ قَالَ يَا أَبَتِ افْعَلْ مَا تُؤْمَرُ",
      translation: "When he reached the age to work with him, he said, 'O my son, I have seen in a dream that I sacrifice you. See what you think.' He said, 'O my father, do as you are commanded.'",
      source: "Qur'an 37:102"
    },
    reflection: "What can we learn from Ismail's response when facing such a difficult test?",
    quizId: 14
  },

  // Prophet Ismail (2 of 2)
  {
    id: 15,
    title: "Prophet Ismail عليه السلام - Part 2",
    meaning: "Ishmael",
    description: [
      "After Allah ﷾ ransomed Ismail with a ram, father and son worked together to rebuild the Ka'bah, the house of worship established by Adam and renewed by Ibrahim for all humanity.",
      "As they raised the walls, Ibrahim and Ismail made beautiful du'a asking Allah ﷾ to accept their work, make them submissive to Him, and raise from their descendants a nation of believers and a prophet.",
      "Ismail became a prophet who called people to worship Allah ﷾ alone. He is honored in the Qur'an as truthful to his promise, encouraging his family to pray and give charity throughout his life.",
      "His descendants included the Prophet Muhammad ﷺ, fulfilling Ibrahim's prayer. Ismail's patience during trials, submission to Allah ﷾'s will, and dedication to worship make him a role model for all believers."
    ],
    evidence: {
      arabic: "وَاذْكُرْ فِي الْكِتَابِ إِسْمَاعِيلَ ۚ إِنَّهُ كَانَ صَادِقَ الْوَعْدِ وَكَانَ رَسُولًا نَّبِيًّا",
      translation: "And mention in the Book, Ismail. Indeed, he was true to his promise, and he was a messenger and a prophet.",
      source: "Qur'an 19:54"
    },
    reflection: "How did Ismail's upbringing in hardship prepare him for his blessed role?",
    quizId: 15
  },

  // Prophet Ishaq (1 of 2)
  {
    id: 16,
    title: "Prophet Ishaq عليه السلام - Part 1",
    meaning: "Isaac",
    description: [
      "Ishaq was given to Ibrahim and Sarah in their old age as a miracle after Sarah had been barren for many years. Angels gave her glad tidings of a son who would be righteous.",
      "Sarah laughed in amazement when told she would have a child in her old age while her husband was elderly. The angels assured her that nothing is impossible for Allah ﷾ who gives life.",
      "Ishaq was born as a gift from Allah ﷾ and grew up under Ibrahim's guidance in the way of Tawhid. He learned from his father's patience, trust in Allah ﷾, and unwavering commitment to calling people.",
      "Ishaq became a prophet continuing Ibrahim's mission in the Blessed Land. He called people to worship Allah ﷾ alone and guided them with wisdom, patience, and the knowledge his father had taught him."
    ],
    evidence: {
      arabic: "فَبَشَّرْنَاهَا بِإِسْحَاقَ وَمِن وَرَاءِ إِسْحَاقَ يَعْقُوبَ",
      translation: "So We gave her good tidings of Ishaq and after Ishaq, Ya'qub.",
      source: "Qur'an 11:71"
    },
    reflection: "How does Ishaq's birth remind us that Allah ﷾'s timing is always perfect?",
    quizId: 16
  },

  // Prophet Ishaq (2 of 2)
  {
    id: 17,
    title: "Prophet Ishaq عليه السلام - Part 2",
    meaning: "Isaac",
    description: [
      "Ishaq continued the legacy of prophethood, maintaining the pure message of Tawhid in his land. He taught his people to worship Allah ﷾ alone without partners or intermediaries between them and their Creator.",
      "Allah ﷾ blessed Ishaq with a son named Ya'qub who would also become a prophet. The glad tidings given to Sarah included not just a son but also a grandson, continuing the blessed lineage of prophets.",
      "Ishaq faced trials with patience just like his father Ibrahim. He remained steadfast in calling people to the straight path despite opposition, following the example of submission and trust he had witnessed.",
      "His life shows how prophethood was passed through Ibrahim's family, each generation teaching the next. Ishaq's story reminds us that Allah ﷾ chooses whom He wills and blesses families who remain faithful to His message."
    ],
    evidence: {
      arabic: "وَوَهَبْنَا لَهُ إِسْحَاقَ وَيَعْقُوبَ نَافِلَةً ۖ وَكُلًّا جَعَلْنَا صَالِحِينَ",
      translation: "And We gave to him Ishaq and Ya'qub in addition, and all of them We made righteous.",
      source: "Qur'an 21:72"
    },
    reflection: "What can we learn from how the message was preserved across Ibrahim's descendants?",
    quizId: 17
  },

  // ============================================================
  // SECTION 2: Prophets of Bani Isra'il
  // ============================================================

  // Prophet Ya'qub (1 of 2)
  {
    id: 18,
    title: "Prophet Ya'qub عليه السلام - Part 1",
    meaning: "Jacob/Israel",
    description: [
      "Ya'qub was the son of Ishaq and grandson of Ibrahim. He was also called Isra'il and became a prophet continuing the legacy of Tawhid. His twelve sons became the fathers of the twelve tribes.",
      "Ya'qub had a special love for his son Yusuf and his younger brother. His other sons grew jealous of the attention Yusuf received. This jealousy would lead to trials that tested Ya'qub's faith deeply.",
      "When Yusuf's brothers took him away, they returned with a blood-stained shirt claiming a wolf had eaten him. Ya'qub didn't believe them but responded with beautiful patience: 'Patience is most fitting.'",
      "For years Ya'qub grieved for Yusuf, crying so much he lost his sight. Yet he never complained against Allah ﷾. He held onto hope, saying, 'I only complain of my suffering to Allah ﷾.'"
    ],
    evidence: {
      arabic: "قَالَ بَلْ سَوَّلَتْ لَكُمْ أَنفُسُكُمْ أَمْرًا ۖ فَصَبْرٌ جَمِيلٌ",
      translation: "He said, 'Rather, your souls have enticed you to something, so patience is most fitting.'",
      source: "Qur'an 12:18"
    },
    reflection: "How did Ya'qub maintain hope in Allah ﷾ despite losing his beloved son?",
    quizId: 18
  },

  // Prophet Ya'qub (2 of 2)
  {
    id: 19,
    title: "Prophet Ya'qub عليه السلام - Part 2",
    meaning: "Jacob/Israel",
    description: [
      "Ya'qub never gave up hope that Yusuf was alive. When his sons went to Egypt, he told them to search for Yusuf and his brother. His trust in Allah ﷾ remained unshaken despite years of separation.",
      "When the shirt of Yusuf was brought back from Egypt and placed over Ya'qub's face, his sight returned miraculously. His years of patient trust were finally rewarded as he was reunited with his beloved son.",
      "Ya'qub traveled to Egypt where Yusuf had become a powerful minister. Yusuf seated his parents on the throne, and Ya'qub's old dream was fulfilled. He praised Allah ﷾ for His mercy and perfect plan.",
      "Ya'qub's life teaches us about sabr, trusting Allah ﷾'s wisdom when we don't understand, and maintaining hope even in darkest times. His patience through loss and his gratitude during reunion are exemplary for believers."
    ],
    evidence: {
      arabic: "إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ",
      translation: "I only complain of my suffering and my grief to Allah ﷾.",
      source: "Qur'an 12:86"
    },
    reflection: "What does Ya'qub's reunion with Yusuf teach us about trusting Allah ﷾'s timing?",
    quizId: 19
  },

  // Prophet Yusuf (1 of 2)
  {
    id: 20,
    title: "Prophet Yusuf عليه السلام - Part 1",
    meaning: "Joseph",
    description: [
      "Yusuf was beloved by his father Ya'qub. As a young boy, he saw a dream where eleven stars, the sun, and moon prostrated to him. Ya'qub knew this meant great things ahead.",
      "Yusuf's jealous brothers plotted to get rid of him. They threw him into a dark well and told their father a wolf had eaten him. Travelers found Yusuf and sold him as a slave in Egypt.",
      "Yusuf was bought by the Aziz of Egypt and grew up in his house. The Aziz's wife tried to seduce Yusuf, but he refused firmly, saying, 'Allah ﷾ forbid! He is my master who has been good to me.'",
      "When Yusuf tried to flee, she tore his shirt from behind. Her husband saw the torn shirt and knew Yusuf was innocent. Yet Yusuf was still imprisoned to protect the Aziz's reputation and honor."
    ],
    evidence: {
      arabic: "قَالَ مَعَاذَ اللَّهِ ۖ إِنَّهُ رَبِّي أَحْسَنَ مَثْوَايَ",
      translation: "He said, 'Allah ﷾ forbid! Indeed, my master has made good my residence.'",
      source: "Qur'an 12:23"
    },
    reflection: "How did Yusuf maintain his honor and integrity despite temptation and injustice?",
    quizId: 20
  },

  // Prophet Yusuf (2 of 2)
  {
    id: 21,
    title: "Prophet Yusuf عليه السلام - Part 2",
    meaning: "Joseph",
    description: [
      "In prison, Yusuf interpreted dreams through Allah ﷾'s knowledge. When the king had a troubling dream, Yusuf explained it: seven years of plenty followed by seven years of famine. The king freed him.",
      "The king made Yusuf treasurer of Egypt. Yusuf stored grain during the good years. When famine struck, people came from everywhere for food, including his brothers who didn't recognize him at first.",
      "Yusuf tested his brothers to see if they had changed. When he finally revealed his identity, he forgave them completely saying, 'No blame on you today. May Allah ﷾ forgive you. He is the Most Merciful.'",
      "Yusuf's family reunited in Egypt. His childhood dream came true as his parents and brothers bowed before him in honor. From slavery to prison to power—Yusuf's trust in Allah ﷾ never wavered, and Allah ﷾ raised him."
    ],
    evidence: {
      arabic: "لَا تَثْرِيبَ عَلَيْكُمُ الْيَوْمَ ۖ يَغْفِرُ اللَّهُ لَكُمْ",
      translation: "No blame will there be upon you today. Allah ﷾ will forgive you.",
      source: "Qur'an 12:92"
    },
    reflection: "What does Yusuf's forgiveness of his brothers teach us about true nobility of character?",
    quizId: 21
  },

  // Prophet Ayyub (1 of 2)
  {
    id: 22,
    title: "Prophet Ayyub عليه السلام - Part 1",
    meaning: "Job",
    description: [
      "Ayyub was a wealthy, healthy prophet blessed with family, land, and livestock. He was grateful to Allah ﷾, worshipped sincerely, and helped the poor. He lived a life of righteousness and devotion.",
      "Allah ﷾ tested Ayyub by allowing him to lose his wealth, his children, and his health. Ayyub developed painful sores all over his body. People abandoned him except his loyal wife who stayed by him.",
      "Despite losing everything, Ayyub never complained about Allah ﷾. He remained patient and continued worshipping Allah ﷾, knowing that everything belongs to Allah ﷾ and He can take what He gives whenever He wills.",
      "People who once respected him now mocked and avoided him. His suffering continued for years. Yet Ayyub's faith never wavered. He accepted Allah ﷾'s decree with beautiful patience, never questioning Allah ﷾'s wisdom or justice."
    ],
    evidence: {
      arabic: "إِنَّا وَجَدْنَاهُ صَابِرًا ۚ نِّعْمَ الْعَبْدُ ۖ إِنَّهُ أَوَّابٌ",
      translation: "Indeed, We found him patient, an excellent servant. Indeed, he was one repeatedly turning back to Allah ﷾.",
      source: "Qur'an 38:44"
    },
    reflection: "How can Ayyub's patience during extreme hardship strengthen our faith during trials?",
    quizId: 22
  },

  // Prophet Ayyub (2 of 2)
  {
    id: 23,
    title: "Prophet Ayyub عليه السلام - Part 2",
    meaning: "Job",
    description: [
      "After many years of suffering, Ayyub finally called upon Allah ﷾: 'Indeed, adversity has touched me, and You are the Most Merciful of the merciful.' This wasn't a complaint but a humble plea.",
      "Allah ﷾ immediately responded to Ayyub's du'a. Allah ﷾ commanded him to strike his foot on the ground. A spring of water gushed out. He bathed in it and drank from it, and his health was completely restored.",
      "Allah ﷾ returned Ayyub's wealth and family to him, giving him double what he had before. His beautiful patience and trust during the darkest trial earned him Allah ﷾'s immense reward in this life and the Hereafter.",
      "Ayyub's story is a powerful reminder that trials test our faith and purify our hearts. No matter how difficult life becomes, turning to Allah ﷾ with patience and du'a always brings relief and blessings."
    ],
    evidence: {
      arabic: "أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ",
      translation: "Indeed, adversity has touched me, and You are the Most Merciful of the merciful.",
      source: "Qur'an 21:83"
    },
    reflection: "What does Ayyub's du'a teach us about how to call upon Allah ﷾ during hardship?",
    quizId: 23
  },

  // Prophet Shu'ayb (1 of 2)
  {
    id: 24,
    title: "Prophet Shu'ayb عليه السلام - Part 1",
    meaning: "The Prophet of Madyan",
    description: [
      "Shu'ayb was sent to the people of Madyan who were dishonest in their business dealings. They cheated in weights and measures, giving less and taking more. They ambushed travelers and stole from them.",
      "Shu'ayb called them to worship Allah ﷾ alone and to be fair and honest in their transactions. He warned them that cheating and corruption would bring Allah ﷾'s punishment upon them and their society.",
      "The people mocked Shu'ayb because he spoke about honesty and fairness. They said his prayers made him foolish. They threatened to stone him and drive him out unless he stopped preaching about justice and righteousness.",
      "Shu'ayb reminded them how Allah ﷾ had blessed them with wealth and safety. He warned them not to repeat the mistakes of earlier nations who were destroyed for their arrogance, corruption, and rejection of messengers."
    ],
    evidence: {
      arabic: "وَإِلَىٰ مَدْيَنَ أَخَاهُمْ شُعَيْبًا ۗ قَالَ يَا قَوْمِ اعْبُدُوا اللَّهَ مَا لَكُم مِّنْ إِلَٰهٍ غَيْرُهُ ۖ وَلَا تَنقُصُوا الْمِكْيَالَ وَالْمِيزَانَ",
      translation: "And to Madyan We sent their brother Shu'ayb. He said, 'O my people, worship Allah ﷾; you have no deity other than Him. And do not decrease from the measure and the scale.'",
      source: "Qur'an 7:85"
    },
    reflection: "How does Shu'ayb's message connect worship of Allah ﷾ to honesty in daily transactions?",
    quizId: 24
  },

  // Prophet Shu'ayb (2 of 2)
  {
    id: 25,
    title: "Prophet Shu'ayb عليه السلام - Part 2",
    meaning: "The Prophet of Madyan",
    description: [
      "The people of Madyan refused to listen to Shu'ayb. They continued cheating, stealing, and worshipping false gods. They challenged him to bring Allah ﷾'s punishment if he was truly a prophet sent by Allah ﷾.",
      "Allah ﷾ sent a punishment that seized them suddenly. A terrible earthquake shook the earth and they were found lying dead in their homes. Their wealth and dishonest dealings couldn't save them from destruction.",
      "Shu'ayb and the believers who followed him were saved from the punishment. They left the destroyed city and continued their journey of faith, trusting in Allah ﷾'s justice and mercy for the righteous.",
      "The story of Shu'ayb teaches us that honesty isn't just good character—it's part of faith. Cheating and corruption destroy societies. True success comes from worshipping Allah ﷾ and treating others with fairness and integrity."
    ],
    evidence: {
      arabic: "فَأَخَذَتْهُمُ الرَّجْفَةُ فَأَصْبَحُوا فِي دَارِهِمْ جَاثِمِينَ",
      translation: "So the earthquake seized them, and they became within their home corpses fallen prone.",
      source: "Qur'an 7:91"
    },
    reflection: "What does the destruction of Madyan teach us about the importance of justice in society?",
    quizId: 25
  },

  // Prophet Musa (1 of 2)
  {
    id: 26,
    title: "Prophet Musa عليه السلام - Part 1",
    meaning: "Moses",
    description: [
      "Musa was born in Egypt when Fir'awn (Pharaoh) was killing all newborn Israelite boys. Allah ﷾ inspired Musa's mother to place him in a basket and let it float down the river to save him.",
      "Fir'awn's wife found baby Musa and convinced Fir'awn to keep him. By Allah ﷾'s plan, Musa's own mother was brought to nurse him. He grew up in Fir'awn's palace, protected and raised among the oppressors.",
      "As a young man, Musa intervened in a fight between an Egyptian and an Israelite. He accidentally killed the Egyptian and fled Egypt in fear. He traveled to Madyan where he helped two women water their flocks.",
      "One of the women's father, Prophet Shu'ayb, offered Musa work and marriage to his daughter in return for eight years of service. Musa accepted and lived peacefully in Madyan for years, far from Egypt."
    ],
    evidence: {
      arabic: "وَأَوْحَيْنَا إِلَىٰ أُمِّ مُوسَىٰ أَنْ أَرْضِعِيهِ ۖ فَإِذَا خِفْتِ عَلَيْهِ فَأَلْقِيهِ فِي الْيَمِّ",
      translation: "And We inspired to the mother of Musa, 'Suckle him; but when you fear for him, cast him into the river.'",
      source: "Qur'an 28:7"
    },
    reflection: "How does Allah ﷾'s protection of baby Musa show His perfect planning and care?",
    quizId: 26
  },

  // Prophet Musa (2 of 2)
  {
    id: 27,
    title: "Prophet Musa عليه السلام - Part 2",
    meaning: "Moses",
    description: [
      "While traveling with his family, Musa saw a fire on Mount Tur. When he approached it, Allah ﷾ spoke to him directly: 'Indeed, I am your Lord, so remove your sandals. You are in the sacred valley.'",
      "Allah ﷾ commanded Musa to go to Fir'awn and call him to worship Allah ﷾ alone. Musa was afraid and asked Allah ﷾ to send his brother Harun with him for support. Allah ﷾ granted his request.",
      "Musa performed miracles before Fir'awn: his staff turned into a serpent, and his hand glowed white. Fir'awn refused to believe and accused Musa of magic. He challenged Musa to a contest with his magicians.",
      "The magicians threw their ropes and staffs which appeared to be moving serpents. Musa threw his staff, and it swallowed all their magic. The magicians recognized truth and prostrated, believing in Allah ﷾ despite Fir'awn's threats."
    ],
    evidence: {
      arabic: "إِنِّي أَنَا رَبُّكَ فَاخْلَعْ نَعْلَيْكَ ۖ إِنَّكَ بِالْوَادِ الْمُقَدَّسِ طُوًى",
      translation: "Indeed, I am your Lord, so remove your sandals. Indeed, you are in the sacred valley of Tuwa.",
      source: "Qur'an 20:12"
    },
    reflection: "What can we learn from Musa's fear and how Allah ﷾ strengthened him for his mission?",
    quizId: 27
  },

  // Prophet Harun (1 of 2)
  {
    id: 28,
    title: "Prophet Harun عليه السلام - Part 1",
    meaning: "Aaron",
    description: [
      "Harun was Musa's older brother and was appointed by Allah ﷾ to support Musa in his mission to Fir'awn. Musa prayed for Harun to be his helper, and Allah ﷾ granted this request mercifully.",
      "Harun was known for his eloquence and gentleness in speech. He stood beside Musa when they confronted Fir'awn and called him to worship Allah ﷾ alone. Together they showed strength in brotherhood and faith.",
      "When Musa went to Mount Tur to receive the Torah, he left Harun in charge of the Children of Israel. Harun was responsible for guiding them and keeping them on the straight path during Musa's absence.",
      "A man named Samiri led some people astray, creating a golden calf for them to worship. Harun tried to stop them and warned them they were being tested, but many refused to listen to him."
    ],
    evidence: {
      arabic: "وَاجْعَل لِّي وَزِيرًا مِّنْ أَهْلِي - هَارُونَ أَخِي",
      translation: "And appoint for me a minister from my family—Harun, my brother.",
      source: "Qur'an 20:29-30"
    },
    reflection: "How does Harun's role as Musa's supporter teach us about the importance of helping others?",
    quizId: 28
  },

  // Prophet Harun (2 of 2)
  {
    id: 29,
    title: "Prophet Harun عليه السلام - Part 2",
    meaning: "Aaron",
    description: [
      "When Musa returned and saw his people worshipping the calf, he was furious. He grabbed Harun's beard in anger. Harun explained that he tried to stop them but feared causing division among the believers.",
      "Harun's gentle approach and wisdom prevented the situation from becoming worse. He chose to hold the believers together rather than force them, waiting for Musa's return to handle the crisis with authority and strength.",
      "After the calf incident, Harun continued supporting Musa in leading the Children of Israel. Together they endured the people's complaints and stubbornness during their desert wanderings for forty years, calling them to patience.",
      "Harun passed away before entering the Promised Land. He is remembered for his patience, loyalty to his brother, and dedication to Allah ﷾'s message. His legacy shows the importance of supporting righteous leadership with wisdom and mercy."
    ],
    evidence: {
      arabic: "قَالَ يَا ابْنَ أُمَّ لَا تَأْخُذْ بِلِحْيَتِي وَلَا بِرَأْسِي ۖ إِنِّي خَشِيتُ أَن تَقُولَ فَرَّقْتَ بَيْنَ بَنِي إِسْرَائِيلَ",
      translation: "He said, 'O son of my mother, do not seize me by my beard or by my head. Indeed, I feared that you would say, You caused division among the Children of Israel.'",
      source: "Qur'an 20:94"
    },
    reflection: "What does Harun's patience with the difficult people teach us about leadership?",
    quizId: 29
  },

  // Prophet Dhul-Kifl (1 of 2)
  {
    id: 30,
    title: "Prophet Dhul-Kifl عليه السلام - Part 1",
    meaning: "The Patient Prophet",
    description: [
      "Dhul-Kifl was a righteous prophet known for his patience and commitment to justice. He is mentioned in the Qur'an among the patient prophets who remained steadfast in their worship and calling to truth.",
      "His name means 'the one who guaranteed' or 'the one who took responsibility.' He took upon himself the duty of guiding his people and judging fairly between them with wisdom and understanding every single day.",
      "Dhul-Kifl spent his life teaching people to worship Allah ﷾ and resolving their disputes with fairness and justice. He never tired of his duties and never let personal comfort stop him from serving his community faithfully.",
      "Shaytaan tried to test Dhul-Kifl's patience by sending people to disturb him during his rest. But Dhul-Kifl remained calm and patient, not allowing anything to disturb his peace or his commitment to his people."
    ],
    evidence: {
      arabic: "وَإِسْمَاعِيلَ وَإِدْرِيسَ وَذَا الْكِفْلِ ۖ كُلٌّ مِّنَ الصَّابِرِينَ",
      translation: "And mention Ismail, Idris, and Dhul-Kifl; all were of the patient.",
      source: "Qur'an 21:85"
    },
    reflection: "How can Dhul-Kifl's dedication to justice inspire us in our daily responsibilities?",
    quizId: 30
  },

  // Prophet Dhul-Kifl (2 of 2)
  {
    id: 31,
    title: "Prophet Dhul-Kifl عليه السلام - Part 2",
    meaning: "The Patient Prophet",
    description: [
      "Despite tests and trials, Dhul-Kifl never became angry or gave up his duties. His patience became legendary, and he remained committed to helping people and calling them to Allah ﷾'s path every day.",
      "He fulfilled every promise he made and never broke his commitments to his people or to Allah ﷾. His reliability and trustworthiness made him a respected leader among his community and a beloved servant of Allah ﷾.",
      "Allah ﷾ honored Dhul-Kifl by mentioning him in the Qur'an alongside other patient prophets. This shows that patience and keeping promises are qualities Allah ﷾ loves and rewards generously both in this life and the next.",
      "Dhul-Kifl's story teaches us that true patience isn't just enduring hardship quietly—it's remaining committed to doing good, serving others, and worshipping Allah ﷾ no matter what obstacles or distractions come our way."
    ],
    evidence: {
      arabic: "وَأَدْخَلْنَاهُمْ فِي رَحْمَتِنَا ۖ إِنَّهُم مِّنَ الصَّالِحِينَ",
      translation: "And We admitted them into Our mercy. Indeed, they were of the righteous.",
      source: "Qur'an 21:86"
    },
    reflection: "What daily commitments can we make and keep to develop patience like Dhul-Kifl?",
    quizId: 31
  },

  // Prophet Dawud (1 of 2)
  {
    id: 32,
    title: "Prophet Dawud عليه السلام - Part 1",
    meaning: "David",
    description: [
      "Dawud was a young shepherd when the Children of Israel faced the giant warrior Jalut (Goliath) and his massive army. King Talut's army was afraid to fight the terrifying giant and his forces.",
      "Young Dawud stepped forward with faith, saying he would fight Jalut. He relied completely on Allah ﷾, not on weapons or armor. With a sling and stone, Dawud struck Jalut and killed him, bringing victory to the believers.",
      "After this victory, Dawud became king and prophet. Allah ﷾ gave him wisdom, strength, and a beautiful voice for reciting scripture. When Dawud recited the Zabur (Psalms), even birds and mountains would glorify Allah ﷾ with him.",
      "Dawud was a just ruler who judged fairly between people. Allah ﷾ gave him knowledge to judge with wisdom. He spent his days worshipping Allah ﷾, fasting frequently, and standing in night prayer with complete devotion."
    ],
    evidence: {
      arabic: "فَهَزَمُوهُم بِإِذْنِ اللَّهِ وَقَتَلَ دَاوُودُ جَالُوتَ وَآتَاهُ اللَّهُ الْمُلْكَ وَالْحِكْمَةَ",
      translation: "So they defeated them by permission of Allah ﷾, and Dawud killed Jalut, and Allah ﷾ gave him kingship and wisdom.",
      source: "Qur'an 2:251"
    },
    reflection: "How did Dawud's trust in Allah ﷾ help him defeat an enemy much stronger than him?",
    quizId: 32
  },

  // Prophet Dawud (2 of 2)
  {
    id: 33,
    title: "Prophet Dawud عليه السلام - Part 2",
    meaning: "David",
    description: [
      "Allah ﷾ gave Dawud a special gift: iron became soft in his hands like clay. He made armor and shields to protect people in battle. He worked with his own hands, never relying only on his position as king.",
      "Once, two men came to Dawud with a dispute. One had ninety-nine sheep and wanted to take his neighbor's single sheep. Dawud immediately judged in favor of the oppressed man with perfect fairness and justice.",
      "This case was actually a test for Dawud himself about a matter. He realized his mistake, fell in prostration, and asked Allah ﷾ for forgiveness. Allah ﷾ forgave him, showing that even prophets seek forgiveness and remain humble.",
      "Dawud's story teaches us that power and position don't excuse injustice. True leadership means working hard, judging fairly, and remaining humble before Allah ﷾. When we err, we must seek forgiveness immediately like Dawud did."
    ],
    evidence: {
      arabic: "وَأَلَنَّا لَهُ الْحَدِيدَ",
      translation: "And We made the iron soft for him.",
      source: "Qur'an 34:10"
    },
    reflection: "What does Dawud's humility in seeking forgiveness teach us about true greatness?",
    quizId: 33
  },

  // Prophet Sulayman (1 of 2)
  {
    id: 34,
    title: "Prophet Sulayman عليه السلام - Part 1",
    meaning: "Solomon",
    description: [
      "Sulayman was the son of Prophet Dawud. He inherited prophethood and kingship from his father. Allah ﷾ granted Sulayman a kingdom unlike any before or after, with powers over winds, jinn, animals, and more.",
      "Sulayman could understand the speech of birds and animals. Once, an ant warned other ants about Sulayman's approaching army. Sulayman heard her, smiled, and thanked Allah ﷾ for this amazing gift of understanding.",
      "The jinn, humans, and birds all worked under Sulayman's command by Allah ﷾'s permission. He used these blessings not for luxury but to establish justice, spread truth, and build places of worship for Allah ﷾ alone.",
      "Every morning, Sulayman would inspect his army of horses. Once, he became so absorbed in checking them that he missed the afternoon prayer. He immediately sacrificed them, choosing Allah ﷾'s pleasure over worldly possessions."
    ],
    evidence: {
      arabic: "وَوَرِثَ سُلَيْمَانُ دَاوُودَ ۖ وَقَالَ يَا أَيُّهَا النَّاسُ عُلِّمْنَا مَنطِقَ الطَّيْرِ",
      translation: "And Sulayman inherited Dawud. He said, 'O people, we have been taught the language of birds.'",
      source: "Qur'an 27:16"
    },
    reflection: "How did Sulayman use his extraordinary powers to serve Allah ﷾ rather than himself?",
    quizId: 34
  },

  // Prophet Sulayman (2 of 2)
  {
    id: 35,
    title: "Prophet Sulayman عليه السلام - Part 2",
    meaning: "Solomon",
    description: [
      "Sulayman learned that the Queen of Sheba and her people worshipped the sun instead of Allah ﷾. He sent a letter inviting her to worship Allah ﷾ alone and abandon the false worship of created things.",
      "The queen was wise and decided to visit Sulayman herself. Before she arrived, Sulayman asked who could bring her throne to him. A knowledgeable jinn brought it in seconds, demonstrating the power Allah ﷾ gave Sulayman.",
      "When the queen arrived and saw her throne and Sulayman's magnificent kingdom, she realized this was power from Allah ﷾ alone. She abandoned sun worship and declared, 'I submit with Sulayman to Allah ﷾, Lord of all worlds.'",
      "Despite his vast kingdom, Sulayman remained humble and grateful. He knew everything came from Allah ﷾'s mercy. His life shows that true success is using blessings to spread Allah ﷾'s message, not for personal glory or pride."
    ],
    evidence: {
      arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ",
      translation: "My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents.",
      source: "Qur'an 27:19"
    },
    reflection: "What does Sulayman's prayer teach us about how to respond to Allah ﷾'s blessings?",
    quizId: 35
  },

  // Prophet Ilyas (1 of 2)
  {
    id: 36,
    title: "Prophet Ilyas عليه السلام - Part 1",
    meaning: "Elijah",
    description: [
      "Ilyas was sent to the people of Israel when they had turned away from worshipping Allah ﷾. They worshipped an idol called Ba'al and abandoned the pure teachings that Musa had brought to them.",
      "King Ahab and his wife Jezebel led the people in idol worship and persecution of true believers. They built temples for Ba'al and forced people to bow to false gods, threatening those who refused.",
      "Ilyas stood alone, calling people back to Tawhid. He warned them that worshipping creation instead of the Creator would bring punishment. He performed miracles by Allah ﷾'s permission to show them the truth clearly.",
      "The king and queen sought to kill Ilyas for opposing their false religion. The people rejected his message and continued their idol worship. Ilyas felt isolated but never stopped calling them to worship Allah ﷾ alone faithfully."
    ],
    evidence: {
      arabic: "وَإِنَّ إِلْيَاسَ لَمِنَ الْمُرْسَلِينَ",
      translation: "And indeed, Ilyas was from among the messengers.",
      source: "Qur'an 37:123"
    },
    reflection: "How can Ilyas's courage in standing alone for truth inspire us today?",
    quizId: 36
  },

  // Prophet Ilyas (2 of 2)
  {
    id: 37,
    title: "Prophet Ilyas عليه السلام - Part 2",
    meaning: "Elijah",
    description: [
      "Ilyas challenged the priests of Ba'al to a test: they would call upon their god, and he would call upon Allah ﷾. Whichever god answered with fire was the true God worth worshipping.",
      "The priests of Ba'al called upon their idol from morning till afternoon, but nothing happened. Then Ilyas called upon Allah ﷾, and immediately fire came down from heaven, proving Allah ﷾'s power and the idols' worthlessness.",
      "Many people believed after witnessing this clear miracle. But the queen Jezebel became more furious and intensified her persecution. Ilyas had to flee for his life and hide in caves, continuing his mission from there.",
      "Despite persecution and rejection, Ilyas never gave up calling to Tawhid. Allah ﷾ honored him and mentioned him among the messengers. His story reminds us that standing for truth may be lonely, but Allah ﷾ is always with the believers."
    ],
    evidence: {
      arabic: "إِذْ قَالَ لِقَوْمِهِ أَلَا تَتَّقُونَ - أَتَدْعُونَ بَعْلًا وَتَذَرُونَ أَحْسَنَ الْخَالِقِينَ",
      translation: "When he said to his people, 'Will you not fear Allah ﷾? Do you call upon Ba'al and leave the best of creators?'",
      source: "Qur'an 37:124-125"
    },
    reflection: "What does Ilyas's test with the priests teach us about proving truth through Allah ﷾'s help?",
    quizId: 37
  },

  // Prophet Al-Yasa' (1 of 2)
  {
    id: 38,
    title: "Prophet Al-Yasa عليه السلام' - Part 1",
    meaning: "Elisha",
    description: [
      "Al-Yasa' was a prophet who succeeded Ilyas in calling the Children of Israel back to the worship of Allah ﷾ alone. He continued the mission of fighting idol worship and establishing Tawhid among his people.",
      "Like Ilyas before him, Al-Yasa' faced a stubborn people who had been led astray by corrupt kings and false priests. They preferred their idols and worldly pleasures over following Allah ﷾'s commands and guidance.",
      "Al-Yasa' performed miracles by Allah ﷾'s permission to show people the truth. He healed the sick, brought blessings to the poor, and demonstrated Allah ﷾'s power. Yet most people remained ungrateful and stubborn in their disbelief.",
      "Despite the difficulties, Al-Yasa' remained patient and continued his mission with determination. He never gave up on his people, always hoping that more would turn back to Allah ﷾ and abandon their false worship of idols."
    ],
    evidence: {
      arabic: "وَإِسْمَاعِيلَ وَالْيَسَعَ وَيُونُسَ وَلُوطًا ۚ وَكُلًّا فَضَّلْنَا عَلَى الْعَالَمِينَ",
      translation: "And Ismail and Al-Yasa' and Yunus and Lut. And all of them We preferred over the worlds.",
      source: "Qur'an 6:86"
    },
    reflection: "What can we learn from Al-Yasa's persistence despite people's rejection?",
    quizId: 38
  },

  // Prophet Al-Yasa' (2 of 2)
  {
    id: 39,
    title: "Prophet Al-Yasa عليه السلام' - Part 2",
    meaning: "Elisha",
    description: [
      "Al-Yasa' taught his people through both words and actions. He lived a simple, pious life, showing them that true wealth is in faith and closeness to Allah ﷾, not in material possessions or power.",
      "He gathered a small group of sincere followers who believed in his message. He taught them the scripture, the laws that Musa had brought, and the importance of worshipping Allah ﷾ with complete devotion and sincerity.",
      "The kings and corrupt priests opposed Al-Yasa', but Allah ﷾ protected him and gave him strength to continue. He reminded his people of their covenant with Allah ﷾ and warned them of the punishment that befell earlier nations.",
      "Al-Yasa' is remembered as one of the righteous prophets who dedicated his life to calling people to Allah ﷾. Though his name is mentioned briefly in the Qur'an, his legacy of patience and perseverance lives on."
    ],
    evidence: {
      arabic: "وَاذْكُرْ إِسْمَاعِيلَ وَالْيَسَعَ وَذَا الْكِفْلِ ۖ وَكُلٌّ مِّنَ الْأَخْيَارِ",
      translation: "And remember Ismail, Al-Yasa', and Dhul-Kifl. And all are among the outstanding.",
      source: "Qur'an 38:48"
    },
    reflection: "How does Al-Yasa's dedication to teaching remind us of our duty to share knowledge?",
    quizId: 39
  },

  // Prophet Yunus (1 of 2)
  {
    id: 40,
    title: "Prophet Yunus عليه السلام - Part 1",
    meaning: "Jonah",
    description: [
      "Yunus was sent to the people of Nineveh (in modern-day Iraq) to call them to worship Allah ﷾. He preached to them for years, but they stubbornly rejected his message and continued their disbelief and sins.",
      "Frustrated by their rejection, Yunus left the city without Allah ﷾'s permission, thinking his mission had failed. He boarded a ship heading to another land, trying to escape from the burden of his people's stubbornness.",
      "During the voyage, a violent storm struck the ship. The crew believed someone on board was the cause and cast lots to find out who. The lot fell on Yunus, who admitted the truth.",
      "Yunus threw himself into the raging sea, and Allah ﷾ sent a huge whale to swallow him. He wasn't harmed but was trapped in the belly of the whale, surrounded by three layers of darkness: night, sea, and whale."
    ],
    evidence: {
      arabic: "فَالْتَقَمَهُ الْحُوتُ وَهُوَ مُلِيمٌ",
      translation: "Then the whale swallowed him, while he was blameworthy.",
      source: "Qur'an 37:142"
    },
    reflection: "What does Yunus's story teach us about leaving our responsibilities without Allah ﷾'s permission?",
    quizId: 40
  },

  // Prophet Yunus (2 of 2)
  {
    id: 41,
    title: "Prophet Yunus عليه السلام - Part 2",
    meaning: "Jonah",
    description: [
      "In the darkness of the whale's belly, Yunus realized his mistake. He turned to Allah ﷾ in sincere repentance, declaring: 'There is no god except You; exalted are You. Indeed, I have been of the wrongdoers.'",
      "This beautiful du'a, made with complete humility and sincere regret, was answered immediately. Allah ﷾ commanded the whale to cast Yunus onto the shore. He was weak and exhausted but alive and forgiven.",
      "Allah ﷾ caused a plant to grow over Yunus to shade and comfort him as he recovered. Meanwhile, back in Nineveh, the people saw signs of approaching punishment and finally believed, repenting sincerely to Allah ﷾.",
      "Allah ﷾ accepted the people's repentance and removed the punishment. Yunus returned to them and found them all believers. His story shows Allah ﷾'s mercy: He forgives those who repent sincerely, no matter their past mistakes or sins."
    ],
    evidence: {
      arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
      translation: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
      source: "Qur'an 21:87"
    },
    reflection: "How can we use Yunus's du'a when we face difficulties caused by our own mistakes?",
    quizId: 41
  },

  // ============================================================
  // SECTION 3: Prophets Before 'Īsā
  // ============================================================

  // Prophet Zakariyya (1 of 2)
  {
    id: 42,
    title: "Prophet Zakariyya عليه السلام - Part 1",
    meaning: "Zechariah",
    description: [
      "Zakariyya was a righteous prophet and guardian of Maryam (Mary). He was very old, and his wife was barren. He had no children and worried there would be no one to continue his mission after him.",
      "Every time Zakariyya entered Maryam's prayer chamber, he found fresh fruits with her—summer fruits in winter, winter fruits in summer. When he asked where they came from, she said, 'From Allah ﷾. Allah ﷾ provides without limit.'",
      "Seeing this miracle, Zakariyya realized that Allah ﷾ can provide anything He wills, even the impossible. He made a private du'a asking Allah ﷾ for a righteous child despite his old age and his wife's inability to bear children.",
      "Zakariyya's du'a was sincere and humble. He prayed, 'My Lord, do not leave me alone, and You are the best of inheritors.' He asked not for worldly glory but for someone to carry on his message."
    ],
    evidence: {
      arabic: "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ",
      translation: "My Lord, do not leave me alone, and You are the best of inheritors.",
      source: "Qur'an 21:89"
    },
    reflection: "How did witnessing Maryam's miracles strengthen Zakariyya's faith and inspire his du'a?",
    quizId: 42
  },

  // Prophet Zakariyya (2 of 2)
  {
    id: 43,
    title: "Prophet Zakariyya عليه السلام - Part 2",
    meaning: "Zechariah",
    description: [
      "While Zakariyya was praying in the temple, angels gave him glad tidings: 'Allah ﷾ gives you good news of Yahya, confirming a word from Allah ﷾, honorable, chaste, and a prophet from among the righteous.'",
      "Zakariyya was amazed and asked, 'How can I have a son when I am old and my wife is barren?' The angels replied, 'Thus Allah ﷾ does what He wills. Nothing is impossible for Him.'",
      "As a sign, Allah ﷾ made Zakariyya unable to speak to people for three days, though he could still glorify Allah ﷾. He praised Allah ﷾ day and night, his heart filled with gratitude for this miraculous blessing.",
      "Zakariyya's story teaches us that age, circumstances, or apparent impossibilities don't limit Allah ﷾'s power. When we make du'a with sincerity and trust, Allah ﷾ can answer in ways beyond our imagination and understanding completely."
    ],
    evidence: {
      arabic: "قَالَ رَبِّ أَنَّىٰ يَكُونُ لِي غُلَامٌ وَقَدْ بَلَغَنِيَ الْكِبَرُ وَامْرَأَتِي عَاقِرٌ ۖ قَالَ كَذَٰلِكَ اللَّهُ يَفْعَلُ مَا يَشَاءُ",
      translation: "He said, 'My Lord, how will I have a boy when I have reached old age and my wife is barren?' He said, 'Such is Allah ﷾; He does what He wills.'",
      source: "Qur'an 3:40"
    },
    reflection: "What does Zakariyya's response to Allah ﷾'s answer teach us about accepting Allah ﷾'s will?",
    quizId: 43
  },

  // Prophet Yahya (1 of 2)
  {
    id: 44,
    title: "Prophet Yahya عليه السلام - Part 1",
    meaning: "John the Baptist",
    description: [
      "Yahya was born to Zakariyya and his wife in their old age, a miracle from Allah ﷾. His name means 'he lives,' as he brought new life to his parents' hopes and to the message of truth.",
      "From childhood, Yahya was wise, pious, and serious about worship. Allah ﷾ says, 'We gave him wisdom even as a child.' He understood scripture deeply and lived by it with complete dedication and devotion.",
      "Yahya was known for his purity and chastity. He stayed away from worldly pleasures and focused entirely on worship and calling people to Allah ﷾. He never married, dedicating his whole life to serving Allah ﷾ alone.",
      "He was extremely kind and respectful to his parents. The Qur'an describes him as 'dutiful to his parents and neither arrogant nor disobedient.' His manners and character were absolutely beautiful and exemplary for all believers."
    ],
    evidence: {
      arabic: "وَآتَيْنَاهُ الْحُكْمَ صَبِيًّا",
      translation: "And We gave him wisdom even as a child.",
      source: "Qur'an 19:12"
    },
    reflection: "What can we learn from Yahya about staying focused on Allah ﷾ despite worldly distractions?",
    quizId: 44
  },

  // Prophet Yahya (2 of 2)
  {
    id: 45,
    title: "Prophet Yahya عليه السلام - Part 2",
    meaning: "John the Baptist",
    description: [
      "Yahya called the Children of Israel to return to pure worship of Allah ﷾. He spoke boldly against sin and corruption, even when it meant confronting powerful kings and leaders with the truth fearlessly.",
      "He baptized people in the Jordan River as a symbol of spiritual purification and repentance. He prepared the way for the coming of Prophet 'Isa, calling people to reform their hearts and lives before his arrival.",
      "Yahya was martyred for speaking truth to power. He condemned the king's immoral marriage, and the king's wife plotted his death. Yahya died as a martyr, never compromising truth for safety or comfort.",
      "Yahya's life shows us that true piety means complete dedication to Allah ﷾ and His commands. He lived purely, spoke truthfully, and died honorably. His legacy is one of unwavering integrity and fearless commitment to righteousness."
    ],
    evidence: {
      arabic: "وَبَرًّا بِوَالِدَيْهِ وَلَمْ يَكُن جَبَّارًا عَصِيًّا",
      translation: "And dutiful to his parents, and he was not a disobedient tyrant.",
      source: "Qur'an 19:14"
    },
    reflection: "How does Yahya's courage in speaking truth inspire us to stand for what is right?",
    quizId: 45
  },

  // Prophet 'Isa (1 of 2)
  {
    id: 46,
    title: "Prophet 'Isa عليه السلام - Part 1",
    meaning: "Jesus",
    description: [
      "'Isa was born to Maryam (Mary) miraculously without a father, as a sign of Allah ﷾'s power. Angels told her she was chosen above all women and would give birth to a blessed prophet and messenger.",
      "When Maryam's people saw her with a baby, they accused her of wrongdoing. But baby 'Isa spoke from the cradle, declaring: 'I am the servant of Allah ﷾. He has given me the Scripture and made me a prophet.'",
      "As 'Isa grew, Allah ﷾ taught him the Torah and the Gospel. He performed miracles by Allah ﷾'s permission: healing the blind, curing lepers, and even bringing the dead back to life to prove his message was from Allah ﷾.",
      "'Isa called the Children of Israel to worship Allah ﷾ alone, to be just and kind, and to follow the law that Musa had brought. He taught pure Tawhid, saying, 'Allah ﷾ is my Lord and your Lord, so worship Him.'"
    ],
    evidence: {
      arabic: "قَالَ إِنِّي عَبْدُ اللَّهِ آتَانِيَ الْكِتَابَ وَجَعَلَنِي نَبِيًّا",
      translation: "He said, 'Indeed, I am the servant of Allah ﷾. He has given me the Scripture and made me a prophet.'",
      source: "Qur'an 19:30"
    },
    reflection: "What does 'Isa speaking from the cradle teach us about Allah ﷾'s power over all things?",
    quizId: 46
  },

  // Prophet 'Isa (2 of 2)
  {
    id: 47,
    title: "Prophet 'Isa عليه السلام - Part 2",
    meaning: "Jesus",
    description: [
      "Some of the Children of Israel believed in 'Isa, but many rejected him. The corrupt priests and leaders plotted to kill him because he exposed their hypocrisy and called them back to true worship.",
      "When they came to arrest him, Allah ﷾ saved 'Isa by raising him to the heavens. Someone else was made to look like him, and that person was crucified instead. 'Isa was never killed nor crucified.",
      "'Isa remains alive in the heavens and will return before the Day of Judgment. He will come back to establish justice, defeat the false messiah, and call all people to worship Allah ﷾ alone.",
      "'Isa's story teaches us that he was a noble prophet and servant of Allah ﷾, not divine. He never claimed to be Allah ﷾'s son or god. He preached pure Tawhid and will testify on Judgment Day that he called people only to Allah ﷾."
    ],
    evidence: {
      arabic: "وَمَا قَتَلُوهُ وَمَا صَلَبُوهُ وَلَٰكِن شُبِّهَ لَهُمْ",
      translation: "And they did not kill him, nor did they crucify him; but another was made to resemble him to them.",
      source: "Qur'an 4:157"
    },
    reflection: "How does understanding 'Isa's true message help us appreciate the final message of Islam?",
    quizId: 47
  }
];

export default prophetsLessons;
