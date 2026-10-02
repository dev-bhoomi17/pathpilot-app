import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import "./InterestsPage.css";

function InterestsPage({
  selectedField,
  selectedCareer,
  userId,
  onBack,
  onContinue,
}) {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [customInterest, setCustomInterest] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const interestsByField = {
    Technology: [
      "Web Development",
      "Artificial Intelligence",
      "Cyber Security",
      "Mobile App Development",
      "Cloud Computing",
      "Data & Analytics",
      "Game Development",
      "Emerging Technologies",
      "Software Innovation",
      "Technology Startups",
    ],

    Healthcare: [
      "Medicine",
      "Medical Research",
      "Mental Health",
      "Public Health",
      "Patient Care",
      "Medical Technology",
      "Nutrition",
      "Healthcare Innovation",
      "Community Health",
      "Medical Sciences",
    ],

    "Business & Finance": [
      "Entrepreneurship",
      "Finance",
      "Marketing",
      "Investment",
      "Business Strategy",
      "Management",
      "E-Commerce",
      "Startups",
      "Leadership",
      "Economics",
    ],

    "Arts & Creative": [
      "Graphic Design",
      "Photography",
      "Film & Media",
      "Animation",
      "Writing",
      "Illustration",
      "Fashion",
      "Music",
      "Content Creation",
      "Creative Direction",
    ],

    "Science & Research": [
      "Scientific Discovery",
      "Biotechnology",
      "Physics",
      "Chemistry",
      "Environmental Science",
      "Space Science",
      "Psychology",
      "Research",
      "Data Analysis",
      "Innovation",
    ],

    "Law & Public Service": [
      "Law",
      "Civil Services",
      "Public Policy",
      "Government",
      "Human Rights",
      "International Relations",
      "Social Justice",
      "Public Administration",
      "Community Development",
      "Governance",
    ],

    Education: [
      "Teaching",
      "Educational Technology",
      "Child Development",
      "Higher Education",
      "Academic Research",
      "Online Learning",
      "Curriculum Design",
      "Educational Psychology",
      "Mentoring",
      "Learning Innovation",
    ],

    "Engineering & Architecture": [
      "Mechanical Design",
      "Civil Engineering",
      "Electrical Systems",
      "Electronics",
      "Robotics",
      "Architecture",
      "Automobile Technology",
      "Construction",
      "Renewable Energy",
      "Engineering Innovation",
    ],

    "Environment & Agriculture": [
      "Sustainable Agriculture",
      "Climate Change",
      "Environmental Protection",
      "Organic Farming",
      "Renewable Energy",
      "Water Conservation",
      "Biodiversity",
      "Food Technology",
      "Sustainable Development",
      "Natural Resources",
    ],

    "Travel & Hospitality": [
      "Travel",
      "Tourism",
      "Aviation",
      "Hotel Management",
      "Event Management",
      "Travel Planning",
      "Food & Hospitality",
      "Luxury Hospitality",
      "Destination Management",
      "Cultural Tourism",
    ],
  };

  const availableInterests =
    interestsByField[selectedField?.title] || [
      "Innovation",
      "Technology",
      "Creativity",
      "Research",
      "Leadership",
      "Community",
    ];

  const toggleInterest = (interest) => {
    setSelectedInterests((previousInterests) => {
      if (previousInterests.includes(interest)) {
        return previousInterests.filter(
          (item) => item !== interest
        );
      }

      return [...previousInterests, interest];
    });

    setError("");
  };

  const addCustomInterest = () => {
    const newInterest = customInterest.trim();

    if (!newInterest) {
      return;
    }

    if (!selectedInterests.includes(newInterest)) {
      setSelectedInterests((previousInterests) => [
        ...previousInterests,
        newInterest,
      ]);
    }

    setCustomInterest("");
    setError("");
  };

  const handleInterestsContinue = async () => {
    if (selectedInterests.length === 0) {
      setError("Please select at least one interest.");
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

      await updateDoc(doc(db, "users", userId), {
        interests: selectedInterests,
      });

      console.log("Interests saved to Firestore.");

      onContinue(selectedInterests);
    } catch (error) {
      console.error("Error saving interests:", error);

      setError(
        "We couldn't save your interests. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="interests-page">

      {/* Back button */}
      <button
        className="interests-back-button"
        type="button"
        onClick={onBack}
      >
        ← Back
      </button>


      <section className="interests-container">

        {/* Progress */}
        <div className="interests-progress">

          <div className="interests-progress-text">
            <span>STEP 6</span>
            <span>3 OF 5</span>
          </div>

          <div className="interests-progress-track">
            <div className="interests-progress-fill"></div>
          </div>

        </div>


        {/* Header */}
        <div className="interests-header">

          <p className="interests-label">
            LET'S DISCOVER WHAT INSPIRES YOU
          </p>

          <h1>
            What are you
            <br />
            interested in? ❤️
          </h1>

          <p>
            Choose the topics and areas you'd love
            to explore along your journey.
          </p>

        </div>


        {/* Destination */}
        <div className="interests-destination">

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


        {/* Interests card */}
        <div className="interests-card">

          <div className="interests-card-heading">

            <div>
              <h2>
                Suggested interests
              </h2>

              <p>
                Based on your selected field
              </p>
            </div>

            <span className="interests-count">
              {selectedInterests.length} selected
            </span>

          </div>


          {/* Interest chips */}
          <div className="interests-list">

            {availableInterests.map((interest) => (
              <button
                key={interest}
                type="button"
                className={`interest-chip ${
                  selectedInterests.includes(interest)
                    ? "interest-chip-selected"
                    : ""
                }`}
                onClick={() => toggleInterest(interest)}
              >
                <span>
                  {selectedInterests.includes(interest)
                    ? "✓"
                    : "+"}
                </span>

                {interest}
              </button>
            ))}

          </div>


          {/* Custom interest */}
          <div className="custom-interest-section">

            <label htmlFor="custom-interest">
              Can't find something you're interested in?
            </label>

            <div className="custom-interest-row">

              <input
                id="custom-interest"
                type="text"
                value={customInterest}
                placeholder="Add your own interest"
                onChange={(event) =>
                  setCustomInterest(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomInterest();
                  }
                }}
              />

              <button
                type="button"
                onClick={addCustomInterest}
              >
                Add
              </button>

            </div>

          </div>


          {/* Selected interests */}
          {selectedInterests.length > 0 && (
            <div className="selected-interests-section">

              <p>
                Your selected interests
              </p>

              <div className="selected-interests-list">

                {selectedInterests.map((interest) => (
                  <span
                    className="selected-interest-tag"
                    key={interest}
                  >
                    {interest}
                  </span>
                ))}

              </div>

            </div>
          )}


          {/* Error */}
          {error && (
            <p className="interests-error">
              {error}
            </p>
          )}


          {/* Continue */}
          <button
            className="interests-continue"
            type="button"
            onClick={handleInterestsContinue}
            disabled={
              selectedInterests.length === 0 || saving
            }
          >
            {saving
              ? "Saving Your Interests..."
              : "Continue to Goals →"}
          </button>

        </div>

      </section>

    </main>
  );
}

export default InterestsPage;