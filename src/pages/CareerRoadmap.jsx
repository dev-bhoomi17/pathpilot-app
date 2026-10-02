import {
  useEffect,
  useState,
} from "react";
import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/config";
import "./CareerRoadmap.css";

function CareerRoadmap({
  userId,
  onBack,
  onOpenMilestone,
}) {
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // =========================================================
  // LIVE PROFILE
  // =========================================================

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const userRef = doc(
      db,
      "users",
      userId
    );

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(
            snapshot.data()
          );
        }

        setLoading(false);
      },
      (error) => {
        console.error(
          "Error loading roadmap:",
          error
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  if (loading) {
    return (
      <div className="roadmap-loading">
        <div className="roadmap-loading-plane">
          ✈️
        </div>

        <h2>
          Preparing your flight plan...
        </h2>

        <p>
          PathPilot is loading your
          career journey.
        </p>
      </div>
    );
  }

  const roadmap =
    profile?.roadmap || null;

  const milestones =
    Array.isArray(
      roadmap?.milestones
    )
      ? roadmap.milestones
      : [];

  const career =
    profile?.career ||
    "Your Career Destination";

  const field =
    profile?.field ||
    "Career Journey";

  // =========================================================
  // CHECKPOINT COMPLETION
  // =========================================================

  const isMilestoneCompleted = (
    milestone
  ) => {
    const tasks = Array.isArray(
      milestone?.tasks
    )
      ? milestone.tasks
      : [];

    const taskStatus =
      Array.isArray(
        milestone?.taskStatus
      )
        ? milestone.taskStatus
        : [];

    if (tasks.length > 0) {
      return tasks.every(
        (_, index) =>
          taskStatus[index] ===
          true
      );
    }

    return milestone?.completed === true;
  };

  // =========================================================
  // TASK PROGRESS
  // =========================================================

  let totalTasks = 0;
  let completedTasks = 0;

  milestones.forEach(
    (milestone) => {
      const tasks = Array.isArray(
        milestone?.tasks
      )
        ? milestone.tasks
        : [];

      const taskStatus =
        Array.isArray(
          milestone?.taskStatus
        )
          ? milestone.taskStatus
          : [];

      totalTasks +=
        tasks.length;

      tasks.forEach(
        (_, index) => {
          if (
            taskStatus[index] ===
            true
          ) {
            completedTasks += 1;
          }
        }
      );
    }
  );

  const progress =
    totalTasks > 0
      ? Math.round(
          (completedTasks /
            totalTasks) *
            100
        )
      : 0;

  // =========================================================
  // CHECKPOINT PROGRESS
  // =========================================================

  const completedMilestones =
    milestones.filter(
      isMilestoneCompleted
    ).length;

  const journeyComplete =
    milestones.length > 0 &&
    completedMilestones >=
      milestones.length;

  const currentMilestoneIndex =
    journeyComplete
      ? Math.max(
          milestones.length -
            1,
          0
        )
      : Math.min(
          completedMilestones,
          Math.max(
            milestones.length -
              1,
            0
          )
        );

  // =========================================================
  // NEXT CHECKPOINT
  // =========================================================

  const currentMilestone =
    milestones[
      currentMilestoneIndex
    ] || null;

  // =========================================================
  // PROGRESS PLANE POSITION
  //
  // IMPORTANT:
  // This uses overall task progress.
  // It starts exactly at 0%.
  // =========================================================

  const progressPlane =
    Math.max(
      0,
      Math.min(
        progress,
        100
      )
    );

  return (
    <div className="roadmap-page">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="roadmap-cloud cloud-one"></div>
      <div className="roadmap-cloud cloud-two"></div>
      <div className="roadmap-cloud cloud-three"></div>

      <div className="roadmap-spark spark-one">
        ✦
      </div>

      <div className="roadmap-spark spark-two">
        ✧
      </div>

      <div className="roadmap-spark spark-three">
        ✦
      </div>

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="roadmap-topbar">

        <button
          className="roadmap-back-button"
          type="button"
          onClick={onBack}
        >
          ← Back to journey
        </button>

        <div className="roadmap-brand">

          <span className="roadmap-brand-icon">
            ✈
          </span>

          <span>
            PathPilot
          </span>

        </div>

      </header>

      <main className="roadmap-container">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="roadmap-hero">

          <div className="hero-copy">

            <div className="hero-badge">
              ✦ YOUR PERSONAL FLIGHT PLAN
            </div>

            <h1>
              Your route to
              <span>
                {career}
              </span>
            </h1>

            <p>
              PathPilot has mapped out
              the steps you can follow
              to move from where you
              are now toward your career
              destination.
            </p>

            <div className="hero-meta">

              <div className="hero-meta-item">
                <span>
                  🎯
                </span>

                <div>
                  <small>
                    Destination
                  </small>

                  <strong>
                    {career}
                  </strong>
                </div>
              </div>

              <div className="hero-meta-item">
                <span>
                  🧭
                </span>

                <div>
                  <small>
                    Field
                  </small>

                  <strong>
                    {field}
                  </strong>
                </div>
              </div>

            </div>

          </div>

          <div className="hero-flight-visual">

            <div className="hero-orbit orbit-one"></div>

            <div className="hero-orbit orbit-two"></div>

            <div className="hero-plane">
              ✈️
            </div>

            <div className="hero-destination">
              <span>
                📍
              </span>
            </div>

          </div>

        </section>

        {/* ===================================================
            PROGRESS
        =================================================== */}

        <section className="roadmap-progress-card">

          <div className="progress-heading">

            <div>

              <span className="section-label">
                JOURNEY STATUS
              </span>

              <h2>
                Your journey at a glance
              </h2>

            </div>

            <div className="progress-number">
              {progress}%
            </div>

          </div>

          {/* =================================================
              PROGRESS TRACK
          ================================================= */}

          <div className="progress-track">

            {/* TRACK GLOW */}

            <div
              className="progress-fill"
              style={{
                width:
                  `${progress}%`,
              }}
            ></div>

            {/* =================================================
                PLANE
                EXACT POSITION = TASK PROGRESS
            ================================================= */}

            <span
              className="progress-plane"
              style={{
                left:
                  `${progressPlane}%`,
              }}
            >
              ✈
            </span>

          </div>

          <div className="progress-markers">

            <span>
              START
            </span>

            <span>
              {milestones.length > 0
                ? `CHECKPOINT ${Math.min(
                    completedMilestones +
                      1,
                    milestones.length
                  )}`
                : "YOUR JOURNEY"}
            </span>

            <span>
              DESTINATION
            </span>

          </div>

          <div className="progress-stats">

            <div>
              <strong>
                {completedTasks}
              </strong>

              <span>
                Tasks completed
              </span>
            </div>

            <div>
              <strong>
                {totalTasks}
              </strong>

              <span>
                Total tasks
              </span>
            </div>

            <div>
              <strong>
                {completedMilestones}
              </strong>

              <span>
                Milestones completed
              </span>
            </div>

            <div>
              <strong>
                {Math.max(
                  milestones.length -
                    completedMilestones,
                  0
                )}
              </strong>

              <span>
                Remaining
              </span>
            </div>

          </div>

        </section>

        {/* ===================================================
            CURRENT WAYPOINT
        =================================================== */}

        {currentMilestone && (
          <section className="roadmap-current-card">

            <div>

              <span>
                {journeyComplete
                  ? "FINAL DESTINATION"
                  : `CURRENT CHECKPOINT • ${String(
                      currentMilestoneIndex +
                        1
                    ).padStart(
                      2,
                      "0"
                    )}`}
              </span>

              <h2>
                {journeyComplete
                  ? `You've reached ${career}`
                  : currentMilestone.title}
              </h2>

              <p>
                {journeyComplete
                  ? "You have completed every checkpoint on your personalized route."
                  : currentMilestone.description ||
                    "Continue through this checkpoint to move farther along your career route."}
              </p>

            </div>

            {!journeyComplete &&
              onOpenMilestone && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenMilestone(
                      currentMilestone,
                      currentMilestoneIndex +
                        1
                    )
                  }
                >
                  Continue checkpoint
                  <span>
                    →
                  </span>
                </button>
              )}

          </section>
        )}

        {/* ===================================================
            ROADMAP
        =================================================== */}

        <section className="journey-section">

          <div className="journey-heading">

            <div>

              <span className="section-label">
                YOUR ROUTE
              </span>

              <h2>
                Career roadmap
              </h2>

            </div>

            <p>
              Follow each checkpoint and
              keep moving toward your
              destination.
            </p>

          </div>

          {milestones.length === 0 ? (

            <div className="empty-roadmap">

              <div className="empty-icon">
                🗺️
              </div>

              <h3>
                Your route is being prepared
              </h3>

              <p>
                Your AI-generated roadmap
                will appear here once it
                is ready.
              </p>

            </div>

          ) : (

            <div className="roadmap-route">

              {milestones.map(
                (
                  milestone,
                  index
                ) => {

                  const tasks =
                    Array.isArray(
                      milestone?.tasks
                    )
                      ? milestone.tasks
                      : [];

                  const taskStatus =
                    Array.isArray(
                      milestone?.taskStatus
                    )
                      ? milestone.taskStatus
                      : [];

                  const completed =
                    isMilestoneCompleted(
                      milestone
                    );

                  const completedTaskCount =
                    taskStatus.filter(
                      (status) =>
                        status === true
                    ).length;

                  const current =
                    index ===
                    currentMilestoneIndex;

                  return (
                    <article
                      className={`milestone-card ${
                        completed
                          ? "completed"
                          : ""
                      } ${
                        current
                          ? "current"
                          : ""
                      }`}
                      key={
                        milestone?.id ||
                        `${milestone?.title}-${index}`
                      }
                      onClick={() => {
                        if (
                          onOpenMilestone
                        ) {
                          onOpenMilestone(
                            milestone,
                            index + 1
                          );
                        }
                      }}
                    >

                      <div className="milestone-marker">

                        {completed
                          ? "✓"
                          : index + 1}

                      </div>

                      <div className="milestone-card-inner">

                        <div className="milestone-top">

                          <div>

                            <span className="milestone-number">
                              CHECKPOINT{" "}
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            <h3>
                              {milestone?.title ||
                                `Checkpoint ${
                                  index + 1
                                }`}
                            </h3>

                          </div>

                          <span className="duration-pill">
                            ⏱{" "}
                            {milestone?.duration ||
                              "Flexible"}
                          </span>

                        </div>

                        <p className="milestone-description">
                          {milestone?.description ||
                            "Build knowledge and practical experience for this stage of your journey."}
                        </p>

                        {/* SKILLS */}

                        {Array.isArray(
                          milestone?.skills
                        ) &&
                          milestone.skills
                            .length > 0 && (
                            <div className="milestone-block">

                              <span className="block-label">
                                🧠 SKILLS TO BUILD
                              </span>

                              <div className="skill-pills">

                                {milestone.skills.map(
                                  (
                                    skill,
                                    skillIndex
                                  ) => (
                                    <span
                                      className="skill-pill"
                                      key={`${skill}-${skillIndex}`}
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}

                              </div>

                            </div>
                          )}

                        {/* TASKS */}

                        <div className="milestone-block">

                          <div className="tasks-heading">

                            <span className="block-label">
                              🚀 PRACTICAL TASKS
                            </span>

                            <span className="task-count">
                              {completedTaskCount}
                              {" / "}
                              {tasks.length}
                              {" completed"}
                            </span>

                          </div>

                          <div className="task-list">

                            {tasks
                              .slice(0, 4)
                              .map(
                                (
                                  task,
                                  taskIndex
                                ) => {

                                  const done =
                                    taskStatus[
                                      taskIndex
                                    ] === true;

                                  return (
                                    <div
                                      className={`task-preview ${
                                        done
                                          ? "task-preview-completed"
                                          : ""
                                      }`}
                                      key={`${task}-${taskIndex}`}
                                    >

                                      <span className="task-dot">
                                        {done
                                          ? "✓"
                                          : taskIndex +
                                            1}
                                      </span>

                                      <span>
                                        {task}
                                      </span>

                                    </div>
                                  );
                                }
                              )}

                          </div>

                        </div>

                        {/* FOOTER */}

                        <div className="milestone-footer">

                          <span className="milestone-status">

                            {completed
                              ? "✓ Checkpoint completed"
                              : `${completedTaskCount}/${tasks.length} tasks completed`}

                          </span>

                          {!completed &&
                            (
                              <button
                                type="button"
                                className="continue-button"
                                onClick={(
                                  event
                                ) => {
                                  event.stopPropagation();

                                  if (
                                    onOpenMilestone
                                  ) {
                                    onOpenMilestone(
                                      milestone,
                                      index +
                                        1
                                    );
                                  }
                                }}
                              >
                                Continue →
                              </button>
                            )}

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* ===================================================
            FINAL DESTINATION
        =================================================== */}

        <section className="final-destination">

          <div className="destination-content">

            <span className="destination-label">
              ✦ FINAL DESTINATION
            </span>

            <h2>
              {career}
            </h2>

            <p>
              Every skill, task and
              checkpoint on this route is
              a step closer to the career
              you chose.
            </p>

            <div className="destination-route">

              <span>
                YOU
              </span>

              <div className="destination-route-line">
                <span>•</span>
                <span>•</span>
                <span>•</span>
                <span>✈</span>
              </div>

              <span>
                DESTINATION
              </span>

            </div>

          </div>

          <div className="destination-plane">
            ✈️
          </div>

        </section>

      </main>

    </div>
  );
}

export default CareerRoadmap;