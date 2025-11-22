import assets from "../assets/assets";
import { useUserStore } from "../store/useUserStore";

// DEV avatar - EXCLUSIVE to "The Dev" NPC in global leaderboard
export const DEV_AVATAR_KEY = "avatar_ninja_male";
export const DEV_USER_ID = "the_dev_npc"; // The Dev NPC's unique ID

// All available avatars EXCEPT the Dev avatar
export const AVAILABLE_AVATARS = [
  "avatar_man_lantern",
  "avatar_man_tasbih",
  "avatar_man_cup",
  "avatar_man_pencil",
  "avatar_man_spoon",
  "avatar_man_soccer",
  "avatar_woman_hijab_book",
  "avatar_woman_hijab_dua",
  "avatar_woman_hijab_tasbih",
  "avatar_woman_hijab_pen",
  "avatar_woman_hijab_studying",
  "avatar_woman_hijab_beads",
  "avatar_woman_niqab",
  "avatar_woman_cartoon",
  "avatar_woman_pixel",
  "avatar_woman_neon",
  "avatar_ninja_female",
  "avatar_dino",
  "avatar_fox",
  "avatar_panda",
  "avatar_rabbit",
  "avatar_robot",
  "avatar_unicorn",
];

// Legacy avatar key mappings (for simulated friends and old data)
const LEGACY_AVATAR_MAP = {
  avatar1: "avatar_man_lantern",
  avatar2: "avatar_woman_hijab_book",
  avatar3: "avatar_man_soccer",
  avatar4: "avatar_woman_hijab_dua",
  avatar5: "avatar_panda",
  avatar6: "avatar_fox",
};

/**
 * Get proper avatar image from any avatar key
 * @param {string} avatarKey - Avatar key (can be legacy like "avatar1" or proper like "avatar_man_lantern")
 * @param {object} options - Options { userId, nickname, isDevCheck }
 * @returns {string} Avatar image path
 */
export function getAvatarImage(avatarKey, options = {}) {
  const { userId, nickname, isDevCheck = true } = options;
  
  // PRIORITY 0: Do not allow fallback/random avatar overrides for the real user
  const { id: currentUserId, avatar: currentUserAvatar } = useUserStore.getState();
  if (avatarKey === currentUserAvatar || userId === currentUserId) {
    return assets.avatars[currentUserAvatar];
  }
  
  // PRIORITY 1: Check if this is the Dev account (The Dev NPC)
  if (isDevCheck && isDevAccount(userId, nickname)) {
    return assets.avatars[DEV_AVATAR_KEY];
  }
  
  // PRIORITY 2: Map legacy avatar keys to proper keys
  let properKey = avatarKey;
  if (avatarKey && LEGACY_AVATAR_MAP[avatarKey]) {
    properKey = LEGACY_AVATAR_MAP[avatarKey];
  }
  
  // PRIORITY 3: STRICT ENFORCEMENT - Prevent ANY non-Dev user from using Dev avatar
  // This ensures avatar_ninja_male is EXCLUSIVE to The Dev NPC only
  if (properKey === DEV_AVATAR_KEY && !isDevAccount(userId, nickname)) {
    // Safety: Assign random avatar instead of allowing Dev avatar for non-Dev users
    properKey = getRandomAvatar();
  }
  
  // PRIORITY 4: Return avatar if it exists
  if (properKey && assets.avatars[properKey]) {
    return assets.avatars[properKey];
  }
  
  // PRIORITY 5: If no valid avatar, assign random avatar (fallback)
  const randomKey = getRandomAvatar();
  return assets.avatars[randomKey];
}

/**
 * Check if a user is the Dev account (The Dev NPC)
 * @param {string} userId - User ID
 * @param {string} nickname - User nickname (unused, kept for API compatibility)
 * @returns {boolean} True if this is The Dev NPC
 */
export function isDevAccount(userId, nickname) {
  // Strict check: Only The Dev NPC (id: "the_dev_npc") gets the Dev avatar
  return userId === DEV_USER_ID;
}

/**
 * Get a random avatar key from available avatars (excluding Dev avatar)
 * @returns {string} Random avatar key
 */
export function getRandomAvatar() {
  const randomIndex = Math.floor(Math.random() * AVAILABLE_AVATARS.length);
  return AVAILABLE_AVATARS[randomIndex];
}

/**
 * Assign avatars to users without proper avatars
 * Used for leaderboards, simulated friends, etc.
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
    
    // Check if Dev
    if (isDevAccount(userId, nickname)) {
      properAvatarKey = DEV_AVATAR_KEY;
    }
    // Map legacy keys
    else if (currentAvatar && LEGACY_AVATAR_MAP[currentAvatar]) {
      properAvatarKey = LEGACY_AVATAR_MAP[currentAvatar];
    }
    // Prevent non-Dev from using Dev avatar
    else if (currentAvatar === DEV_AVATAR_KEY) {
      properAvatarKey = getRandomAvatar();
    }
    // If no avatar or invalid avatar, assign random
    else if (!currentAvatar || !assets.avatars[currentAvatar]) {
      // Use deterministic random based on user index for consistency
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

/**
 * Get avatar keys for simulated friends (6 different avatars)
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
