import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "./MilestoneDetails.css";

function MilestoneDetails({
  userId,
  milestone,
  milestoneNumber,
  onBack,
}) {
  const [taskStatus, setTaskStatus] = useState([]);
  const [savingTask, setSavingTask] = useState(null);

  // =========================================================
  // INITIALIZE TASK STATUS
  // =========================================================
  useEffect(() => {
    if (!milestone) {
      setTaskStatus([]);
      return;
    }

    const tasks = Array.isArray(milestone.tasks)
      ? milestone.tasks
      : [];

    const existingStatus = Array.isArray(
      milestone.taskStatus
    )
      ? milestone.taskStatus
      : [];

    // Make sure taskStatus always has exactly one
    // entry for every task.
    const normalizedStatus = tasks.map(
      (_, index) =>
        existingStatus[index] === true
    );

    setTaskStatus(normalizedStatus);
  }, [milestone]);

  // =========================================================
  // EMPTY STATE
  // =========================================================
  if (!milestone) {
    return (
      <div className="milestone-details-empty">
        <h2>Milestone not found</h2>

        <button
          type="button"
          onClick={onBack}
        >
          ← Back to roadmap
        </button>
      </div>
    );
  }

  // =========================================================
  // MILESTONE DATA
  // =========================================================
  const tasks = Array.isArray(
    milestone.tasks
  )
    ? milestone.tasks
    : [];

  const skills = Array.isArray(
    milestone.skills
  )
    ? milestone.skills
    : [];

  // =========================================================
  // COMPLETION
  // =========================================================
  const completedTaskCount =
    taskStatus.filter(
      (status) => status === true
    ).length;

  const completed =
    tasks.length > 0 &&
    completedTaskCount === tasks.length;

  // =========================================================
  // HANDLE TASK TOGGLE
  // =========================================================
  const handleTaskToggle = async (
    taskIndex
  ) => {
    if (
      !userId ||
      !milestone ||
      !Array.isArray(milestone.tasks)
    ) {
      return;
    }

    try {
      setSavingTask(taskIndex);

      // -----------------------------------------------------
      // CREATE A COMPLETE STATUS ARRAY
      // -----------------------------------------------------
      const updatedStatus =
        tasks.map(
          (_, index) =>
            taskStatus[index] === true
        );

      // Toggle selected task
      updatedStatus[taskIndex] =
        !updatedStatus[taskIndex];

      // -----------------------------------------------------
      // CHECK IF ALL TASKS ARE COMPLETE
      // -----------------------------------------------------
      const allTasksCompleted =
        tasks.length > 0 &&
        updatedStatus.every(
          (status) => status === true
        );

      // -----------------------------------------------------
      // GET USER PROFILE
      // -----------------------------------------------------
      const userRef = doc(
        db,
        "users",
        userId
      );

      const snapshot = await getDoc(
        userRef
      );

      if (!snapshot.exists()) {
        throw new Error(
          "User profile not found."
        );
      }

      const userData =
        snapshot.data();

      const roadmap =
        userData.roadmap;

      if (
        !roadmap ||
        !Array.isArray(
          roadmap.milestones
        )
      ) {
        throw new Error(
          "Roadmap not found."
        );
      }

      // -----------------------------------------------------
      // UPDATE ONLY THIS MILESTONE
      // -----------------------------------------------------
      const updatedMilestones =
        roadmap.milestones.map(
          (
            roadmapMilestone,
            index
          ) => {
            if (
              index !==
              milestoneNumber - 1
            ) {
              return roadmapMilestone;
            }

            return {
              ...roadmapMilestone,

              taskStatus:
                updatedStatus,

              completed:
                allTasksCompleted,
            };
          }
        );

      // -----------------------------------------------------
      // SAVE TO FIRESTORE
      // -----------------------------------------------------
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

      // -----------------------------------------------------
      // UPDATE UI IMMEDIATELY
      // -----------------------------------------------------
      setTaskStatus(
        updatedStatus
      );

    } catch (error) {
      console.error(
        "Error updating task:",
        error
      );

      alert(
        "Could not save the task status. Please try again."
      );
    } finally {
      setSavingTask(null);
    }
  };

  return (
    <div className="milestone-details-page">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="milestone-details-topbar">

        <button
          className="milestone-back-button"
          type="button"
          onClick={onBack}
        >
          ← Back to roadmap
        </button>

        <div className="milestone-brand">
          <span>✈</span>
          PathPilot
        </div>

      </header>

      <main className="milestone-details-container">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="milestone-details-hero">

          <div className="milestone-hero-content">

            <span className="milestone-checkpoint">
              CHECKPOINT{" "}
              {String(
                milestoneNumber
              ).padStart(2, "0")}
            </span>

            <h1>
              {milestone.title}
            </h1>

            <p>
              {milestone.description ||
                "Build the knowledge and practical experience needed for this stage of your career journey."}
            </p>

            <div className="milestone-hero-meta">

              {/* DURATION */}

              <div className="milestone-meta-box">

                <span>⏱</span>

                <div>

                  <small>
                    Estimated duration
                  </small>

                  <strong>
                    {milestone.duration ||
                      "Flexible"}
                  </strong>

                </div>

              </div>

              {/* STATUS */}

              <div
                className={`milestone-meta-box ${
                  completed
                    ? "completed-box"
                    : ""
                }`}
              >

                <span>
                  {completed
                    ? "✓"
                    : "○"}
                </span>

                <div>

                  <small>
                    Status
                  </small>

                  <strong>
                    {completed
                      ? "Completed"
                      : "Ready to begin"}
                  </strong>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              HERO VISUAL
          ================================================= */}

          <div className="milestone-hero-visual">

            <div className="milestone-orbit"></div>

            <div className="milestone-hero-plane">
              ✈️
            </div>

            <div className="milestone-hero-star star-a">
              ✦
            </div>

            <div className="milestone-hero-star star-b">
              ✧
            </div>

          </div>

        </section>

        {/* ===================================================
            SKILLS
        =================================================== */}

        <section className="milestone-detail-card">

          <div className="detail-card-heading">

            <div>

              <span>🧠</span>

              <div>

                <small>
                  WHAT YOU'LL BUILD
                </small>

                <h2>
                  Skills to develop
                </h2>

              </div>

            </div>

          </div>

          {skills.length > 0 ? (

            <div className="detail-skills">

              {skills.map(
                (skill, index) => (
                  <div
                    className="detail-skill"
                    key={`${skill}-${index}`}
                  >
                    <span>✦</span>
                    {skill}
                  </div>
                )
              )}

            </div>

          ) : (

            <p className="detail-empty-text">
              No specific skills were
              added for this milestone.
            </p>

          )}

        </section>

        {/* ===================================================
            TASKS
        =================================================== */}

        <section className="milestone-task-section">

          <div className="task-section-heading">

            <div>

              <span>🚀</span>

              <div>

                <small>
                  YOUR ACTION PLAN
                </small>

                <h2>
                  Practical tasks
                </h2>

              </div>

            </div>

            <div className="task-total">

              {completedTaskCount}
              {" / "}
              {tasks.length}
              {" completed"}

            </div>

          </div>

          {tasks.length > 0 ? (

            <div className="milestone-task-list">

              {tasks.map(
                (task, index) => {

                  const isCompleted =
                    taskStatus[index] ===
                    true;

                  const isSaving =
                    savingTask ===
                    index;

                  return (
                    <button
                      type="button"
                      className={`milestone-task-card ${
                        isCompleted
                          ? "task-completed"
                          : ""
                      }`}
                      key={`${task}-${index}`}
                      onClick={() =>
                        handleTaskToggle(
                          index
                        )
                      }
                      disabled={
                        isSaving
                      }
                    >

                      {/* TASK NUMBER */}

                      <div className="task-number">

                        {isCompleted
                          ? "✓"
                          : String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}

                      </div>

                      {/* TASK CONTENT */}

                      <div className="task-content">

                        <h3>
                          {task}
                        </h3>

                        <span>

                          {isSaving
                            ? "Saving..."
                            : isCompleted
                              ? "✓ Completed"
                              : "○ Not started"}

                        </span>

                      </div>

                      {/* ARROW */}

                      <div className="task-arrow">

                        {isCompleted
                          ? "✓"
                          : "→"}

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          ) : (

            <div className="no-tasks">

              <span>🗺️</span>

              <h3>
                No tasks added yet
              </h3>

              <p>
                Your tasks for this
                milestone will appear here.
              </p>

            </div>

          )}

        </section>

        {/* ===================================================
            BOTTOM CARD
        =================================================== */}

        <section className="milestone-bottom-card">

          <div>

            <span className="bottom-label">
              ✦ ONE STEP AT A TIME
            </span>

            <h2>
              Every checkpoint takes you
              closer.
            </h2>

            <p>
              Focus on completing the
              tasks for this stage. You
              don't need to finish
              everything at once.
            </p>

          </div>

          <div className="bottom-plane">
            ✈️
          </div>

        </section>

      </main>

    </div>
  );
}

export default MilestoneDetails;