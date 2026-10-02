import { useEffect, useMemo, useRef, useState } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";
import "./Profile.css";

function Profile({ userId, onBack }) {
  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [educationYear, setEducationYear] = useState("");
  const [educationStream, setEducationStream] = useState("");
  const [institution, setInstitution] = useState("");

  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [priorities, setPriorities] = useState([]);

  const [dailyStudy, setDailyStudy] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [learningStyle, setLearningStyle] = useState("");

  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newPriority, setNewPriority] = useState("");

  const [profilePhoto, setProfilePhoto] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const photoInputRef = useRef(null);

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();

        const education = data.education || {};
        const goals = data.goals || {};
        const studyTime = data.studyTime || {};

        setProfile(data);

        setName(data.name || "");

        setEducationLevel(
          education.level || ""
        );

        setEducationYear(
          education.year || ""
        );

        setEducationStream(
          education.stream || ""
        );

        setInstitution(
          education.institution || ""
        );

        setSkills(
          Array.isArray(data.skills)
            ? data.skills
            : []
        );

        setInterests(
          Array.isArray(data.interests)
            ? data.interests
            : []
        );

        setPrimaryGoal(
          goals.primary || ""
        );

        setPriorities(
          Array.isArray(goals.priorities)
            ? goals.priorities
            : []
        );

        setDailyStudy(
          studyTime.daily || ""
        );

        setPreferredTime(
          studyTime.preferredTime || ""
        );

        setLearningStyle(
          studyTime.learningStyle || ""
        );

        setProfilePhoto(
          data.profilePhoto || ""
        );
      },
      (snapshotError) => {
        console.error(
          "Error loading profile:",
          snapshotError
        );

        setError(
          "Unable to load your profile."
        );
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // =========================================================
  // ROADMAP STATS
  // =========================================================

  const milestones = Array.isArray(
    profile?.roadmap?.milestones
  )
    ? profile.roadmap.milestones
    : [];

  const completedTasks = useMemo(() => {
    return milestones.reduce(
      (total, milestone) => {
        const tasks = Array.isArray(
          milestone?.tasks
        )
          ? milestone.tasks
          : [];

        const status = Array.isArray(
          milestone?.taskStatus
        )
          ? milestone.taskStatus
          : [];

        return (
          total +
          status.filter(
            (value, index) =>
              value === true &&
              index < tasks.length
          ).length
        );
      },
      0
    );
  }, [milestones]);

  const completedMilestones = useMemo(() => {
    return milestones.filter(
      (milestone) => {
        const tasks = Array.isArray(
          milestone?.tasks
        )
          ? milestone.tasks
          : [];

        const status = Array.isArray(
          milestone?.taskStatus
        )
          ? milestone.taskStatus
          : [];

        if (tasks.length === 0) {
          return milestone?.completed === true;
        }

        return tasks.every(
          (_, index) =>
            status[index] === true
        );
      }
    ).length;
  }, [milestones]);

  const savedResourceCount =
    Array.isArray(profile?.savedResources)
      ? profile.savedResources.length
      : 0;

  // =========================================================
  // BADGES
  // =========================================================

  const badges = useMemo(() => {
    return [
      {
        id: "first-takeoff",
        icon: "✈",
        title: "First Takeoff",
        description:
          "Completed your PathPilot onboarding journey.",
        unlocked:
          profile?.onboardingCompleted === true,
      },
      {
        id: "goal-setter",
        icon: "🎯",
        title: "Goal Setter",
        description:
          "Added a primary career goal.",
        unlocked:
          Boolean(
            profile?.goals?.primary
          ),
      },
      {
        id: "skill-builder",
        icon: "◆",
        title: "Skill Builder",
        description:
          "Added at least three skills to your profile.",
        unlocked:
          skills.length >= 3,
      },
      {
        id: "mission-runner",
        icon: "✓",
        title: "Mission Runner",
        description:
          "Completed your first roadmap task.",
        unlocked:
          completedTasks >= 1,
      },
      {
        id: "checkpoint-cleared",
        icon: "✦",
        title: "Checkpoint Cleared",
        description:
          "Completed your first roadmap checkpoint.",
        unlocked:
          completedMilestones >= 1,
      },
      {
        id: "resource-explorer",
        icon: "◈",
        title: "Resource Explorer",
        description:
          "Saved a learning resource for later.",
        unlocked:
          savedResourceCount >= 1,
      },
    ];
  }, [
    profile,
    skills.length,
    completedTasks,
    completedMilestones,
    savedResourceCount,
  ]);

  const unlockedBadgeCount =
    badges.filter(
      (badge) => badge.unlocked
    ).length;

  // =========================================================
  // TAG HELPERS
  // =========================================================

  const addSkill = () => {
    const value = newSkill.trim();

    if (
      !value ||
      skills.some(
        (skill) =>
          skill.toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      return;
    }

    setSkills([
      ...skills,
      value,
    ]);

    setNewSkill("");
  };

  const removeSkill = (indexToRemove) => {
    setSkills(
      skills.filter(
        (_, index) =>
          index !== indexToRemove
      )
    );
  };

  const addInterest = () => {
    const value =
      newInterest.trim();

    if (
      !value ||
      interests.some(
        (interest) =>
          interest.toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      return;
    }

    setInterests([
      ...interests,
      value,
    ]);

    setNewInterest("");
  };

  const removeInterest = (
    indexToRemove
  ) => {
    setInterests(
      interests.filter(
        (_, index) =>
          index !== indexToRemove
      )
    );
  };

  const addPriority = () => {
    const value =
      newPriority.trim();

    if (
      !value ||
      priorities.some(
        (priority) =>
          priority.toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      return;
    }

    setPriorities([
      ...priorities,
      value,
    ]);

    setNewPriority("");
  };

  const removePriority = (
    indexToRemove
  ) => {
    setPriorities(
      priorities.filter(
        (_, index) =>
          index !== indexToRemove
      )
    );
  };

  // =========================================================
  // PHOTO UPLOAD
  // =========================================================

  const handlePhotoChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please choose an image file."
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Please choose an image smaller than 5 MB."
      );
      return;
    }

    setError("");

    const reader =
      new FileReader();

    reader.onload = (
      readerEvent
    ) => {
      const image =
        new Image();

      image.onload = () => {
        const canvas =
          document.createElement(
            "canvas"
          );

        const maxSize = 500;

        let width =
          image.width;

        let height =
          image.height;

        if (
          width > maxSize ||
          height > maxSize
        ) {
          const scale =
            Math.min(
              maxSize / width,
              maxSize / height
            );

          width =
            Math.round(
              width * scale
            );

          height =
            Math.round(
              height * scale
            );
        }

        canvas.width =
          width;

        canvas.height =
          height;

        const context =
          canvas.getContext("2d");

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        const compressed =
          canvas.toDataURL(
            "image/jpeg",
            0.78
          );

        setProfilePhoto(
          compressed
        );
      };

      image.src =
        readerEvent.target.result;
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const removePhoto = () => {
    setProfilePhoto("");
  };

  // =========================================================
  // SAVE
  // =========================================================

  const saveProfile = async () => {
    if (
      !userId ||
      !name.trim()
    ) {
      setError(
        "Please enter your name."
      );

      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await setDoc(
        doc(db, "users", userId),
        {
          name: name.trim(),

          profilePhoto:
            profilePhoto || "",

          education: {
            level:
              educationLevel,
            year:
              educationYear,
            stream:
              educationStream.trim(),
            institution:
              institution.trim(),
          },

          skills,

          interests,

          goals: {
            primary:
              primaryGoal.trim(),
            priorities,
          },

          studyTime: {
            daily:
              dailyStudy,
            preferredTime:
              preferredTime,
            learningStyle:
              learningStyle,
          },
        },
        {
          merge: true,
        }
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (saveError) {
      console.error(
        "Error updating profile:",
        saveError
      );

      setError(
        "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DISPLAY
  // =========================================================

  const studentName =
    name || "Pilot";

  const initials =
    studentName
      .trim()
      .charAt(0)
      .toUpperCase() || "P";

  const educationText =
    educationLevel
      ? `${educationLevel}${
          educationYear
            ? ` • ${educationYear}`
            : ""
        }`
      : "Not set";

  return (
    <div className="profile-page">
      <div className="profile-glow profile-glow-one" />
      <div className="profile-glow profile-glow-two" />

      {/* =====================================================
          TOPBAR
      ===================================================== */}

      <header className="profile-topbar">
        <button
          type="button"
          className="profile-back-button"
          onClick={onBack}
        >
          ← Dashboard
        </button>

        <div className="profile-brand">
          <span>✦</span>
          <strong>
            PathPilot
          </strong>
        </div>
      </header>

      <main className="profile-container">

        {/* ===================================================
            HEADING
        =================================================== */}

        <section className="profile-heading">
          <span>ACCOUNT</span>

          <h1>
            Your profile
          </h1>

          <p>
            Keep your PathPilot identity,
            skills and learning preferences
            up to date as your journey evolves.
          </p>
        </section>

        {/* ===================================================
            PROFILE HEADER CARD
        =================================================== */}

        <section className="profile-identity-card">

          <div className="profile-identity-left">

            <div className="profile-photo-area">

              <div
                className={`profile-avatar ${
                  profilePhoto
                    ? "has-photo"
                    : ""
                }`}
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="profile-photo-actions">

                <strong>
                  {studentName}
                </strong>

                <span>
                  Student Pilot
                </span>

                <div className="profile-photo-buttons">

                  <button
                    type="button"
                    onClick={() =>
                      photoInputRef.current?.click()
                    }
                  >
                    {profilePhoto
                      ? "Change photo"
                      : "Add photo"}
                  </button>

                  {profilePhoto && (
                    <button
                      type="button"
                      className="remove-photo-button"
                      onClick={
                        removePhoto
                      }
                    >
                      Remove
                    </button>
                  )}

                  <input
                    ref={
                      photoInputRef
                    }
                    type="file"
                    accept="image/*"
                    onChange={
                      handlePhotoChange
                    }
                    hidden
                  />

                </div>

              </div>

            </div>

          </div>

          <div className="profile-identity-stats">

            <div>
              <span>CHECKPOINTS</span>
              <strong>
                {completedMilestones}
              </strong>
            </div>

            <div>
              <span>TASKS DONE</span>
              <strong>
                {completedTasks}
              </strong>
            </div>

            <div>
              <span>BADGES</span>
              <strong>
                {unlockedBadgeCount}
              </strong>
            </div>

          </div>

        </section>

        {/* ===================================================
            PERSONAL DETAILS
        =================================================== */}

        <section className="profile-edit-card">

          <div className="profile-section-heading">
            <div>
              <span>PERSONAL DETAILS</span>
              <h2>
                Basic information
              </h2>
            </div>
          </div>

          <div className="profile-edit-grid">

            <div className="profile-field">
              <label>
                Full name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Your full name"
              />
            </div>

            <div className="profile-field">
              <label>
                Email
              </label>

              <input
                type="email"
                value={
                  profile?.email || ""
                }
                disabled
              />

              <small>
                Managed by Firebase
                Authentication.
              </small>
            </div>

          </div>

        </section>

        {/* ===================================================
            CAREER DESTINATION
        =================================================== */}

        <section className="profile-destination-section">

          <div className="profile-destination-content">

            <div>
              <span>
                YOUR DESTINATION
              </span>

              <h2>
                {profile?.career ||
                  "Your career"}
              </h2>

              <p>
                {profile?.field ||
                  "Your selected field"}
              </p>
            </div>

            <div className="profile-destination-lock">
              ✦
            </div>

          </div>

          <div className="profile-destination-note">
            Your destination is connected
            to your current roadmap. To change
            it safely, create a new journey.
          </div>

        </section>

        {/* ===================================================
            EDUCATION
        =================================================== */}

        <section className="profile-edit-card">

          <div className="profile-section-heading">
            <div>
              <span>EDUCATION</span>
              <h2>
                Your academic profile
              </h2>
            </div>
          </div>

          <div className="profile-edit-grid">

            <div className="profile-field">
              <label>
                Level
              </label>

              <input
                type="text"
                value={
                  educationLevel
                }
                onChange={(event) =>
                  setEducationLevel(
                    event.target.value
                  )
                }
                placeholder="e.g. TYBSc CS"
              />
            </div>

            <div className="profile-field">
              <label>
                Year
              </label>

              <input
                type="text"
                value={
                  educationYear
                }
                onChange={(event) =>
                  setEducationYear(
                    event.target.value
                  )
                }
                placeholder="e.g. 2026–27"
              />
            </div>

            <div className="profile-field">
              <label>
                Stream
              </label>

              <input
                type="text"
                value={
                  educationStream
                }
                onChange={(event) =>
                  setEducationStream(
                    event.target.value
                  )
                }
                placeholder="Your stream"
              />
            </div>

            <div className="profile-field">
              <label>
                Institution
              </label>

              <input
                type="text"
                value={
                  institution
                }
                onChange={(event) =>
                  setInstitution(
                    event.target.value
                  )
                }
                placeholder="College / school"
              />
            </div>

          </div>

        </section>

        {/* ===================================================
            SKILLS
        =================================================== */}

        <section className="profile-edit-card">

          <div className="profile-section-heading">
            <div>
              <span>SKILLS</span>
              <h2>
                Your strengths
              </h2>
            </div>
          </div>

          <div className="profile-tags editable-tags">
            {skills.map(
              (skill, index) => (
                <span
                  key={`${skill}-${index}`}
                >
                  {skill}

                  <button
                    type="button"
                    onClick={() =>
                      removeSkill(
                        index
                      )
                    }
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              )
            )}

            {skills.length ===
              0 && (
              <p className="empty-tag-text">
                No skills added yet.
              </p>
            )}
          </div>

          <div className="profile-add-row">

            <input
              type="text"
              value={newSkill}
              onChange={(event) =>
                setNewSkill(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Add a skill..."
            />

            <button
              type="button"
              onClick={
                addSkill
              }
            >
              + Add skill
            </button>

          </div>

        </section>

        {/* ===================================================
            INTERESTS
        =================================================== */}

        <section className="profile-edit-card">

          <div className="profile-section-heading">
            <div>
              <span>INTERESTS</span>
              <h2>
                What interests you
              </h2>
            </div>
          </div>

          <div className="profile-tags editable-tags">
            {interests.map(
              (
                interest,
                index
              ) => (
                <span
                  key={`${interest}-${index}`}
                >
                  {interest}

                  <button
                    type="button"
                    onClick={() =>
                      removeInterest(
                        index
                      )
                    }
                    aria-label={`Remove ${interest}`}
                  >
                    ×
                  </button>
                </span>
              )
            )}

            {interests.length ===
              0 && (
              <p className="empty-tag-text">
                No interests added yet.
              </p>
            )}
          </div>

          <div className="profile-add-row">

            <input
              type="text"
              value={
                newInterest
              }
              onChange={(event) =>
                setNewInterest(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();
                  addInterest();
                }
              }}
              placeholder="Add an interest..."
            />

            <button
              type="button"
              onClick={
                addInterest
              }
            >
              + Add interest
            </button>

          </div>

        </section>

        {/* ===================================================
            GOALS
        =================================================== */}

        <section className="profile-edit-card">

          <div className="profile-section-heading">
            <div>
              <span>GOALS</span>
              <h2>
                Your direction
              </h2>
            </div>
          </div>

          <div className="profile-field">

            <label>
              Primary goal
            </label>

            <textarea
              value={
                primaryGoal
              }
              onChange={(event) =>
                setPrimaryGoal(
                  event.target.value
                )
              }
              placeholder="What are you working toward?"
              rows={3}
            />

          </div>

          <div className="profile-subsection-title">
            Priorities
          </div>

          <div className="profile-tags editable-tags">
            {priorities.map(
              (
                priority,
                index
              ) => (
                <span
                  key={`${priority}-${index}`}
                >
                  {priority}

                  <button
                    type="button"
                    onClick={() =>
                      removePriority(
                        index
                      )
                    }
                  >
                    ×
                  </button>
                </span>
              )
            )}
          </div>

          <div className="profile-add-row">

            <input
              type="text"
              value={
                newPriority
              }
              onChange={(event) =>
                setNewPriority(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();
                  addPriority();
                }
              }}
              placeholder="Add a priority..."
            />

            <button
              type="button"
              onClick={
                addPriority
              }
            >
              + Add priority
            </button>

          </div>

        </section>

        {/* ===================================================
            STUDY ROUTINE
        =================================================== */}

        <section className="profile-edit-card">

          <div className="profile-section-heading">
            <div>
              <span>STUDY ROUTINE</span>
              <h2>
                Your learning rhythm
              </h2>
            </div>
          </div>

          <div className="profile-edit-grid">

            <div className="profile-field">
              <label>
                Daily study time
              </label>

              <input
                type="text"
                value={
                  dailyStudy
                }
                onChange={(event) =>
                  setDailyStudy(
                    event.target.value
                  )
                }
                placeholder="e.g. 2 hours"
              />
            </div>

            <div className="profile-field">
              <label>
                Preferred time
              </label>

              <input
                type="text"
                value={
                  preferredTime
                }
                onChange={(event) =>
                  setPreferredTime(
                    event.target.value
                  )
                }
                placeholder="e.g. Evening"
              />
            </div>

            <div className="profile-field profile-field-full">
              <label>
                Learning style
              </label>

              <input
                type="text"
                value={
                  learningStyle
                }
                onChange={(event) =>
                  setLearningStyle(
                    event.target.value
                  )
                }
                placeholder="e.g. Practical, visual, project-based"
              />
            </div>

          </div>

        </section>

        {/* ===================================================
            BADGES
        =================================================== */}

        <section className="profile-badges-section">

          <div className="profile-section-heading">
            <div>
              <span>ACHIEVEMENTS</span>
              <h2>
                Your badges
              </h2>
            </div>

            <span className="badge-count">
              {unlockedBadgeCount}
              /
              {badges.length}
              unlocked
            </span>
          </div>

          <div className="profile-badges-grid">

            {badges.map(
              (badge) => (
                <article
                  key={badge.id}
                  className={`profile-badge-card ${
                    badge.unlocked
                      ? "unlocked"
                      : "locked"
                  }`}
                >
                  <div className="profile-badge-icon">
                    {badge.icon}
                  </div>

                  <div>
                    <strong>
                      {badge.title}
                    </strong>

                    <p>
                      {badge.description}
                    </p>

                    <span>
                      {badge.unlocked
                        ? "UNLOCKED"
                        : "LOCKED"}
                    </span>
                  </div>
                </article>
              )
            )}

          </div>

        </section>

        {/* ===================================================
            ERROR / SAVE
        =================================================== */}

        {error && (
          <div className="profile-error">
            <span>!</span>
            {error}
          </div>
        )}

        <div className="profile-save-bar">

          <div>
            <span>
              PROFILE SETTINGS
            </span>

            <p>
              Changes are saved to your
              PathPilot account.
            </p>
          </div>

          <button
            type="button"
            className="profile-save-button"
            onClick={
              saveProfile
            }
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : saved
                ? "✓ Changes saved"
                : "Save profile"}
          </button>

        </div>

        <div className="profile-footer-note">
          <span>✈</span>

          <p>
            Your destination can change.
            Your profile can change with it.
          </p>
        </div>

      </main>
    </div>
  );
}

export default Profile;