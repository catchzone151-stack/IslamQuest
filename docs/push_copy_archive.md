# Push Notification Copy Archive

This file contains all push notification copy used in Islam Quest, organized by use case.

**Last Updated:** January 2026

---

## 1. Streak Protection (Daily Reminders)

Sent to users with an active streak (streak > 0) who have NOT opened the app today.

| Variant | Title | Body |
|---------|-------|------|
| 1 | Don't lose your streak! 🔥 | One lesson keeps your streak alive |
| 2 | Your streak is waiting! 🔥 | Complete a quick lesson to keep it going |
| 3 | Keep the fire burning! 🔥 | Your streak needs you today |
| 4 | Streak alert! 🔥 | A quick lesson protects your progress |

**Source:** `supabase/functions/send-daily-notifications/index.ts` (lines 18-23)

---

## 2. Learning Encouragement (Inactive Users)

Sent to users with NO active streak (streak = 0 or NULL) who have NOT opened the app today.

| Variant | Title | Body |
|---------|-------|------|
| 1 | Ready to learn something new? ✨ | Just 10 minutes today can grow your knowledge. |
| 2 | A moment to learn 📖 | Do you have a few minutes to discover something beneficial? |
| 3 | Your learning journey awaits 🌱 | Open a lesson and begin today. |
| 4 | Let's learn together 🤍 | How about learning one of the beautiful Names of Allah today? |

**Source:** `supabase/functions/send-daily-notifications/index.ts` (lines 27-32)

---

## 3. Challenge Notifications

Sent when friend challenges are created or accepted.

### Challenge Received
Sent to the receiver when someone challenges them.

| Title | Body Template |
|-------|---------------|
| New Challenge! ⚔️ | {sender_name} challenged you to {challenge_type}! |

**Fallback:** If challenge_type is empty, uses "a quiz battle"

### Challenge Accepted
Sent to the original sender when their challenge is accepted.

| Title | Body Template |
|-------|---------------|
| Challenge Accepted! 🎮 | {sender_name} accepted your {challenge_type}! |

**Fallback:** If challenge_type is empty, uses "challenge"

**Source:** `supabase/functions/send-challenge-notification/index.ts` (lines 90-97)

---

## 4. Lesson/Path Completion

*No push notifications currently implemented for lesson or path completion.*

---

## 5. Broadcast / Announcement

*No broadcast or announcement notifications currently implemented.*

---

## Spam Prevention Rules

1. **Max 1 notification per user per UTC day** - Tracked via `profiles.last_notification_sent`
2. **Skip users who opened app today** - Checked via `profiles.updated_at`
3. **Challenge notifications are event-driven only** - No reminders or follow-ups
4. **No generic "come back" messages** - All messages are purpose-driven

---

## Database Tables Used

| Table | Column | Purpose |
|-------|--------|---------|
| `push_tokens` | `device_token` | OneSignal subscription ID |
| `push_tokens` | `user_id` | Links token to user |
| `push_tokens` | `platform` | android or ios |
| `profiles` | `last_notification_sent` | Spam prevention timestamp |
| `profiles` | `updated_at` | Last app open timestamp |
| `user_progress` | `streak` | Determines message variant |

---

## Edge Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `send-daily-notifications` | Daily streak/learning reminders | Scheduled (cron) |
| `send-challenge-notification` | Challenge events | On-demand (from app) |
| `register-device` | Device tracking (not notifications) | App startup |
