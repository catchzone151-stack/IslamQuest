import { create } from 'zustand';

const MODAL_TYPES = {
  NONE: null,
  REWARD: 'REWARD',
  LEVEL_UP: 'LEVEL_UP',
  PURCHASE: 'PURCHASE',
  PURCHASE_STREAK_FREEZE: 'PURCHASE_STREAK_FREEZE',
  REPAIR_STREAK: 'REPAIR_STREAK',
  EDIT_NAME: 'EDIT_NAME',
  EDIT_AVATAR: 'EDIT_AVATAR',
  VIEW_ALL_LEVELS: 'VIEW_ALL_LEVELS',
  LEVEL_DETAIL: 'LEVEL_DETAIL',
  INVITE_FAMILY: 'INVITE_FAMILY',
  CHALLENGE_EXPLAINER: 'CHALLENGE_EXPLAINER',
  CHALLENGE_COUNTDOWN: 'CHALLENGE_COUNTDOWN',
  CHALLENGE_RESULTS: 'CHALLENGE_RESULTS',
  NO_SHARED_LESSONS: 'NO_SHARED_LESSONS',
  BOSS_LOCKED: 'BOSS_LOCKED',
  EVENT_INFO: 'EVENT_INFO',
  EVENT_COUNTDOWN: 'EVENT_COUNTDOWN',
  EVENT_PROVISIONAL_RESULTS: 'EVENT_PROVISIONAL_RESULTS',
  EVENT_FINAL_RESULTS: 'EVENT_FINAL_RESULTS',
  INSUFFICIENT_COINS: 'INSUFFICIENT_COINS',
  DAILY_QUEST_EXPLAINER: 'DAILY_QUEST_EXPLAINER',
  EXIT_CONFIRMATION: 'EXIT_CONFIRMATION',
};

export const useModalStore = create((set, get) => ({
  activeModal: null,
  modalData: {},
  previousModal: null,

  showModal: (type, data = {}) => {
    const current = get().activeModal;
    set({ 
      activeModal: type,
      modalData: data,
      previousModal: current
    });
  },

  hideModal: () => {
    set({ 
      activeModal: null,
      modalData: {},
      previousModal: null
    });
  },

  replaceModal: (type, data = {}) => {
    set({ 
      activeModal: type,
      modalData: data
    });
  },

  isModalActive: () => {
    return get().activeModal !== null;
  },

  getActiveModal: () => {
    return get().activeModal;
  },

  getModalData: () => {
    return get().modalData;
  }
}));

export { MODAL_TYPES };
