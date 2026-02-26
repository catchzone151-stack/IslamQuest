import assets from "../assets/assets";
import { useUserStore } from "../store/useUserStore";

// ═══════════════════════════════════════════════════════════════════
// 🥷 HIDDEN NINJA AVATAR SYSTEM
// ═══════════════════════════════════════════════════════════════════
// These avatars are NEVER shown in the UI selection screen.
// They can only be assigned internally or via Supabase dashboard.
// Regular users cannot access, select, or change these avatars.
// ═══════════════════════════════════════════════════════════════════

// Male Ninja - Reserved for "The Dev" NPC
export const NINJA_MALE_KEY = "avatar_ninja_male";
export const DEV_AVATAR_KEY = NINJA_MALE_KEY; // Alias for backward compatibility
export const DEV_USER_ID = "the_dev_permanent"; // The Dev NPC's unique ID (matches leaderboard)

// Female Ninja - Reserved for special user (to be assigned via Supabase)
export const NINJA_FEMALE_KEY = "avatar_ninja_female";
export const SPECIAL_USER_ID = null; // Will be set after Supabase integration

// All hidden ninja avatars (excluded from user selection)
export const HIDDEN_NINJA_AVATARS = [NINJA_MALE_KEY, NINJA_FEMALE_KEY];

// ═══════════════════════════════════════════════════════════════════
// 👥 AVAILABLE AVATARS (User Selection Only)
// ═══════════════════════════════════════════════════════════════════
// Ordered: Male avatars → Female avatars → Other avatars
// EXCLUDES all ninja avatars (they are hidden)
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// HISTORICAL AVATAR ORDER - DO NOT MODIFY!
// This array maintains the exact original ordering for DB index mapping.
// Existing users have avatar indices stored that depend on this order.
// ═══════════════════════════════════════════════════════════════════
export const HISTORICAL_AVATARS = [
  // Male avatars (9 total)
  "avatar_man_lantern",      // 0
  "avatar_man_tasbih",       // 1
  "avatar_man_cup",          // 2
  "avatar_man_spoon",        // 3
  "avatar_man_soccer",       // 4
  "avatar_man_sunglasses",   // 5
  "avatar_man_construction", // 6
  "avatar_man_thumbsup",     // 7
  "avatar_man_scholar",      // 8
  // Women avatars - cartoon/neon/pixel styles (3 total)
  "avatar_woman_cartoon",    // 9
  "avatar_woman_pixel",      // 10
  "avatar_woman_neon",       // 11
  // Female avatars - hijab/traditional styles (13 total)
  "avatar_woman_hijab_book",     // 12
  "avatar_woman_hijab_dua",      // 13
  "avatar_woman_hijab_tasbih",   // 14
  "avatar_woman_hijab_studying", // 15
  "avatar_woman_hijab_beads",    // 16
  "avatar_woman_niqab",          // 17 - HIDDEN from selection
  "avatar_woman_crown",          // 18
  "avatar_woman_cooking",        // 19
  "avatar_woman_elder_cane",     // 20
  "avatar_woman_hawa",           // 21
  "avatar_woman_hijab_pink",     // 22
  "avatar_woman_hijab_tan",      // 23
  "avatar_woman_hijab_purse",    // 24
  // Other avatars (6 total)
  "avatar_dino",             // 25
  "avatar_fox",              // 26
  "avatar_panda",            // 27 - HIDDEN from selection
  "avatar_rabbit",           // 28
  "avatar_robot",            // 29
  "avatar_unicorn",          // 30
];

// Avatars hidden from user selection (but still valid in DB)
export const HIDDEN_AVATARS = ["avatar_panda"];

