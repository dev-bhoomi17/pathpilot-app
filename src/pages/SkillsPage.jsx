import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import "./SkillsPage.css";

function SkillsPage({
  selectedField,
  selectedCareer,
  userId,
  onBack,
  onContinue,
}) {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const skillsByField = {
    Technology: [
      "Python",
      "JavaScript",
      "Java",
      "SQL",
      "HTML",
      "CSS",
      "React",
      "Git",
      "Networking",
      "Problem Solving",
    ],

    Healthcare: [
      "Biology",
      "Patient Care",
      "Medical Research",
      "Communication",
      "Critical Thinking",
      "Teamwork",
      "Clinical Skills",
      "Documentation",
      "Time Management",
      "Empathy",
    ],

    "Business & Finance": [
      "Excel",
      "Financial Analysis",
      "Marketing",
      "Communication",
      "Leadership",
      "Business Strategy",
      "Accounting",
      "Presentation",
      "Negotiation",
      "Problem Solving",
    ],

    "Arts & Creative": [
      "Graphic Design",
      "Photography",
      "Writing",
      "Illustration",
      "Animation",
      "Video Editing",
      "Creative Thinking",
      "Storytelling",
      "Branding",
      "Communication",
    ],

    "Science & Research": [
      "Scientific Research",
      "Data Analysis",
      "Laboratory Skills",
      "Critical Thinking",
      "Statistics",
      "Scientific Writing",
      "Observation",
      "Problem Solving",
      "Research Methods",
      "Documentation",
    ],

    "Law & Public Service": [
      "Legal Research",
      "Communication",
      "Public Speaking",
      "Critical Thinking",
      "Writing",
      "Analysis",
      "Leadership",
      "Negotiation",
      "Problem Solving",
      "Decision Making",
    ],

    Education: [
      "Teaching",
      "Communication",
      "Presentation",
      "Public Speaking",
      "Lesson Planning",
      "Research",
      "Leadership",
      "Patience",
      "Teamwork",
      "Time Management",
    ],

    "Engineering & Architecture": [
      "CAD",
      "Engineering Design",
      "Problem Solving",
      "Mathematics",
      "Technical Drawing",
      "Project Management",
      "3D Modelling",
      "Analysis",
      "Technical Writing",
      "Teamwork",
    ],

    "Environment & Agriculture": [
      "Environmental Research",
      "Agriculture",
      "Data Analysis",
      "Sustainability",
      "Field Research",
      "Project Management",
      "Communication",
      "Problem Solving",
      "Observation",
      "Resource Management",
    ],

    "Travel & Hospitality": [
      "Customer Service",
      "Communication",
      "Event Planning",
      "Travel Planning",
      "Hospitality",
      "Leadership",
      "Teamwork",
      "Problem Solving",
      "Time Management",
      "Organization",
    ],
  };

  const availableSkills =
    skillsByField[selectedField?.title] || [
      "Communication",
      "Teamwork",
      "Problem Solving",
      "Leadership",
      "Time Management",
      "Critical Thinking",
    ];

  const toggleSkill = (skill) => {
    setSelectedSkills((previousSkills) => {
      if (previousSkills.includes(skill)) {
        return previousSkills.filter(
          (item) => item !== skill
        );
      }

      return [...previousSkills, skill];
    });

    setError("");
  };

  const addCustomSkill = () => {
    const newSkill = customSkill.trim();

    if (!newSkill) {
      return;
    }

    if (!selectedSkills.includes(newSkill)) {
      setSelectedSkills((previousSkills) => [
        ...previousSkills,
        newSkill,
      ]);
    }

    setCustomSkill("");
    setError("");
  };

  const handleSkillsContinue = async () => {
    if (selectedSkills.length === 0) {
      setError("Please select at least one skill.");
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

      await updateDoc(doc(db, "users", userId), {
        skills: selectedSkills,
      });

      console.log("Skills saved to Firestore.");

      onContinue(selectedSkills);
    } catch (error) {
      console.error("Error saving skills:", error);

      setError(
        "We couldn't save your skills. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="skills-page">

      <button
        className="skills-back-button"
        type="button"
        onClick={onBack}
      >
        ← Back
      </button>

      <section className="skills-container">

        {/* Progress */}
        <div className="skills-progress">

          <div className="skills-progress-text">
            <span>STEP 5</span>
            <span>2 OF 5</span>
          </div>

          <div className="skills-progress-track">
            <div className="skills-progress-fill"></div>
          </div>

        </div>


        {/* Header */}
        <div className="skills-header">

          <p className="skills-label">
            LET'S GET TO KNOW YOU
          </p>

          <h1>
            What skills
            <br />
            do you already have? 🧠
          </h1>

          <p>
            Select the skills you're comfortable with.
            <br />
            There are no wrong answers.
          </p>

        </div>


        {/* Destination */}
        <div className="skills-destination">

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


        {/* Skills */}
        <div className="skills-card">

          <div className="skills-card-heading">
            <div>
              <h2>
                Suggested skills
              </h2>

              <p>
                Based on your selected field
              </p>
            </div>

            <span className="skills-count">
              {selectedSkills.length} selected
            </span>
          </div>


          <div className="skills-list">

            {availableSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                className={`skill-chip ${
                  selectedSkills.includes(skill)
                    ? "skill-chip-selected"
                    : ""
                }`}
                onClick={() => toggleSkill(skill)}
              >
                <span>
                  {selectedSkills.includes(skill)
                    ? "✓"
                    : "+"}
                </span>

                {skill}
              </button>
            ))}

          </div>


          {/* Custom skill */}
          <div className="custom-skill-section">

            <label htmlFor="custom-skill">
              Have another skill?
            </label>

            <div className="custom-skill-row">

              <input
                id="custom-skill"
                type="text"
                value={customSkill}
                placeholder="Add your own skill"
                onChange={(event) =>
                  setCustomSkill(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomSkill();
                  }
                }}
              />

              <button
                type="button"
                onClick={addCustomSkill}
              >
                Add
              </button>

            </div>

          </div>


          {/* Selected skills */}
          {selectedSkills.length > 0 && (
            <div className="selected-skills-section">

              <p>
                Your selected skills
              </p>

              <div className="selected-skills-list">

                {selectedSkills.map((skill) => (
                  <span
                    className="selected-skill-tag"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}

              </div>

            </div>
          )}


          {error && (
            <p className="skills-error">
              {error}
            </p>
          )}


          <button
            className="skills-continue"
            type="button"
            onClick={handleSkillsContinue}
            disabled={
              selectedSkills.length === 0 || saving
            }
          >
            {saving
              ? "Saving Your Skills..."
              : "Continue to Interests →"}
          </button>

        </div>

      </section>

    </main>
  );
}

export default SkillsPage;