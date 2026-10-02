import { useState } from "react";

import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/config";
import "./Login.css";

function Login({
  onBack,
  onRegister,
  onLoginSuccess,
  selectedField,
  selectedCareer,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [googleLoading, setGoogleLoading] =
    useState(false);

  /* =========================================================
     EMAIL + PASSWORD LOGIN
  ========================================================= */

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setResetMessage("");

    if (!email.trim() || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      if (onLoginSuccess) {
        onLoginSuccess(
          result.user.uid,
          false
        );
      }
    } catch (firebaseError) {
      console.error(
        "Login error:",
        firebaseError
      );

      switch (firebaseError.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError(
            "Incorrect email or password."
          );
          break;

        case "auth/invalid-email":
          setError(
            "Please enter a valid email address."
          );
          break;

        case "auth/too-many-requests":
          setError(
            "Too many login attempts. Please wait a little and try again."
          );
          break;

        default:
          setError(
            "Unable to log in right now. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FORGOT PASSWORD
  ========================================================= */

  const handleForgotPassword = async () => {
    setError("");
    setResetMessage("");

    if (!email.trim()) {
      setError(
        "Enter your email address first."
      );
      return;
    }

    try {
      await sendPasswordResetEmail(
        auth,
        email.trim()
      );

      setResetMessage(
        "Password reset instructions have been sent to your email."
      );
    } catch (firebaseError) {
      console.error(
        "Password reset error:",
        firebaseError
      );

      if (
        firebaseError.code ===
        "auth/user-not-found"
      ) {
        setError(
          "No account was found with this email."
        );
      } else if (
        firebaseError.code ===
        "auth/invalid-email"
      ) {
        setError(
          "Please enter a valid email address."
        );
      } else {
        setError(
          "Unable to send the reset email right now."
        );
      }
    }
  };

  /* =========================================================
     GOOGLE LOGIN
  ========================================================= */

  const handleGoogleLogin = async () => {
    setError("");
    setResetMessage("");

    try {
      setGoogleLoading(true);

      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      /*
        Firebase Google sign-in
      */
      const result =
        await signInWithPopup(
          auth,
          provider
        );

      const user = result.user;

      console.log(
        "Google authentication successful:",
        user
      );

      /*
        -----------------------------------------------------
        GET EXISTING PATHPILOT PROFILE
        -----------------------------------------------------
      */

      const userRef = doc(
        db,
        "users",
        user.uid
      );

      const profileSnapshot =
        await getDoc(userRef);

      /*
        -----------------------------------------------------
        FIRST PATHPILOT LOGIN
        -----------------------------------------------------

        If there is no Firestore document, create the
        basic PathPilot account.

        IMPORTANT:
        We do NOT decide using Firebase's isNewUser.
        We decide using the PathPilot Firestore profile.
      */

      if (!profileSnapshot.exists()) {
        await setDoc(
          userRef,
          {
            uid: user.uid,

            name:
              user.displayName ||
              "PathPilot Pilot",

            email:
              user.email || "",

            profilePhoto:
              user.photoURL || "",

            field:
              selectedField?.title ||
              "",

            career:
              selectedCareer?.title ||
              "",

            careerDescription:
              selectedCareer?.description ||
              "",

            onboardingCompleted:
              false,

            journeyGenerated:
              false,

            createdAt:
              serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        /*
          New PathPilot profile
          → Start onboarding
        */

        if (onLoginSuccess) {
          onLoginSuccess(
            user.uid,
            true
          );
        }

        return;
      }

      /*
        -----------------------------------------------------
        EXISTING PATHPILOT PROFILE
        -----------------------------------------------------
      */

      const profile =
        profileSnapshot.data();

      /*
        Keep field/career selected during the
        current login flow if Firestore doesn't have them.
      */

      const missingField =
        !profile.field &&
        selectedField?.title;

      const missingCareer =
        !profile.career &&
        selectedCareer?.title;

      if (
        missingField ||
        missingCareer
      ) {
        await setDoc(
          userRef,
          {
            ...(missingField
              ? {
                  field:
                    selectedField.title,
                }
              : {}),

            ...(missingCareer
              ? {
                  career:
                    selectedCareer.title,
                  careerDescription:
                    selectedCareer.description ||
                    "",
                }
              : {}),
          },
          {
            merge: true,
          }
        );
      }

      /*
        -----------------------------------------------------
        THIS IS THE IMPORTANT PART
        -----------------------------------------------------

        PathPilot decides whether onboarding is complete
        from Firestore.
      */

      const onboardingCompleted =
        profile.onboardingCompleted ===
        true;

      console.log(
        "PathPilot onboarding status:",
        onboardingCompleted
      );

      if (onLoginSuccess) {
        onLoginSuccess(
          user.uid,
          !onboardingCompleted
        );
      }
    } catch (firebaseError) {
      console.error(
        "Google login error:",
        firebaseError
      );

      switch (firebaseError.code) {
        case "auth/popup-closed-by-user":
          setError(
            "Google sign-in was cancelled."
          );
          break;

        case "auth/popup-blocked":
          setError(
            "Your browser blocked the Google sign-in popup. Please allow popups and try again."
          );
          break;

        case "auth/cancelled-popup-request":
          setError(
            "Another Google sign-in request is already in progress."
          );
          break;

        case "auth/account-exists-with-different-credential":
          setError(
            "An account already exists with this email using another sign-in method. Please use your existing sign-in method."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection and try again."
          );
          break;

        case "permission-denied":
          setError(
            "PathPilot could not access your profile. Please try again."
          );
          break;

        default:
          setError(
            "Unable to sign in with Google right now. Please try again."
          );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="login-page">

      {/* =====================================================
          LEFT VISUAL
      ===================================================== */}

      <section className="login-visual">

        <button
          type="button"
          className="login-back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="login-cloud login-cloud-one">
          ☁️
        </div>

        <div className="login-cloud login-cloud-two">
          ☁️
        </div>

        <div className="login-plane">
          ✈️
        </div>

        <div className="login-visual-content">

          <p className="login-small-text">
            WELCOME BACK, PILOT
          </p>

          <h1>
            Ready to
            <br />
            continue?
          </h1>

          <p>
            Your destination is waiting.
            <br />
            Pick up where you left off.
          </p>

          <div className="login-quote-card">

            <span>🧭</span>

            <div>

              <strong>
                Your journey is still yours.
              </strong>

              <small>
                Continue from where you stopped.
              </small>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          LOGIN FORM
      ===================================================== */}

      <section className="login-form-section">

        <div className="login-form-container">

          <div className="login-brand">
            ✈️ <span>PathPilot</span>
          </div>

          <p className="login-step">
            WELCOME BACK
          </p>

          <h2>
            Continue your journey
          </h2>

          <p className="login-description">
            Log in to continue exploring your path.
          </p>

          {/* EMAIL LOGIN */}

          <form onSubmit={handleLogin}>

            <div className="login-input-group">

              <label htmlFor="login-email">
                Email Address
              </label>

              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );
                  setError("");
                  setResetMessage("");
                }}
                autoComplete="email"
              />

            </div>

            <div className="login-input-group">

              <div className="password-label-row">

                <label htmlFor="login-password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={
                    handleForgotPassword
                  }
                >
                  Forgot password?
                </button>

              </div>

              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value
                  );
                  setError("");
                }}
                autoComplete="current-password"
              />

            </div>

            {error && (
              <p className="login-error-message">
                {error}
              </p>
            )}

            {resetMessage && (
              <p className="login-success-message">
                {resetMessage}
              </p>
            )}

            <button
              type="submit"
              className="login-submit-button"
              disabled={
                loading ||
                googleLoading
              }
            >
              {loading
                ? "Checking your boarding pass..."
                : "Continue Your Journey →"}
            </button>

          </form>

          {/* DIVIDER */}

          <div className="login-divider">
            <span>or</span>
          </div>

          {/* GOOGLE LOGIN */}

          <button
            type="button"
            className="google-login-button"
            onClick={
              handleGoogleLogin
            }
            disabled={
              loading ||
              googleLoading
            }
          >
            {googleLoading ? (
              "Connecting to Google..."
            ) : (
              <>
                <span
                  className="google-button-icon"
                  aria-hidden="true"
                >
                  G
                </span>

                Continue with Google
              </>
            )}
          </button>

          {/* REGISTER */}

          <p className="register-prompt">

            New to PathPilot?

            <button
              type="button"
              onClick={onRegister}
            >
              Create Your Boarding Pass
            </button>

          </p>

        </div>

      </section>

    </main>
  );
}

export default Login;