// ═══════════════════════════════════════════════════════════════════
// 🎯 SELECTABLE AVATARS - Exactly 23 avatars shown in UI (1-23.webp)
// ═══════════════════════════════════════════════════════════════════
export const SELECTABLE_AVATARS = [
  "avatar_1",   // 1.webp
  "avatar_2",   // 2.webp
  "avatar_3",   // 3.webp
  "avatar_4",   // 4.webp
  "avatar_5",   // 5.webp
  "avatar_6",   // 6.webp
  "avatar_7",   // 7.webp
  "avatar_8",   // 8.webp
  "avatar_9",   // 9.webp
  "avatar_10",  // 10.webp
  "avatar_11",  // 11.webp
  "avatar_12",  // 12.webp
  "avatar_13",  // 13.webp
  "avatar_14",  // 14.webp
  "avatar_15",  // 15.webp
  "avatar_16",  // 16.webp
  "avatar_17",  // 17.webp
  "avatar_18",  // 18.webp (cartoon)
  "avatar_19",  // 19.webp (unicorn)
  "avatar_20",  // 20.webp (robot)
  "avatar_21",  // 21.webp (rabbit)
  "avatar_22",  // 22.webp (fox)
  "avatar_23",  // 23.webp (dino)
];

// AVAILABLE_AVATARS = what users can select in UI (excludes hidden avatars)
// Legacy: kept for backward compatibility with existing code
export const AVAILABLE_AVATARS = SELECTABLE_AVATARS;

// Legacy avatar key mappings (for simulated friends and old data)
const LEGACY_AVATAR_MAP = {
  avatar1: "avatar_man_lantern",
  avatar2: "avatar_woman_hijab_book",
  avatar3: "avatar_man_soccer",
  avatar4: "avatar_woman_hijab_dua",
  avatar5: "avatar_fox",
  avatar6: "avatar_rabbit",
  // Map removed avatars to safe alternatives
  avatar_panda: "avatar_fox",
  avatar_woman_niqab: "avatar_woman_hijab_book",
};

// ═══════════════════════════════════════════════════════════════════
// 🔐 SPECIAL USER DETECTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Check if a user is The Dev account (gets male ninja)
 * @param {string} userId - User ID
 * @param {string} nickname - User nickname (unused, kept for API compatibility)
 * @returns {boolean} True if this is The Dev NPC
 */
export function isDevAccount(userId, nickname) {
  return userId === DEV_USER_ID;
}

/**
 * Check if a user is the special user (gets female ninja)
 * This will be activated after Supabase integration
 * @param {string} userId - User ID
 * @param {string} nickname - User nickname (unused, kept for future)
 * @returns {boolean} True if this is the special user
 */
export function isSpecialUser(userId, nickname) {
  // Will be activated when SPECIAL_USER_ID is set via Supabase
  if (!SPECIAL_USER_ID) return false;
  return userId === SPECIAL_USER_ID;
}

/**
 * Check if an avatar key is a hidden ninja avatar
 * @param {string} avatarKey - Avatar key to check
 * @returns {boolean} True if this is a hidden ninja avatar
 */
export function isHiddenNinjaAvatar(avatarKey) {
  return HIDDEN_NINJA_AVATARS.includes(avatarKey);
}

// ═══════════════════════════════════════════════════════════════════
// 🎭 AVATAR IMAGE RETRIEVAL
// ═══════════════════════════════════════════════════════════════════

/**
 * Resolve any avatar input (numeric DB index or string key) to an image src.
 * Pure function — no store dependency. Safe for all non-current-user contexts
 * (friend cards, leaderboards, request cards, challenge cards, etc.).
 *
 * Special avatar keys (index 31 = ninja_male, index 32 = ninja_female) are
 * displayed as-is when a user legitimately holds them — they are NOT stripped.
 *
 * @param {number|string} avatarInput - Numeric DB index or string avatar key
 * @param {object} options - { userId, nickname }
 * @returns {string} Image path
 */
