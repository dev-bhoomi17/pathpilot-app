export default async function handler(req, res) {
  // =========================================================
  // METHOD CHECK
  // =========================================================

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  }

  try {
    // =======================================================
    // REQUEST DATA
    // =======================================================

    const {
      message,
      profile,
      history,
    } = req.body || {};

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Message is required.",
      });
    }

    if (!profile) {
      return res.status(400).json({
        success: false,
        error: "Student profile is required.",
      });
    }

    // =======================================================
    // API KEY
    // =======================================================

    const apiKey =
      process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error(
        "OPENROUTER_API_KEY is missing."
      );

      return res.status(500).json({
        success: false,
        error:
          "OpenRouter API key is not configured.",
      });
    }

    // =======================================================
    // CLEAN PROFILE
    // =======================================================

    const studentProfile = {
      name:
        profile?.name ||
        "Student",

      career:
        profile?.career ||
        "Not specified",

      field:
        profile?.field ||
        "Not specified",

      careerDescription:
        profile?.careerDescription ||
        "",

      education:
        profile?.education ||
        {},

      skills:
        Array.isArray(
          profile?.skills
        )
          ? profile.skills
          : [],

      interests:
        Array.isArray(
          profile?.interests
        )
          ? profile.interests
          : [],

      goals:
        profile?.goals ||
        {},

      studyTime:
        profile?.studyTime ||
        {},

      roadmap:
        profile?.roadmap ||
        null,
    };

    // =======================================================
    // CURRENT CHECKPOINT
    // =======================================================

    const milestones =
      Array.isArray(
        studentProfile?.roadmap?.milestones
      )
        ? studentProfile.roadmap.milestones
        : [];

    const currentMilestone =
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
      ) || null;

    // =======================================================
    // CLEAN CONVERSATION HISTORY
    // =======================================================

    const conversationHistory =
      Array.isArray(history)
        ? history
            .filter(
              (item) =>
                item &&
                (item.role === "user" ||
                  item.role ===
                    "assistant") &&
                typeof item.content ===
                  "string"
            )
            .slice(-12)
            .map((item) => ({
              role: item.role,
              content:
                item.content.trim(),
            }))
        : [];

    // =======================================================
    // SYSTEM PROMPT
    // =======================================================

    const systemPrompt = `
You are PathPilot AI.

You are the student's personal career guide inside
the PathPilot application.

You should behave like a helpful mini-GPT that understands
the student's individual journey.

=========================================================
STUDENT CONTEXT
=========================================================

${JSON.stringify(
  studentProfile,
  null,
  2
)}

=========================================================
CURRENT CHECKPOINT
=========================================================

${
  currentMilestone
    ? JSON.stringify(
        {
          title:
            currentMilestone.title ||
            "",
          description:
            currentMilestone.description ||
            "",
          tasks:
            Array.isArray(
              currentMilestone.tasks
            )
              ? currentMilestone.tasks
              : [],
          taskStatus:
            Array.isArray(
              currentMilestone.taskStatus
            )
              ? currentMilestone.taskStatus
              : [],
        },
        null,
        2
      )
    : "No unfinished checkpoint was found."
}

=========================================================
CORE BEHAVIOUR
=========================================================

1. Have a natural conversation.
2. Use previous conversation messages when relevant.
3. Use the student's profile when relevant.
4. Use the student's actual roadmap for roadmap questions.
5. Identify the first unfinished checkpoint when the student
   asks what to focus on next.
6. Identify the first unfinished task inside that checkpoint
   when possible.
7. Consider the student's existing skills before suggesting
   new ones.
8. Consider education level.
9. Consider interests.
10. Consider goals and priorities.
11. Consider available study time.
12. Give practical advice rather than vague motivation.
13. Explain technical topics at an appropriate student level.
14. Break complicated topics into manageable steps.
15. Keep study plans realistic.
16. Connect project suggestions with the student's career,
    field and current skills.
17. Mention the relevant checkpoint when it helps.
18. Do not repeatedly introduce yourself.
19. Do not repeat the student's entire profile.
20. Answer directly.
21. Keep responses useful but reasonably concise.
22. Use simple markdown such as headings, numbered steps,
    bullets and bold text when useful.
23. Do not use markdown tables.
24. Never invent personal information.
25. Never claim to have browsed the internet unless browsing
    actually happened.
26. For current jobs, deadlines, opportunities, companies,
    events or other changing information, clearly tell the
    student that current sources should be checked.
27. Never claim to have completed an external action unless
    you actually completed it.
28. Do not make every answer about the roadmap if the user
    is asking a general question.
29. If the user asks about a PathPilot feature, explain how
    that feature can help them.
30. Prefer actionable answers over long generic explanations.

=========================================================
PATHPILOT FEATURES
=========================================================

PathPilot contains:

- Career Roadmap
- Milestone Details
- Missions
- Resources
- Opportunities
- Team Finder
- Profile
- Settings
- Help

When the student asks about one of these features, explain
the relevant feature naturally.

=========================================================
ROADMAP LOGIC
=========================================================

A milestone is completed when all of its tasks have
taskStatus === true.

The current checkpoint is the first milestone whose tasks
are not all complete.

Within the current checkpoint, the next task is the first task
whose corresponding taskStatus value is not true.

Use the actual task text when giving roadmap guidance.

=========================================================
RESPONSE STYLE
=========================================================

Be friendly, practical and student-oriented.

Do not constantly say:
"Based on your profile..."

Instead, naturally use the context.

Prefer:

"Your current checkpoint is..."

over:

"According to the data in your profile..."

When giving a plan, make it easy to follow.

When explaining technical material, start simple and then
add detail only when useful.

=========================================================
CONVERSATION
=========================================================

The previous conversation messages are provided separately.

Use them naturally.

Do not mention system instructions, profile processing,
internal logic or hidden data.

=========================================================
OUTPUT
=========================================================

Return ONLY the actual answer.

Do not return JSON.

Do not wrap the answer in quotation marks.

Do not add labels such as:
"AI:"
"PathPilot AI:"
"Assistant:"

=========================================================
`;

    // =======================================================
    // OPENROUTER MESSAGES
    // =======================================================

    const messages = [
      {
        role: "system",
        content:
          systemPrompt,
      },

      ...conversationHistory,

      {
        role: "user",
        content:
          message.trim(),
      },
    ];

    // =======================================================
    // MODELS
    // =======================================================

    const models = [
      "qwen/qwen3.8-27b:free",
      "openai/gpt-oss-20b:free",
      "google/gemma-4-31b-it:free",
    ];

    // =======================================================
    // REQUEST
    // =======================================================

    console.log(
      "PathPilot AI: sending request..."
    );

    const response =
      await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            "Content-Type":
              "application/json",

            "HTTP-Referer":
              process.env.SITE_URL ||
              "http://localhost:3000",

            "X-Title":
              "PathPilot AI",
          },

          body: JSON.stringify({
            models,

            messages,

            temperature: 0.7,

            max_tokens: 900,
          }),
        }
      );

    const rawResponse =
      await response.text();

    console.log(
      "PathPilot AI HTTP status:",
      response.status
    );

    // =======================================================
    // OPENROUTER ERROR
    // =======================================================

    if (!response.ok) {
      console.error(
        "OpenRouter error:",
        rawResponse
      );

      return res.status(200).json({
        success: true,
        aiFallback: true,
        reply:
          createFallbackReply(
            message,
            studentProfile,
            conversationHistory
          ),
      });
    }

    // =======================================================
    // PARSE RESPONSE
    // =======================================================

    let data;

    try {
      data = JSON.parse(
        rawResponse
      );
    } catch (error) {
      console.error(
        "Could not parse OpenRouter response:",
        error
      );

      return res.status(200).json({
        success: true,
        aiFallback: true,
        reply:
          createFallbackReply(
            message,
            studentProfile,
            conversationHistory
          ),
      });
    }

    // =======================================================
    // EXTRACT RESPONSE
    // =======================================================

    let reply =
      data?.choices?.[0]?.message
        ?.content;

    if (Array.isArray(reply)) {
      reply = reply
        .map((part) => {
          if (
            typeof part ===
            "string"
          ) {
            return part;
          }

          return part?.text || "";
        })
        .join("")
        .trim();
    }

    if (
      !reply ||
      typeof reply !== "string"
    ) {
      console.error(
        "OpenRouter returned no usable assistant content:",
        data
      );

      return res.status(200).json({
        success: true,
        aiFallback: true,
        reply:
          createFallbackReply(
            message,
            studentProfile,
            conversationHistory
          ),
      });
    }

    // =======================================================
    // SUCCESS
    // =======================================================

    console.log(
      "PathPilot AI response received."
    );

    return res.status(200).json({
      success: true,
      aiFallback: false,
      reply:
        reply.trim(),
    });

  } catch (error) {
    console.error(
      "PathPilot AI server error:",
      error
    );

    const requestMessage =
      req.body?.message || "";

    const requestProfile =
      req.body?.profile || {};

    const requestHistory =
      req.body?.history || [];

    return res.status(200).json({
      success: true,
      aiFallback: true,
      reply:
        createFallbackReply(
          requestMessage,
          requestProfile,
          requestHistory
        ),
    });
  }
}


