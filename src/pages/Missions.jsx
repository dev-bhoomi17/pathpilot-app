import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";
import "./Missions.css";

function Missions({
  userId,
  onBack,
  onOpenMilestone,
}) {
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [filter, setFilter] =
    useState("all");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [savingMission, setSavingMission] =
    useState(null);

  // =========================================================
  // LOAD PROFILE LIVE
  // =========================================================

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const userRef = doc(
      db,
      "users",
      userId
    );

    const unsubscribe =
      onSnapshot(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setProfile(
              snapshot.data()
            );
          } else {
            setProfile(null);
          }

          setLoading(false);
        },
        (error) => {
          console.error(
            "Error loading missions:",
            error
          );

          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [userId]);

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

  // =========================================================
  // BUILD MISSIONS FROM ROADMAP TASKS
  // =========================================================

  const missions =
    useMemo(() => {
      const result = [];

      milestones.forEach(
        (milestone, milestoneIndex) => {
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

          tasks.forEach(
            (task, taskIndex) => {
              result.push({
                id: `${milestoneIndex}-${taskIndex}`,

                milestoneIndex,

                taskIndex,

                checkpointNumber:
                  milestoneIndex + 1,

                checkpointTitle:
                  milestone?.title ||
                  `Checkpoint ${
                    milestoneIndex + 1
                  }`,

                milestoneDescription:
                  milestone?.description ||
                  "",

                duration:
                  milestone?.duration ||
                  "Flexible",

                task,

                completed:
                  taskStatus[
                    taskIndex
                  ] === true,
              });
            }
          );
        }
      );

      return result;
    }, [milestones]);

  // =========================================================
  // CURRENT CHECKPOINT
  // =========================================================

  const completedMilestones =
    milestones.filter(
      (milestone) => {
        const tasks =
          Array.isArray(
            milestone?.tasks
          )
            ? milestone.tasks
            : [];

        const status =
          Array.isArray(
            milestone?.taskStatus
          )
            ? milestone.taskStatus
            : [];

        if (tasks.length === 0) {
          return (
            milestone?.completed === true
          );
        }

        return tasks.every(
          (_, index) =>
            status[index] === true
        );
      }
    ).length;

  const currentMilestoneIndex =
    milestones.length > 0
      ? Math.min(
          completedMilestones,
          milestones.length - 1
        )
      : 0;

  const currentMilestone =
    milestones[
      currentMilestoneIndex
    ] || null;

  // =========================================================
  // CURRENT MISSION
  // =========================================================

  const nextMission =
    missions.find(
      (mission) => {
        if (
          mission.milestoneIndex !==
          currentMilestoneIndex
        ) {
          return false;
        }

        return !mission.completed;
      }
    ) || null;

  // =========================================================
  // COUNTS
  // =========================================================

  const totalMissions =
    missions.length;

  const completedMissions =
    missions.filter(
      (mission) =>
        mission.completed
    ).length;

  const remainingMissions =
    totalMissions -
    completedMissions;

  const missionProgress =
    totalMissions > 0
      ? Math.round(
          (completedMissions /
            totalMissions) *
            100
        )
      : 0;

  // =========================================================
  // FILTER + SEARCH
  // =========================================================

  const filteredMissions =
    missions.filter(
      (mission) => {
        const matchesFilter =
          filter === "all"
            ? true
            : filter === "active"
              ? !mission.completed
              : filter === "completed"
                ? mission.completed
                : mission.milestoneIndex ===
                  currentMilestoneIndex;

        const searchableText =
          `${mission.task} ${mission.checkpointTitle}`
            .toLowerCase();

        const matchesSearch =
          searchableText.includes(
            searchTerm
              .trim()
              .toLowerCase()
          );

        return (
          matchesFilter &&
          matchesSearch
        );
      }
    );

  // =========================================================
  // TOGGLE MISSION
  // =========================================================

  const handleMissionToggle =
    async (mission) => {
      if (
        !userId ||
        savingMission === mission.id
      ) {
        return;
      }

      try {
        setSavingMission(
          mission.id
        );

        const userRef = doc(
          db,
          "users",
          userId
        );

        const updatedMilestones =
          milestones.map(
            (
              milestone,
              milestoneIndex
            ) => {
              if (
                milestoneIndex !==
                mission.milestoneIndex
              ) {
                return milestone;
              }

              const tasks =
                Array.isArray(
                  milestone?.tasks
                )
                  ? milestone.tasks
                  : [];

              const existingStatus =
                Array.isArray(
                  milestone?.taskStatus
                )
                  ? [
                      ...milestone.taskStatus,
                    ]
                  : tasks.map(
                      () => false
                    );

              while (
                existingStatus.length <
                tasks.length
              ) {
                existingStatus.push(
                  false
                );
              }

              existingStatus[
                mission.taskIndex
              ] =
                !mission.completed;

              const allTasksCompleted =
                tasks.length > 0 &&
                tasks.every(
                  (_, index) =>
                    existingStatus[
                      index
                    ] === true
                );

              return {
                ...milestone,

                taskStatus:
                  existingStatus,

                completed:
                  allTasksCompleted,
              };
            }
          );

        await updateDoc(
          userRef,
          {
            roadmap: {
              ...roadmap,

              milestones:
                updatedMilestones,
            },
          }
        );
      } catch (error) {
        console.error(
          "Error updating mission:",
          error
        );

        alert(
          "Could not update this mission. Please try again."
        );
      } finally {
        setSavingMission(
          null
        );
      }
    };

  // =========================================================
  // OPEN CHECKPOINT
  // =========================================================

  const handleOpenCheckpoint =
    (mission) => {
      if (
        !onOpenMilestone
      ) {
        return;
      }

      const milestone =
        milestones[
          mission.milestoneIndex
        ];

      if (!milestone) {
        return;
      }

      onOpenMilestone(
        milestone,
        mission.milestoneIndex + 1
      );
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="missions-loading-page">

        <div className="missions-loading-plane">
          ✈️
        </div>

        <h2>
          Loading your missions...
        </h2>

        <p>
          Preparing your next steps.
        </p>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="missions-page">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="missions-bg-glow missions-glow-one"></div>

      <div className="missions-bg-glow missions-glow-two"></div>

      <div className="missions-cloud missions-cloud-one"></div>

      <div className="missions-cloud missions-cloud-two"></div>

      <div className="missions-spark missions-spark-one">
        ✦
      </div>

      <div className="missions-spark missions-spark-two">
        ✧
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="missions-topbar">

        <button
          type="button"
          className="missions-back-button"
          onClick={onBack}
        >
          ← Back to journey
        </button>

        <div className="missions-brand">

          <span>
            ✈
          </span>

          PathPilot

        </div>

      </header>

      <section className="missions-container">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="missions-hero">

          <div className="missions-hero-copy">

            <span className="missions-eyebrow">
              ✦ YOUR LEARNING MISSIONS
            </span>

            <h1>
              Turn your roadmap
              <span>
                into action.
              </span>
            </h1>

            <p>
              Every mission is a practical
              task from your personalized
              career roadmap. Complete them
              one at a time and watch your
              journey move forward.
            </p>

            <div className="missions-hero-stats">

              <div>
                <strong>
                  {remainingMissions}
                </strong>

                <span>
                  To complete
                </span>
              </div>

              <div>
                <strong>
                  {completedMissions}
                </strong>

                <span>
                  Completed
                </span>
              </div>

              <div>
                <strong>
                  {missionProgress}%
                </strong>

                <span>
                  Progress
                </span>
              </div>

            </div>

          </div>

          <div className="missions-hero-visual">

            <div className="mission-orbit mission-orbit-one"></div>

            <div className="mission-orbit mission-orbit-two"></div>

            <div className="mission-hero-icon">
              🚀
            </div>

            <div className="mission-floating-dot dot-one"></div>
            <div className="mission-floating-dot dot-two"></div>
            <div className="mission-floating-dot dot-three"></div>

          </div>

        </section>

        {/* ===================================================
            TODAY / NEXT MISSION
        =================================================== */}

        <section className="mission-focus-card">

          <div className="mission-focus-left">

            <span className="mission-focus-label">
              {nextMission
                ? "NEXT MISSION"
                : "JOURNEY STATUS"}
            </span>

            <h2>
              {nextMission
                ? nextMission.task
                : "You've completed every mission!"}
            </h2>

            <p>
              {nextMission
                ? `Checkpoint ${nextMission.checkpointNumber} • ${nextMission.checkpointTitle}`
                : "Your roadmap is fully complete. Time to celebrate your progress."}
            </p>

          </div>

          <div className="mission-focus-actions">

            {nextMission && (
              <>
                <button
                  type="button"
                  className="mission-focus-primary"
                  onClick={() =>
                    handleMissionToggle(
                      nextMission
                    )
                  }
                  disabled={
                    savingMission ===
                    nextMission.id
                  }
                >
                  {savingMission ===
                  nextMission.id
                    ? "Saving..."
                    : "Complete mission"}

                  <span>
                    ✓
                  </span>

                </button>

                <button
                  type="button"
                  className="mission-focus-secondary"
                  onClick={() =>
                    handleOpenCheckpoint(
                      nextMission
                    )
                  }
                >
                  View checkpoint
                  <span>
                    →
                  </span>
                </button>
              </>
            )}

          </div>

        </section>

        {/* ===================================================
            FILTERS
        =================================================== */}

        <section className="missions-toolbar">

          <div className="missions-toolbar-heading">

            <span>
              YOUR MISSIONS
            </span>

            <h2>
              Keep moving forward.
            </h2>

          </div>

          <div className="missions-tools">

            <div className="missions-search">

              <span>
                ⌕
              </span>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search missions..."
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                >
                  ×
                </button>
              )}

            </div>

            <div className="mission-filter-tabs">

              <button
                type="button"
                className={
                  filter === "all"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("all")
                }
              >
                All
              </button>

              <button
                type="button"
                className={
                  filter === "active"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("active")
                }
              >
                To do
              </button>

              <button
                type="button"
                className={
                  filter === "current"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("current")
                }
              >
                Current
              </button>

              <button
                type="button"
                className={
                  filter ===
                  "completed"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter(
                    "completed"
                  )
                }
              >
                Done
              </button>

            </div>

          </div>

        </section>

        {/* ===================================================
            MISSION LIST
        =================================================== */}

        <section className="missions-list-section">

          {filteredMissions.length ===
          0 ? (

            <div className="missions-empty">

              <div>
                🧭
              </div>

              <h3>
                No missions found
              </h3>

              <p>
                Try another search or
                filter.
              </p>

              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setSearchTerm("");
                }}
              >
                Show all missions
              </button>

            </div>

          ) : (

            <div className="missions-list">

              {filteredMissions.map(
                (mission) => {

                  const isSaving =
                    savingMission ===
                    mission.id;

                  return (
                    <article
                      key={mission.id}
                      className={`mission-card ${
                        mission.completed
                          ? "mission-card-completed"
                          : ""
                      } ${
                        nextMission?.id ===
                        mission.id
                          ? "mission-card-next"
                          : ""
                      }`}
                    >

                      <div className="mission-number">

                        {mission.completed
                          ? "✓"
                          : String(
                              mission.checkpointNumber
                            ).padStart(
                              2,
                              "0"
                            )}

                      </div>

                      <div className="mission-main">

                        <div className="mission-card-top">

                          <div>

                            <span className="mission-checkpoint">
                              CHECKPOINT{" "}
                              {String(
                                mission.checkpointNumber
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            <h3>
                              {mission.task}
                            </h3>

                          </div>

                          {nextMission?.id ===
                            mission.id && (
                            <span className="mission-next-badge">
                              NEXT UP
                            </span>
                          )}

                        </div>

                        <p className="mission-checkpoint-title">
                          {mission.checkpointTitle}
                        </p>

                        <div className="mission-meta">

                          <span>
                            ⏱{" "}
                            {mission.duration}
                          </span>

                          <span>
                            {mission.completed
                              ? "✓ Completed"
                              : "○ Not started"}
                          </span>

                        </div>

                      </div>

                      <div className="mission-actions">

                        <button
                          type="button"
                          className={`mission-complete-button ${
                            mission.completed
                              ? "completed"
                              : ""
                          }`}
                          onClick={() =>
                            handleMissionToggle(
                              mission
                            )
                          }
                          disabled={
                            isSaving
                          }
                        >
                          {isSaving
                            ? "..."
                            : mission.completed
                              ? "Completed ✓"
                              : "Complete"}
                        </button>

                        <button
                          type="button"
                          className="mission-view-button"
                          onClick={() =>
                            handleOpenCheckpoint(
                              mission
                            )
                          }
                        >
                          →
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* ===================================================
            BOTTOM MESSAGE
        =================================================== */}

        <section className="missions-bottom-card">

          <div>

            <span>
              ✦ ONE MISSION AT A TIME
            </span>

            <h2>
              Small progress still moves
              the plane forward.
            </h2>

            <p>
              You don't need to finish
              your whole roadmap today.
              Complete one useful task and
              come back for the next one.
            </p>

          </div>

          <div className="missions-bottom-plane">
            ✈️
          </div>

        </section>

      </section>

    </main>
  );
}

export default Missions;