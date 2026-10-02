import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { generateJourney } from "../services/journeyGenerator";

import "./JourneyLoading.css";

function JourneyLoading({
  userId,
  onComplete,
}) {
  const [currentMessage, setCurrentMessage] = useState(
    "Reviewing your goals..."
  );

  const [progress, setProgress] = useState(8);

  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let messageTimer;
    let isMounted = true;

    const messages = [
      {
        text: "Reviewing your goals...",
        progress: 15,
      },
      {
        text: "Connecting your skills with opportunities...",
        progress: 30,
      },
      {
        text: "Planning your learning route...",
        progress: 48,
      },
      {
        text: "Creating your career milestones...",
        progress: 66,
      },
      {
        text: "Personalizing your learning tasks...",
        progress: 82,
      },
      {
        text: "Almost ready for takeoff...",
        progress: 94,
      },
    ];

    const runJourneyGeneration =
      async () => {
        try {
          if (!userId) {
            throw new Error(
              "Your user profile could not be found."
            );
          }

          // -------------------------------------------------
          // LOAD STUDENT PROFILE
          // -------------------------------------------------

          const userRef = doc(
            db,
            "users",
            userId
          );

          const userSnapshot =
            await getDoc(userRef);

          if (!userSnapshot.exists()) {
            throw new Error(
              "Your PathPilot profile could not be found."
            );
          }

          const studentProfile =
            userSnapshot.data();

          if (isMounted) {
            setProfile(
              studentProfile
            );
          }

          // -------------------------------------------------
          // ANIMATE LOADING MESSAGES
          // -------------------------------------------------

          let messageIndex = 0;

          messageTimer =
            setInterval(() => {
              if (!isMounted) return;

              if (
                messageIndex <
                messages.length
              ) {
                setCurrentMessage(
                  messages[
                    messageIndex
                  ].text
                );

                setProgress(
                  messages[
                    messageIndex
                  ].progress
                );

                messageIndex++;
              }
            }, 1300);

          // -------------------------------------------------
          // GENERATE AI JOURNEY
          // -------------------------------------------------

          const roadmap =
            await generateJourney(
              studentProfile
            );

          if (!isMounted) return;

          clearInterval(messageTimer);

          setCurrentMessage(
            "Your personalized journey is ready!"
          );

          setProgress(100);

          // -------------------------------------------------
          // SAVE ROADMAP
          // -------------------------------------------------

          await updateDoc(
            userRef,
            {
              roadmap,
              journeyGenerated: true,
              journeyGeneratedAt:
                new Date(),
            }
          );

          // -------------------------------------------------
          // SHOW COMPLETION STATE
          // -------------------------------------------------

          setTimeout(() => {
            if (!isMounted) return;

            onComplete();
          }, 1300);
        } catch (
          generationError
        ) {
          console.error(
            "Journey generation error:",
            generationError
          );

          if (!isMounted) return;

          clearInterval(
            messageTimer
          );

          setError(
            generationError?.message ||
              "We couldn't create your journey."
          );

          setProgress(100);
        }
      };

    runJourneyGeneration();

    return () => {
      isMounted = false;

      clearInterval(
        messageTimer
      );
    };
  }, [userId, onComplete]);

  // =========================================================
  // ERROR STATE
  // =========================================================

  if (error) {
    return (
      <main className="journey-loading-page">

        <div className="journey-sky">
          <div className="journey-glow journey-glow-one" />
          <div className="journey-glow journey-glow-two" />

          <div className="journey-cloud journey-cloud-one" />
          <div className="journey-cloud journey-cloud-two" />

          <span className="journey-spark spark-one">
            ✦
          </span>

          <span className="journey-spark spark-two">
            ✧
          </span>
        </div>

        <section className="journey-error-card">

          <div className="journey-error-icon">
            !
          </div>

          <span className="journey-status-label">
            PATHPILOT
          </span>

          <h1>
            A little turbulence
            <span> occurred.</span>
          </h1>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try again
            <span>↻</span>
          </button>

        </section>

      </main>
    );
  }

  // =========================================================
  // PROFILE DISPLAY
  // =========================================================

  const studentName =
    profile?.name || "Pilot";

  const career =
    profile?.career ||
    "Your career destination";

  const field =
    profile?.field ||
    "Your selected field";

  // =========================================================
  // LOADING UI
  // =========================================================

  return (
    <main className="journey-loading-page">

      {/* ===================================================
          SKY BACKGROUND
      =================================================== */}

      <div className="journey-sky">

        <div className="journey-glow journey-glow-one" />

        <div className="journey-glow journey-glow-two" />

        <div className="journey-cloud journey-cloud-one">
          <span />
          <span />
        </div>

        <div className="journey-cloud journey-cloud-two">
          <span />
          <span />
        </div>

        <div className="journey-cloud journey-cloud-three">
          <span />
          <span />
        </div>

        <span className="journey-spark spark-one">
          ✦
        </span>

        <span className="journey-spark spark-two">
          ✧
        </span>

        <span className="journey-spark spark-three">
          ·
        </span>

      </div>

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="journey-loading-header">

        <div className="journey-brand">
          <div className="journey-brand-icon">
            ✈
          </div>

          <div>
            <strong>
              Path<span>Pilot</span>
            </strong>

            <small>
              YOUR CAREER JOURNEY
            </small>
          </div>
        </div>

        <div className="journey-header-status">
          <span />
          BUILDING YOUR ROUTE
        </div>

      </header>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <section className="journey-loading-content">

        <div className="journey-intro">

          <span className="journey-eyebrow">
            PERSONALIZING YOUR FLIGHT PLAN
          </span>

          <h1>
            Preparing your
            <span> journey.</span>
          </h1>

          <p>
            {studentName}, we're connecting your goals,
            skills and interests into a route designed
            specifically for you.
          </p>

        </div>

        {/* =================================================
            DESTINATION CARD
        ================================================= */}

        <div className="journey-destination-card">

          <div className="destination-icon">
            ✈
          </div>

          <div className="destination-details">

            <span>
              YOUR DESTINATION
            </span>

            <strong>
              {career}
            </strong>

            <small>
              {field}
            </small>

          </div>

          <div className="destination-arrow">
            →
          </div>

        </div>

        {/* =================================================
            FLIGHT MAP
        ================================================= */}

        <div className="journey-flight-card">

          <div className="flight-map-header">

            <div>
              <span>
                LIVE ROUTE BUILDING
              </span>

              <strong>
                Mapping your path
              </strong>
            </div>

            <div className="flight-status">
              <span />
              ACTIVE
            </div>

          </div>

          <div className="journey-route">

            <div className="journey-route-line">

              <div
                className="journey-route-progress"
                style={{
                  width: `${Math.max(
                    progress,
                    8
                  )}%`,
                }}
              />

            </div>

            <div className="journey-route-stops">

              <div
                className={`journey-stop ${
                  progress >= 15
                    ? "completed"
                    : ""
                }`}
              >
                <span>
                  {progress >= 15
                    ? "✓"
                    : "1"}
                </span>

                <small>
                  Goals
                </small>
              </div>

              <div
                className={`journey-stop ${
                  progress >= 30
                    ? "completed"
                    : ""
                }`}
              >
                <span>
                  {progress >= 30
                    ? "✓"
                    : "2"}
                </span>

                <small>
                  Skills
                </small>
              </div>

              <div
                className={`journey-stop ${
                  progress >= 66
                    ? "completed"
                    : ""
                }`}
              >
                <span>
                  {progress >= 66
                    ? "✓"
                    : "3"}
                </span>

                <small>
                  Route
                </small>
              </div>

              <div
                className={`journey-stop ${
                  progress >= 100
                    ? "completed"
                    : ""
                }`}
              >
                <span>
                  {progress >= 100
                    ? "✓"
                    : "4"}
                </span>

                <small>
                  Takeoff
                </small>
              </div>

            </div>

            <div
              className="journey-route-plane"
              style={{
                left: `${Math.min(
                  Math.max(
                    progress - 5,
                    5
                  ),
                  94
                )}%`,
              }}
            >
              ✈
            </div>

          </div>

        </div>

        {/* =================================================
            STATUS MESSAGE
        ================================================= */}

        <div className="journey-status-area">

          <div className="journey-status-icon">
            <span />
            <span />
            <span />
          </div>

          <div>
            <span>
              CURRENTLY
            </span>

            <strong>
              {currentMessage}
            </strong>
          </div>

        </div>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <div className="journey-progress-section">

          <div className="journey-progress-top">

            <span>
              BUILDING YOUR PERSONALIZED ROADMAP
            </span>

            <strong>
              {progress}%
            </strong>

          </div>

          <div className="journey-progress-track">

            <div
              className="journey-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            >

              <div className="progress-shine" />

            </div>

          </div>

        </div>

        {/* =================================================
            BOTTOM MESSAGE
        ================================================= */}

        <div className="journey-bottom-message">

          <span>
            ✦
          </span>

          <p>
            No two career journeys are exactly the same.
            Your route is being built around yours.
          </p>

        </div>

      </section>

    </main>
  );
}

export default JourneyLoading;