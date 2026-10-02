import "./LandingPage.css";

function LandingPage({ onStart }) {
  return (
    <main className="landing-page">

      {/* Decorative sky elements */}
      <div className="sky-glow sky-glow-one"></div>
      <div className="sky-glow sky-glow-two"></div>

      <div className="cloud cloud-one">☁</div>
      <div className="cloud cloud-two">☁</div>
      <div className="cloud cloud-three">☁</div>

      {/* Header */}
      <header className="landing-header">

        <div className="brand">
          <span className="brand-plane">✈</span>
          <span className="brand-name">Path<span>Pilot</span></span>
        </div>

        <button
          className="menu-button"
          type="button"
          aria-label="Open menu"
        >
          ☰
        </button>

      </header>


      {/* Main Hero */}
      <section className="hero-section">

        {/* Floating destinations */}
        <div className="destination-bubble bubble-web">
          <span className="bubble-icon">⌘</span>
          <span>Web<br />Developer</span>
        </div>

        <div className="destination-bubble bubble-cyber">
          <span className="bubble-icon">🛡</span>
          <span>Cyber<br />Security</span>
        </div>

        <div className="destination-bubble bubble-ai">
          <span className="bubble-icon">✦</span>
          <span>AI / ML<br />Engineer</span>
        </div>

        <div className="destination-bubble bubble-data">
          <span className="bubble-icon">▥</span>
          <span>Data<br />Scientist</span>
        </div>

        <div className="destination-bubble bubble-cloud">
          <span className="bubble-icon">☁</span>
          <span>Cloud<br />Engineer</span>
        </div>


        {/* Airplane */}
        <div className="hero-plane">
          <span className="plane-trail"></span>
          <span className="plane-trail trail-two"></span>
          <span className="plane-icon">✈</span>
        </div>


        {/* Main text */}
        <div className="hero-content">

          <p className="hero-eyebrow">
            YOUR FUTURE IS A JOURNEY
          </p>

          <h1>
            Choose Your
            <br />
            <span>Destination</span>
          </h1>

          <p className="hero-description">
            Your career journey starts here.
            <br />
            Pick a destination and let PathPilot
            guide you there.
          </p>

          <button
            className="start-button"
            type="button"
            onClick={onStart}
          >
            <span>Start Your Journey</span>
            <span className="button-arrow">→</span>
          </button>

          <p className="hero-hint">
            Explore your possibilities • Find your path
          </p>

        </div>

      </section>


      {/* Bottom journey indicator */}
      <div className="journey-indicator">
        <span className="indicator-dot"></span>
        <span>Begin your journey</span>
        <span className="indicator-arrow">↓</span>
      </div>

    </main>
  );
}

export default LandingPage;