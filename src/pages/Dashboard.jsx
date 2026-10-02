import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";
import "./Dashboard.css";

// =========================================================
// DATE HELPERS
// =========================================================

function getLocalDateKey() {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
}

function getPreviousDateKey() {
  const yesterday = new Date();

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  return `${yesterday.getFullYear()}-${String(
    yesterday.getMonth() + 1
  ).padStart(2, "0")}-${String(
    yesterday.getDate()
  ).padStart(2, "0")}`;
}

function Dashboard({
  selectedField,
  selectedCareer,
  userId,
  onOpenRoadmap,
  onOpenMilestone,
  onOpenTeamFinder,
  onOpenAI,
  onOpenMissions,
  onOpenResources,
  onOpenProfile,
  onOpenSettings,
  onOpenOpportunities,
  onOpenHelp,
}) {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [profile, setProfile] =
    useState(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  // =========================================================
  // LOAD PROFILE LIVE
  // =========================================================

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);

    const userRef = doc(
      db,
      "users",
      userId
    );

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          // =================================================
          // REAL DAILY STREAK
          // =================================================

          const todayKey =
            getLocalDateKey();

          const yesterdayKey =
            getPreviousDateKey();

          const lastActiveDate =
            data.lastActiveDate || "";

          let activeStreak =
            Number(data.activeStreak) || 0;

          let streakChanged = false;

          if (
            lastActiveDate !==
            todayKey
          ) {
            if (
              lastActiveDate ===
              yesterdayKey
            ) {
              activeStreak += 1;
            } else {
              activeStreak = 1;
            }

            streakChanged = true;
          }

          setProfile({
            ...data,
            activeStreak,
            lastActiveDate:
              todayKey,
          });

          // Save today's activity once
          if (streakChanged) {
            setDoc(
              userRef,
              {
                activeStreak,
                lastActiveDate:
                  todayKey,
              },
              {
                merge: true,
              }
            ).catch(
              (streakError) => {
                console.error(
                  "Error updating streak:",
                  streakError
                );
              }
            );
          }
        } else {
          setProfile(null);
        }

        setLoadingProfile(false);
      },
      (error) => {
        console.error(
          "Error loading dashboard profile:",
          error
        );

        setLoadingProfile(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // =========================================================
  // BASIC PROFILE DATA
  // =========================================================

  const studentName =
    profile?.name ||
    "Pilot";

  const careerTitle =
    profile?.career ||
    selectedCareer?.title ||
    "Your Career Destination";

  const fieldTitle =
    profile?.field ||
    selectedField?.title ||
    "Your Selected Field";

  const careerIcon =
    selectedCareer?.icon ||
    "✈️";

  // =========================================================
  // ROADMAP
  // =========================================================

  const roadmap =
    profile?.roadmap || null;

  const milestones =
    Array.isArray(
      roadmap?.milestones
    )
      ? roadmap.milestones
      : [];

  const routeMilestones =
    milestones.slice(0, 4);

  // =========================================================
  // CHECKPOINT COMPLETION
  // =========================================================

  const isMilestoneCompleted = (
    milestone
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

    if (tasks.length > 0) {
      return tasks.every(
        (_, index) =>
          taskStatus[index] === true
      );
    }

    return (
      milestone?.completed ===
      true
    );
  };

  // =========================================================
  // TASK PROGRESS
  // =========================================================

  let totalTasks = 0;
  let completedTasks = 0;
  let unfinishedTaskCount = 0;

  milestones.forEach(
    (milestone) => {
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

      totalTasks +=
        tasks.length;

      tasks.forEach(
        (_, index) => {
          if (
            taskStatus[index] ===
            true
          ) {
            completedTasks += 1;
          } else {
            unfinishedTaskCount += 1;
          }
        }
      );
    }
  );

  const journeyProgress =
    totalTasks > 0
      ? Math.round(
          (completedTasks /
            totalTasks) *
            100
        )
      : 0;

  // =========================================================
  // CHECKPOINT COUNT
  // =========================================================

  const completedMilestones =
    milestones.filter(
      isMilestoneCompleted
    ).length;

  const journeyComplete =
    milestones.length > 0 &&
    completedMilestones >=
      milestones.length;

  // =========================================================
  // CURRENT CHECKPOINT
  // =========================================================

  const currentMilestoneIndex =
    journeyComplete
      ? Math.max(
          milestones.length - 1,
          0
        )
      : Math.min(
          completedMilestones,
          Math.max(
            milestones.length - 1,
            0
          )
        );

  const currentMilestone =
    milestones[
      currentMilestoneIndex
    ] || null;

  // =========================================================
  // JOURNEY MAP POSITIONS
  // =========================================================

  const mapPositions = [
    {
      left: "10%",
      top: "72%",
    },
    {
      left: "38%",
      top: "52%",
    },
    {
      left: "66%",
      top: "32%",
    },
    {
      left: "87%",
      top: "14%",
    },
  ];

  const currentMapPosition =
    mapPositions[
      Math.min(
        completedMilestones,
        3
      )
    ] ||
    mapPositions[0];

  // =========================================================
  // ALL STUDENT COUNTS
  // =========================================================

  const [
    campusStudentCount,
    setCampusStudentCount,
  ] = useState(0);

  useEffect(() => {
    const usersQuery = query(
      collection(db, "users"),
      where(
        "onboardingCompleted",
        "==",
        true
      )
    );

    const unsubscribe =
      onSnapshot(
        usersQuery,
        (snapshot) => {
          const count =
            userId
              ? snapshot.docs.filter(
                  (student) =>
                    student.id !==
                    userId
                ).length
              : snapshot.docs.length;

          setCampusStudentCount(
            count
          );
        },
        (error) => {
          console.error(
            "Error loading campus count:",
            error
          );
        }
      );

    return () => unsubscribe();
  }, [userId]);

  // =========================================================
  // SKILL COUNT
  // =========================================================

  const skillCount =
    Array.isArray(
      profile?.skills
    )
      ? profile.skills.length
      : 0;

  // =========================================================
  // TOTAL ROADMAP TASKS
  // =========================================================

  const roadmapTaskCount =
    milestones.reduce(
      (
        total,
        milestone
      ) => {
        const tasks =
          Array.isArray(
            milestone?.tasks
          )
            ? milestone.tasks.length
            : 0;

        return (
          total + tasks
        );
      },
      0
    );

  // =========================================================
  // OPEN CURRENT CHECKPOINT
  // =========================================================

  const handleContinueJourney =
    () => {
      if (
        currentMilestone &&
        onOpenMilestone
      ) {
        onOpenMilestone(
          currentMilestone,
          currentMilestoneIndex +
            1
        );
        return;
      }

      if (onOpenRoadmap) {
        onOpenRoadmap();
      }
    };

  // =========================================================
  // PROFILE AVATAR
  // =========================================================

  const profileInitial =
    studentName
      .charAt(0)
      .toUpperCase() || "P";

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingProfile) {
    return (
      <main className="dashboard-page sidebar-open">
        <section
          className="dashboard-main"
          style={{
            display: "grid",
            placeItems: "center",
            minHeight: "100vh",
          }}
        >
          <div
            style={{
              color: "#6f5a78",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            Loading your journey...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`dashboard-page ${
        sidebarOpen
          ? "sidebar-open"
          : "sidebar-collapsed"
      }`}
    >

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="dashboard-bg-glow glow-peach"></div>

      <div className="dashboard-bg-glow glow-lavender"></div>

      <div className="dashboard-cloud cloud-one"></div>

      <div className="dashboard-cloud cloud-two"></div>

      <div className="dashboard-spark spark-one">
        ✦
      </div>

      <div className="dashboard-spark spark-two">
        ✧
      </div>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="dashboard-sidebar">

        <div className="dashboard-brand">

          <div className="dashboard-brand-mark">
            ✈
          </div>

          <div className="dashboard-brand-copy">

            <strong>
              Path<span>Pilot</span>
            </strong>

            <small>
              Your career journey
            </small>

          </div>

        </div>

        <nav className="dashboard-navigation">

          <button
            type="button"
            className="dashboard-nav-link dashboard-nav-link-active"
          >
            <span className="nav-icon">
              ⌂
            </span>

            <span>
              My Journey
            </span>
          </button>

          <button
            type="button"
            className="dashboard-nav-link"
            onClick={
              onOpenRoadmap
            }
          >
            <span className="nav-icon">
              ✦
            </span>

            <span>
              Career Roadmap
            </span>
          </button>

          <button
            type="button"
            className="dashboard-nav-link"
            onClick={
              onOpenTeamFinder
            }
          >
            <span className="nav-icon">
              ♟
            </span>

            <span>
              Team Finder
            </span>
          </button>

          <button
            type="button"
            className="dashboard-nav-link"
            onClick={
              onOpenAI
            }
          >
            <span className="nav-icon">
              ✧
            </span>

            <span>
              PathPilot AI
            </span>
          </button>

        </nav>

        <div className="dashboard-sidebar-label">
          EXPLORE
        </div>

        <div className="dashboard-navigation dashboard-navigation-secondary">

          <button
            type="button"
            className="dashboard-nav-link"
            onClick={
              onOpenMissions
            }
          >
            <span className="nav-icon">
              ✓
            </span>

            <span>
              Missions
            </span>
          </button>

          <button
            type="button"
            className="dashboard-nav-link"
            onClick={
              onOpenResources
            }
          >
            <span className="nav-icon">
              ◈
            </span>

            <span>
              Resources
            </span>
          </button>

          <button
            type="button"
            className="dashboard-nav-link"
            onClick={
              onOpenOpportunities
            }
          >
            <span className="nav-icon">
              ♧
            </span>

            <span>
              Opportunities
            </span>
          </button>

          <button
            type="button"
            className="dashboard-nav-link"
            onClick={
              onOpenProfile
            }
          >
            <span className="nav-icon">
              ◉
            </span>

            <span>
              Profile
            </span>
          </button>

          <button
            type="button"
            className="dashboard-nav-link"
            onClick={
              onOpenSettings
            }
          >
            <span className="nav-icon">
              ⚙
            </span>

            <span>
              Settings
            </span>
          </button>

        </div>

        <div className="dashboard-sidebar-label sidebar-account-label">
          ACCOUNT
        </div>

        <div className="dashboard-sidebar-bottom">

          <button
            type="button"
            className="dashboard-nav-link"
            onClick={
              onOpenHelp
            }
          >
            <span className="nav-icon">
              ?
            </span>

            <span>
              Help
            </span>
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <section className="dashboard-main">

        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header className="dashboard-topbar">

          <div className="dashboard-topbar-left">

            <button
              type="button"
              className="dashboard-menu-button"
              onClick={() =>
                setSidebarOpen(
                  (value) =>
                    !value
                )
              }
              aria-label="Toggle sidebar"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div className="dashboard-greeting">

              <p className="dashboard-eyebrow">
                YOUR PERSONAL CAREER COMPASS
              </p>

              <h1>
                Good evening,{" "}
                {studentName}

                <span>
                  ✦
                </span>
              </h1>

              <p className="dashboard-subtitle">
                One step at a time. Your
                future is taking shape.
              </p>

            </div>

          </div>

          {/* =================================================
              USER AREA
          ================================================= */}

          <div className="dashboard-user-area">

            {/* STREAK */}

            <div
              className="dashboard-streak"
              title="Your PathPilot activity streak"
            >

              <span>
                🔥
              </span>

              <strong>
                {profile?.activeStreak || 0}
              </strong>

              <small>
                day streak
              </small>

            </div>

            {/* NOTIFICATIONS */}

            <button
              type="button"
              className={`dashboard-notification ${
                unfinishedTaskCount > 0
                  ? "has-notifications"
                  : ""
              }`}
              onClick={
                onOpenMissions
              }
              title={
                unfinishedTaskCount > 0
                  ? `${unfinishedTaskCount} unfinished mission${
                      unfinishedTaskCount === 1
                        ? ""
                        : "s"
                    }`
                  : "No unfinished missions"
              }
              aria-label="Open missions"
            >
              ♧

              {unfinishedTaskCount >
                0 && (
                <span
                  aria-hidden="true"
                >
                  {unfinishedTaskCount >
                  9
                    ? "9+"
                    : ""}
                </span>
              )}

            </button>

            {/* PROFILE CHIP */}

            <button
              type="button"
              className="dashboard-profile-chip"
              onClick={
                onOpenProfile
              }
              aria-label="Open profile"
            >

              <div
                className={`dashboard-profile-avatar ${
                  profile?.profilePhoto
                    ? "dashboard-profile-avatar-photo"
                    : ""
                }`}
              >

                {profile?.profilePhoto ? (
                  <img
                    src={
                      profile.profilePhoto
                    }
                    alt="Profile"
                  />
                ) : (
                  profileInitial
                )}

              </div>

              <div>

                <strong>
                  {studentName}
                </strong>

                <small>
                  Student Pilot
                </small>

              </div>

              <span>
                ⌄
              </span>

            </button>

          </div>

        </header>

        {/* ===================================================
            DESTINATION
        =================================================== */}

        <section className="destination-banner">

          <div className="destination-copy">

            <p className="section-kicker">
              ✈ YOUR DESTINATION
            </p>

            <h2>
              {careerTitle}
            </h2>

            <span>
              {fieldTitle}
            </span>

          </div>

          <div className="destination-icon">
            {careerIcon}
          </div>

        </section>

        {/* ===================================================
            MAIN GRID
        =================================================== */}

        <div className="dashboard-card-grid">

          {/* =================================================
              CAREER ROADMAP
          ================================================= */}

          <section className="dashboard-roadmap-card">

            <div className="roadmap-card-heading">

              <div>

                <p className="section-kicker light-kicker">
                  CAREER ROADMAP
                </p>

                <h2>
                  Your path, mapped out.
                </h2>

                <p>
                  {roadmap?.summary ||
                    `Your personalized route toward ${careerTitle}.`}
                </p>

              </div>

              <div className="roadmap-heading-icon">
                ✦
              </div>

            </div>

            <div className="dashboard-roadmap-map">

              <div className="dashboard-roadmap-glow"></div>

              <div className="dashboard-route-curve"></div>

              {routeMilestones.map(
                (
                  milestone,
                  index
                ) => {

                  const completed =
                    isMilestoneCompleted(
                      milestone
                    );

                  const isCurrent =
                    index ===
                    currentMilestoneIndex;

                  const position =
                    mapPositions[
                      index
                    ] ||
                    mapPositions[3];

                  return (
                    <div
                      key={
                        milestone?.id ||
                        index
                      }
                      className={`dashboard-map-point ${
                        completed
                          ? "dashboard-map-point-completed"
                          : ""
                      } ${
                        isCurrent &&
                        !completed
                          ? "dashboard-map-point-current"
                          : ""
                      }`}
                      style={{
                        left:
                          position.left,
                        top:
                          position.top,
                      }}
                    >

                      {isCurrent &&
                        !completed && (
                        <div className="dashboard-current-pulse"></div>
                      )}

                      <span>
                        {completed
                          ? "✓"
                          : index + 1}
                      </span>

                      <small>
                        {milestone?.title ||
                          `Checkpoint ${
                            index + 1
                          }`}
                      </small>

                    </div>
                  );
                }
              )}

              {milestones.length > 0 && (
                <div
                  className="dashboard-map-plane"
                  style={{
                    left:
                      currentMapPosition.left,
                    top:
                      currentMapPosition.top,
                  }}
                >
                  ✈
                </div>
              )}

              {milestones.length > 0 && (
                <div
                  className="dashboard-finish-flag"
                  style={{
                    left: "92%",
                    top: "8%",
                  }}
                >
                  🏁
                </div>
              )}

            </div>

            <div className="dashboard-current-waypoint">

              <div>

                <p>
                  {journeyComplete
                    ? "FINAL DESTINATION"
                    : `CURRENT CHECKPOINT • ${String(
                        currentMilestoneIndex +
                          1
                      ).padStart(
                        2,
                        "0"
                      )}`}
                </p>

                <h3>
                  {journeyComplete
                    ? `You've reached ${careerTitle}`
                    : currentMilestone?.title ||
                      "Your first checkpoint awaits"}
                </h3>

                <span>
                  {journeyComplete
                    ? "Every checkpoint on your route is complete."
                    : currentMilestone?.description ||
                      "Start your first checkpoint and keep moving forward."}
                </span>

              </div>

              <button
                type="button"
                className="dashboard-roadmap-button"
                onClick={
                  handleContinueJourney
                }
              >
                {journeyComplete
                  ? "View roadmap"
                  : "Continue checkpoint"}

                <span>
                  →
                </span>
              </button>

            </div>

          </section>

          {/* =================================================
              PATHPILOT AI
          ================================================= */}

          <section className="dashboard-ai-card">

            <div className="ai-card-decoration"></div>

            <div className="ai-card-top">

              <div className="ai-icon">
                ✦
              </div>

              <span className="ai-ready">
                READY
              </span>

            </div>

            <p className="section-kicker">
              PATHPILOT AI
            </p>

            <h2>
              Your personal guide.
            </h2>

            <p className="ai-description">
              Your next step is based on
              where you are now, not where
              you are expected to be.
            </p>

            <div className="ai-orbit">

              <div className="ai-orbit-ring ring-one"></div>

              <div className="ai-orbit-ring ring-two"></div>

              <div className="ai-orbit-core">
                ✦
              </div>

            </div>

            <p className="ai-focus-text">
              Your next focus is{" "}
              <strong>
                {currentMilestone?.title ||
                  "your first checkpoint"}
              </strong>
              .
            </p>

            <button
              type="button"
              className="ai-explore-button"
              onClick={
                onOpenAI
              }
            >
              Explore with AI

              <span>
                →
              </span>
            </button>

          </section>

          {/* =================================================
              MY JOURNEY GROWTH
          ================================================= */}

          <section className="dashboard-growth-card">

            <div className="growth-heading">

              <div>

                <p className="section-kicker light-kicker">
                  MY JOURNEY
                </p>

                <h2>
                  See yourself grow.
                </h2>

                <p>
                  Your progress will grow as
                  you complete checkpoints and
                  learning tasks.
                </p>

              </div>

              <div className="growth-percentage">
                {journeyProgress}%
              </div>

            </div>

            <div className="growth-main">

              <div className="growth-map">

                <div className="growth-route"></div>

                {routeMilestones.map(
                  (
                    milestone,
                    index
                  ) => {

                    const completed =
                      isMilestoneCompleted(
                        milestone
                      );

                    const isCurrent =
                      index ===
                      currentMilestoneIndex;

                    const position =
                      mapPositions[
                        index
                      ] ||
                      mapPositions[3];

                    return (
                      <div
                        key={
                          milestone?.id ||
                          index
                        }
                        className={`growth-point ${
                          completed
                            ? "growth-point-completed"
                            : ""
                        } ${
                          isCurrent &&
                          !completed
                            ? "growth-point-current"
                            : ""
                        }`}
                        style={{
                          left:
                            position.left,
                          top:
                            position.top,
                        }}
                      >

                        {isCurrent &&
                          !completed && (
                          <div className="growth-pulse"></div>
                        )}

                        <span>
                          {completed
                            ? "✓"
                            : index + 1}
                        </span>

                        <small>
                          {milestone?.title ||
                            `Checkpoint ${
                              index + 1
                            }`}
                        </small>

                      </div>
                    );
                  }
                )}

                {milestones.length > 0 && (
                  <div
                    className="growth-plane"
                    style={{
                      left:
                        currentMapPosition.left,
                      top:
                        currentMapPosition.top,
                    }}
                  >
                    ✈
                  </div>
                )}

                <div className="growth-cloud growth-cloud-one"></div>

                <div className="growth-cloud growth-cloud-two"></div>

              </div>

              <div className="growth-stats">

                <div className="growth-stat-card">

                  <span>
                    MILESTONES
                  </span>

                  <strong>
                    {milestones.length}
                  </strong>

                </div>

                <div className="growth-stat-card">

                  <span>
                    SKILLS
                  </span>

                  <strong>
                    {skillCount}
                  </strong>

                </div>

                <div className="growth-stat-card">

                  <span>
                    TASKS
                  </span>

                  <strong>
                    {roadmapTaskCount}
                  </strong>

                </div>

              </div>

            </div>

            <button
              type="button"
              className="growth-progress-button"
              onClick={
                onOpenRoadmap
              }
            >
              View my progress

              <span>
                →
              </span>
            </button>

          </section>

        </div>

      </section>

    </main>
  );
}

export default Dashboard;