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

      case MODAL_TYPES.RAMADAN_COMING_SOON:
        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={hideModal}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #0a2a43 0%, #000814 100%)',
                border: '2px solid rgba(255, 215, 0, 0.4)',
                borderRadius: '24px',
                padding: '32px 24px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.2)',
                textAlign: 'center',
                animation: 'modalScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Moon Icon */}
              <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🌙</div>

              {/* Title */}
              <h2
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#FFD700',
                  margin: '0 0 12px 0',
                }}
              >
                Ramadan Mode Coming Soon
              </h2>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#e8e8e8',
                  margin: '0 0 24px 0',
                  lineHeight: 1.5,
                }}
              >
                Launching with Global Events, in shā' Allāh ✨
              </p>

              {/* OK Button */}
              <button
                onClick={hideModal}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #b89600 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#000814',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                OK
              </button>
            </div>
          </div>
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
