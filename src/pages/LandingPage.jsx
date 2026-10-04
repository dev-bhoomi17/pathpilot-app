import "./LandingPage.css";

function LandingPage({ onStart }) {
  return (
    <main className="landing-page">

      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}

      <div className="landing-orb landing-orb-one"></div>
      <div className="landing-orb landing-orb-two"></div>

      <div className="landing-cloud landing-cloud-one">
        ☁
      </div>

      <div className="landing-cloud landing-cloud-two">
        ☁
      </div>

      <div className="landing-cloud landing-cloud-three">
        ☁
      </div>

      <div className="landing-spark landing-spark-one">
        ✦
      </div>

      <div className="landing-spark landing-spark-two">
        ✧
      </div>

      <div className="landing-spark landing-spark-three">
        ✦
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="landing-header">

        <div className="landing-logo">
          <span className="landing-logo-icon">
            ✈
          </span>

          <span className="landing-logo-text">
            PathPilot
          </span>
        </div>

        <div className="landing-header-status">
          <span className="status-dot"></span>
          Your career journey starts here
        </div>

      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="landing-hero">

        {/* LEFT SIDE */}

        <div className="landing-copy">

          <div className="landing-eyebrow">
            ✦ YOUR FUTURE IS A JOURNEY
          </div>

          <h1>
            Find your path.
            <span>
              Build your future.
            </span>
          </h1>

          <p className="landing-description">
            Choose where you want to go, tell us
            where you're starting from, and let
            PathPilot build a personalized route
            to get you there.
          </p>

          <div className="landing-actions">

            <button
              type="button"
              className="landing-primary-button"
              onClick={onStart}
            >
              <span>Start Your Journey</span>
              <strong>→</strong>
            </button>

            <div className="landing-action-note">
              <span>✦</span>
              Personalized for you
            </div>

          </div>

          <div className="landing-trust-row">

            <div className="landing-trust-item">
              <span>🧭</span>
              <div>
                <strong>Choose</strong>
                <small>Your destination</small>
              </div>
            </div>

            <div className="landing-trust-line"></div>

            <div className="landing-trust-item">
              <span>✦</span>
              <div>
                <strong>Plan</strong>
                <small>Your journey</small>
              </div>
            </div>

            <div className="landing-trust-line"></div>

            <div className="landing-trust-item">
              <span>✈</span>
              <div>
                <strong>Grow</strong>
                <small>At your pace</small>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="landing-visual">

          {/* ROUTE PATH */}

          <div className="landing-route">
            <span className="route-start"></span>

            <span className="route-path route-path-one"></span>
            <span className="route-path route-path-two"></span>

            <span className="route-end">
              <span>📍</span>
            </span>
          </div>

          {/* MAIN AIRPLANE */}

          <div className="landing-plane-shadow"></div>

          <div className="landing-plane">
            ✈
          </div>

          {/* DESTINATION CARD */}

          <div className="landing-destination-card">

            <div className="destination-card-top">

              <span className="destination-mini-label">
                YOUR DESTINATION
              </span>

              <span className="destination-pin">
                📍
              </span>

            </div>

            <h2>
              Choose Your
              <span>Destination</span>
            </h2>

            <p>
              Your career goal becomes
              the destination. PathPilot
              maps the route.
            </p>

          </div>

          {/* FLOATING CAREER CARDS */}

          <div className="career-float-card career-card-one">

            <div className="career-card-icon">
              ⌘
            </div>

            <div>
              <strong>Web Developer</strong>
              <span>Build digital experiences</span>
            </div>

          </div>

          <div className="career-float-card career-card-two">

            <div className="career-card-icon">
              🛡
            </div>

            <div>
              <strong>Cyber Security</strong>
              <span>Protect what matters</span>
            </div>

          </div>

          <div className="career-float-card career-card-three">

            <div className="career-card-icon">
              ✦
            </div>

            <div>
              <strong>AI / ML Engineer</strong>
              <span>Build intelligent systems</span>
            </div>

          </div>

          <div className="career-float-card career-card-four">

            <div className="career-card-icon">
              ▥
            </div>

            <div>
              <strong>Data Scientist</strong>
              <span>Turn data into insight</span>
            </div>

          </div>

          {/* SMALL DESTINATION MARKER */}

          <div className="landing-map-marker">
            <span className="marker-pulse"></span>
            <strong>YOUR FUTURE</strong>
            <small>is somewhere ahead</small>
          </div>

        </div>

      </section>

      {/* =====================================================
          BOTTOM MESSAGE
      ===================================================== */}

      <div className="landing-bottom">

        <div className="landing-bottom-line"></div>

        <span>
          Explore your possibilities
        </span>

        <b>•</b>

        <span>
          Find your path
        </span>

        <b>•</b>

        <span>
          Take off
        </span>

      </div>

    </main>
  );
}

export default LandingPage;