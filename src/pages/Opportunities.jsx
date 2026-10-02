import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import "./Opportunities.css";

function Opportunities({ userId, onBack }) {
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data());
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const field = profile?.field || "your field";
  const career = profile?.career || "your career";
  const primaryGoal = profile?.goals?.primary || "";

  const opportunities = useMemo(() => {
    const queryBase = `${career} ${field}`;

    return [
      {
        id: "internships",
        type: "Internships",
        icon: "↗",
        title: `${career} internships`,
        description:
          `Find internship opportunities related to ${career} and build practical experience.`,
        searchQuery: `${queryBase} internship`,
        platform: "Internship Search",
      },
      {
        id: "hackathons",
        type: "Hackathons",
        icon: "⚡",
        title: `${field} hackathons & challenges`,
        description:
          "Discover competitions, challenges and project-based opportunities to strengthen your portfolio.",
        searchQuery: `${field} hackathon challenge`,
        platform: "Challenge Search",
      },
      {
        id: "scholarships",
        type: "Scholarships",
        icon: "◇",
        title: `${field} scholarships`,
        description:
          "Explore scholarship and funding opportunities related to your academic direction.",
        searchQuery: `${field} student scholarship`,
        platform: "Scholarship Search",
      },
      {
        id: "events",
        type: "Events",
        icon: "✦",
        title: `${field} student events`,
        description:
          "Find conferences, workshops, webinars and student events connected to your field.",
        searchQuery: `${field} student events workshop`,
        platform: "Event Search",
      },
      {
        id: "jobs",
        type: "Jobs",
        icon: "▣",
        title: `Entry-level ${career} opportunities`,
        description:
          "Explore beginner-friendly roles and early-career openings related to your destination.",
        searchQuery: `${career} entry level jobs`,
        platform: "Job Search",
      },
      {
        id: "projects",
        type: "Projects",
        icon: "⌁",
        title: `${career} projects`,
        description:
          "Find project ideas, volunteer work and practical opportunities that can strengthen your experience.",
        searchQuery: `${career} student projects volunteer`,
        platform: "Project Search",
      },
    ];
  }, [career, field]);

  const filteredOpportunities = opportunities.filter((item) => {
    const text = search.toLowerCase().trim();

    const matchesSearch =
      !text ||
      item.title.toLowerCase().includes(text) ||
      item.description.toLowerCase().includes(text) ||
      item.type.toLowerCase().includes(text);

    const matchesFilter =
      filter === "all" ||
      item.type.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const openOpportunitySearch = (query) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(
      query
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="opportunities-page">
      <div className="opportunities-glow glow-one" />
      <div className="opportunities-glow glow-two" />

      <header className="opportunities-topbar">
        <button
          type="button"
          className="opportunities-back-button"
          onClick={onBack}
        >
          ← Dashboard
        </button>

        <div className="opportunities-brand">
          <span>✈</span>
          <strong>PathPilot</strong>
        </div>
      </header>

      <main className="opportunities-container">
        <section className="opportunities-hero">
          <div>
            <span className="opportunities-eyebrow">
              OPPORTUNITY RADAR
            </span>

            <h1>
              Find where your
              <br />
              journey can take you.
            </h1>

            <p>
              Explore internships, challenges, scholarships,
              events and early-career opportunities connected
              to your PathPilot destination.
            </p>
          </div>

          <div className="opportunities-destination-card">
            <span>YOUR DESTINATION</span>

            <strong>{career}</strong>

            <small>{field}</small>

            {primaryGoal && (
              <div className="goal-pill">
                Goal · {primaryGoal}
              </div>
            )}
          </div>
        </section>

        <section className="opportunities-discovery">
          <div className="opportunities-section-heading">
            <div>
              <span>DISCOVER</span>
              <h2>Opportunities for your journey</h2>
            </div>

            <span>
              {filteredOpportunities.length} options
            </span>
          </div>

          <div className="opportunities-controls">
            <div className="opportunities-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search opportunities..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="opportunity-filters">
              <button
                type="button"
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                All
              </button>

              <button
                type="button"
                className={
                  filter === "internships" ? "active" : ""
                }
                onClick={() => setFilter("internships")}
              >
                Internships
              </button>

              <button
                type="button"
                className={
                  filter === "hackathons" ? "active" : ""
                }
                onClick={() => setFilter("hackathons")}
              >
                Hackathons
              </button>

              <button
                type="button"
                className={
                  filter === "scholarships" ? "active" : ""
                }
                onClick={() => setFilter("scholarships")}
              >
                Scholarships
              </button>

              <button
                type="button"
                className={
                  filter === "events" ? "active" : ""
                }
                onClick={() => setFilter("events")}
              >
                Events
              </button>
            </div>
          </div>

          {filteredOpportunities.length > 0 ? (
            <div className="opportunities-grid">
              {filteredOpportunities.map((item) => (
                <article
                  className="opportunity-card"
                  key={item.id}
                >
                  <div className="opportunity-card-top">
                    <div className="opportunity-icon">
                      {item.icon}
                    </div>

                    <span className="opportunity-type">
                      {item.type}
                    </span>
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  <div className="opportunity-card-bottom">
                    <span>{item.platform}</span>

                    <button
                      type="button"
                      onClick={() =>
                        openOpportunitySearch(
                          item.searchQuery
                        )
                      }
                    >
                      Explore →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="opportunities-empty">
              <div>⌁</div>
              <h3>No opportunities found</h3>
              <p>
                Try a different search or category.
              </p>
            </div>
          )}
        </section>

        <section className="opportunities-tip">
          <div className="tip-icon">✦</div>

          <div>
            <span>PILOT TIP</span>

            <p>
              Start with opportunities that give you
              practical experience, projects or meaningful
              exposure to your target career.
            </p>
          </div>
        </section>

        <div className="opportunities-footer">
          <span>✈</span>
          <p>
            Every opportunity is another possible route
            toward your destination.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Opportunities;