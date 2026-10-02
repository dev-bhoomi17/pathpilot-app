import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import "./GoalsPage.css";

function GoalsPage({
  selectedField,
  selectedCareer,
  userId,
  onBack,
  onContinue,
}) {
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [priorities, setPriorities] = useState([]);
  const [customGoal, setCustomGoal] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const goalOptions = [
    {
      icon: "💼",
      title: "Get a Job",
      description: "Prepare for placements and start my career.",
    },
    {
      icon: "🧑‍💻",
      title: "Get an Internship",
      description: "Gain practical experience before graduating.",
    },
    {
      icon: "🎓",
      title: "Pursue Higher Studies",
      description: "Prepare for further education and specialization.",
    },
    {
      icon: "🚀",
      title: "Start a Business",
      description: "Turn an idea into a business or startup.",
    },
    {
      icon: "🌍",
      title: "Work Abroad",
      description: "Prepare for career opportunities internationally.",
    },
    {
      icon: "💻",
      title: "Become a Freelancer",
      description: "Build skills and work independently.",
    },
    {
      icon: "🏆",
      title: "Build a Strong Portfolio",
      description: "Create projects that demonstrate my abilities.",
    },
    {
      icon: "🔄",
      title: "Explore a Career Change",
      description: "Move toward a new career direction.",
    },
  ];

  const priorityOptions = [
    "Career growth",
    "Financial stability",
    "Learning opportunities",
    "Creativity",
    "Making an impact",
    "Work-life balance",
    "Job security",
    "Independence",
  ];

  const togglePriority = (priority) => {
    setPriorities((previousPriorities) => {
      if (previousPriorities.includes(priority)) {
        return previousPriorities.filter(
          (item) => item !== priority
        );
      }

      return [...previousPriorities, priority];
    });

    setError("");
  };

  const addCustomGoal = () => {
    const goal = customGoal.trim();

    if (!goal) {
      return;
    }

    setPrimaryGoal(goal);
    setCustomGoal("");
    setError("");
  };

  const handleGoalsContinue = async () => {
    if (!primaryGoal) {
      setError("Please choose your main goal.");
      return;
    }

    if (priorities.length === 0) {
      setError("Please choose at least one priority.");
      return;
    }

    if (!userId) {
      setError(
        "We couldn't identify your account. Please try again."
      );

      console.error("No user ID available.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const goalData = {
        primary: primaryGoal,
        priorities,
      };

      await updateDoc(doc(db, "users", userId), {
        goals: goalData,
      });

      console.log("Goals saved to Firestore.");

      onContinue(goalData);
    } catch (error) {
      console.error("Error saving goals:", error);

      setError(
        "We couldn't save your goals. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="goals-page">

      <button
        className="goals-back-button"
        type="button"
        onClick={onBack}
      >
        ← Back
      </button>

      <section className="goals-container">

        {/* Progress */}
        <div className="goals-progress">

          <div className="goals-progress-text">
            <span>STEP 7</span>
            <span>4 OF 5</span>
          </div>

          <div className="goals-progress-track">
            <div className="goals-progress-fill"></div>
          </div>

        </div>


        {/* Header */}
        <div className="goals-header">

          <p className="goals-label">
            THINK ABOUT WHERE YOU WANT TO GO
          </p>

          <h1>
            What are you
            <br />
            hoping to achieve? 🎯
          </h1>

          <p>
            Tell us what success looks like for you.
            <br />
            This helps us shape the right journey.
          </p>

        </div>


        {/* Destination */}
        <div className="goals-destination">

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


        {/* Main card */}
        <div className="goals-card">

          {/* Primary goal */}
          <div className="goals-section">

            <div className="goals-section-heading">
              <div>
                <h2>Choose your main goal</h2>

                <p>
                  Pick the outcome that matters most to you.
                </p>
              </div>

              <span className="required-label">
                Required
              </span>
            </div>


            <div className="goal-grid">

              {goalOptions.map((goal) => (
                <button
                  key={goal.title}
                  type="button"
                  className={`goal-option ${
                    primaryGoal === goal.title
                      ? "goal-option-selected"
                      : ""
                  }`}
                  onClick={() => {
                    setPrimaryGoal(goal.title);
                    setError("");
                  }}
                >
                  <span className="goal-icon">
                    {goal.icon}
                  </span>

                  <span className="goal-option-content">

                    <strong>
                      {goal.title}
                    </strong>

                    <small>
                      {goal.description}
                    </small>

                  </span>

                  <span className="goal-check">
                    {primaryGoal === goal.title
                      ? "✓"
                      : ""}
                  </span>
                </button>
              ))}

            </div>


            {/* Custom goal */}
            <div className="custom-goal-section">

              <label htmlFor="custom-goal">
                Have a different goal?
              </label>

              <div className="custom-goal-row">

                <input
                  id="custom-goal"
                  type="text"
                  value={customGoal}
                  placeholder="Write your own goal"
                  onChange={(event) =>
                    setCustomGoal(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustomGoal();
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={addCustomGoal}
                >
                  Use Goal
                </button>

              </div>

            </div>

          </div>


          {/* Priorities */}
          <div className="goals-section priorities-section">

            <div className="goals-section-heading">

              <div>
                <h2>
                  What matters most to you?
                </h2>

                <p>
                  Select one or more priorities.
                </p>
              </div>

            </div>


            <div className="priority-list">

              {priorityOptions.map((priority) => (
                <button
                  key={priority}
                  type="button"
                  className={`priority-chip ${
                    priorities.includes(priority)
                      ? "priority-chip-selected"
                      : ""
                  }`}
                  onClick={() =>
                    togglePriority(priority)
                  }
                >
                  <span>
                    {priorities.includes(priority)
                      ? "✓"
                      : "+"}
                  </span>

                  {priority}
                </button>
              ))}

            </div>

          </div>


          {/* Summary */}
          {primaryGoal && (
            <div className="goals-summary">

              <span className="summary-icon">
                🎯
              </span>

              <div>
                <small>Your main goal</small>

                <strong>
                  {primaryGoal}
                </strong>
              </div>

            </div>
          )}


          {/* Error */}
          {error && (
            <p className="goals-error">
              {error}
            </p>
          )}


          {/* Continue */}
          <button
            className="goals-continue"
            type="button"
            onClick={handleGoalsContinue}
            disabled={
              !primaryGoal ||
              priorities.length === 0 ||
              saving
            }
          >
            {saving
              ? "Saving Your Goals..."
              : "Continue to Study Time →"}
          </button>

        </div>

      </section>

    </main>
  );
}

export default GoalsPage;