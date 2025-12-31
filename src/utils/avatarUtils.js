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
 * Get proper avatar image from any avatar key
 * Handles hidden ninja avatars, user selection, and fallbacks
 * @param {string} avatarKey - Avatar key (can be legacy or proper key)
 * @param {object} options - Options { userId, nickname, isDevCheck }
 * @returns {string} Avatar image path
 */
export function getAvatarImage(avatarKey, options = {}) {
  const { userId, nickname, isDevCheck = true } = options;
  
  // PRIORITY 0: FORCE current user to always use their selected avatar from store
  // This ensures the store is the single source of truth for the logged-in user
  const { id: currentUserId, avatar: currentUserAvatar } = useUserStore.getState();
  if (userId === currentUserId) {
    // Current user must have their selected avatar, always
    if (currentUserAvatar && assets.avatars[currentUserAvatar]) {
      return assets.avatars[currentUserAvatar];
    }
    // Fallback: return a valid default if no avatar is set
    return assets.avatars[AVAILABLE_AVATARS[0]];
  }
  
  // PRIORITY 1: Check if this is The Dev (gets male ninja)
  if (isDevCheck && isDevAccount(userId, nickname)) {
    return assets.avatars[NINJA_MALE_KEY];
  }
  
  // PRIORITY 2: Check if this is the special user (gets female ninja)
  // This will automatically work when SPECIAL_USER_ID is set via Supabase
  if (isDevCheck && isSpecialUser(userId, nickname)) {
    return assets.avatars[NINJA_FEMALE_KEY];
  }
  
  // PRIORITY 3: Map legacy avatar keys to proper keys
  let properKey = avatarKey;
  if (avatarKey && LEGACY_AVATAR_MAP[avatarKey]) {
    properKey = LEGACY_AVATAR_MAP[avatarKey];
  }
  
  // PRIORITY 4: HIDDEN NINJA PROTECTION
  // If avatar is a hidden ninja but user is NOT authorized, assign fallback
  if (isHiddenNinjaAvatar(properKey)) {
    const isAuthorizedForNinja = 
      (properKey === NINJA_MALE_KEY && isDevAccount(userId, nickname)) ||
      (properKey === NINJA_FEMALE_KEY && isSpecialUser(userId, nickname));
    
    if (!isAuthorizedForNinja) {
      // Unauthorized user trying to use ninja avatar - assign deterministic fallback
      properKey = getRandomAvatar(userId);
    }
  }
  
  // PRIORITY 5: Return avatar if it exists in assets
  if (properKey && assets.avatars[properKey]) {
    return assets.avatars[properKey];
  }
  
  // PRIORITY 6: Final fallback - assign deterministic avatar
  const deterministicKey = getRandomAvatar(userId);
  return assets.avatars[deterministicKey];
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
// ═══════════════════════════════════════════════════════════════════

// Complete list of ALL avatars including hidden ninjas (for DB mapping)
// Uses HISTORICAL_AVATARS to maintain stable indices for existing DB records
// Plus new numbered avatars for new user selections
export const ALL_AVATARS = [
  ...HISTORICAL_AVATARS,
  NINJA_MALE_KEY,
  NINJA_FEMALE_KEY,
  // New numbered avatar keys (these map to same files as historical for DB purposes)
  ...SELECTABLE_AVATARS,
];

/**
 * Convert avatar string key to integer index for Supabase storage
 * Normalizes legacy keys and removed avatar keys before lookup
 * @param {string} avatarKey - Avatar key like "avatar_woman_crown"
 * @returns {number} Integer index (defaults to 0 if not found after normalization)
 */
export function avatarKeyToIndex(avatarKey) {
  if (!avatarKey) {
    console.warn("[avatarKeyToIndex] No avatar key provided, defaulting to index 0");
    return 0;
  }
  
  // Normalize the key - check legacy mappings first
  let normalizedKey = avatarKey;
  if (LEGACY_AVATAR_MAP[avatarKey]) {
    normalizedKey = LEGACY_AVATAR_MAP[avatarKey];
    console.log(`[avatarKeyToIndex] Normalized legacy key ${avatarKey} → ${normalizedKey}`);
  }
  
  // Try to find in ALL_AVATARS
  let index = ALL_AVATARS.indexOf(normalizedKey);
  
  // If still not found, try stripping any path or extension (for asset URLs)
  if (index < 0 && normalizedKey.includes("/")) {
    const keyFromPath = normalizedKey.split("/").pop()?.replace(/\.(webp|png|jpg)$/i, "");
    if (keyFromPath) {
      index = ALL_AVATARS.indexOf(keyFromPath);
      if (index >= 0) {
        console.log(`[avatarKeyToIndex] Extracted key from path: ${keyFromPath}`);
      }
    }
  }
  
  if (index < 0) {
    console.warn(`[avatarKeyToIndex] Unknown avatar key "${avatarKey}", defaulting to index 0`);
    return 0;
  }
  
  return index;
}

/**
 * Convert integer index from Supabase to avatar string key
 * @param {number} index - Integer index from database
 * @returns {string|null} Avatar key or null if invalid index
 */
export function avatarIndexToKey(index) {
  if (index === null || index === undefined || index < 0 || index >= ALL_AVATARS.length) {
    return null;
  }
  return ALL_AVATARS[index];
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