export function resolveAvatar(avatarInput, { userId, nickname } = {}) {
  // 1. Identity overrides — Dev always gets ninja male, special user gets ninja female
  if (userId) {
    if (isDevAccount(userId, nickname)) return assets.avatars[NINJA_MALE_KEY];
    if (isSpecialUser(userId, nickname)) return assets.avatars[NINJA_FEMALE_KEY];
  }

  // 2. Convert numeric DB index (number or numeric string) to string key
  //    Handles both integer columns (typeof === "number") and text columns ("32")
  let key;
  if (typeof avatarInput === "number") {
    key = avatarIndexToKey(avatarInput);
  } else if (typeof avatarInput === "string" && avatarInput !== "" && !isNaN(+avatarInput)) {
    key = avatarIndexToKey(+avatarInput);
  } else {
    key = avatarInput;
  }

  // 3. Map legacy string keys to current keys
  if (key && LEGACY_AVATAR_MAP[key]) key = LEGACY_AVATAR_MAP[key];

  // 4. Return image — special keys are trusted here, no stripping
  if (key && assets.avatars[key]) return assets.avatars[key];

  // 5. Deterministic fallback
  return assets.avatars[getRandomAvatar(userId)];
}

/**
 * Get avatar image for any user, with current-user store override.
 * Use resolveAvatar() for all non-current-user rendering instead.
 * @param {string|number} avatarKey - Avatar key or DB index
 * @param {object} options - { userId, nickname }
 * @returns {string} Image path
 */
export function getAvatarImage(avatarKey, options = {}) {
  const { userId, nickname } = options;

  // Current user → always read from Zustand store for instant local updates
  const { id: currentUserId, avatar: currentUserAvatar } = useUserStore.getState();
  if (userId === currentUserId) {
    if (currentUserAvatar && assets.avatars[currentUserAvatar]) return assets.avatars[currentUserAvatar];
    return assets.avatars[AVAILABLE_AVATARS[0]];
  }

  return resolveAvatar(avatarKey, { userId, nickname });
}

// ═══════════════════════════════════════════════════════════════════
// 🎲 DETERMINISTIC AVATAR ASSIGNMENT
// ═══════════════════════════════════════════════════════════════════

/**
 * Get a deterministic avatar key based on userId (NOT random!)
 * Uses userId as seed to ensure same user always gets same avatar
 * Only returns avatars from AVAILABLE_AVATARS (excludes hidden ninjas)
 * @param {string} userId - User ID to use as seed
 * @returns {string} Deterministic avatar key
 */
export function getRandomAvatar(userId = null) {
  if (!userId) {
    // Fallback: return first avatar if no userId provided
    return AVAILABLE_AVATARS[0];
  }
  
  // Create deterministic seed from userId
  let seed = 0;
  for (let i = 0; i < userId.length; i++) {
    seed += userId.charCodeAt(i);
  }
  
  // Use seed to get consistent avatar index
  // Only from AVAILABLE_AVATARS (excludes hidden ninjas)
  const avatarIndex = seed % AVAILABLE_AVATARS.length;
  return AVAILABLE_AVATARS[avatarIndex];
}

// ═══════════════════════════════════════════════════════════════════
// 👥 USER AVATAR ASSIGNMENT (Leaderboards & Lists)
// ═══════════════════════════════════════════════════════════════════

/**
 * Assign avatars to users without proper avatars
 * Used for leaderboards, simulated friends, etc.
 * Handles hidden ninja avatars and special user detection
 * @param {Array} users - Array of user objects with avatar property
 * @param {object} options - Options { userIdKey, nicknameKey, avatarKey }
 * @returns {Array} Users with proper avatars assigned
 */
