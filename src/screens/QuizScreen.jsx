// ✅ FINAL CLEAN QUIZSCREEN.JSX
// XP, Coins, Certificates intact
// All badge references removed
// No UI/theme/layout changes

import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createQuiz,
  getCurrentQuestion,
  answerCurrent,
  next,
  getResults,
  buildProgressPayload,
} from "../engine/quizEngine.js";

import { useProgressStore } from "../store/progressStore.js";

import mascotDefault from "../assets/mascots/mascot_zayd_default.webp";
import mascotCheer from "../assets/mascots/mascot_zayd_cheer.webp";
import mascotThinking from "../assets/mascots/mascot_zayd_thinking.webp";
import mascotTrophy from "../assets/mascots/mascot_zayd_trophy.webp";

const GOLD = "#fbbf24";
const NAVY = "#0b1220";
const SLATE = "#0f172a";

const LESSON_MAP = {};
const congratsLines = [
  "MashaAllah! Perfect score 🎉",
  "Alhamdulillah — you nailed it!",
  "Excellent! A complete score 🌟",
  "Well done! 4/4 — keep going!",
];

export default function QuizScreen() {
  const navigate = useNavigate();
  const { pathId, lessonId = "0" } = useParams();
  const lessonKey = String(lessonId);
  const questions = LESSON_MAP[lessonKey] || [];

  const applyQuizResults = useProgressStore((s) => s.applyQuizResults);
  const earnCertificate = useProgressStore((s) => s.earnCertificate);

  // Quiz init
  const quizRef = useRef(null);
  const [, force] = useState(0);
  if (!quizRef.current) {
    quizRef.current = createQuiz({
      questions,
      shuffleQuestions: true,
      shuffleAnswers: true,
      timePerQuestionSec: null,
      passMark: 1.0,
    });
  }

  const state = quizRef.current;
  const q = getCurrentQuestion(state);
  const finished = state.finished;

  // Results
  const liveResults = finished ? getResults(state) : null;
  const livePayload = finished ? buildProgressPayload(state) : null;

  const didCelebrate = useRef(false);
  const [frozenResults, setFrozenResults] = useState(null);
  const [frozenPayload, setFrozenPayload] = useState(null);
  const [showRewards, setShowRewards] = useState(false);
  const [congrats, setCongrats] = useState(congratsLines[0]);

  // Celebration & certificate trigger
  useEffect(() => {
    if (finished && liveResults?.passed && !didCelebrate.current) {
      const picked =
        congratsLines[Math.floor(Math.random() * congratsLines.length)];
      setCongrats(picked);

      setFrozenResults(liveResults);
      setFrozenPayload(livePayload);

      // Apply XP / Coins only (badges removed)
      applyQuizResults(livePayload, pathId, lessonKey, 6);

      // Auto award certificate on final lesson
      if (lessonKey === "5") {
        earnCertificate(pathId, "Completed: " + pathId);
      }

      setShowRewards(true);
      didCelebrate.current = true;
    }
  }, [finished, liveResults?.passed]);

  const results = frozenResults || liveResults;
  const payload = frozenPayload || livePayload;

  // Answer / next
  const onAnswer = (i) => {
    if (finished || !q) return;
    answerCurrent(state, i);
    force((x) => x + 1);
  };

  const onNext = () => {
    next(state);
    force((x) => x + 1);
  };

  // Reset
  const onRetry = () => {
    quizRef.current = createQuiz({
      questions,
      shuffleQuestions: true,
      shuffleAnswers: true,
      timePerQuestionSec: null,
      passMark: 1.0,
    });
    didCelebrate.current = false;
    setShowRewards(false);
    setFrozenResults(null);
    setFrozenPayload(null);
    setCongrats(congratsLines[0]);
    force((x) => x + 1);
  };

  const nextLessonId = getNextLessonId(lessonKey);

  return (
    <div style={page}>
      <header style={header}>
        <h1 style={title}>Quiz</h1>
        <img
          src={
            !finished
              ? mascotThinking
              : results?.passed
              ? mascotCheer
              : mascotDefault
          }
          alt="Zayd"
          style={mascot}
        />
      </header>

      {/* === Quiz UI === */}
      {!finished && q && (
        <div style={card}>
          <div style={topRow}>
            <span>
              Question {state.index + 1} / {state.total}
            </span>
            <span>Correct: {state.correctCount}</span>
          </div>

          <h2 style={question}>{q.prompt}</h2>

          {q.options.map((opt, i) => {
            const chosen = state.userAnswers[state.index] === i;
            const already = state.userAnswers[state.index] !== -1;
            const isCorrect = already && i === q.correctIndex;
            const wrongChosen = already && chosen && !isCorrect;

            return (
              <button
                key={i}
                onClick={() => onAnswer(i)}
                disabled={already}
                style={{
                  ...btn,
                  ...(chosen ? btnPrimary : {}),
                  ...(isCorrect ? btnSuccess : {}),
                  ...(wrongChosen ? btnDanger : {}),
                  marginBottom: 10,
                  textAlign: "left",
                }}
              >
                {opt}
              </button>
            );
          })}

          {state.userAnswers[state.index] !== -1 && (
            <div style={{ marginTop: 12 }}>
              {state.userAnswers[state.index] === q.correctIndex ? (
                <p style={{ color: "#22c55e" }}>Correct — well done!</p>
              ) : (
                <p style={{ color: "#f87171" }}>
                  Correct answer:{" "}
                  <strong>{q.options[q.correctIndex]}</strong>
                </p>
              )}

              {q.explanation && (
                <p style={{ marginTop: 6 }}>{q.explanation}</p>
              )}

              <div style={{ textAlign: "right", marginTop: 10 }}>
                <button onClick={onNext} style={{ ...btn, ...btnPrimary }}>
                  {state.index < state.total - 1 ? "Next" : "Finish"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === Rewards Modal === */}
      {showRewards && results?.passed && (
        <div style={modalWrap}>
          <div style={modalCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={mascotTrophy} style={{ width: 56 }} alt="Trophy" />
              <div>
                <h3 style={{ color: GOLD }}>{congrats}</h3>
                <p>Rewards earned:</p>
              </div>
            </div>

            <div style={rewardBox}>
              <div style={rewardItem}>
                XP: <strong>{payload?.xp || 0}</strong>
              </div>
              <div style={rewardItem}>
                Coins: <strong>{payload?.coins || 0}</strong>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 14,
              }}
            >
              <button
                onClick={() => setShowRewards(false)}
                style={btn}
              >
                Stay here
              </button>

              {lessonKey === "5" ? (
                <button
                  onClick={() => navigate(`/path/${pathId}/certificate`)}
                  style={{ ...btn, ...btnPrimary }}
                >
                  View Certificate
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowRewards(false);
                    if (nextLessonId)
                      navigate(`/path/${pathId}/lesson/${nextLessonId}`);
                    else navigate(`/path/${pathId}`);
                  }}
                  style={{ ...btn, ...btnPrimary }}
                >
                  Next lesson
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Retry Button if Failed */}
      {finished && !results?.passed && (
        <button onClick={onRetry} style={{ ...btn, marginTop: 10 }}>
          Retry this quiz
        </button>
      )}
    </div>
  );
}

function getNextLessonId(current) {
  const n = parseInt(current, 10);
  return n < 5 ? String(n + 1) : null;
}

/************* STYLES *************/
const page = {
  maxWidth: 820,
  margin: "24px auto",
  padding: 16,
  color: "white",
};
const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};
const title = { fontSize: 26, margin: 0 };
const mascot = {
  width: 72,
  height: 72,
  objectFit: "contain",
  filter: "drop-shadow(0 0 12px rgba(251,191,36,.35))",
};
const card = {
  background: SLATE,
  border: `1px solid ${GOLD}`,
  borderRadius: 16,
  padding: 18,
  marginBottom: 16,
};
const topRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 8,
};
const question = { fontSize: 20, margin: "8px 0 12px" };
const btn = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: `2px solid ${GOLD}`,
  background: "rgba(11,18,32,0.85)",
  color: "#fff",
  cursor: "pointer",
  boxShadow: `inset 0 0 0 2px rgba(251,191,36,.9)`,
};
const btnPrimary = {
  background: `linear-gradient(180deg, ${GOLD}, #b45309)`,
};
const btnSuccess = {
  background: "linear-gradient(180deg, #22c55e, #15803d)",
};
const btnDanger = {
  background: "linear-gradient(180deg, #ef4444, #991b1b)",
};
const modalWrap = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
};
const modalCard = {
  background: NAVY,
  border: `1px solid ${GOLD}`,
  borderRadius: 16,
  padding: 18,
  width: "min(640px, 92vw)",
  color: "white",
};
const rewardBox = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 10,
  marginTop: 8,
};
const rewardItem = {
  background: SLATE,
  border: `1px solid rgba(251,191,36,.35)`,
  borderRadius: 12,
  padding: "10px 12px",
};
