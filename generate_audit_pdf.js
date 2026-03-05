const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50, size: 'A4' });
const out = fs.createWriteStream('/home/runner/workspace/IslamQuest_XP_Audit.pdf');
doc.pipe(out);

const DARK   = '#1a1a2e';
const BLUE   = '#1565C0';
const GREEN  = '#2E7D32';
const ORANGE = '#E65100';
const GREY   = '#555555';
const LIGHT  = '#f5f5f5';

// ── helpers ──────────────────────────────────────────────────────────────────
function header(text) {
  doc.moveDown(0.6)
     .font('Helvetica-Bold').fontSize(13).fillColor(BLUE)
     .text(text)
     .moveDown(0.3)
     .moveTo(doc.page.margins.left, doc.y)
     .lineTo(doc.page.width - doc.page.margins.right, doc.y)
     .strokeColor(BLUE).lineWidth(0.5).stroke()
     .moveDown(0.4);
}

function sub(text) {
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(DARK).text(text).moveDown(0.15);
}

function body(text) {
  doc.font('Helvetica').fontSize(9.5).fillColor(GREY).text(text, { lineGap: 2 }).moveDown(0.25);
}

function code(text) {
  doc.font('Courier').fontSize(8.5).fillColor('#333333')
     .text(text, { lineGap: 1 }).moveDown(0.25);
}

function pill(label, value, color) {
  doc.font('Helvetica-Bold').fontSize(9).fillColor(color || GREEN).text(`${label}  `, { continued: true })
     .font('Helvetica').fillColor(GREY).text(value).moveDown(0.1);
}

function table(headers, rows) {
  const colW = (doc.page.width - 100) / headers.length;
  const startX = doc.page.margins.left;
  let y = doc.y;

  // header row
  doc.rect(startX, y, doc.page.width - 100, 16).fill('#ddeeff');
  headers.forEach((h, i) => {
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(DARK)
       .text(h, startX + i * colW + 4, y + 4, { width: colW - 6 });
  });
  y += 16;

  // data rows
  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? '#ffffff' : '#f8f9fc';
    doc.rect(startX, y, doc.page.width - 100, 16).fill(bg);
    row.forEach((cell, i) => {
      doc.font('Helvetica').fontSize(8.5).fillColor(DARK)
         .text(String(cell), startX + i * colW + 4, y + 4, { width: colW - 6 });
    });
    y += 16;
  });

  doc.y = y + 6;
  doc.moveDown(0.4);
}

// ── TITLE PAGE ───────────────────────────────────────────────────────────────
doc.rect(0, 0, doc.page.width, 120).fill(BLUE);
doc.font('Helvetica-Bold').fontSize(22).fillColor('#ffffff')
   .text('IslamQuest', 50, 35)
   .fontSize(14).text('XP Sources — Full Read-Only Audit', 50, 65)
   .font('Helvetica').fontSize(9).fillColor('#cce0ff')
   .text(`Generated ${new Date().toDateString()}`, 50, 95);
doc.moveDown(3);

// ── OVERVIEW ─────────────────────────────────────────────────────────────────
header('Overview');
body('This document records every location in the IslamQuest codebase where XP or coins are awarded or modified. No code was changed. The audit covers all Zustand store mutations, Supabase writes, and the XP cap / multiplier system.');

// ── 1. LESSON QUIZ ────────────────────────────────────────────────────────────
header('1.  Lesson Quiz Completion');
pill('File', 'src/data/quizEngine.js  →  src/screens/QuizScreen.jsx');
pill('Trigger', 'User finishes a lesson quiz with a passing score (≥ 75% correct)');
sub('XP Formula  (calculateResults)');
code(
`XP = (correct × 20)  +  (40 if passed ≥ 75%)  +  (20 if perfect score)
Coins = (correct × 5)  +  (10 if passed)`
);
sub('Example awards');
table(
  ['Scenario', 'Correct / Total', 'XP', 'Coins'],
  [
    ['Min pass  (5-Q quiz)', '4 / 5', '120', '30'],
    ['Perfect   (5-Q quiz)', '5 / 5', '160', '35'],
    ['Failed    (< 75%)',     '—',    '0',   '0'],
  ]
);
body('XP is only awarded when passed === true. The guard is inside progressStore.applyQuizResults() — XP flows through addXP(), not written directly to Supabase.');

