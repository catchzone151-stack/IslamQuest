# 🎭 Modal Architecture - IslamQuest

## Overview
IslamQuest now features a unified modal architecture with global state management, smooth animations, and optimized rendering for mobile devices.

---

## 📁 File Structure

```
src/
├── providers/
│   └── ModalProvider.jsx          # Global modal provider with animations
├── components/
│   ├── ModalController.jsx         # Existing modal router (kept for compatibility)
│   └── ShimmerLoader.jsx           # Skeleton loading components
└── store/
    └── modalStore.js               # Zustand store for modal state
```

---

## 🎯 Key Features

### 1. **Global Modal Provider**
- Centralized modal state management via React Context
- Supports both inline and portal rendering
- Automatic animation handling

### 2. **Smooth Animations**
- **Duolingo-style fade + scale**: `opacity: 0→1` and `scale: 0.93→1.0`
- Optimized for 60fps on low-end Android devices
- GPU-accelerated with `transform` and `opacity` only

### 3. **Rendering Strategy**
- **Light modals**: Rendered inline (EditName, EditAvatar)
- **Heavy modals**: Rendered via portal (Reward, LevelUp, Purchase)
- Automatic DOM portal creation at `<div id="modal-root" />`

### 4. **Loading UX**
- Shimmer skeleton loaders for page transitions
- Contextual loading states (header, cards, images)
- Smooth 2s shimmer animation

---

## 🚀 Usage Guide

### Using the Modal Provider (New API)

```jsx
import { useModal } from '../providers/ModalProvider';

function MyComponent() {
  const { openModal, closeModal } = useModal();

  const handleShowModal = () => {
    openModal(
      'success',           // type
      MyModalComponent,    // component
      { message: 'Done!' }, // data
      false,               // usePortal (false = inline, true = portal)
      () => console.log('Modal closed') // onClose callback
    );
  };

  return <button onClick={handleShowModal}>Show Modal</button>;
}
```

### Using the Existing System (Legacy API)

```jsx
import { useModalStore, MODAL_TYPES } from '../store/modalStore';

function MyComponent() {
  const { showModal, hideModal } = useModalStore();

  const handleShowReward = () => {
    showModal(MODAL_TYPES.REWARD, {
      xp: 100,
      coins: 20,
      mascotImg: zaydCheerMascot,
      onContinue: () => {
        hideModal();
        navigate('/');
      }
    });
  };

  return <button onClick={handleShowReward}>Show Reward</button>;
}
```

---

## 🎨 Shimmer Loader Components

### Basic Shimmer
```jsx
import { ShimmerLoader } from '../components/ShimmerLoader';

<ShimmerLoader width="100%" height="20px" borderRadius="8px" />
```

### Shimmer Card
```jsx
import { ShimmerCard } from '../components/ShimmerLoader';

<ShimmerCard style={{ marginBottom: '16px' }} />
```

### Shimmer Image
```jsx
import { ShimmerImage } from '../components/ShimmerLoader';

<ShimmerImage width="80px" height="80px" borderRadius="50%" />
```

---

## 📊 Modal Types Reference

### Current Modal Types (21 total)
- `REWARD` - Quiz completion rewards
- `LEVEL_UP` - Diamond level progression
- `PURCHASE` - Premium plan upgrades
- `PURCHASE_STREAK_FREEZE` - Streak freeze shields
- `REPAIR_STREAK` - Broken streak recovery
- `EDIT_NAME` - User name editing
- `EDIT_AVATAR` - Avatar selection
- `VIEW_ALL_LEVELS` - Diamond levels overview
- `LEVEL_DETAIL` - Individual level details
- `INVITE_FAMILY` - Family plan invites
- `CHALLENGE_EXPLAINER` - Challenge rules
- `CHALLENGE_COUNTDOWN` - 3-2-1 countdown
- `CHALLENGE_RESULTS` - Challenge outcomes
- `NO_SHARED_LESSONS` - Error: no shared lessons
- `BOSS_LOCKED` - Boss level requirements
- `EVENT_INFO` - Global event details
- `EVENT_COUNTDOWN` - Event quiz countdown
- `EVENT_PROVISIONAL_RESULTS` - Provisional rankings
- `EVENT_FINAL_RESULTS` - Final event rankings
- `INSUFFICIENT_COINS` - Error: not enough coins
- `DAILY_QUEST_EXPLAINER` - Daily quest rules

---

## 🎭 Animation CSS Classes

### Overlay Animations
- `.modal-overlay-enter` - Fade in (0.2s)
- `.modal-overlay-exit` - Fade out (0.2s)

