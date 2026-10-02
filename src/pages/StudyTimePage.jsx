import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import "./StudyTimePage.css";

function StudyTimePage({
  selectedField,
  selectedCareer,
  userId,
  onBack,
  onComplete,
}) {
  const [dailyTime, setDailyTime] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [learningStyle, setLearningStyle] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const dailyTimeOptions = [
    {
      icon: "🌱",
      title: "15–30 minutes",
      description: "A small, consistent daily habit.",
    },
    {
      icon: "🌤️",
      title: "30–60 minutes",
      description: "A balanced learning routine.",
    },
    {
      icon: "🚀",
      title: "1–2 hours",
      description: "A focused and steady pace.",
    },
    {
      icon: "🔥",
      title: "2–3 hours",
      description: "A more intensive learning routine.",
    },
    {
      icon: "⚡",
      title: "3+ hours",
      description: "I'm ready for a highly focused journey.",
    },
  ];

  const preferredTimeOptions = [
    "Morning",
    "Afternoon",
    "Evening",
    "Night",
    "Flexible",
  ];

  const learningStyleOptions = [
    {
      icon: "🧩",
      title: "Short daily sessions",
      description: "Small lessons spread throughout the week.",
    },
    {
      icon: "🎯",
      title: "Long focused sessions",
      description: "Fewer sessions with deeper focus.",
    },
    {
      icon: "🌈",
      title: "Mix of both",
      description: "A flexible combination of short and long sessions.",
    },
  ];

  const handleComplete = async () => {
    if (!dailyTime) {
      setError("Please choose how much time you can study each day.");
      return;
    }

    if (!preferredTime) {
      setError("Please choose your preferred time.");
      return;
    }

    if (!learningStyle) {
      setError("Please choose your learning style.");
      return;
    }

    if (!userId) {
      setError("We couldn't identify your account. Please try again.");
      console.error("No user ID available.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const studyTimeData = {
        daily: dailyTime,
        preferredTime,
        learningStyle,
      };

      await updateDoc(doc(db, "users", userId), {
        studyTime: studyTimeData,
        onboardingCompleted: true,
      });

      console.log("Study time saved to Firestore.");

      onComplete(studyTimeData);
    } catch (error) {
      console.error("Error saving study time:", error);

      setError(
        "We couldn't save your study preferences. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="study-time-page">

      <button
        className="study-time-back-button"
        type="button"
        onClick={onBack}
      >
        ← Back
      </button>

      <section className="study-time-container">

        {/* Progress */}
        <div className="study-time-progress">

          <div className="study-time-progress-text">
            <span>STEP 8</span>
            <span>5 OF 5</span>
          </div>

          <div className="study-time-progress-track">
            <div className="study-time-progress-fill"></div>
          </div>

        </div>


        {/* Header */}
        <div className="study-time-header">

          <p className="study-time-label">
            ONE LAST THING
          </p>

          <h1>
            How much time
            <br />
            can you give your journey? ⏰
          </h1>

          <p>
            Be realistic. Your journey should fit your life,
            not make life fit around it.
          </p>

        </div>


        {/* Destination */}
        <div className="study-time-destination">

          <span>
            {selectedCareer?.icon}
          </span>

          <div>
            <small>Your destination</small>

            <strong>
              {selectedCareer?.title}
            </strong>

            <em>
              {selectedField?.title}
            </em>
          </div>

        </div>


        <div className="study-time-card">

          {/* Daily time */}
          <section className="study-section">

            <div className="study-section-heading">

              <div>
                <h2>
                  Daily learning time
                </h2>

                <p>
                  How much time can you realistically give each day?
                </p>
              </div>

              <span className="required-label">
                Required
              </span>

            </div>


            <div className="daily-time-grid">

              {dailyTimeOptions.map((option) => (
                <button
                  key={option.title}
                  type="button"
                  className={`daily-time-option ${
                    dailyTime === option.title
                      ? "daily-time-option-selected"
                      : ""
                  }`}
                  onClick={() => {
                    setDailyTime(option.title);
                    setError("");
                  }}
                >
                  <span className="daily-time-icon">
                    {option.icon}
                  </span>

                  <span className="daily-time-content">
                    <strong>
                      {option.title}
                    </strong>

                    <small>
                      {option.description}
                    </small>
                  </span>

                  <span className="option-check">
                    {dailyTime === option.title ? "✓" : ""}
                  </span>
                </button>
              ))}

            </div>

          </section>


          {/* Preferred time */}
          <section className="study-section">

            <div className="study-section-heading">

              <div>
                <h2>
                  When do you learn best?
                </h2>

                <p>
                  Choose the time that usually works best for you.
                </p>
              </div>

            </div>


            <div className="preferred-time-list">

              {preferredTimeOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`preferred-time-chip ${
                    preferredTime === time
                      ? "preferred-time-chip-selected"
                      : ""
                  }`}
                  onClick={() => {
                    setPreferredTime(time);
                    setError("");
                  }}
                >
                  <span>
                    {preferredTime === time ? "✓" : "+"}
                  </span>

                  {time}
                </button>
              ))}

            </div>

          </section>


          {/* Learning style */}
          <section className="study-section">

            <div className="study-section-heading">

              <div>
                <h2>
                  What's your learning style?
                </h2>

                <p>
                  We'll use this to shape the pace of your journey.
                </p>
              </div>

            </div>


            <div className="learning-style-grid">

              {learningStyleOptions.map((style) => (
                <button
                  key={style.title}
                  type="button"
                  className={`learning-style-option ${
                    learningStyle === style.title
                      ? "learning-style-option-selected"
                      : ""
                  }`}
                  onClick={() => {
                    setLearningStyle(style.title);
                    setError("");
                  }}
                >
                  <span className="learning-style-icon">
                    {style.icon}
                  </span>

                  <span className="learning-style-content">
                    <strong>
                      {style.title}
                    </strong>

                    <small>
                      {style.description}
                    </small>
                  </span>

                  <span className="option-check">
                    {learningStyle === style.title ? "✓" : ""}
                  </span>
                </button>
              ))}

            </div>

          </section>


          {/* Summary */}
          {dailyTime && preferredTime && learningStyle && (
            <div className="study-summary">

              <span className="study-summary-icon">
                ✈️
              </span>

              <div>
                <small>
                  Your learning rhythm
                </small>

                <strong>
                  {dailyTime} · {preferredTime}
                </strong>

                <span>
                  {learningStyle}
                </span>
              </div>

            </div>
          )}


          {/* Error */}
          {error && (
            <p className="study-time-error">
              {error}
            </p>
          )}


          {/* Complete button */}
          <button
            className="study-time-complete"
            type="button"
            onClick={handleComplete}
            disabled={
              !dailyTime ||
              !preferredTime ||
              !learningStyle ||
              saving
            }
          >
            {saving
              ? "Preparing Your Journey..."
              : "Complete My Profile →"}
          </button>

        </div>

      </section>

    </main>
  );
}

export default StudyTimePage;