// ── 2. DAILY QUEST ────────────────────────────────────────────────────────────
header('2.  Daily Quest Completion');
pill('File', 'src/store/dailyQuestStore.js  (line 240)');
pill('Trigger', 'User completes all daily quest questions');
code(
`const xp    = 60;
const coins = 20;
useProgressStore.getState().addXPAndCoins(xp, coins);`
);
body('Flat reward — 60 XP and 20 coins. Limited to once per calendar day by the quest completion guard.');

// ── 3. SOLO CHALLENGE / BOSS LEVEL ───────────────────────────────────────────
header('3.  Solo Challenge / Boss Level');
pill('File', 'src/store/challengeStore.js  (reward table: lines 34–81,  award call: line 872)');
pill('Trigger', 'User finishes a solo challenge or the daily Boss Level round');
sub('Reward table by mode and result');
table(
  ['Mode', 'Win', 'Lose', 'Draw'],
  [
    ['Standard Quiz',  '100 XP / 20 coins', '20 XP',  '50 XP'],
    ['Speed Round',    '150 XP / 25 coins', '25 XP',  '—'],
    ['Survival',       '120 XP / 20 coins', '20 XP',  '50 XP'],
    ['Elimination',    '200 XP / 30 coins', '0 XP',   '100 XP / 15 coins'],
    ['Boss Level',     '500 XP / 100 coins','50 XP',  '—'],
  ]
);
code(
`// challengeStore.js line 872
const { addXPAndCoins } = useProgressStore.getState();
addXPAndCoins(rewards.xp, rewards.coins);`
);

// ── 4. FRIEND CHALLENGE ───────────────────────────────────────────────────────
header('4.  Friend Challenge');
pill('File', 'src/components/challenges/FriendChallengeResultsModal.jsx  (lines 39, 54)');
pill('Trigger', 'User views the result modal after a live friend challenge');
code(
`if (rewards.xp > 0)    addXP(rewards.xp);
if (rewards.coins > 0) addCoins(rewards.coins);`
);
body('Reward amounts are identical to the Solo Challenge table above. Resolved via friendChallengesStore.getRewardForResult() which references the same mode configs.');

// ── 5. GLOBAL EVENT ───────────────────────────────────────────────────────────
header('5.  Global Event — Final Results (rank-based)');
pill('File', 'src/store/eventsStore.js  (lines 439, 538)  +  src/components/events/FinalResultsModal.jsx  (line 53)');
pill('Trigger', "User claims rewards after a weekly Global Event concludes");
sub('computeRewardsForRank()');
table(
  ['Rank', 'XP', 'Coins'],
  [
    ['1st place',    '1 000', '300'],
    ['2nd – 3rd',   '750',   '200'],
    ['4th – 10th',  '500',   '100'],
    ['11th+',       '100',   '10'],
  ]
);
body('Two code paths: claimRewards() (line 439) for final results and grantRewardsForEvent() (line 538) for provisional results. Both are guarded by a resultsViewed[eventId] flag to prevent double-granting.');

// ── 6. REVISION – REVIEW MISTAKES ─────────────────────────────────────────────
header('6.  Revision — Review Mistakes Mode');
pill('File', 'src/pages/Revise.jsx  (lines 191–197)');
pill('Trigger', 'User completes a Review Mistakes revision session');
code(
`const xpPerCorrect = 4;
const xpEarned    = correctCount * xpPerCorrect;
const bonusXP     = correctCount === totalQuestions ? 10 : 0;
const totalXP     = xpEarned + bonusXP;
addXPAndCoins(totalXP, 0);   // No coins awarded`
);
body('XP only, no coins. Bonus 10 XP for a perfect revision run.');