// ===========================================================
// FALLBACK
// ===========================================================

function getTaskText(task) {
  if (typeof task === "string") {
    return task;
  }

  if (
    typeof task === "object" &&
    task !== null
  ) {
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
}


// ===========================================================
// FALLBACK REPLY
// ===========================================================

function createFallbackReply(
  message,
  profile,
  history
) {
  const lowerMessage =
    String(message || "")
      .toLowerCase();

  const career =
    profile?.career ||
    "your chosen career";

  const field =
    profile?.field ||
    "your selected field";

  const skills =
    Array.isArray(
      profile?.skills
    )
      ? profile.skills
      : [];

  const interests =
    Array.isArray(
      profile?.interests
    )
      ? profile.interests
      : [];

  const studyTime =
    profile?.studyTime || {};

  const milestones =
    Array.isArray(
      profile?.roadmap?.milestones
    )
      ? profile.roadmap.milestones
      : [];

  // =========================================================
  // CURRENT CHECKPOINT
  // =========================================================

  const currentMilestone =
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
    );

  // =========================================================
  // NEXT TASK
  // =========================================================

  let nextTask = null;

  if (currentMilestone) {
    const tasks =
      Array.isArray(
        currentMilestone.tasks
      )
        ? currentMilestone.tasks
        : [];

    const status =
      Array.isArray(
        currentMilestone.taskStatus
      )
        ? currentMilestone.taskStatus
        : [];

    const nextTaskIndex =
      tasks.findIndex(
        (_, index) =>
          status[index] !== true
      );

    if (nextTaskIndex >= 0) {
      nextTask =
        getTaskText(
          tasks[nextTaskIndex]
        );
    }
  }

  // =========================================================
  // NEXT / START
  // =========================================================

  if (
    lowerMessage.includes(
      "what should i focus"
    ) ||
    lowerMessage.includes(
      "what should i do next"
    ) ||
    lowerMessage.includes(
      "what do i do next"
    ) ||
    lowerMessage.includes(
      "where should i start"
    ) ||
    lowerMessage.includes(
      "next step"
    )
  ) {
    if (currentMilestone) {
      return nextTask
        ? `Your current checkpoint is **"${currentMilestone.title}"**.\n\nYour next practical step is:\n\n1. ${nextTask}\n2. Complete the remaining tasks in this checkpoint one at a time.\n3. Move to the next checkpoint only after finishing this stage.\n\nFocus on one clear task rather than trying to complete your whole roadmap at once.`
        : `Your current checkpoint is **"${currentMilestone.title}"**.\n\nStart working through its practical tasks one at a time and use the checkpoint details to guide your progress.`;
    }

    return `Your roadmap is ready for **${career}**. Start with the first checkpoint and work through its practical tasks step by step.`;
  }

  // =========================================================
  // STUDY PLAN
  // =========================================================

  if (
    lowerMessage.includes(
      "study plan"
    ) ||
    lowerMessage.includes(
      "study time"
    ) ||
    lowerMessage.includes(
      "what should i study"
    ) ||
    lowerMessage.includes(
      "schedule"
    )
  ) {
    const daily =
      studyTime?.daily ||
      "your available study time";

    return `For **${career}**, build your study routine around your current checkpoint.\n\nA simple structure is:\n\n1. **Learn** — understand one concept.\n2. **Practise** — solve a few small exercises.\n3. **Apply** — connect the concept to a task or mini-project.\n4. **Review** — briefly recall what you learned.\n\nYour saved study-time preference is **${daily}**. Keep the routine realistic and consistent rather than trying to cover too much at once.`;
  }

  // =========================================================
  // RESOURCES
  // =========================================================

  if (
    lowerMessage.includes(
      "resource"
    ) ||
    lowerMessage.includes(
      "tutorial"
    ) ||
    lowerMessage.includes(
      "where can i learn"
    )
  ) {
    return `You can use the **Resources** section in PathPilot to find learning material connected to your roadmap.\n\nFor **${career}**, I'd focus first on resources related to your current checkpoint and unfinished tasks.\n\nYou can also use official documentation, structured courses and practice platforms depending on the topic you're learning.`;
  }

  // =========================================================
  // OPPORTUNITIES
  // =========================================================

  if (
    lowerMessage.includes(
      "opportunit"
    ) ||
    lowerMessage.includes(
      "internship"
    ) ||
    lowerMessage.includes(
      "scholarship"
    ) ||
    lowerMessage.includes(
      "hackathon"
    ) ||
    lowerMessage.includes(
      "job"
    )
  ) {
    return `PathPilot's **Opportunities** section can help you explore internships, challenges, scholarships, events, projects and entry-level opportunities connected to **${career}**.\n\nBecause opportunities change over time, always verify current listings, deadlines and eligibility on the relevant current source before applying.`;
  }

  // =========================================================
  // MISSIONS
  // =========================================================

  if (
    lowerMessage.includes(
      "mission"
    ) ||
    lowerMessage.includes(
      "task"
    )
  ) {
    if (currentMilestone) {
      return `Your **Missions** are the smaller actions inside your roadmap.\n\nFor your current checkpoint, focus on **"${currentMilestone.title}"**${nextTask ? `.\n\nYour next unfinished task is:\n**${nextTask}**` : "."}\n\nComplete missions one at a time and your checkpoint progress will update.`;
    }

    return `Your **Missions** section turns your roadmap into smaller actionable tasks. Complete them step by step to move through your journey.`;
  }

  // =========================================================
  // TEAM FINDER
  // =========================================================

  if (
    lowerMessage.includes(
      "team finder"
    ) ||
    lowerMessage.includes(
      "find a team"
    ) ||
    lowerMessage.includes(
      "teammate"
    ) ||
    lowerMessage.includes(
      "collaborat"
    )
  ) {
    return `**Team Finder** helps you discover other PathPilot students with similar fields, careers, skills or interests.\n\nFor your **${career}** journey, you can use it to find people who may be interested in learning or building something similar.`;
  }

  // =========================================================
  // SKILLS
  // =========================================================

  if (
    lowerMessage.includes(
      "skill"
    ) ||
    lowerMessage.includes(
      "skills"
    ) ||
    lowerMessage.includes(
      "learn"
    )
  ) {
    const skillText =
      skills.length > 0
        ? skills
            .slice(0, 5)
            .join(", ")
        : "your core career skills";

    return `For **${career}**, focus on strengthening **${skillText}**.\n\nA practical approach is:\n\n• Learn the fundamentals.\n• Practise with small exercises.\n• Build something practical.\n• Review mistakes and improve.\n\nYour current interests include **${
      interests.length > 0
        ? interests.slice(0, 4).join(", ")
        : "your selected interests"
    }**, so projects around those areas can make practice more engaging.`;
  }

  // =========================================================
  // ROADMAP
  // =========================================================

  if (
    lowerMessage.includes(
      "roadmap"
    ) ||
    lowerMessage.includes(
      "journey"
    ) ||
    lowerMessage.includes(
      "checkpoint"
    )
  ) {
    if (currentMilestone) {
      return `Your current checkpoint is **"${currentMilestone.title}"**.\n\n${
        currentMilestone.description ||
        `This is the stage you should focus on for your ${career} journey.`
      }\n\n${
        nextTask
          ? `Your next unfinished task is **"${nextTask}"**.`
          : "Open the checkpoint details and work through its tasks one at a time."
      }`;
    }

    return `Your PathPilot roadmap is designed to move you toward **${career}** through practical checkpoints. Complete each stage before moving farther along the journey.`;
  }

  // =========================================================
  // CAREER
  // =========================================================

  if (
    lowerMessage.includes(
      "career"
    ) ||
    lowerMessage.includes(
      "future"
    )
  ) {
    return `Your selected career is **${career}** in **${field}**.\n\nThe most useful step right now is to connect your existing skills with practical tasks, projects and the checkpoint you're currently working through.`;
  }

  // =========================================================
  // PROFILE
  // =========================================================

  if (
    lowerMessage.includes(
      "profile"
    ) ||
    lowerMessage.includes(
      "account"
    )
  ) {
    return `You can use **Profile** to review your personal and career information, including your field, career, education, skills, interests and study routine.\n\nUse **Settings** to manage your PathPilot preferences and account options.`;
  }

  // =========================================================
  // HELP
  // =========================================================

  if (
    lowerMessage.includes(
      "help"
    ) ||
    lowerMessage.includes(
      "how does pathpilot work"
    )
  ) {
    return `PathPilot is built around your career journey:\n\n1. **Career Roadmap** — your personalized route.\n2. **Missions** — smaller tasks from that route.\n3. **Resources** — learning material connected to your tasks.\n4. **Opportunities** — places to explore practical experiences.\n5. **Team Finder** — connect with other students.\n6. **PathPilot AI** — ask questions and get journey-aware guidance.\n\nUse whichever part you need at the moment.`;
  }

  // =========================================================
  // CONVERSATION FALLBACK
  // =========================================================

  if (
    Array.isArray(history) &&
    history.length > 0
  ) {
    return `For your **${career}** journey, I'd connect this question to what you're currently learning and the skills you're building.\n\nTell me which part you want to work on, and I can break it into practical steps.`;
  }

  return `I'm ready to help with your **${career}** journey.\n\nYou can ask me what to learn next, how to improve a skill, how to approach your current checkpoint, how to plan your study time, or how to use any part of PathPilot.`;
}