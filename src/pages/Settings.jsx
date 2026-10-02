import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase/config";
import "./Settings.css";

function Settings({ userId, onBack, onSignedOut }) {
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      const settings = data.settings || {};

      setNotifications(
        settings.notifications ?? true
      );

      setDailyReminder(
        settings.dailyReminder ?? true
      );

      setCompactMode(
        settings.compactMode ?? false
      );
    });

    return () => unsubscribe();
  }, [userId]);

  const saveSettings = async () => {
    if (!userId) return;

    try {
      await setDoc(
        doc(db, "users", userId),
        {
          settings: {
            notifications,
            dailyReminder,
            compactMode,
          },
        },
        { merge: true }
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Error saving settings:",
        error
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onSignedOut();
    } catch (error) {
      console.error(
        "Error signing out:",
        error
      );
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-glow settings-glow-one" />
      <div className="settings-glow settings-glow-two" />

      <header className="settings-topbar">
        <button
          className="settings-back-button"
          onClick={onBack}
        >
          ← Dashboard
        </button>

        <div className="settings-brand">
          <span>✦</span>
          <strong>PathPilot</strong>
        </div>
      </header>

      <main className="settings-container">
        <section className="settings-heading">
          <span>SETTINGS</span>
          <h1>Make PathPilot yours.</h1>
          <p>
            Manage your learning preferences and how
            PathPilot keeps you updated.
          </p>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading">
            <div>
              <span>NOTIFICATIONS</span>
              <h2>Stay on track</h2>
            </div>
          </div>

          <div className="settings-option">
            <div>
              <strong>Journey notifications</strong>
              <p>
                Receive useful updates about your
                learning journey.
              </p>
            </div>

            <button
              className={`settings-toggle ${
                notifications ? "active" : ""
              }`}
              onClick={() =>
                setNotifications(!notifications)
              }
              aria-label="Toggle notifications"
            >
              <span />
            </button>
          </div>

          <div className="settings-option">
            <div>
              <strong>Daily study reminder</strong>
              <p>
                Keep a gentle reminder for your
                planned study routine.
              </p>
            </div>

            <button
              className={`settings-toggle ${
                dailyReminder ? "active" : ""
              }`}
              onClick={() =>
                setDailyReminder(!dailyReminder)
              }
              aria-label="Toggle study reminder"
            >
              <span />
            </button>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading">
            <div>
              <span>APPEARANCE</span>
              <h2>Interface preferences</h2>
            </div>
          </div>

          <div className="settings-option">
            <div>
              <strong>Compact cards</strong>
              <p>
                Use a slightly denser layout when
                browsing your journey.
              </p>
            </div>

            <button
              className={`settings-toggle ${
                compactMode ? "active" : ""
              }`}
              onClick={() =>
                setCompactMode(!compactMode)
              }
              aria-label="Toggle compact mode"
            >
              <span />
            </button>
          </div>
        </section>

        <section className="settings-account-card">
          <div>
            <span>ACCOUNT</span>
            <h2>You're signed in</h2>

            <p>
              {auth.currentUser?.email ||
                "Your PathPilot account"}
            </p>
          </div>

          <button
            className="settings-signout-button"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </section>

        <button
          className="settings-save-button"
          onClick={saveSettings}
        >
          {saved ? "✓ Settings saved" : "Save settings"}
        </button>

        <div className="settings-footer-note">
          <span>✦</span>
          <p>
            Your journey, your pace, your settings.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Settings;