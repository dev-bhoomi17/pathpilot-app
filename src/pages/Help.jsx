import { useState } from "react";
import "./Help.css";

function Help({ onBack }) {
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqs = [
    {
      question: "How does PathPilot create my career journey?",
      answer:
        "PathPilot uses the information you provide during onboarding, including your field, career, education, skills, interests, goals and study routine, to create a personalized roadmap.",
    },
    {
      question: "What are Missions?",
      answer:
        "Missions turn your roadmap into smaller actionable tasks. Complete them step by step to move through your checkpoints and track your progress.",
    },
    {
      question: "Where can I find learning resources?",
      answer:
        "Open Resources from the dashboard. You will find learning material connected to your roadmap, including courses, documentation and practice resources.",
    },
    {
      question: "What is Team Finder?",
      answer:
        "Team Finder helps you discover other PathPilot students with similar fields, careers, skills or interests so you can connect and collaborate.",
    },
    {
      question: "What does PathPilot AI do?",
      answer:
        "PathPilot AI acts as your personal career guide. It can use your journey context to help you think through next steps, learning questions and career-related decisions.",
    },
    {
      question: "Can I update my profile later?",
      answer:
        "Yes. Open Profile from the dashboard to update your basic account information. Your journey information remains connected to your PathPilot profile.",
    },
    {
      question: "What happens when I log out?",
      answer:
        "Your Firebase account remains saved. You can use the Login page later to sign back in and continue from your existing journey.",
    },
  ];

  const toggleQuestion = (index) => {
    setOpenQuestion((current) =>
      current === index ? null : index
    );
  };

  return (
    <div className="help-page">
      <div className="help-glow help-glow-one" />
      <div className="help-glow help-glow-two" />

      <header className="help-topbar">
        <button
          type="button"
          className="help-back-button"
          onClick={onBack}
        >
          ← Dashboard
        </button>

        <div className="help-brand">
          <span>✦</span>
          <strong>PathPilot</strong>
        </div>
      </header>

      <main className="help-container">
        <section className="help-hero">
          <div>
            <span className="help-eyebrow">HELP CENTER</span>

            <h1>
              Got questions?
              <br />
              We have a route.
            </h1>

            <p>
              Find quick answers about your journey,
              roadmap, missions, resources and account.
            </p>
          </div>

          <div className="help-hero-card">
            <div className="help-hero-icon">?</div>

            <div>
              <strong>Need a quick answer?</strong>
              <span>
                Check the guides below.
              </span>
            </div>
          </div>
        </section>

        <section className="help-quick-grid">
          <article className="help-quick-card">
            <span className="help-quick-icon">✦</span>
            <div>
              <span>JOURNEY</span>
              <h3>Career roadmap</h3>
              <p>
                Follow your checkpoints and track
                your progress.
              </p>
            </div>
          </article>

          <article className="help-quick-card">
            <span className="help-quick-icon">✓</span>
            <div>
              <span>PROGRESS</span>
              <h3>Complete missions</h3>
              <p>
                Break big goals into manageable tasks.
              </p>
            </div>
          </article>

          <article className="help-quick-card">
            <span className="help-quick-icon">◈</span>
            <div>
              <span>LEARNING</span>
              <h3>Use resources</h3>
              <p>
                Find material connected to your path.
              </p>
            </div>
          </article>

          <article className="help-quick-card">
            <span className="help-quick-icon">✧</span>
            <div>
              <span>GUIDANCE</span>
              <h3>Ask PathPilot AI</h3>
              <p>
                Get help when you are unsure what to do next.
              </p>
            </div>
          </article>
        </section>

        <section className="help-faq-section">
          <div className="help-section-heading">
            <div>
              <span>FREQUENTLY ASKED</span>
              <h2>How can we help?</h2>
            </div>

            <span>{faqs.length} questions</span>
          </div>

          <div className="help-faq-list">
            {faqs.map((item, index) => {
              const isOpen = openQuestion === index;

              return (
                <div
                  className={`help-faq-item ${
                    isOpen ? "open" : ""
                  }`}
                  key={item.question}
                >
                  <button
                    type="button"
                    className="help-faq-question"
                    onClick={() =>
                      toggleQuestion(index)
                    }
                  >
                    <span>{item.question}</span>
                    <strong>
                      {isOpen ? "−" : "+"}
                    </strong>
                  </button>

                  {isOpen && (
                    <div className="help-faq-answer">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="help-support-card">
          <div className="help-support-icon">✈</div>

          <div>
            <span>STILL FINDING YOUR WAY?</span>
            <h2>Keep moving one step at a time.</h2>
            <p>
              PathPilot is built around progress, not
              perfection. Use your roadmap, missions and
              AI guide whenever you need a little direction.
            </p>
          </div>
        </section>

        <div className="help-footer">
          <span>✦</span>
          <p>
            Your questions are part of the journey too.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Help;