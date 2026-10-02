import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "./Resources.css";

function Resources({ userId, onBack }) {
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [savedResources, setSavedResources] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();

        setProfile(data);

        setSavedResources(
          Array.isArray(data.savedResources) ? data.savedResources : []
        );
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const milestones = Array.isArray(profile?.roadmap?.milestones)
    ? profile.roadmap.milestones
    : [];

  /*
   * ---------------------------------------------------------
   * CURRENT CHECKPOINT
   * ---------------------------------------------------------
   */

  const currentMilestoneIndex = useMemo(() => {
    if (!milestones.length) return 0;

    let completed = 0;

    for (const milestone of milestones) {
      const tasks = Array.isArray(milestone.tasks)
        ? milestone.tasks
        : [];

      const statuses = Array.isArray(milestone.taskStatus)
        ? milestone.taskStatus
        : [];

      const completedTasks =
        tasks.length > 0
          ? tasks.every((_, index) => statuses[index] === true)
          : milestone.completed === true;

      if (completedTasks) {
        completed += 1;
      } else {
        break;
      }
    }

    return Math.min(
      completed,
      Math.max(milestones.length - 1, 0)
    );
  }, [milestones]);

  /*
   * ---------------------------------------------------------
   * TASK TEXT HELPER
   * ---------------------------------------------------------
   */

  const getTaskText = (task) => {
    if (typeof task === "string") {
      return task;
    }

    if (typeof task === "object" && task !== null) {
      return (
        task.title ||
        task.task ||
        task.name ||
        task.description ||
        task.text ||
        ""
      );
    }

    return "";
  };

  /*
   * ---------------------------------------------------------
   * RESOURCE TYPE DETECTION
   * ---------------------------------------------------------
   */

  const getResourceCategory = (taskText) => {
    const text = taskText.toLowerCase();

    if (
      text.includes("practice") ||
      text.includes("problem") ||
      text.includes("exercise") ||
      text.includes("project") ||
      text.includes("build") ||
      text.includes("implement")
    ) {
      return "Practice";
    }

    if (
      text.includes("video") ||
      text.includes("watch") ||
      text.includes("lecture")
    ) {
      return "Video";
    }

    if (
      text.includes("course") ||
      text.includes("learn") ||
      text.includes("study") ||
      text.includes("fundamental") ||
      text.includes("basics")
    ) {
      return "Course";
    }

    return "Documentation";
  };

  /*
   * ---------------------------------------------------------
   * RESOURCE GENERATOR
   *
   * Uses the ACTUAL roadmap task and maps it to useful
   * learning platforms / official documentation.
   * ---------------------------------------------------------
   */

  const generateResourcesForTask = (
    taskText,
    milestone,
    milestoneIndex,
    taskIndex
  ) => {
    const text = taskText.toLowerCase();

    const cleanTask =
      taskText.trim().length > 70
        ? `${taskText.trim().slice(0, 70)}...`
        : taskText.trim();

    const resources = [];

    const addResource = (
      title,
      description,
      type,
      url,
      suffix
    ) => {
      resources.push({
        id: `generated-${milestoneIndex}-${taskIndex}-${suffix}`,
        title,
        description,
        type,
        url,
        checkpoint:
          milestone.title ||
          `Checkpoint ${milestoneIndex + 1}`,
        milestoneIndex,
        taskIndex,
      });
    };

    /*
     * PYTHON
     */

    if (
      text.includes("python") ||
      text.includes("django") ||
      text.includes("flask")
    ) {
      addResource(
        "Python Official Documentation",
        `Reference material for the roadmap task: ${cleanTask}`,
        "Documentation",
        "https://docs.python.org/3/",
        "python-docs"
      );

      addResource(
        "Python Learning — freeCodeCamp",
        "Beginner-friendly Python lessons and practical tutorials.",
        "Course",
        "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
        "python-course"
      );

      return resources;
    }

    /*
     * JAVASCRIPT / WEB DEVELOPMENT
     */

    if (
      text.includes("javascript") ||
      text.includes("js ") ||
      text.includes("react") ||
      text.includes("html") ||
      text.includes("css") ||
      text.includes("frontend") ||
      text.includes("web development")
    ) {
      addResource(
        "MDN Web Docs",
        `Official web-development reference related to: ${cleanTask}`,
        "Documentation",
        "https://developer.mozilla.org/en-US/docs/Web",
        "mdn"
      );

      addResource(
        "Web Development — freeCodeCamp",
        "Hands-on web-development tutorials, projects and practice.",
        "Course",
        "https://www.freecodecamp.org/learn/",
        "web-course"
      );

      return resources;
    }

    /*
     * CYBERSECURITY
     */

    if (
      text.includes("cyber") ||
      text.includes("security") ||
      text.includes("ethical hacking") ||
      text.includes("hacking") ||
      text.includes("penetration") ||
      text.includes("vulnerability") ||
      text.includes("xss") ||
      text.includes("sql injection") ||
      text.includes("owasp") ||
      text.includes("phishing") ||
      text.includes("malware")
    ) {
      addResource(
        "OWASP Learning Resources",
        `Security reference material connected to: ${cleanTask}`,
        "Documentation",
        "https://owasp.org/www-project-web-security-testing-guide/",
        "owasp"
      );

      addResource(
        "TryHackMe",
        "Interactive cybersecurity rooms and practical security learning.",
        "Practice",
        "https://tryhackme.com/",
        "tryhackme"
      );

      return resources;
    }

    /*
     * COMPUTER NETWORKS
     */

    if (
      text.includes("network") ||
      text.includes("tcp") ||
      text.includes("udp") ||
      text.includes("ip address") ||
      text.includes("dns") ||
      text.includes("dhcp") ||
      text.includes("routing") ||
      text.includes("switching") ||
      text.includes("packet") ||
      text.includes("protocol") ||
      text.includes("wireshark") ||
      text.includes("nmap")
    ) {
      addResource(
        "Cloudflare Learning Center",
        `Networking concepts related to: ${cleanTask}`,
        "Documentation",
        "https://www.cloudflare.com/learning/",
        "networking"
      );

      addResource(
        "Cisco Networking Resources",
        "Networking concepts, protocols and foundational learning.",
        "Course",
        "https://www.cisco.com/c/en/us/training-events/training-certifications/training.html",
        "cisco"
      );

      return resources;
    }

    /*
     * AI / MACHINE LEARNING
     */

    if (
      text.includes("artificial intelligence") ||
      text.includes("machine learning") ||
      text.includes("deep learning") ||
      text.includes("neural network") ||
      text.includes("classification") ||
      text.includes("regression") ||
      text.includes("supervised learning") ||
      text.includes("unsupervised learning") ||
      text.includes("heuristic")
    ) {
      addResource(
        "Google Machine Learning Crash Course",
        `Machine-learning concepts related to: ${cleanTask}`,
        "Course",
        "https://developers.google.com/machine-learning/crash-course",
        "google-ml"
      );

      addResource(
        "scikit-learn Documentation",
        "Practical machine-learning algorithms and examples.",
        "Documentation",
        "https://scikit-learn.org/stable/user_guide.html",
        "sklearn"
      );

      return resources;
    }

    /*
     * DATA SCIENCE
     */

    if (
      text.includes("data science") ||
      text.includes("data analysis") ||
      text.includes("pandas") ||
      text.includes("numpy") ||
      text.includes("visualization") ||
      text.includes("statistics")
    ) {
      addResource(
        "Kaggle Learn",
        `Interactive data-learning material related to: ${cleanTask}`,
        "Course",
        "https://www.kaggle.com/learn",
        "kaggle"
      );

      addResource(
        "pandas Documentation",
        "Official documentation and examples for data manipulation.",
        "Documentation",
        "https://pandas.pydata.org/docs/",
        "pandas"
      );

      return resources;
    }

    /*
     * SQL / DATABASE
     */

    if (
      text.includes("sql") ||
      text.includes("database") ||
      text.includes("mysql") ||
      text.includes("postgres") ||
      text.includes("mongodb") ||
      text.includes("dbms") ||
      text.includes("query")
    ) {
      addResource(
        "SQL Tutorial — W3Schools",
        `Database and SQL concepts related to: ${cleanTask}`,
        "Course",
        "https://www.w3schools.com/sql/",
        "sql-w3schools"
      );

      addResource(
        "SQLBolt",
        "Interactive SQL lessons and exercises.",
        "Practice",
        "https://sqlbolt.com/",
        "sqlbolt"
      );

      return resources;
    }

    /*
     * C / C++ / JAVA
     */

    if (
      text.includes("c++") ||
      text.includes("cpp") ||
      text.includes("c programming")
    ) {
      addResource(
        "cppreference",
        "Detailed C and C++ language reference material.",
        "Documentation",
        "https://en.cppreference.com/",
        "cppreference"
      );

      addResource(
        "Learn C++",
        "Structured tutorials and examples for C++ programming.",
        "Course",
        "https://www.learncpp.com/",
        "learncpp"
      );

      return resources;
    }

    if (
      text.includes("java") ||
      text.includes("spring boot")
    ) {
      addResource(
        "Oracle Java Documentation",
        "Official Java language and platform documentation.",
        "Documentation",
        "https://docs.oracle.com/en/java/",
        "java-docs"
      );

      addResource(
        "Java — freeCodeCamp",
        "Java programming tutorials and practical learning.",
        "Course",
        "https://www.freecodecamp.org/news/learn-java-free-java-courses/",
        "java-course"
      );

      return resources;
    }

    /*
     * GIT / GITHUB
     */

    if (
      text.includes("git") ||
      text.includes("github") ||
      text.includes("version control")
    ) {
      addResource(
        "Git Documentation",
        "Official Git documentation and reference.",
        "Documentation",
        "https://git-scm.com/doc",
        "git-docs"
      );

      addResource(
        "GitHub Skills",
        "Interactive exercises for learning GitHub workflows.",
        "Practice",
        "https://skills.github.com/",
        "github-skills"
      );

      return resources;
    }

    /*
     * LINUX
     */

    if (
      text.includes("linux") ||
      text.includes("shell") ||
      text.includes("terminal") ||
      text.includes("bash")
    ) {
      addResource(
        "Linux Documentation",
        "Linux documentation and command-line reference.",
        "Documentation",
        "https://www.kernel.org/doc/html/latest/",
        "linux-docs"
      );

      addResource(
        "Linux Journey",
        "Interactive Linux learning path for beginners.",
        "Course",
        "https://linuxjourney.com/",
        "linux-journey"
      );

      return resources;
    }

    /*
     * GENERIC FALLBACK
     *
     * Every task still gets resources, even when it does not
     * match one of the categories above.
     */

    addResource(
      `${cleanTask || "Roadmap topic"} — Learning`,
      `Learning material selected for the roadmap task: ${cleanTask}`,
      getResourceCategory(taskText),
      `https://www.google.com/search?q=${encodeURIComponent(
        `${taskText} tutorial`
      )}`,
      "general-learning"
    );

    addResource(
      `${cleanTask || "Roadmap topic"} — Practice`,
      `Practice and examples for: ${cleanTask}`,
      "Practice",
      `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${taskText} tutorial`
      )}`,
      "general-practice"
    );

    return resources;
  };

  /*
   * ---------------------------------------------------------
   * BUILD RESOURCE LIBRARY
   * ---------------------------------------------------------
   */

  const resources = useMemo(() => {
    const collected = [];

    milestones.forEach((milestone, milestoneIndex) => {
      /*
       * First use actual resources if the AI happened
       * to return them.
       */

      if (Array.isArray(milestone.resources)) {
        milestone.resources.forEach((resource, index) => {
          if (typeof resource === "string") {
            collected.push({
              id: `roadmap-${milestoneIndex}-${index}-${resource}`,
              title: resource,
              description:
                "Resource recommended for this checkpoint.",
              url: resource.startsWith("http")
                ? resource
                : `https://www.google.com/search?q=${encodeURIComponent(
                    resource
                  )}`,
              type: "Resource",
              checkpoint:
                milestone.title ||
                `Checkpoint ${milestoneIndex + 1}`,
              milestoneIndex,
              taskIndex: index,
            });

            return;
          }

          if (typeof resource === "object" && resource !== null) {
            collected.push({
              id:
                resource.id ||
                `roadmap-${milestoneIndex}-${index}`,
              title:
                resource.title ||
                "Learning Resource",
              description:
                resource.description ||
                "Resource recommended for this checkpoint.",
              url:
                resource.url ||
                resource.link ||
                "#",
              type:
                resource.type ||
                resource.category ||
                "Resource",
              checkpoint:
                milestone.title ||
                `Checkpoint ${milestoneIndex + 1}`,
              milestoneIndex,
              taskIndex: index,
            });
          }
        });
      }

      /*
       * Then generate resources from the actual roadmap tasks.
       */

      const tasks = Array.isArray(milestone.tasks)
        ? milestone.tasks
        : [];

      tasks.forEach((task, taskIndex) => {
        const taskText = getTaskText(task);

        if (!taskText.trim()) return;

        /*
         * If a task already has its own resource field,
         * keep it too.
         */

        const taskResources =
          typeof task === "object" && task !== null
            ? task.resources || task.resource
            : null;

        if (Array.isArray(taskResources)) {
          taskResources.forEach((resource, resourceIndex) => {
            if (typeof resource === "string") {
              collected.push({
                id: `task-${milestoneIndex}-${taskIndex}-${resourceIndex}`,
                title: resource,
                description:
                  "Resource connected to this roadmap task.",
                url: resource.startsWith("http")
                  ? resource
                  : `https://www.google.com/search?q=${encodeURIComponent(
                      resource
                    )}`,
                type: "Resource",
                checkpoint:
                  milestone.title ||
                  `Checkpoint ${milestoneIndex + 1}`,
                milestoneIndex,
                taskIndex,
              });
            } else if (
              typeof resource === "object" &&
              resource !== null
            ) {
              collected.push({
                id:
                  resource.id ||
                  `task-${milestoneIndex}-${taskIndex}-${resourceIndex}`,
                title:
                  resource.title ||
                  "Learning Resource",
                description:
                  resource.description ||
                  "Resource connected to this roadmap task.",
                url:
                  resource.url ||
                  resource.link ||
                  "#",
                type:
                  resource.type ||
                  resource.category ||
                  "Resource",
                checkpoint:
                  milestone.title ||
                  `Checkpoint ${milestoneIndex + 1}`,
                milestoneIndex,
                taskIndex,
              });
            }
          });
        } else if (taskResources) {
          if (typeof taskResources === "string") {
            collected.push({
              id: `task-${milestoneIndex}-${taskIndex}-existing`,
              title: taskResources,
              description:
                "Resource connected to this roadmap task.",
              url: taskResources.startsWith("http")
                ? taskResources
                : `https://www.google.com/search?q=${encodeURIComponent(
                    taskResources
                  )}`,
              type: "Resource",
              checkpoint:
                milestone.title ||
                `Checkpoint ${milestoneIndex + 1}`,
              milestoneIndex,
              taskIndex,
            });
          }
        }

        /*
         * Generate intelligent resources from the task.
         */

        const generated = generateResourcesForTask(
          taskText,
          milestone,
          milestoneIndex,
          taskIndex
        );

        collected.push(...generated);
      });
    });

    /*
     * Remove duplicates.
     */

    return Array.from(
      new Map(
        collected.map((resource) => [
          resource.id,
          resource,
        ])
      ).values()
    );
  }, [milestones]);

  /*
   * ---------------------------------------------------------
   * FILTERING
   * ---------------------------------------------------------
   */

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const title =
        resource.title?.toLowerCase() || "";

      const description =
        resource.description?.toLowerCase() || "";

      const type =
        resource.type?.toLowerCase() || "";

      const checkpoint =
        resource.checkpoint?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        title.includes(query) ||
        description.includes(query) ||
        type.includes(query) ||
        checkpoint.includes(query);

      let matchesFilter = true;

      if (filter === "current") {
        matchesFilter =
          resource.milestoneIndex === currentMilestoneIndex;
      }

      if (filter === "saved") {
        matchesFilter =
          savedResources.includes(resource.id);
      }

      if (filter === "video") {
        matchesFilter =
          type.includes("video");
      }

      if (filter === "course") {
        matchesFilter =
          type.includes("course");
      }

      return matchesSearch && matchesFilter;
    });
  }, [
    resources,
    search,
    filter,
    currentMilestoneIndex,
    savedResources,
  ]);

  const currentResources = resources.filter(
    (resource) =>
      resource.milestoneIndex === currentMilestoneIndex
  );

  /*
   * ---------------------------------------------------------
   * SAVE RESOURCE
   * ---------------------------------------------------------
   */

  const toggleSave = async (resourceId) => {
    if (!userId) return;

    const isSaved =
      savedResources.includes(resourceId);

    const updated = isSaved
      ? savedResources.filter(
          (id) => id !== resourceId
        )
      : [...savedResources, resourceId];

    setSavedResources(updated);

    try {
      await updateDoc(doc(db, "users", userId), {
        savedResources: updated,
      });
    } catch (error) {
      console.error(
        "Error saving resource:",
        error
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * RESOURCE ICON
   * ---------------------------------------------------------
   */

  const getResourceIcon = (type) => {
    const value = type.toLowerCase();

    if (value.includes("video")) return "▶";
    if (value.includes("course")) return "◈";
    if (value.includes("documentation")) return "▤";
    if (value.includes("practice")) return "⌁";

    return "✦";
  };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="resources-page">
      <div className="resources-background-glow glow-one" />
      <div className="resources-background-glow glow-two" />

      <header className="resources-topbar">
        <button
          className="resources-back-button"
          onClick={onBack}
        >
          ← Dashboard
        </button>

        <div className="resources-brand">
          <span className="resources-brand-mark">
            ✦
          </span>

          <span>PathPilot</span>
        </div>
      </header>

      <main className="resources-container">
        <section className="resources-hero">
          <div className="resources-hero-copy">
            <span className="resources-eyebrow">
              LEARNING HUB
            </span>

            <h1>
              Your resources,
              <br />
              all in one place.
            </h1>

            <p>
              Explore learning material connected to
              your PathPilot journey and keep the useful
              ones saved for later.
            </p>
          </div>

          <div className="resources-hero-card">
            <div className="resources-hero-card-icon">
              ✦
            </div>

            <div>
              <span>Current checkpoint</span>

              <strong>
                {milestones[currentMilestoneIndex]
                  ?.title ||
                  `Checkpoint ${
                    currentMilestoneIndex + 1
                  }`}
              </strong>
            </div>
          </div>
        </section>

        <section className="resources-focus">
          <div className="resources-focus-header">
            <div>
              <span className="section-label">
                START HERE
              </span>

              <h2>
                Recommended for your current
                checkpoint
              </h2>
            </div>

            <span className="resource-count">
              {currentResources.length} resources
            </span>
          </div>

          {currentResources.length > 0 ? (
            <div className="current-resource-grid">
              {currentResources
                .slice(0, 3)
                .map((resource) => {
                  const isSaved =
                    savedResources.includes(
                      resource.id
                    );

                  return (
                    <article
                      className="current-resource-card"
                      key={resource.id}
                    >
                      <div className="resource-card-top">
                        <span className="resource-type">
                          {getResourceIcon(
                            resource.type
                          )}{" "}
                          {resource.type}
                        </span>

                        <button
                          className={`save-button ${
                            isSaved ? "saved" : ""
                          }`}
                          onClick={() =>
                            toggleSave(resource.id)
                          }
                          title={
                            isSaved
                              ? "Remove from saved"
                              : "Save resource"
                          }
                        >
                          {isSaved ? "★" : "☆"}
                        </button>
                      </div>

                      <h3>
                        {resource.title}
                      </h3>

                      <p>
                        {resource.description}
                      </p>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="resource-open-button"
                      >
                        Open resource →
                      </a>
                    </article>
                  );
                })}
            </div>
          ) : (
            <div className="resources-empty-focus">
              <span>✦</span>

              <div>
                <strong>
                  No checkpoint resources yet
                </strong>

                <p>
                  Your roadmap does not currently
                  contain resources for this
                  checkpoint.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="resources-library">
          <div className="resources-library-heading">
            <div>
              <span className="section-label">
                RESOURCE LIBRARY
              </span>

              <h2>
                Explore your learning material
              </h2>
            </div>
          </div>

          <div className="resources-controls">
            <div className="resources-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search resources..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="resource-filters">
              <button
                className={
                  filter === "all"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("all")
                }
              >
                All
              </button>

              <button
                className={
                  filter === "current"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("current")
                }
              >
                Current
              </button>

              <button
                className={
                  filter === "saved"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("saved")
                }
              >
                Saved
              </button>

              <button
                className={
                  filter === "video"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("video")
                }
              >
                Videos
              </button>

              <button
                className={
                  filter === "course"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter("course")
                }
              >
                Courses
              </button>
            </div>
          </div>

          {filteredResources.length > 0 ? (
            <div className="resources-grid">
              {filteredResources.map(
                (resource) => {
                  const isSaved =
                    savedResources.includes(
                      resource.id
                    );

                  return (
                    <article
                      className="resource-card"
                      key={resource.id}
                    >
                      <div className="resource-card-icon">
                        {getResourceIcon(
                          resource.type
                        )}
                      </div>

                      <div className="resource-card-content">
                        <div className="resource-card-meta">
                          <span>
                            {resource.type}
                          </span>

                          <span>
                            Checkpoint{" "}
                            {resource.milestoneIndex +
                              1}
                          </span>
                        </div>

                        <h3>
                          {resource.title}
                        </h3>

                        <p>
                          {resource.description}
                        </p>

                        <div className="resource-card-footer">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open →
                          </a>

                          <button
                            className={
                              isSaved
                                ? "saved"
                                : ""
                            }
                            onClick={() =>
                              toggleSave(
                                resource.id
                              )
                            }
                          >
                            {isSaved
                              ? "★ Saved"
                              : "☆ Save"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div className="resources-empty">
              <div className="resources-empty-icon">
                ⌁
              </div>

              <h3>No resources found</h3>

              <p>
                Try a different search or filter,
                or continue your roadmap to unlock
                more learning material.
              </p>
            </div>
          )}
        </section>

        <div className="resources-footer-message">
          <span>✈</span>

          <p>
            Learn at your own pace. Your destination
            is built one resource at a time.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Resources;