export function assignAvatarsToUsers(users, options = {}) {
  const {
    userIdKey = "userId",
    nicknameKey = "nickname",
    avatarKey = "avatar",
  } = options;
  
  return users.map((user, index) => {
    const userId = user[userIdKey];
    const nickname = user[nicknameKey];
    const currentAvatar = user[avatarKey];
    
    // Get proper avatar image key
    let properAvatarKey = currentAvatar;
    
    // Check if The Dev (gets male ninja)
    if (isDevAccount(userId, nickname)) {
      properAvatarKey = NINJA_MALE_KEY;
    }
    // Check if special user (gets female ninja)
    else if (isSpecialUser(userId, nickname)) {
      properAvatarKey = NINJA_FEMALE_KEY;
    }
    // Map legacy keys
    else if (currentAvatar && LEGACY_AVATAR_MAP[currentAvatar]) {
      properAvatarKey = LEGACY_AVATAR_MAP[currentAvatar];
    }
    // Prevent unauthorized users from using hidden ninja avatars
    else if (isHiddenNinjaAvatar(currentAvatar)) {
      properAvatarKey = getRandomAvatar(userId);
    }
    // If no avatar or invalid avatar, assign deterministic fallback
    else if (!currentAvatar || !assets.avatars[currentAvatar]) {
      // Use deterministic assignment based on user index for consistency
      const seed = userId ? userId.length + index : index;
      const avatarIndex = seed % AVAILABLE_AVATARS.length;
      properAvatarKey = AVAILABLE_AVATARS[avatarIndex];
    }
    
    return {
      ...user,
      [avatarKey]: properAvatarKey,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════
// 🔢 AVATAR INDEX MAPPING (For Supabase integer column)
// ═══════════════════════════════════════════════════════════════════
// Supabase stores avatar as integer. These functions convert between
// string keys (used in app) and integer indices (stored in DB).
// 
// INDEX MAPPING:
// - Index 0: Default fallback (avatar_1)
// - Index 1-23: avatar_1 through avatar_23 (new numbered avatars)
// - Index 31: ninja_male (hidden, reserved for The Dev)
// - Index 32: ninja_female (hidden, reserved for special user)
// ═══════════════════════════════════════════════════════════════════

// Direct index-to-key mapping for clean Supabase storage
const INDEX_TO_KEY_MAP = {
  0: "avatar_1",  // Default fallback
  1: "avatar_1",
  2: "avatar_2",
  3: "avatar_3",
  4: "avatar_4",
  5: "avatar_5",
  6: "avatar_6",
  7: "avatar_7",
  8: "avatar_8",
  9: "avatar_9",
  10: "avatar_10",
  11: "avatar_11",
  12: "avatar_12",
  13: "avatar_13",
  14: "avatar_14",
  15: "avatar_15",
  16: "avatar_16",
  17: "avatar_17",
  18: "avatar_18",
  19: "avatar_19",
  20: "avatar_20",
  21: "avatar_21",
  22: "avatar_22",
  23: "avatar_23",
  31: NINJA_MALE_KEY,   // Hidden ninja male
  32: NINJA_FEMALE_KEY, // Hidden ninja female
};

// Reverse mapping: key to index
const KEY_TO_INDEX_MAP = {
  "avatar_1": 1,
  "avatar_2": 2,
  "avatar_3": 3,
  "avatar_4": 4,
  "avatar_5": 5,
  "avatar_6": 6,
  "avatar_7": 7,
  "avatar_8": 8,
  "avatar_9": 9,
  "avatar_10": 10,
  "avatar_11": 11,
  "avatar_12": 12,
  "avatar_13": 13,
  "avatar_14": 14,
  "avatar_15": 15,
  "avatar_16": 16,
  "avatar_17": 17,
  "avatar_18": 18,
  "avatar_19": 19,
  "avatar_20": 20,
  "avatar_21": 21,
  "avatar_22": 22,
  "avatar_23": 23,
  [NINJA_MALE_KEY]: 31,
  [NINJA_FEMALE_KEY]: 32,
};

// Legacy mapping: old historical avatar keys to new avatar indices
const LEGACY_KEY_TO_INDEX = {
  "avatar_man_lantern": 1,
  "avatar_man_tasbih": 2,
  "avatar_man_cup": 3,
  "avatar_man_spoon": 4,
  "avatar_man_soccer": 5,
  "avatar_man_sunglasses": 6,
  "avatar_man_construction": 7,
  "avatar_man_thumbsup": 8,
  "avatar_man_scholar": 9,
  "avatar_woman_cartoon": 10,
  "avatar_woman_pixel": 11,
  "avatar_woman_neon": 12,
  "avatar_woman_hijab_book": 13,
  "avatar_woman_hijab_dua": 14,
  "avatar_woman_hijab_tasbih": 15,
  "avatar_woman_hijab_studying": 16,
  "avatar_woman_hijab_beads": 17,
  "avatar_woman_crown": 18,
  "avatar_woman_cooking": 19,
  "avatar_woman_elder_cane": 20,
  "avatar_woman_hawa": 21,
  "avatar_woman_hijab_pink": 22,
  "avatar_woman_hijab_tan": 23,
  "avatar_woman_hijab_purse": 1,
  "avatar_dino": 1,
  "avatar_fox": 1,
  "avatar_panda": 1,
  "avatar_rabbit": 1,
  "avatar_robot": 1,
  "avatar_unicorn": 1,
  "avatar_woman_niqab": 1,
};

// For backward compatibility with code that uses ALL_AVATARS
export const ALL_AVATARS = [
  "avatar_1", // index 0 (fallback)
  ...SELECTABLE_AVATARS, // indices 1-23
];

/**
 * Convert avatar string key to integer index for Supabase storage
 * @param {string} avatarKey - Avatar key like "avatar_1" or "avatar_ninja_male"
 * @returns {number} Integer index (1-23 for regular, 31-32 for ninja, defaults to 1)
 */
export function avatarKeyToIndex(avatarKey) {
  if (!avatarKey) {
    console.warn("[avatarKeyToIndex] No avatar key provided, defaulting to index 1");
    return 1;
  }
  
  // Check direct mapping first (new keys)
  if (KEY_TO_INDEX_MAP[avatarKey] !== undefined) {
    return KEY_TO_INDEX_MAP[avatarKey];
  }
  
  // Check legacy mapping (old historical keys)
  if (LEGACY_KEY_TO_INDEX[avatarKey] !== undefined) {
    console.log(`[avatarKeyToIndex] Mapped legacy key ${avatarKey} → index ${LEGACY_KEY_TO_INDEX[avatarKey]}`);
    return LEGACY_KEY_TO_INDEX[avatarKey];
  }
  
  // Check old-style legacy keys (avatar1, avatar2, etc.)
  if (LEGACY_AVATAR_MAP[avatarKey]) {
    const mappedKey = LEGACY_AVATAR_MAP[avatarKey];
    if (LEGACY_KEY_TO_INDEX[mappedKey] !== undefined) {
      return LEGACY_KEY_TO_INDEX[mappedKey];
    }
  }
  
  console.warn(`[avatarKeyToIndex] Unknown avatar key "${avatarKey}", defaulting to index 1`);
  return 1;
}

/**
 * Convert integer index from Supabase to avatar string key
 * @param {number} index - Integer index from database (1-23 or 31-32)
 * @returns {string|null} Avatar key or null if invalid index
 */
export function avatarIndexToKey(index) {
  if (index === null || index === undefined) {
    return "avatar_1";
  }
  
  // Check direct mapping
  if (INDEX_TO_KEY_MAP[index] !== undefined) {
    return INDEX_TO_KEY_MAP[index];
  }
  
  // Invalid index - return default
  console.warn(`[avatarIndexToKey] Unknown index ${index}, defaulting to avatar_1`);
  return "avatar_1";
}

// ═══════════════════════════════════════════════════════════════════
// 🧪 SIMULATED FRIENDS (For Testing)
// ═══════════════════════════════════════════════════════════════════

/**
 * Get avatar keys for simulated friends (6 different avatars)
 * Only returns non-hidden avatars
 * @returns {Array<string>} Array of 6 avatar keys
 */
export function getSimulatedFriendsAvatars() {
  return [
    "avatar_man_cup",
    "avatar_woman_hijab_pen",
    "avatar_fox",
    "avatar_woman_hijab_studying",
    "avatar_robot",
    "avatar_woman_hijab_tasbih",
  ];
}
