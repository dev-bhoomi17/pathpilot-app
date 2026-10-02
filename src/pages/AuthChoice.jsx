import "./AuthChoice.css";

function AuthChoice({
  selectedField,
  selectedCareer,
  onBack,
  onRegister,
  onLogin,
}) {
  return (
    <main className="auth-choice-page">
      <button className="auth-choice-back" onClick={onBack}>
        ← Back
      </button>

      <section className="auth-choice-card">

        <div className="auth-choice-icon">
          {selectedCareer?.icon}
        </div>

        <p className="auth-choice-label">
          YOUR CHOSEN DESTINATION
        </p>

        <h1>
          {selectedCareer?.title}
        </h1>

        <p className="auth-choice-field">
          {selectedField?.title}
        </p>

        <p className="auth-choice-description">
          {selectedCareer?.description}
        </p>

        <div className="auth-choice-message">
          <span>✈️</span>
          <p>
            Your destination is set.
            <br />
            Let's prepare your journey.
          </p>
        </div>

        <button
          className="auth-choice-register"
          onClick={onRegister}
        >
          Create Your Boarding Pass →
        </button>

        <div className="auth-choice-divider">
          <span>Already a pilot?</span>
        </div>

        <button
          className="auth-choice-login"
          onClick={onLogin}
        >
          Login to Continue
        </button>

      </section>
    </main>
  );
}

export default AuthChoice;