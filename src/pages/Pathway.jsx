// src/pages/Pathway.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pathways } from "../data/paths.js";
import zaydGuide from "../assets/mascots/mascot_zayd_reading.webp";

export default function Pathway() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pathData = pathways.find((p) => p.id === id);

  const [progress] = useState(0); // 🔹 We'll hook this up later to Supabase

  if (!pathData) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Pathway not found</h2>
      </div>
    );
  }

  return (
    <div className="pathway-page p-6 text-center">
      <h1 className="text-2xl font-bold mb-2">{pathData.title}</h1>

      {/* 🦁 Zayd mascot */}
      <div className="flex justify-center mb-4">
        <img
          src={zaydGuide}
          alt="Zayd mascot"
          className="w-24 h-24 animate-bounce"
        />
      </div>

      {/* Progress ring placeholder */}
      <div className="mb-6">
        <div
          className="mx-auto bg-emerald-100 text-emerald-700 font-semibold rounded-full w-24 h-24 flex items-center justify-center shadow-inner"
          style={{ fontSize: "1.2rem" }}
        >
          {progress}%
        </div>
        <p className="text-gray-500 mt-1">Progress</p>
      </div>

      {/* Lesson list */}
      <div className="grid gap-3 text-left">
        {pathData.data.lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            onClick={() =>
              alert(`Lesson: ${lesson.title} — quiz unlocks soon!`)
            }
            className={`p-4 rounded-xl shadow-md bg-white hover:scale-105 transition cursor-pointer ${
              index > 1 ? "opacity-50" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-base">{lesson.title}</h3>
              {index > 1 ? (
                <span className="text-gray-400">🔒</span>
              ) : (
                <span className="text-green-600">✅</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {lesson.paragraphs[0].slice(0, 70)}...
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-400">
        🎓 Complete all lessons to unlock your certificate!
      </div>
    </div>
  );
}
