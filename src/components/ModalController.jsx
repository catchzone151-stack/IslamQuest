import React from 'react';
import { useModalStore, MODAL_TYPES } from '../store/modalStore';

import RewardModal from './quiz/RewardModal';
import { ZaydLevelUpPopup } from './ZaydLevelUpPopup';
import PurchaseModal from './PurchaseModal';
import PurchaseStreakFreezeModal from './PurchaseStreakFreezeModal';
import RepairStreakModal from './RepairStreakModal';
import EditNameInput from './EditNameInput';
import EditAvatarModal from './EditAvatarModal';
import { ViewAllLevelsModal } from './ViewAllLevelsModal';
import LevelDetailModal from './LevelDetailModal';
import InviteFamilyMemberModal from './InviteFamilyMemberModal';
import ClearCacheModal from './ClearCacheModal';

import ChallengeExplainerModal from './challenges/ChallengeExplainerModal';
import ChallengeCountdown from './challenges/ChallengeCountdown';
import ChallengeResultsModal from './challenges/ChallengeResultsModal';
import NoSharedLessonsModal from './challenges/NoSharedLessonsModal';
import BossLockedModal from './challenges/BossLockedModal';

import EventInfoModal from './events/EventInfoModal';
import CountdownModal from './events/CountdownModal';
import ProvisionalResultsModal from './events/ProvisionalResultsModal';
import FinalResultsModal from './events/FinalResultsModal';
import InsufficientCoinsModal from './events/InsufficientCoinsModal';

import DailyQuestExplainerModal from './dailyquest/DailyQuestExplainerModal';

import ExitConfirmationModal from './ExitConfirmationModal';

export default function ModalController() {
  const { activeModal, modalData, hideModal, replaceModal } = useModalStore();

  if (!activeModal) return null;

  const renderModal = () => {
    switch (activeModal) {
      case MODAL_TYPES.REWARD:
        return (
          <RewardModal
            score={modalData.score}
            totalQ={modalData.totalQ}
            xp={modalData.xp || 0}
            coins={modalData.coins || 0}
            passed={modalData.passed}
            mascotImg={modalData.mascotImg}
            onRetry={() => {
              hideModal();
              modalData.onRetry?.();
            }}
            onContinue={() => {
              hideModal();
              modalData.onContinue?.();
            }}
          />
        );

      case MODAL_TYPES.LEVEL_UP:
        return (
          <ZaydLevelUpPopup
            levelUpData={modalData.levelUpData}
            onClose={() => {
              hideModal();
              modalData.onClose?.();
            }}
          />
        );

      case MODAL_TYPES.PURCHASE:
        return (
          <PurchaseModal
            onClose={() => {
              hideModal();
              modalData.onClose?.();
            }}
          />
        );

      case MODAL_TYPES.PURCHASE_STREAK_FREEZE:
        return (
          <PurchaseStreakFreezeModal
            onClose={() => {
              hideModal();
              modalData.onClose?.();
            }}
            onPurchase={(amount) => {
              modalData.onPurchase?.(amount);
              hideModal();
            }}
          />
        );

      case MODAL_TYPES.REPAIR_STREAK:
        return (
          <RepairStreakModal
            onClose={() => {
              hideModal();
              modalData.onClose?.();
            }}
            onRepair={() => {
              modalData.onRepair?.();
              hideModal();
            }}
          />
        );

      case MODAL_TYPES.EDIT_NAME:
        return (
          <EditNameInput
            isOpen={true}
            initialName={modalData.initialName || ''}
            onSave={(name) => {
              modalData.onSave?.(name);
              hideModal();
            }}
            onClose={hideModal}
          />
        );

      case MODAL_TYPES.EDIT_AVATAR:
        return (
          <EditAvatarModal
            isOpen={true}
            currentAvatar={modalData.currentAvatar}
            onSave={(avatar) => {
              modalData.onSave?.(avatar);
              hideModal();
            }}
            onClose={hideModal}
          />
        );

      case MODAL_TYPES.VIEW_ALL_LEVELS:
        return (
          <ViewAllLevelsModal
            isOpen={true}
            onClose={hideModal}
          />
        );

      case MODAL_TYPES.LEVEL_DETAIL:
        return (
          <LevelDetailModal
            isOpen={true}
            onClose={hideModal}
          />
        );

      case MODAL_TYPES.INVITE_FAMILY:
        return (
          <InviteFamilyMemberModal
            isOpen={true}
            onClose={hideModal}
          />
        );

      case MODAL_TYPES.CHALLENGE_EXPLAINER:
        return (
          <ChallengeExplainerModal
            mode={modalData.mode}
            onStart={() => {
              hideModal();
              modalData.onStart?.();
            }}
            onCancel={() => {
              hideModal();
              modalData.onCancel?.();
            }}
          />
        );

      case MODAL_TYPES.CHALLENGE_COUNTDOWN:
        return (
          <ChallengeCountdown
            onComplete={() => {
              hideModal();
              modalData.onComplete?.();
            }}
          />
        );

      case MODAL_TYPES.CHALLENGE_RESULTS:
        return (
          <ChallengeResultsModal
            mode={modalData.mode}
            score={modalData.score}
            totalQuestions={modalData.totalQuestions}
            result={modalData.result}
            rewards={modalData.rewards}
            opponentName={modalData.opponentName}
            opponentScore={modalData.opponentScore}
            onClose={() => {
              hideModal();
              modalData.onClose?.();
            }}
          />
        );

      case MODAL_TYPES.NO_SHARED_LESSONS:
        return (
          <NoSharedLessonsModal
            friendName={modalData.friendName}
            onClose={hideModal}
          />
        );

      case MODAL_TYPES.BOSS_LOCKED:
        return (
          <BossLockedModal
            currentLevel={modalData.currentLevel}
            onClose={hideModal}
          />
        );

      case MODAL_TYPES.EVENT_INFO:
        return (
          <EventInfoModal
            event={modalData.event}
            onStart={() => {
              hideModal();
              modalData.onStart?.();
            }}
            onCancel={() => {
              hideModal();
              modalData.onCancel?.();
            }}
          />
        );

      case MODAL_TYPES.EVENT_COUNTDOWN:
        return (
          <CountdownModal
            onComplete={() => {
              hideModal();
              modalData.onComplete?.();
            }}
          />
        );

      case MODAL_TYPES.EVENT_PROVISIONAL_RESULTS:
        return (
          <ProvisionalResultsModal
            event={modalData.event}
            score={modalData.score}
            totalQuestions={modalData.totalQuestions}
            onClose={() => {
              hideModal();
              modalData.onClose?.();
            }}
          />
        );

      case MODAL_TYPES.EVENT_FINAL_RESULTS:
        return (
          <FinalResultsModal
            event={modalData.event}
            entry={modalData.entry}
            onClose={() => {
              hideModal();
              modalData.onClose?.();
            }}
          />
        );

      case MODAL_TYPES.INSUFFICIENT_COINS:
        return (
          <InsufficientCoinsModal
            onClose={hideModal}
          />
        );

      case MODAL_TYPES.DAILY_QUEST_EXPLAINER:
        return (
          <DailyQuestExplainerModal
            onClose={hideModal}
            onStart={() => {
              hideModal();
              modalData.onStart?.();
            }}
          />
        );

      case MODAL_TYPES.EXIT_CONFIRMATION:
        return (
          <ExitConfirmationModal
            onCancel={hideModal}
            onConfirm={() => {
              hideModal();
              modalData.onConfirm?.();
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div key={activeModal} style={{ position: 'relative', zIndex: 9999 }}>
      {renderModal()}
    </div>
  );
}
