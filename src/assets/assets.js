// src/assets/assets.js

// ============ MASCOTS ============
// Using only the "1 Mascot" culturally authentic Islamic mascots
import mascot_boss from "./mascots/mascot_boss.webp";
import mascot_congratulation from "./mascots/mascot_congratulation.webp";
import mascot_welldone from "./mascots/mascot_welldone.webp";
import mascot_sitting_v2 from "./mascots/mascot_sitting_v2.webp";
import mascot_onboarding from "./mascots/mascot_onboarding.webp";
import mascot_pointing from "./mascots/mascot_pointing.webp";
import mascot_running from "./mascots/mascot_running.webp";
import mascot_sitting from "./mascots/mascot_sitting.webp";
import mascot_waving from "./mascots/mascot_waving.webp";
import mascot_defeated from "./mascots/mascot_defeated.webp";

// Additional mascot variants
import mascot_pointing_v2 from "./mascots/mascot_pointing_v2.webp";
import mascot_quiz from "./mascots/mascot_quiz.webp";
import mascot_locked from "./mascots/mascot_locked.webp";
import mascot_power from "./mascots/mascot_power.webp";
import mascot_countdown from "./mascots/mascot_countdown.webp";
import mascot_streak_freeze from "./mascots/mascot_streak_freeze.webp";

// ============ AVATARS ============
// New numbered avatars (1-17 are new uploads, 18-23 are remapped existing)
import avatar_1 from "./avatars/1.webp";
import avatar_2 from "./avatars/2.webp";
import avatar_3 from "./avatars/3.webp";
import avatar_4 from "./avatars/4.webp";
import avatar_5 from "./avatars/5.webp";
import avatar_6 from "./avatars/6.webp";
import avatar_7 from "./avatars/7.webp";
import avatar_8 from "./avatars/8.webp";
import avatar_9 from "./avatars/9.webp";
import avatar_10 from "./avatars/10.webp";
import avatar_11 from "./avatars/11.webp";
import avatar_12 from "./avatars/12.webp";
import avatar_13 from "./avatars/13.webp";
import avatar_14 from "./avatars/14.webp";
import avatar_15 from "./avatars/15.webp";
import avatar_16 from "./avatars/16.webp";
import avatar_17 from "./avatars/17.webp";
import avatar_18 from "./avatars/18.webp";
import avatar_19 from "./avatars/19.webp";
import avatar_20 from "./avatars/20.webp";
import avatar_21 from "./avatars/21.webp";
import avatar_22 from "./avatars/22.webp";
import avatar_23 from "./avatars/23.webp";

// Ninja avatars (kept exactly as-is)
import avatar_ninja_male from "./avatars/avatar_ninja_male.png.webp";
import avatar_ninja_female from "./avatars/avatar_ninja_female.png.webp";

// ============ UI ============
import ui_coin from "./ui/ui_coin.webp";
import ui_shield from "./ui/ui_shield.webp";
import ui_streak from "./ui/ui_streak.webp";
import ui_xp from "./ui/ui_xp.webp";

// ============ EXPORT ============
const assets = {
  mascots: {
    mascot_boss,
    mascot_congratulation,
    mascot_welldone,
    mascot_sitting_v2,
    mascot_onboarding,
    mascot_pointing,
    mascot_running,
    mascot_sitting,
    mascot_waving,
    mascot_defeated,
    mascot_pointing_v2,
    mascot_quiz,
    mascot_locked,
    mascot_power,
    mascot_countdown,
    mascot_streak_freeze,
  },
  avatars: {
    // New numbered avatars (1-23) for UI selection
    avatar_1,
    avatar_2,
    avatar_3,
    avatar_4,
    avatar_5,
    avatar_6,
    avatar_7,
    avatar_8,
    avatar_9,
    avatar_10,
    avatar_11,
    avatar_12,
    avatar_13,
    avatar_14,
    avatar_15,
    avatar_16,
    avatar_17,
    avatar_18,
    avatar_19,
    avatar_20,
    avatar_21,
    avatar_22,
    avatar_23,
    // Ninja avatars (hidden from selection)
    avatar_ninja_male,
    avatar_ninja_female,
    // Legacy key mappings for existing users
    avatar_man_lantern: avatar_1,
    avatar_man_tasbih: avatar_2,
    avatar_man_cup: avatar_3,
    avatar_man_spoon: avatar_4,
    avatar_man_soccer: avatar_5,
    avatar_man_sunglasses: avatar_6,
    avatar_man_construction: avatar_7,
    avatar_man_thumbsup: avatar_8,
    avatar_man_scholar: avatar_9,
    avatar_woman_hijab_book: avatar_10,
    avatar_woman_hijab_dua: avatar_11,
    avatar_woman_hijab_tasbih: avatar_12,
    avatar_woman_hijab_studying: avatar_13,
    avatar_woman_hijab_beads: avatar_14,
    avatar_woman_niqab: avatar_15,
    avatar_woman_pixel: avatar_16,
    avatar_woman_neon: avatar_17,
    avatar_woman_cartoon: avatar_18,
    avatar_woman_crown: avatar_12,
    avatar_woman_cooking: avatar_12,
    avatar_woman_elder_cane: avatar_8,
    avatar_woman_hawa: avatar_15,
    avatar_woman_hijab_pink: avatar_13,
    avatar_woman_hijab_tan: avatar_9,
    avatar_woman_hijab_purse: avatar_10,
    avatar_unicorn: avatar_19,
    avatar_robot: avatar_20,
    avatar_rabbit: avatar_21,
    avatar_fox: avatar_22,
    avatar_dino: avatar_23,
    avatar_panda: avatar_22,
  },
  ui: {
    ui_coin,
    ui_shield,
    ui_streak,
    ui_xp,
  },
};

export default assets;
