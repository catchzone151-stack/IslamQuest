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

import ChallengeExplainerModal from './challenges/ChallengeExplainerModal';
import ChallengeCountdown from './challenges/ChallengeCountdown';
import ChallengeResultsModal from './challenges/ChallengeResultsModal';
import NoSharedLessonsModal from './challenges/NoSharedLessonsModal';
import BossLockedModal from './challenges/BossLockedModal';
import BossPlayedTodayModal from './challenges/BossPlayedTodayModal';
import FriendChallengeSentModal from './challenges/FriendChallengeSentModal';
import FriendChallengeReceivedModal from './challenges/FriendChallengeReceivedModal';
import FriendChallengeResultsModal from './challenges/FriendChallengeResultsModal';
import FriendChallengeWaitingModal from './challenges/FriendChallengeWaitingModal';

import EventInfoModal from './events/EventInfoModal';
import CountdownModal from './events/CountdownModal';
import ProvisionalResultsModal from './events/ProvisionalResultsModal';
import FinalResultsModal from './events/FinalResultsModal';
import InsufficientCoinsModal from './events/InsufficientCoinsModal';

import DailyQuestExplainerModal from './dailyquest/DailyQuestExplainerModal';

import ExitConfirmationModal from './ExitConfirmationModal';
import PathCompletedModal from './PathCompletedModal';

import mascotRocket from '../assets/mascots/mascot_countdown.webp';

export default function ModalController() {
  const { activeModal, modalData, hideModal, replaceModal } = useModalStore();

  if (!activeModal) return null;

  const renderModal = () => {
    switch (activeModal) {
      case MODAL_TYPES.CONFIRM:
        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
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
              }}
            >
              <h2
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#FFD700',
                  margin: '0 0 16px 0',
                }}
              >
                {modalData.title || 'Confirm'}
              </h2>

              <p
                style={{
                  fontSize: '1rem',
                  color: '#e8e8e8',
                  margin: '0 0 24px 0',
                  lineHeight: 1.5,
                }}
              >
                {modalData.message || 'Are you sure?'}
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={hideModal}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {modalData.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    hideModal();
                    modalData.onConfirm?.();
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {modalData.confirmText || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        );

      case MODAL_TYPES.SUCCESS:
        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
            onClick={() => {
              hideModal();
              modalData.onClose?.();
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #0a2a43 0%, #000814 100%)',
                border: '2px solid rgba(34, 197, 94, 0.4)',
                borderRadius: '24px',
                padding: '32px 24px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(34, 197, 94, 0.2)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <span style={{ fontSize: '2rem' }}>✓</span>
              </div>

              <p
                style={{
                  fontSize: '1rem',
                  color: '#e8e8e8',
                  margin: '0 0 24px 0',
                  lineHeight: 1.5,
                }}
              >
                {modalData.message || 'Success!'}
              </p>

              <button
                onClick={() => {
                  hideModal();
                  modalData.onClose?.();
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                OK
              </button>
            </div>
          </div>
        );

      case MODAL_TYPES.ERROR:
        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
            onClick={() => {
              hideModal();
              modalData.onClose?.();
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #0a2a43 0%, #000814 100%)',
                border: '2px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '24px',
                padding: '32px 24px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.2)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <span style={{ fontSize: '2rem' }}>✕</span>
              </div>

              <p
                style={{
                  fontSize: '1rem',
                  color: '#e8e8e8',
                  margin: '0 0 24px 0',
                  lineHeight: 1.5,
                }}
              >
                {modalData.message || 'Something went wrong'}
              </p>

              <button
                onClick={() => {
                  hideModal();
                  modalData.onClose?.();
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                OK
              </button>
            </div>
          </div>
        );

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
            currentXP={modalData?.currentXP ?? 0}
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

      case MODAL_TYPES.BOSS_PLAYED_TODAY:
        return (
          <BossPlayedTodayModal
            onClose={hideModal}
          />
        );

      case MODAL_TYPES.FRIEND_CHALLENGE_SENT:
        return (
          <FriendChallengeSentModal
            friendName={modalData.friendName}
            modeId={modalData.modeId}
            onClose={() => {
              hideModal();
              modalData.onClose?.();
            }}
          />
        );

      case MODAL_TYPES.FRIEND_CHALLENGE_RECEIVED:
        return (
          <FriendChallengeReceivedModal
            challenge={modalData.challenge}
            senderName={modalData.senderName}
            senderAvatar={modalData.senderAvatar}
            onAccept={() => {
              modalData.onAccept?.();
            }}
            onDecline={() => {
              modalData.onDecline?.();
            }}
            onClose={() => {
              hideModal();
              modalData.onClose?.();
            }}
          />
        );

      case MODAL_TYPES.FRIEND_CHALLENGE_RESULTS:
        return (
          <FriendChallengeResultsModal
            challenge={modalData.challenge}
            currentUserId={modalData.currentUserId}
            userScore={modalData.userScore}
            opponentInfo={modalData.opponentInfo}
            onChallengeAgain={(modeId) => {
              hideModal();
              modalData.onChallengeAgain?.(modeId);
            }}
            onClose={() => {
              hideModal();
              modalData.onClose?.();
            }}
          />
        );

      case MODAL_TYPES.FRIEND_CHALLENGE_WAITING:
        return (
          <FriendChallengeWaitingModal
            friendName={modalData.friendName}
            modeId={modalData.modeId}
            score={modalData.score}
            totalQuestions={modalData.totalQuestions}
            onClose={() => {
              hideModal();
              modalData.onClose?.();
            }}
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

      case MODAL_TYPES.PATH_COMPLETED:
        return (
          <PathCompletedModal
            pathTitle={modalData.pathTitle}
            onClose={hideModal}
          />
        );

      case MODAL_TYPES.EID_COMING_SOON:
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
              <img 
                src={mascotRocket} 
                alt="Rocket" 
                style={{ 
                  width: '80px', 
                  height: 'auto', 
                  marginBottom: '16px',
                  filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.5))'
                }} 
              />

              <h2
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#FFD700',
                  margin: '0 0 12px 0',
                }}
              >
                Launching Eid 2026!
              </h2>

              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#e8e8e8',
                  margin: '0 0 24px 0',
                  lineHeight: 1.5,
                }}
              >
                Coming soon with Global Events, in shā' Allāh
              </p>

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