// ── 7. REVISION – SMART REVISION ──────────────────────────────────────────────
header('7.  Revision — Smart Revision Mode');
pill('File', 'src/pages/Revise.jsx  (lines 215–217)');
pill('Trigger', 'User completes a Smart Revision session');
code(
`const xp    = 25;
const coins = 10;
addXPAndCoins(xp, coins);`
);
body('Flat reward — 25 XP and 10 coins per Smart Revision session.');

// ── 8. STREAK MILESTONES ──────────────────────────────────────────────────────
header('8.  Streak Milestones  (Coins only — no XP)');
pill('File', 'src/store/progressStore.js  (lines 22–26, triggered via markDayComplete)');
pill('Trigger', "User's daily streak counter hits a milestone day");
table(
  ['Streak Day', 'Coins Awarded'],
  [['5 days',  '50'], ['10 days', '120'], ['30 days', '400'], ['100 days', '1 500']]
);
body('Milestone coins are added to the store AND written directly to profiles.coins in Supabase in the same operation (line 420) — they do not wait for the periodic sync.');

// ── XP MULTIPLIER ─────────────────────────────────────────────────────────────
header('XP Multiplier  (applies to all sources above)');
pill('File', 'src/store/progressStore.js  (lines 667, 681–682)');
code(
`const bonus = Math.round((amount * xpMultiplier) / 100);
const total = amount + bonus;`
);
body('xpMultiplier is a percentage stored in Zustand state (default 0). When non-zero, every addXP call receives the percentage on top of the base amount. The setter is at line 662.');

// ── UNVERIFIED USER CAP ───────────────────────────────────────────────────────
header('Unverified User XP Cap');
pill('File', 'src/store/progressStore.js  (lines 673–685)');
body('If email_confirmed_at is absent (unverified account) and the store XP is already ≥ 1 000, addXP() is a no-op and the verify-email modal fires. The cap is hard-coded at 1 000 XP. Once verified, no cap applies.');

// ── SUPABASE WRITE SUMMARY ────────────────────────────────────────────────────
doc.addPage();
header('Direct Supabase profiles.xp Writes');
table(
  ['Location', 'When triggered'],
  [
    ['progressStore.js → syncToSupabase()',         '50 ms after every addXP() or addCoins() call'],
    ['sync/profileSync.js → pushProfileToCloud()',  'Periodic background sync (throttled)'],
    ['progressStore.js line ~420',                  'Streak milestone — writes coins only, immediately'],
  ]
);
body('No feature component writes XP directly to Supabase. All XP mutations go through progressStore.addXP(), which accumulates the value in the Zustand store and schedules a syncToSupabase() call 50 ms later. Supabase is the final store — it is updated every time XP changes.');

// ── FULL SUMMARY TABLE ────────────────────────────────────────────────────────
header('Full Summary');
table(
  ['#', 'Source', 'XP', 'Coins', 'Guarded by'],
  [
    ['1', 'Lesson quiz',          '20×correct+40+20',  '5×correct+10',  'Pass ≥ 75%'],
    ['2', 'Daily Quest',          '60 flat',            '20 flat',       'Once per day'],
    ['3', 'Solo Challenge/Boss',  '20 – 500 by mode',  '0 – 100',       'Result-based'],
    ['4', 'Friend Challenge',     '20 – 500 by mode',  '0 – 100',       'Result-based'],
    ['5', 'Global Event',         '100 – 1 000 rank',  '10 – 300',      'resultsViewed flag'],
    ['6', 'Revise — Mistakes',    '4×correct+10',      '0',             'Session-scoped'],
    ['7', 'Revise — Smart',       '25 flat',            '10 flat',       'Session-scoped'],
    ['8', 'Streak milestone',     '0',                  '50 – 1 500',   'Milestone days only'],
  ]
);

// ── FOOTER ────────────────────────────────────────────────────────────────────
doc.moveDown(1)
   .font('Helvetica').fontSize(8).fillColor('#aaaaaa')
   .text('IslamQuest — Confidential — Read-only audit. No code was modified.', { align: 'center' });

doc.end();
out.on('finish', () => console.log('PDF written.'));