### Content Animations
- `.modal-content-enter` - Scale in (0.25s cubic-bezier)
- `.modal-content-exit` - Scale out (0.2s)

---

## 🏗️ Architecture Decisions

### Why Both Systems Coexist?

1. **Backward Compatibility**: Existing `ModalController` kept to avoid breaking changes
2. **Gradual Migration**: New modals can use `ModalProvider` API
3. **Flexibility**: Developers choose inline vs. portal rendering
4. **Safety**: No rewrites, no removals, incremental improvements

### Portal vs. Inline Rendering

**Use Portal (`usePortal: true`) for:**
- Heavy modals with complex animations (RewardModal, ZaydLevelUpPopup)
- Modals that need highest z-index (PurchaseModal)
- Modals with complex layouts (FinalResultsModal)

**Use Inline (`usePortal: false`) for:**
- Simple modals (EditName, EditAvatar)
- Quick interactions (confirmation dialogs)
- Lightweight UI (info modals)

---

## 🔧 Performance Optimizations

### GPU Acceleration
- All animations use `transform` and `opacity` only
- Avoid `width`, `height`, `margin`, `padding` in animations
- 60fps guaranteed on low-end devices

### Code Splitting
- Modal components lazy-loaded where possible
- Routes split with `React.lazy()` and `Suspense`
- Shimmer loaders reduce perceived load time

### Rendering Strategy
- Portal modals rendered outside main DOM tree
- Inline modals rendered in component tree
- Automatic cleanup on unmount

---

## 📝 Best Practices

### 1. **Always Use ShimmerLoader for Loading States**
```jsx
// ✅ Good - Contextual loading
<Suspense fallback={<ShimmerCard />}>
  <MyComponent />
</Suspense>

// ❌ Bad - Generic spinner
<Suspense fallback={<Spinner />}>
  <MyComponent />
</Suspense>
```

### 2. **Choose Right Modal Type**
```jsx
// ✅ Good - Heavy modal via portal
openModal('reward', RewardModal, data, true);

// ✅ Good - Light modal inline
openModal('info', InfoModal, data, false);
```

### 3. **Keep Existing Zayd Animations**
```jsx
// ✅ Good - Preserve mascot animations
<img src={mascotZaydCheer} className="challenge-zayd-bounce" />

// ❌ Bad - Remove animations
<img src={mascotZaydCheer} />
```

---

## 🚦 Migration Path (Future)

### Phase 1: Foundation (✅ Complete)
- [x] Create ModalProvider
- [x] Create ShimmerLoader
- [x] Add fade+scale animations
- [x] Integrate into App.jsx

### Phase 2: Cleanup (Optional)
- [ ] Migrate modals to new API gradually
- [ ] Remove unused modal code
- [ ] Consolidate CSS into modal themes

### Phase 3: Enhancement (Future)
- [ ] Add modal stacking support
- [ ] Add custom animation presets
- [ ] Add accessibility features (focus trap, ARIA)

---

## 🎓 Examples

### Example 1: Success Modal
```jsx
import { useModal } from '../providers/ModalProvider';
import SuccessModal from '../components/modals/SuccessModal';

const handleSuccess = () => {
  openModal(
    'success',
    SuccessModal,
    { 
      title: 'Mashaa Allah!',
      message: 'Lesson completed!',
      xp: 100
    },
    false, // inline rendering
    () => navigate('/')
  );
};
```

### Example 2: Heavy Reward Modal
```jsx
import { useModalStore, MODAL_TYPES } from '../store/modalStore';

const handleQuizComplete = () => {
  showModal(MODAL_TYPES.REWARD, {
    score: 8,
    totalQ: 10,
    xp: 100,
    coins: 20,
    passed: true,
    mascotImg: assets.mascots.mascot_zayd_cheer,
    onContinue: () => {
      hideModal();
      navigate('/');
    }
  });
};
```

---

## 🛡️ Safety Guarantees

- ✅ **No breaking changes** - All existing modals work
- ✅ **No code removal** - Old system intact
- ✅ **No theme changes** - Navy + Gold preserved
- ✅ **No Zayd changes** - Mascot animations kept
- ✅ **No logic changes** - XP/coins/streaks untouched

---

## 📞 Support

For questions or issues with the modal system:
1. Check existing modal implementations in `/src/components`
2. Review `ModalController.jsx` for modal routing
3. Test with `<ShimmerCard />` for loading states

---

**Built with safety and performance in mind** 🌙
**MashaAllah, may Allah bless this work** ✨
