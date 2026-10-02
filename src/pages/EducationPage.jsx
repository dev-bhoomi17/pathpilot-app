import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import "./EducationPage.css";

function EducationPage({
  selectedField,
  selectedCareer,
  userId,
  onBack,
  onContinue,
}) {
  const [educationLevel, setEducationLevel] =
    useState("");

  const [year, setYear] =
    useState("");

  const [stream, setStream] =
    useState("");

  const [institution, setInstitution] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const canContinue =
    educationLevel &&
    year &&
    stream &&
    institution.trim();

  const handleEducationContinue =
    async () => {
      if (
        !educationLevel ||
        !year ||
        !stream ||
        !institution.trim()
      ) {
        return;
      }

      if (!userId) {
        console.error(
          "No user ID available."
        );
        return;
      }

      console.log(
        "Saving education for user:",
        userId
      );

      try {
        setSaving(true);

        const userRef = doc(
          db,
          "users",
          userId
        );

        await setDoc(
          userRef,
          {
            uid: userId,

            // -----------------------------------------
            // PRESERVE SELECTED CAREER + FIELD
            // -----------------------------------------
            ...(selectedCareer?.title
              ? {
                  career:
                    selectedCareer.title,
                }
              : {}),

            ...(selectedField?.title
              ? {
                  field:
                    selectedField.title,
                }
              : {}),

            // -----------------------------------------
            // EDUCATION
            // -----------------------------------------
            education: {
              level:
                educationLevel,

              year: year,

              stream:
                stream.trim(),

              institution:
                institution.trim(),
            },
          },
          {
            merge: true,
          }
        );

        console.log(
          "Education and career profile saved to Firestore."
        );

        onContinue({
          educationLevel,
          year,
          stream:
            stream.trim(),
          institution:
            institution.trim(),
        });
      } catch (error) {
        console.error(
          "Error saving education:",
          error
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <main className="education-page">

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <button
        className="education-back-button"
        onClick={onBack}
        type="button"
      >
        ← Back
      </button>

      <section className="education-container">

        {/* ===================================================
            PROGRESS
        =================================================== */}

        <div className="onboarding-progress">

          <div className="progress-text">
            <span>STEP 4</span>
            <span>1 OF 5</span>
          </div>

          <div className="progress-track">
            <div className="progress-fill" />
          </div>

        </div>

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="education-header">

          <p className="education-label">
            LET'S PLAN YOUR JOURNEY
          </p>

          <h1>
            Tell us about
            <br />
            your education 🎓
          </h1>

          <p>
            This helps us create recommendations
            that fit your current stage.
          </p>

        </div>

        {/* ===================================================
            DESTINATION
        =================================================== */}

        <div className="education-destination">

          <span>
            {selectedCareer?.icon}
          </span>

          <div>

            <small>
              Your destination
            </small>

            <strong>
              {selectedCareer?.title}
            </strong>

            <em>
              {selectedField?.title}
            </em>

          </div>

        </div>

        {/* ===================================================
            FORM
        =================================================== */}

        <div className="education-form">

          {/* EDUCATION LEVEL */}

          <div className="education-group">

            <label>
              Education Level
            </label>

            <select
              value={educationLevel}
              onChange={(event) =>
                setEducationLevel(
                  event.target.value
                )
              }
            >

              <option value="">
                Select your education level
              </option>

              <option value="School">
                School
              </option>

              <option value="Diploma">
                Diploma
              </option>

              <option value="Undergraduate">
                Undergraduate
              </option>

              <option value="Postgraduate">
                Postgraduate
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          {/* CURRENT YEAR */}

          <div className="education-group">

            <label>
              Current Class / Year
            </label>

            <select
              value={year}
              onChange={(event) =>
                setYear(
                  event.target.value
                )
              }
            >

              <option value="">
                Select your current year
              </option>

              <option value="10th">
                10th
              </option>

              <option value="11th">
                11th
              </option>

              <option value="12th">
                12th
              </option>

              <option value="FY">
                First Year
              </option>

              <option value="SY">
                Second Year
              </option>

              <option value="TY">
                Third Year
              </option>

              <option value="Final Year">
                Final Year
              </option>

              <option value="Graduate">
                Graduate
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          {/* FIELD / STREAM */}

          <div className="education-group">

            <label>
              Field / Stream
            </label>

            <input
              type="text"
              placeholder="e.g. Computer Science, Commerce, Biology"
              value={stream}
              onChange={(event) =>
                setStream(
                  event.target.value
                )
              }
            />

          </div>

          {/* INSTITUTION */}

          <div className="education-group">

            <label>
              School / College / University
            </label>

            <input
              type="text"
              placeholder="Enter your institution name"
              value={institution}
              onChange={(event) =>
                setInstitution(
                  event.target.value
                )
              }
            />

          </div>

          {/* =================================================
              CONTINUE
          ================================================= */}

          <button
            className="education-continue"
            disabled={
              !canContinue ||
              saving
            }
            onClick={
              handleEducationContinue
            }
            type="button"
          >
            {saving
              ? "Saving..."
              : "Continue to Skills →"}
          </button>

        </div>

      </section>

    </main>
  );
}

export default EducationPage;