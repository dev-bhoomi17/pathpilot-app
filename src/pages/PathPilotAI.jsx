import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/config";
import "./PathPilotAI.css";

function PathPilotAI({
  userId,
  onBack,
}) {
  const [profile, setProfile] =
    useState(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [sending, setSending] =
    useState(false);

  const [chatLoaded, setChatLoaded] =
    useState(false);

  const messagesEndRef =
    useRef(null);

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    const userRef = doc(
      db,
      "users",
      userId
    );

    const unsubscribe =
      onSnapshot(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setProfile(
              snapshot.data()
            );
          } else {
            setProfile(null);
          }

          setLoadingProfile(false);
        },
        (error) => {
          console.error(
            "Error loading AI profile:",
            error
          );

          setLoadingProfile(false);
        }
      );

    return () => unsubscribe();
  }, [userId]);

  // =========================================================
  // LOAD SAVED CHAT
  // =========================================================

  useEffect(() => {
    if (!userId) return;

    setChatLoaded(false);

    try {
      const savedChat =
        localStorage.getItem(
          `pathpilot-ai-chat-${userId}`
        );

      if (savedChat) {
        const parsedChat =
          JSON.parse(savedChat);

        if (Array.isArray(parsedChat)) {
          setMessages(parsedChat);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error(
        "Error loading saved AI chat:",
        error
      );

      setMessages([]);
    }

    setChatLoaded(true);
  }, [userId]);

  // =========================================================
  // SAVE CHAT
  // =========================================================

  useEffect(() => {
    if (!userId || !chatLoaded) {
      return;
    }

    try {
      localStorage.setItem(
        `pathpilot-ai-chat-${userId}`,
        JSON.stringify(messages)
      );
    } catch (error) {
      console.error(
        "Error saving AI chat:",
        error
      );
    }
  }, [
    messages,
    userId,
    chatLoaded,
  ]);

  // =========================================================
  // AUTO SCROLL
  // =========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    messages,
    sending,
  ]);

  // =========================================================
  // CURRENT CHECKPOINT
  // =========================================================

  const currentMilestone =
    useMemo(() => {
      const milestones =
        Array.isArray(
          profile?.roadmap?.milestones
        )
          ? profile.roadmap.milestones
          : [];

      return (
        milestones.find(
          (milestone) => {
            const tasks =
              Array.isArray(
                milestone?.tasks
              )
                ? milestone.tasks
                : [];

            const status =
              Array.isArray(
                milestone?.taskStatus
              )
                ? milestone.taskStatus
                : [];

            if (tasks.length === 0) {
              return (
                milestone?.completed !==
                true
              );
            }

            return !tasks.every(
              (_, index) =>
                status[index] === true
            );
          }
        ) || null
      );
    }, [profile]);

  // =========================================================
  // PROFILE DISPLAY
  // =========================================================

  const studentName =
    profile?.name ||
    "Pilot";

  const career =
    profile?.career ||
    "your career";

  const field =
    profile?.field ||
    "your field";

  // =========================================================
  // QUICK PROMPTS
  // =========================================================

  const quickPrompts = [
    {
      icon: "🧭",
      text:
        "What should I focus on next?",
    },
    {
      icon: "📚",
      text:
        "Help me plan my study time.",
    },
    {
      icon: "🚀",
      text:
        "How can I improve my skills?",
    },
    {
      icon: "🎯",
      text:
        currentMilestone
          ? `Explain my checkpoint: ${currentMilestone.title}`
          : "Explain my current checkpoint.",
    },
  ];

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = async (
    textOverride = null
  ) => {
    const text =
      typeof textOverride === "string"
        ? textOverride
        : message;

    if (
      !text.trim() ||
      sending ||
      !profile
    ) {
      return;
    }

    const cleanMessage =
      text.trim();

    // -------------------------------------------------------
    // HISTORY BEFORE NEW MESSAGE
    // -------------------------------------------------------

    const history =
      messages
        .filter(
          (item) =>
            item.role === "user" ||
            item.role === "assistant"
        )
        .map((item) => ({
          role: item.role,
          content: item.content,
        }))
        .slice(-12);

    // -------------------------------------------------------
    // SHOW USER MESSAGE
    // -------------------------------------------------------

    const userMessage = {
      id:
        `${Date.now()}-user`,
      role: "user",
      content:
        cleanMessage,
    };

    setMessages(
      (previous) => [
        ...previous,
        userMessage,
      ]
    );

    setMessage("");
    setSending(true);

    try {
      const response =
        await fetch(
          "/api/pathpilot-ai",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              message:
                cleanMessage,

              profile,

              history,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.error ||
            "PathPilot AI could not respond."
        );
      }

      // -----------------------------------------------------
      // ASSISTANT RESPONSE
      // -----------------------------------------------------

      const assistantReply =
        data.reply ||
        "I'm ready to help with your journey.";

      setMessages(
        (previous) => [
          ...previous,
          {
            id:
              `${Date.now()}-assistant`,

            role:
              "assistant",

            content:
              assistantReply,

            fallback:
              data.aiFallback === true,
          },
        ]
      );
    } catch (error) {
      console.error(
        "PathPilot AI request error:",
        error
      );

      setMessages(
        (previous) => [
          ...previous,
          {
            id:
              `${Date.now()}-error`,

            role:
              "assistant",

            content:
              "I couldn't reach PathPilot AI right now. Please try again in a moment.",
          },
        ]
      );
    } finally {
      setSending(false);
    }
  };

  // =========================================================
  // KEYBOARD
  // =========================================================

  const handleKeyDown =
    (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        sendMessage();
      }
    };

  // =========================================================
  // CLEAR CHAT
  // =========================================================

  const clearChat = () => {
    setMessages([]);
    setMessage("");

    if (userId) {
      try {
        localStorage.removeItem(
          `pathpilot-ai-chat-${userId}`
        );
      } catch (error) {
        console.error(
          "Error clearing saved AI chat:",
          error
        );
      }
    }
  };

  // =========================================================
  // FORMAT AI MESSAGE
  // =========================================================

  const formatMessage = (
    content
  ) => {
    const lines =
      String(content || "").split(
        "\n"
      );

    return lines.map(
      (line, lineIndex) => {
        const parts =
          line.split(
            /(\*\*.*?\*\*)/g
          );

        return (
          <Fragment
            key={`line-${lineIndex}`}
          >
            {parts.map(
              (
                part,
                partIndex
              ) => {
                if (
                  part.startsWith(
                    "**"
                  ) &&
                  part.endsWith(
                    "**"
                  )
                ) {
                  return (
                    <strong
                      key={`part-${partIndex}`}
                    >
                      {part.slice(
                        2,
                        -2
                      )}
                    </strong>
                  );
                }

                return (
                  <span
                    key={`part-${partIndex}`}
                  >
                    {part}
                  </span>
                );
              }
            )}

            {lineIndex <
              lines.length - 1 && (
              <br />
            )}
          </Fragment>
        );
      }
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingProfile) {
    return (
      <div className="pathpilot-ai-page">

        <div className="pathpilot-ai-loading">

          <div className="ai-loading-orb">
            ✦
          </div>

          <h2>
            Preparing your AI guide...
          </h2>

          <p>
            Loading your personal journey.
          </p>

        </div>

      </div>
    );
  }

  return (
    <main className="pathpilot-ai-page">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="ai-bg-glow ai-glow-one"></div>

      <div className="ai-bg-glow ai-glow-two"></div>

      <div className="ai-bg-cloud ai-cloud-one"></div>

      <div className="ai-bg-cloud ai-cloud-two"></div>

      <div className="ai-spark ai-spark-one">
        ✦
      </div>

      <div className="ai-spark ai-spark-two">
        ✧
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="pathpilot-ai-header">

        <button
          type="button"
          className="ai-back-button"
          onClick={onBack}
        >
          ← Back to dashboard
        </button>

        <div className="ai-brand">

          <span>
            ✦
          </span>

          PathPilot AI

        </div>

      </header>

      {/* =====================================================
          CONTAINER
      ===================================================== */}

      <section className="pathpilot-ai-container">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="ai-hero">

          <div className="ai-hero-copy">

            <div className="ai-hero-badge">
              ✦ YOUR PERSONAL AI GUIDE
            </div>

            <h1>
              Ask.
              <span>
                Explore.
              </span>
              Grow.
            </h1>

            <p>
              Hi {studentName} — I'm your
              PathPilot AI guide. Ask me
              about your roadmap, skills,
              study routine, projects or
              career journey.
            </p>

            <div className="ai-profile-strip">

              <div>

                <small>
                  DESTINATION
                </small>

                <strong>
                  {career}
                </strong>

              </div>

              <div>

                <small>
                  FIELD
                </small>

                <strong>
                  {field}
                </strong>

              </div>

              {currentMilestone && (
                <div>

                  <small>
                    CURRENT CHECKPOINT
                  </small>

                  <strong>
                    {currentMilestone.title}
                  </strong>

                </div>
              )}

            </div>

          </div>

          <div className="ai-hero-visual">

            <div className="ai-big-orbit orbit-one"></div>

            <div className="ai-big-orbit orbit-two"></div>

            <div className="ai-core">

              <div>
                ✦
              </div>

            </div>

            <span className="ai-orbit-dot dot-one"></span>

            <span className="ai-orbit-dot dot-two"></span>

            <span className="ai-orbit-dot dot-three"></span>

          </div>

        </section>

        {/* ===================================================
            CHAT
        =================================================== */}

        <section className="ai-chat-section">

          <div className="ai-chat-header">

            <div>

              <span>
                PATHPILOT AI
              </span>

              <h2>
                Your journey, one conversation at a time.
              </h2>

            </div>

            <button
              type="button"
              className="ai-clear-button"
              onClick={clearChat}
              disabled={
                messages.length === 0 ||
                sending
              }
            >
              {messages.length > 0
                ? "New chat"
                : "Clear chat"}
            </button>

          </div>

          {/* =================================================
              WELCOME
          ================================================= */}

          {messages.length === 0 && (
            <div className="ai-welcome">

              <div className="ai-welcome-icon">
                ✦
              </div>

              <h3>
                What can I help you with?
              </h3>

              <p>
                Ask naturally. PathPilot
                will use your journey as
                context.
              </p>

              <div className="ai-quick-grid">

                {quickPrompts.map(
                  (prompt) => (
                    <button
                      type="button"
                      key={
                        prompt.text
                      }
                      className="ai-quick-card"
                      onClick={() =>
                        sendMessage(
                          prompt.text
                        )
                      }
                      disabled={sending}
                    >

                      <span>
                        {prompt.icon}
                      </span>

                      <strong>
                        {prompt.text}
                      </strong>

                      <small>
                        Ask PathPilot →
                      </small>

                    </button>
                  )
                )}

              </div>

            </div>
          )}

          {/* =================================================
              MESSAGES
          ================================================= */}

          {messages.length > 0 && (
            <div className="ai-message-list">

              {messages.map(
                (chatMessage) => (
                  <div
                    key={
                      chatMessage.id
                    }
                    className={`ai-message-row ${
                      chatMessage.role ===
                      "user"
                        ? "ai-message-user"
                        : "ai-message-assistant"
                    }`}
                  >

                    {chatMessage.role ===
                      "assistant" && (
                      <div className="ai-message-avatar">
                        ✦
                      </div>
                    )}

                    <div className="ai-message-bubble">

                      <span className="ai-message-label">
                        {chatMessage.role ===
                        "user"
                          ? "YOU"
                          : "PATHPILOT AI"}
                      </span>

                      <p
                        style={{
                          whiteSpace:
                            "normal",
                        }}
                      >
                        {formatMessage(
                          chatMessage.content
                        )}
                      </p>

                    </div>

                  </div>
                )
              )}

              {sending && (
                <div className="ai-message-row ai-message-assistant">

                  <div className="ai-message-avatar">
                    ✦
                  </div>

                  <div className="ai-message-bubble ai-typing-bubble">

                    <span className="ai-message-label">
                      PATHPILOT AI
                    </span>

                    <div className="ai-typing">

                      <span></span>
                      <span></span>
                      <span></span>

                    </div>

                  </div>

                </div>
              )}

              <div
                ref={messagesEndRef}
              />

            </div>
          )}

          {/* =================================================
              INPUT
          ================================================= */}

          <div className="ai-input-area">

            <div className="ai-input-shell">

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Ask PathPilot AI anything about your journey..."
                rows={1}
                disabled={sending}
              />

              <button
                type="button"
                className="ai-send-button"
                onClick={() =>
                  sendMessage()
                }
                disabled={
                  !message.trim() ||
                  sending ||
                  !profile
                }
                aria-label="Send message"
              >
                {sending
                  ? "..."
                  : "↑"}
              </button>

            </div>

            <span className="ai-input-hint">
              Press Enter to send
            </span>

          </div>

        </section>

        {/* ===================================================
            BOTTOM TIP
        =================================================== */}

        <section className="ai-bottom-tip">

          <div className="ai-tip-icon">
            🧭
          </div>

          <div>

            <span>
              REMEMBER
            </span>

            <strong>
              PathPilot guides your journey —
              you choose the destination.
            </strong>

          </div>

        </section>

      </section>

    </main>
  );
}

export default PathPilotAI;