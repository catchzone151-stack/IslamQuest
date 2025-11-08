const namesOfAllahLessons = [
  { id: 1, title: "Allah", meaning: "The one true God", quizId: "allah_quiz" },
  { id: 2, title: "Ar-Rabb", meaning: "The Lord and Sustainer", quizId: "ar_rabb_quiz" },
  { id: 3, title: "Ar-Rahmaan", meaning: "The Most Merciful", quizId: "ar_rahmaan_quiz" },
  { id: 4, title: "Ar-Raheem", meaning: "The Especially Merciful", quizId: "ar_raheem_quiz" },

  // --- Creator group ---
  { id: 5, title: "Al-Khaaliq", meaning: "The Creator", quizId: "al_khaaliq_quiz" },
  { id: 6, title: "Al-Khallaaq", meaning: "The Supreme Creator", quizId: "al_khallaq_quiz" },
  { id: 7, title: "Al-Baari", meaning: "The Evolver", quizId: "al_baari_quiz" },
  { id: 8, title: "Al-Musawwir", meaning: "The Fashioner", quizId: "al_musawwir_quiz" },

  // --- The Living and Sustaining ---
  { id: 9, title: "Al-Hayy", meaning: "The Ever-Living", quizId: "al_hayy_quiz" },
  { id: 10, title: "Al-Qayyoom", meaning: "The Sustainer of all", quizId: "al_qayyoom_quiz" },

  // --- Kingship group ---
  { id: 11, title: "Al-Maalik", meaning: "The Owner", quizId: "al_maalik_quiz" },
  { id: 12, title: "Al-Malik", meaning: "The King", quizId: "al_malik_quiz" },
  { id: 13, title: "Al-Maleek", meaning: "The Sovereign Master", quizId: "al_maleek_quiz" },

  // --- Provision and Oneness ---
  { id: 14, title: "Ar-Razzaaq", meaning: "The Provider", quizId: "ar_razzaaq_quiz" },
  { id: 15, title: "Ar-Raaziq", meaning: "The Giver of sustenance", quizId: "ar_raaziq_quiz" },
  { id: 16, title: "Al-Ahad", meaning: "The One", quizId: "al_ahad_quiz" },
  { id: 17, title: "Al-Waahid", meaning: "The Unique One", quizId: "al_waahid_quiz" },
  { id: 18, title: "As-Samad", meaning: "The Self-Sufficient", quizId: "as_samad_quiz" },

  // --- Guidance & Giving ---
  { id: 19, title: "Al-Haadee", meaning: "The Guide", quizId: "al_haadee_quiz" },
  { id: 20, title: "Al-Wahhaab", meaning: "The Bestower", quizId: "al_wahhaab_quiz" },
  { id: 21, title: "Al-Fattaah", meaning: "The Opener", quizId: "al_fattaah_quiz" },

  // --- Hearing & Seeing ---
  { id: 22, title: "As-Samee", meaning: "The All-Hearing", quizId: "as_samee_quiz" },
  { id: 23, title: "Al-Baseer", meaning: "The All-Seeing", quizId: "al_baseer_quiz" },

  // --- Knowledge & Awareness ---
  { id: 24, title: "Al-Aleem", meaning: "The All-Knowing", quizId: "al_aleem_quiz" },
  { id: 25, title: "Al-Lateef", meaning: "The Subtle and Kind", quizId: "al_lateef_quiz" },
  { id: 26, title: "Al-Khabeer", meaning: "The All-Aware", quizId: "al_khabeer_quiz" },

  // --- Forgiveness ---
  { id: 27, title: "Al-Afw", meaning: "The Pardoner", quizId: "al_afw_quiz" },
  { id: 28, title: "Al-Ghafoor", meaning: "The Forgiving", quizId: "al_ghafoor_quiz" },

  // --- Greatness & Strength ---
  { id: 29, title: "Al-Alee", meaning: "The Most High", quizId: "al_alee_quiz" },
  { id: 30, title: "Al-Aalaa", meaning: "The Most Exalted", quizId: "al_aalaa_quiz" },
  { id: 31, title: "Al-Muta'aal", meaning: "The Supremely Exalted", quizId: "al_muta_aal_quiz" },
  { id: 32, title: "Al-Kabeer", meaning: "The Great", quizId: "al_kabeer_quiz" },
  { id: 33, title: "Al-Adheem", meaning: "The Magnificent", quizId: "al_adheem_quiz" },
  { id: 34, title: "Al-Qawee", meaning: "The All-Strong", quizId: "al_qawee_quiz" },
  { id: 35, title: "Al-Mateen", meaning: "The Firm", quizId: "al_mateen_quiz" },

  // --- Watchfulness & Protection ---
  { id: 36, title: "Ash-Shaheed", meaning: "The Witness", quizId: "ash_shaheed_quiz" },
  { id: 37, title: "Ar-Raqeeb", meaning: "The Watchful", quizId: "ar_raqeeb_quiz" },
  { id: 38, title: "Al-Muhaymin", meaning: "The Protector", quizId: "al_muhaymin_quiz" },
  { id: 39, title: "Al-Muheet", meaning: "The Encompassing", quizId: "al_muheet_quiz" },
  { id: 40, title: "Al-Muqeet", meaning: "The Maintainer", quizId: "al_muqeet_quiz" },

  // --- Generosity & Wealth ---
  { id: 41, title: "Al-Waasi", meaning: "The All-Encompassing", quizId: "al_waasi_quiz" },
  { id: 42, title: "Al-Ghanee", meaning: "The Self-Sufficient", quizId: "al_ghanee_quiz" },
  { id: 43, title: "Al-Kareem", meaning: "The Generous", quizId: "al_kareem_quiz" },
  { id: 44, title: "Al-Akram", meaning: "The Most Generous", quizId: "al_akram_quiz" },

  // --- Peace & Holiness ---
  { id: 45, title: "As-Salaam", meaning: "The Source of Peace", quizId: "as_salaam_quiz" },
  { id: 46, title: "Al-Quddoos", meaning: "The Holy", quizId: "al_quddoos_quiz" },
  { id: 47, title: "As-Subbooh", meaning: "The Most Pure", quizId: "as_subbooh_quiz" },

  // --- Praise & Thanks ---
  { id: 48, title: "Al-Hameed", meaning: "The Praiseworthy", quizId: "al_hameed_quiz" },
  { id: 49, title: "Al-Majeed", meaning: "The Most Glorious", quizId: "al_majeed_quiz" },
  { id: 50, title: "Ash-Shakoor", meaning: "The Appreciative", quizId: "ash_shakoor_quiz" },
  { id: 51, title: "Ash-Shaakir", meaning: "The Grateful", quizId: "ash_shaakir_quiz" },

  // --- Forbearance & Truth ---
  { id: 52, title: "Al-Haleem", meaning: "The Forbearing", quizId: "al_haleem_quiz" },
  { id: 53, title: "Al-Haqq", meaning: "The Truth", quizId: "al_haqq_quiz" },
  { id: 54, title: "Al-Mubeen", meaning: "The Clear", quizId: "al_mubeen_quiz" },

  // --- Power & Control ---
  { id: 55, title: "Al-Qadeer", meaning: "The Able", quizId: "al_qadeer_quiz" },
  { id: 56, title: "Al-Qaadir", meaning: "The Powerful", quizId: "al_qaadir_quiz" },
  { id: 57, title: "Al-Muqtadir", meaning: "The Omnipotent", quizId: "al_muqtadir_quiz" },

  // --- Love & Kindness ---
  { id: 58, title: "Al-Wadood", meaning: "The Loving", quizId: "al_wadood_quiz" },
  { id: 59, title: "Al-Barr", meaning: "The Most Kind", quizId: "al_barr_quiz" },
  { id: 60, title: "Ar-Raoof", meaning: "The Compassionate", quizId: "ar_raoof_quiz" },

  // --- Helper & Protector ---
  { id: 61, title: "Al-Walee", meaning: "The Protecting Friend", quizId: "al_walee_quiz" },
  { id: 62, title: "Al-Mawlaa", meaning: "The Patron", quizId: "al_mawlaa_quiz" },
  { id: 63, title: "Al-Wakeel", meaning: "The Disposer of Affairs", quizId: "al_wakeel_quiz" },
  { id: 64, title: "An-Naseer", meaning: "The Helper", quizId: "an_naseer_quiz" },

  // --- Justice & Honour ---
  { id: 65, title: "Al-Azeez", meaning: "The Mighty", quizId: "al_azeez_quiz" },
  { id: 66, title: "Al-Jabbaar", meaning: "The Compeller", quizId: "al_jabbaar_quiz" },
  { id: 67, title: "Al-Mutakabbir", meaning: "The Supreme", quizId: "al_mutakabbir_quiz" },

  // --- Nearness & Response ---
  { id: 68, title: "Al-Qareeb", meaning: "The Near", quizId: "al_qareeb_quiz" },
  { id: 69, title: "Al-Mujeeb", meaning: "The Responsive", quizId: "al_mujeeb_quiz" },

  // --- Strength & Dominance ---
  { id: 70, title: "Al-Qaahir", meaning: "The Subduer", quizId: "al_qaahir_quiz" },
  { id: 71, title: "Al-Qahhaar", meaning: "The All-Powerful", quizId: "al_qahhaar_quiz" },

  // --- Eternal & Timeless ---
  { id: 72, title: "Al-Awwal", meaning: "The First", quizId: "al_awwal_quiz" },
  { id: 73, title: "Al-Aakhir", meaning: "The Last", quizId: "al_aakhir_quiz" },
  { id: 74, title: "Adh-Dhaahir", meaning: "The Manifest", quizId: "adh_dhaahir_quiz" },
  { id: 75, title: "Al-Baatin", meaning: "The Hidden", quizId: "al_baatin_quiz" },

  // --- Wisdom ---
  { id: 76, title: "Al-Hakeem", meaning: "The Wise", quizId: "al_hakeem_quiz" },

  // --- Remaining group (condensed for brevity) ---
  { id: 77, title: "Al-Hafeedh", meaning: "The Preserver", quizId: "al_hafeedh_quiz" },
  { id: 78, title: "Al-Haafidh", meaning: "The Protector", quizId: "al_haafidh_quiz" },
  { id: 79, title: "Ash-Saadiq", meaning: "The Truthful", quizId: "ash_saadiq_quiz" },
  { id: 80, title: "An-Noor", meaning: "The Light", quizId: "an_noor_quiz" },
  { id: 81, title: "Al-Muhsin", meaning: "The Doer of Good", quizId: "al_muhsin_quiz" },
  { id: 82, title: "Ad-Dayyaan", meaning: "The Judge", quizId: "ad_dayyaan_quiz" },
  { id: 83, title: "Al-Muqaddim", meaning: "The One Who Brings Forward", quizId: "al_muqaddim_quiz" },
  { id: 84, title: "Al-Muakhkhir", meaning: "The One Who Delays", quizId: "al_muakhkhir_quiz" },
  { id: 85, title: "At-Tayyib", meaning: "The Good and Pure", quizId: "at_tayyib_quiz" },
  { id: 86, title: "Ash-Shaafee", meaning: "The Healer", quizId: "ash_shaafee_quiz" },
  { id: 87, title: "Al-Jameel", meaning: "The Beautiful", quizId: "al_jameel_quiz" },
  { id: 88, title: "Al-Qaabid", meaning: "The Withholder", quizId: "al_qaabid_quiz" },
  { id: 89, title: "Al-Baasit", meaning: "The Expander", quizId: "al_baasit_quiz" },
  { id: 90, title: "Al-Mannaan", meaning: "The Bestower of Favours", quizId: "al_mannaan_quiz" },
  { id: 91, title: "Al-Hayyiy", meaning: "The Modest", quizId: "al_hayyiy_quiz" },
  { id: 92, title: "As-Sitteer", meaning: "The Concealer of faults", quizId: "as_sitteer_quiz" },
  { id: 93, title: "As-Sayyid", meaning: "The Master", quizId: "as_sayyid_quiz" },
  { id: 94, title: "Ar-Rafeeq", meaning: "The Gentle", quizId: "ar_rafeeq_quiz" },
  { id: 95, title: "Al-Witr", meaning: "The One", quizId: "al_witr_quiz" },
  { id: 96, title: "Al-Mutee", meaning: "The Giver", quizId: "al_mutee_quiz" },
  { id: 97, title: "Al-Jawaad", meaning: "The Most Generous Giver", quizId: "al_jawaad_quiz" },
  { id: 98, title: "Al-Haseeb", meaning: "The Reckoner", quizId: "al_haseeb_quiz" },
  { id: 99, title: "Al-Kaafee", meaning: "The Sufficient", quizId: "al_kaafee_quiz" },
  { id: 100, title: "Al-Kafeel", meaning: "The Guarantor", quizId: "al_kafeel_quiz" },
  { id: 101, title: "Al-Waarith", meaning: "The Inheritor", quizId: "al_waarith_quiz" },
  { id: 102, title: "Al-Ghaalib", meaning: "The Victorious", quizId: "al_ghaalib_quiz" },
  { id: 103, title: "Al-Mu'min", meaning: "The Giver of Faith", quizId: "al_mumin_quiz" },
  { id: 104, title: "Dhul-Jalaali wal-Ikraam", meaning: "The Lord of Majesty and Honour", quizId: "dhul_jalaali_wal_ikraam_quiz" },
];

export default namesOfAllahLessons;
