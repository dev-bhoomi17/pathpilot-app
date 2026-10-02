import {
  useEffect,
  useRef,
  useState,
} from "react";

import LandingPage from "./pages/LandingPage";
import FieldSelectionPage from "./pages/FieldSelectionPage";
import DestinationPage from "./pages/DestinationPage";
import AuthChoice from "./pages/AuthChoice";
import Register from "./pages/Register";
import Login from "./pages/Login";
import EducationPage from "./pages/EducationPage";
import SkillsPage from "./pages/SkillsPage";
import InterestsPage from "./pages/InterestsPage";
import GoalsPage from "./pages/GoalsPage";
import StudyTimePage from "./pages/StudyTimePage";
import JourneyLoading from "./pages/JourneyLoading";
import Dashboard from "./pages/Dashboard";
import CareerRoadmap from "./pages/CareerRoadmap";
import MilestoneDetails from "./pages/MilestoneDetails";
import TeamFinder from "./pages/TeamFinder";
import PathPilotAI from "./pages/PathPilotAI";
import Missions from "./pages/Missions";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Opportunities from "./pages/Opportunities";
import Help from "./pages/Help";

import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase/config";

function App() {
  const [currentPage, setCurrentPage] =
    useState("landing");

  const [selectedField, setSelectedField] =
    useState(null);

  const [selectedCareer, setSelectedCareer] =
    useState(null);

  const [educationData, setEducationData] =
    useState(null);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [userId, setUserId] =
    useState(null);

  const [skillsData, setSkillsData] =
    useState([]);

  const [interestsData, setInterestsData] =
    useState([]);

  const [goalsData, setGoalsData] =
    useState(null);

  const [studyTimeData, setStudyTimeData] =
    useState(null);

  const [selectedMilestone, setSelectedMilestone] =
    useState(null);

  const [
    selectedMilestoneNumber,
    setSelectedMilestoneNumber,
  ] = useState(null);

  /*
    =========================================================
    AUTH INITIALIZATION
    =========================================================

    Firebase immediately calls onAuthStateChanged once when
    the app starts.

    We use this FIRST callback only to restore an existing
    session.

    After that, Login/Register components control navigation.

    This prevents Google login from being forced to Dashboard.
  */

  const initialAuthCheckDone =
    useRef(false);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          /*
            -------------------------------------------------
            ALWAYS UPDATE AUTH USER STATE
            -------------------------------------------------
          */

          if (user) {
            setCurrentUser(user);
            setUserId(user.uid);
          } else {
            setCurrentUser(null);
            setUserId(null);
          }

          /*
            -------------------------------------------------
            ONLY RESTORE ROUTING ON INITIAL APP LOAD
            -------------------------------------------------
          */

          if (initialAuthCheckDone.current) {
            return;
          }

          initialAuthCheckDone.current = true;

          /*
            No signed-in user when the app starts.
            Keep the normal landing page.
          */

          if (!user) {
            return;
          }

          /*
            Existing Firebase session found.
            Check the PathPilot Firestore profile.
          */

          try {
            const userRef = doc(
              db,
              "users",
              user.uid
            );

            const snapshot =
              await getDoc(userRef);

            if (!snapshot.exists()) {
              /*
                Auth account exists but there is
                no PathPilot profile yet.
              */
              return;
            }

            const profile =
              snapshot.data();

            /*
              ------------------------------------------------
              COMPLETED USER
              ------------------------------------------------
            */

            if (
              profile.onboardingCompleted ===
              true
            ) {
              setCurrentPage(
                "dashboard"
              );

              return;
            }

            /*
              ------------------------------------------------
              INCOMPLETE USER
              ------------------------------------------------

              This mainly handles a user who refreshes
              the browser in the middle of onboarding.
            */

            if (
              profile.onboardingCompleted ===
              false
            ) {
              /*
                Restore field/career from Firestore
                when available.
              */

              if (profile.field) {
                setSelectedField({
                  title: profile.field,
                });
              }

              if (profile.career) {
                setSelectedCareer({
                  title: profile.career,
                  description:
                    profile.careerDescription ||
                    "",
                });
              }

              /*
                Send incomplete users back to
                onboarding.
              */

              setCurrentPage(
                "education"
              );
            }
          } catch (error) {
            console.error(
              "Error restoring user session:",
              error
            );
          }
        }
      );

    return unsubscribe;
  }, []);

  /*
    =========================================================
    APP
    =========================================================
  */

  return (
    <>
      {/* =====================================================
          LANDING
      ===================================================== */}

      {currentPage === "landing" && (
        <LandingPage
          onStart={() =>
            setCurrentPage("fields")
          }
        />
      )}

      {/* =====================================================
          FIELD SELECTION
      ===================================================== */}

      {currentPage === "fields" && (
        <FieldSelectionPage
          onBack={() =>
            setCurrentPage("landing")
          }
          onSelectField={(field) => {
            setSelectedField(field);
            setCurrentPage("careers");
          }}
        />
      )}

      {/* =====================================================
          CAREER SELECTION
      ===================================================== */}

      {currentPage === "careers" && (
        <DestinationPage
          selectedField={selectedField}
          onBack={() =>
            setCurrentPage("fields")
          }
          onSelectCareer={(career) => {
            setSelectedCareer(career);
            setCurrentPage("auth");
          }}
        />
      )}

      {/* =====================================================
          AUTH CHOICE
      ===================================================== */}

      {currentPage === "auth" && (
        <AuthChoice
          selectedField={selectedField}
          selectedCareer={selectedCareer}
          onBack={() =>
            setCurrentPage("careers")
          }
          onRegister={() =>
            setCurrentPage("register")
          }
          onLogin={() =>
            setCurrentPage("login")
          }
        />
      )}

      {/* =====================================================
          LOGIN
      ===================================================== */}

      {currentPage === "login" && (
        <Login
  selectedField={selectedField}
  selectedCareer={selectedCareer}
  onBack={() =>
    setCurrentPage("auth")
  }
          onRegister={() =>
            setCurrentPage("register")
          }
          onLoginSuccess={(
            uid,
            isNewUser
          ) => {
            /*
              Save authenticated Firebase UID.
            */

            setUserId(uid);

            /*
              NEW GOOGLE USER
              ----------------
              Start PathPilot onboarding.
            */

            if (isNewUser) {
              setCurrentPage(
                "education"
              );
            } else {
              /*
                EXISTING USER
                -------------
                Go straight to Dashboard.
              */

              setCurrentPage(
                "dashboard"
              );
            }
          }}
        />
      )}

      {/* =====================================================
          REGISTER
      ===================================================== */}

      {currentPage === "register" && (
        <Register
          selectedField={selectedField}
          selectedCareer={selectedCareer}
          onBack={() =>
            setCurrentPage("auth")
          }
          onContinue={() =>
            setCurrentPage("education")
          }
          onLogin={() =>
            setCurrentPage("login")
          }
          onUserCreated={(uid) => {
            setUserId(uid);
          }}
        />
      )}

      {/* =====================================================
          EDUCATION
      ===================================================== */}

      {currentPage === "education" && (
        <EducationPage
          selectedField={selectedField}
          selectedCareer={selectedCareer}
          userId={userId}
          onBack={() =>
            setCurrentPage("register")
          }
          onContinue={(data) => {
            setEducationData(data);
            setCurrentPage("skills");
          }}
        />
      )}

      {/* =====================================================
          SKILLS
      ===================================================== */}

      {currentPage === "skills" && (
        <SkillsPage
          selectedField={selectedField}
          selectedCareer={selectedCareer}
          userId={userId}
          onBack={() =>
            setCurrentPage("education")
          }
          onContinue={(skills) => {
            setSkillsData(skills);
            setCurrentPage("interests");
          }}
        />
      )}

      {/* =====================================================
          INTERESTS
      ===================================================== */}

      {currentPage === "interests" && (
        <InterestsPage
          selectedField={selectedField}
          selectedCareer={selectedCareer}
          userId={userId}
          onBack={() =>
            setCurrentPage("skills")
          }
          onContinue={(interests) => {
            setInterestsData(interests);
            setCurrentPage("goals");
          }}
        />
      )}

      {/* =====================================================
          GOALS
      ===================================================== */}

      {currentPage === "goals" && (
        <GoalsPage
          selectedField={selectedField}
          selectedCareer={selectedCareer}
          userId={userId}
          onBack={() =>
            setCurrentPage("interests")
          }
          onContinue={(goals) => {
            setGoalsData(goals);
            setCurrentPage("studyTime");
          }}
        />
      )}

      {/* =====================================================
          STUDY TIME
      ===================================================== */}

      {currentPage === "studyTime" && (
        <StudyTimePage
          selectedField={selectedField}
          selectedCareer={selectedCareer}
          userId={userId}
          onBack={() =>
            setCurrentPage("goals")
          }
          onComplete={(data) => {
            setStudyTimeData(data);
            setCurrentPage("journey");
          }}
        />
      )}

      {/* =====================================================
          AI JOURNEY GENERATION
      ===================================================== */}

      {currentPage === "journey" && (
        <JourneyLoading
          userId={userId}
          onComplete={() =>
            setCurrentPage("dashboard")
          }
        />
      )}

      {/* =====================================================
          DASHBOARD
      ===================================================== */}

      {currentPage === "dashboard" && (
        <Dashboard
          selectedField={selectedField}
          selectedCareer={selectedCareer}
          userId={userId}

          onOpenRoadmap={() => {
            setCurrentPage("roadmap");
          }}

          onOpenMilestone={(
            milestone,
            number
          ) => {
            setSelectedMilestone(
              milestone
            );

            setSelectedMilestoneNumber(
              number
            );

            setCurrentPage(
              "milestone-details"
            );
          }}

          onOpenTeamFinder={() => {
            setCurrentPage(
              "team-finder"
            );
          }}

          onOpenAI={() => {
            setCurrentPage(
              "pathpilotAI"
            );
          }}

          onOpenMissions={() => {
            setCurrentPage(
              "missions"
            );
          }}

          onOpenResources={() => {
            setCurrentPage(
              "resources"
            );
          }}

          onOpenProfile={() => {
            setCurrentPage(
              "profile"
            );
          }}

          onOpenSettings={() => {
            setCurrentPage(
              "settings"
            );
          }}

          onOpenOpportunities={() => {
            setCurrentPage(
              "opportunities"
            );
          }}

          onOpenHelp={() => {
            setCurrentPage(
              "help"
            );
          }}
        />
      )}

      {/* =====================================================
          CAREER ROADMAP
      ===================================================== */}

      {currentPage === "roadmap" && (
        <CareerRoadmap
          userId={userId}
          onBack={() => {
            setCurrentPage(
              "dashboard"
            );
          }}
          onOpenMilestone={(
            milestone,
            number
          ) => {
            setSelectedMilestone(
              milestone
            );

            setSelectedMilestoneNumber(
              number
            );

            setCurrentPage(
              "milestone-details"
            );
          }}
        />
      )}

      {/* =====================================================
          MILESTONE DETAILS
      ===================================================== */}

      {currentPage ===
        "milestone-details" && (
        <MilestoneDetails
          userId={userId}
          milestone={
            selectedMilestone
          }
          milestoneNumber={
            selectedMilestoneNumber
          }
          onBack={() => {
            setCurrentPage(
              "roadmap"
            );
          }}
        />
      )}

      {/* =====================================================
          TEAM FINDER
      ===================================================== */}

      {currentPage ===
        "team-finder" && (
        <TeamFinder
          userId={userId}
          onBack={() => {
            setCurrentPage(
              "dashboard"
            );
          }}
        />
      )}

      {/* =====================================================
          PATHPILOT AI
      ===================================================== */}

      {currentPage ===
        "pathpilotAI" && (
        <PathPilotAI
          userId={userId}
          onBack={() =>
            setCurrentPage(
              "dashboard"
            )
          }
        />
      )}

      {/* =====================================================
          MISSIONS
      ===================================================== */}

      {currentPage === "missions" && (
        <Missions
          userId={userId}

          onBack={() => {
            setCurrentPage(
              "dashboard"
            );
          }}

          onOpenMilestone={(
            milestone,
            number
          ) => {
            setSelectedMilestone(
              milestone
            );

            setSelectedMilestoneNumber(
              number
            );

            setCurrentPage(
              "milestone-details"
            );
          }}
        />
      )}

      {/* =====================================================
          RESOURCES
      ===================================================== */}

      {currentPage === "resources" && (
        <Resources
          userId={userId}
          onBack={() => {
            setCurrentPage(
              "dashboard"
            );
          }}
        />
      )}

      {/* =====================================================
          PROFILE
      ===================================================== */}

      {currentPage === "profile" && (
        <Profile
          userId={userId}
          onBack={() => {
            setCurrentPage(
              "dashboard"
            );
          }}
        />
      )}

      {/* =====================================================
          SETTINGS
      ===================================================== */}

      {currentPage === "settings" && (
        <Settings
          userId={userId}
          onBack={() => {
            setCurrentPage(
              "dashboard"
            );
          }}
          onSignedOut={() => {
            setUserId(null);
            setCurrentUser(null);
            setCurrentPage(
              "landing"
            );
          }}
        />
      )}

      {/* =====================================================
          OPPORTUNITIES
      ===================================================== */}

      {currentPage ===
        "opportunities" && (
        <Opportunities
          userId={userId}
          onBack={() => {
            setCurrentPage(
              "dashboard"
            );
          }}
        />
      )}

      {/* =====================================================
          HELP
      ===================================================== */}

      {currentPage === "help" && (
        <Help
          onBack={() => {
            setCurrentPage(
              "dashboard"
            );
          }}
        />
      )}
    </>
  );
}

export default App;