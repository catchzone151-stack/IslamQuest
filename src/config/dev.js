const getStoredDevMode = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('iq_dev_mode') === 'true';
  }
  return false;
};

export let DEV_MODE = getStoredDevMode();

export const setDevMode = (value) => {
  DEV_MODE = value;
  if (typeof window !== 'undefined') {
    window.DEV_MODE = value;
    window.localStorage.setItem('iq_dev_mode', value ? 'true' : 'false');
  }
  console.log(`🔧 Dev Mode ${value ? 'ENABLED' : 'DISABLED'}`);
};

export const isDevMode = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('iq_dev_mode') === 'true';
  }
  return DEV_MODE;
};

export const DEV_MOCK_FRIENDS = [
  {
    odolena_user_id: 'dev_friend_1',
    odolena_nickname: 'Ahmad (Test)',
    odolena_avatar: 'avatar_man_beard',
    odolena_xp: 1250,
    odolena_streak: 7,
    odolena_level: 5,
    status: 'accepted'
  },
  {
    odolena_user_id: 'dev_friend_2',
    odolena_nickname: 'Fatimah (Test)',
    odolena_avatar: 'avatar_woman_hijab',
    odolena_xp: 2100,
    odolena_streak: 14,
    odolena_level: 8,
    status: 'accepted'
  },
  {
    odolena_user_id: 'dev_friend_3',
    odolena_nickname: 'Yusuf (Test)',
    odolena_avatar: 'avatar_man_cap',
    odolena_xp: 890,
    odolena_streak: 3,
    odolena_level: 3,
    status: 'accepted'
  }
];

export const DEV_MOCK_EVENT_LEADERBOARD = [
  { userId: 'dev_player_1', nickname: 'Abdullah', avatar: 'avatar_man_beard', score: 10, completionTime: 45 },
  { userId: 'dev_player_2', nickname: 'Maryam', avatar: 'avatar_woman_hijab', score: 9, completionTime: 52 },
  { userId: 'dev_player_3', nickname: 'Ibrahim', avatar: 'avatar_man_cap', score: 9, completionTime: 58 },
  { userId: 'dev_player_4', nickname: 'Khadijah', avatar: 'avatar_woman_cartoon', score: 8, completionTime: 42 },
  { userId: 'dev_player_5', nickname: 'Bilal', avatar: 'avatar_man_glasses', score: 8, completionTime: 55 },
  { userId: 'dev_player_6', nickname: 'Aisha', avatar: 'avatar_woman_glasses', score: 7, completionTime: 48 },
  { userId: 'dev_player_7', nickname: 'Zakariya', avatar: 'avatar_boy_cap', score: 7, completionTime: 60 },
  { userId: 'dev_player_8', nickname: 'Hafsa', avatar: 'avatar_girl_hijab', score: 6, completionTime: 40 },
  { userId: 'dev_player_9', nickname: 'Umar', avatar: 'avatar_man_beard', score: 6, completionTime: 55 },
  { userId: 'dev_player_10', nickname: 'Salma', avatar: 'avatar_woman_hijab', score: 5, completionTime: 50 }
];

export const initDevCommands = (progressStore) => {
  if (typeof window === 'undefined') return;
  
  window.dev = {
    setXP: (amount) => {
      progressStore.getState().setXP(amount);
      console.log(`✅ XP set to ${amount}`);
    },
    setLevel: (level) => {
      const xpThresholds = [0, 250, 750, 1500, 3500, 7000, 14000, 25000, 40000, 51000];
      const xp = xpThresholds[level - 1] || 0;
      progressStore.getState().setXP(xp);
      console.log(`✅ Level set to ${level} (XP: ${xp})`);
    },
    setCoins: (amount) => {
      progressStore.getState().setCoins(amount);
      console.log(`✅ Coins set to ${amount}`);
    },
    setPremium: (value = true) => {
      if (value) {
        progressStore.getState().purchaseIndividual();
        console.log('✅ Premium enabled');
      }
    },
    getStats: () => {
      const state = progressStore.getState();
      console.log({
        xp: state.xp,
        coins: state.coins,
        streak: state.streak,
        premium: state.premium,
        level: state.level
      });
    },
    help: () => {
      console.log(`
🔧 Dev Commands:
  dev.setXP(25000)     - Set XP to specific amount
  dev.setLevel(8)      - Set level (auto-calculates XP)
  dev.setCoins(1000)   - Set coins
  dev.setPremium()     - Enable premium
  dev.getStats()       - View current stats
      `);
    }
  };
  
  console.log('🔧 Dev commands loaded. Type dev.help() for options.');
};
