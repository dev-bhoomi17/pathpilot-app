export default async function handler(req, res) {
  // =========================================
  // ONLY ALLOW POST REQUESTS
  // =========================================

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  }

  try {
    // =========================================
    // GET STUDENT PROFILE
    // =========================================

    const {
      name,
      field,
      career,
      careerDescription,
      education,
      skills,
      interests,
      goals,
      studyTime,
    } = req.body || {};

    // =========================================
    // BASIC VALIDATION
    // =========================================

    if (!career || !field) {
      return res.status(400).json({
        success: false,
        error: "Career and field are required.",
      });
    }

    // =========================================
    // CHECK API KEY
    // =========================================

    const apiKey =
      process.env.OPENROUTER_API_KEY;

    console.log(
      "OpenRouter key loaded:",
      Boolean(apiKey)
    );

    if (!apiKey) {
      console.error(
        "OPENROUTER_API_KEY is missing."
      );

      // Even without AI, provide a fallback
      const fallbackRoadmap =
        createFallbackRoadmap({
          name,
          field,
          career,
          careerDescription,
          education,
          skills,
          interests,
          goals,
          studyTime,
        });

      return res.status(200).json({
        success: true,
        roadmap: fallbackRoadmap,
        aiFallback: true,
      });
    }

    // =========================================
    // PREPARE STUDENT PROFILE
    // =========================================

    const studentProfile = {
      name: name || "Student",

      field: field || "",

      career: career || "",

      careerDescription:
        careerDescription || "",

      education:
        education || {},

      skills:
        Array.isArray(skills)
          ? skills
          : [],

      interests:
        Array.isArray(interests)
          ? interests
          : [],

      goals:
        goals || {},

      studyTime:
        studyTime || {},
    };

    // =========================================
    // SYSTEM PROMPT
    // =========================================

    const systemPrompt = `
You are PathPilot's career roadmap generator.

Your job is to create a realistic, personalized and achievable career roadmap for a student.

Consider all of the following:

- Selected career destination
- Selected field
- Academic background
- Existing skills
- Interests
- Career goals
- Career priorities
- Available study time
- Preferred study time
- Preferred learning style

Rules:

1. Start from the student's current knowledge and education level.
2. Do not assume advanced knowledge.
3. Progress from fundamentals to intermediate skills and then practical application.
4. Keep the roadmap realistic and achievable for a student.
5. Every milestone must contain practical tasks.
6. Tasks must match the student's available study time.
7. Avoid generic filler tasks.
8. Recommend skills relevant to the selected career.
9. Include practical or project-based learning where appropriate.
10. The final milestone should focus on career readiness.
11. Make the roadmap personalized using the student's profile.
12. Return ONLY valid JSON.
13. Do not use Markdown code fences.
14. Do not add explanations outside the JSON.
`;

    // =========================================
    // USER PROMPT
    // =========================================

    const userPrompt = `
Create a personalized PathPilot career roadmap using this student profile:

${JSON.stringify(
  studentProfile,
  null,
  2
)}

Create between 4 and 6 milestones.

Milestone 1 must start from the student's current knowledge.

Each milestone must contain:

- id
- title
- description
- duration
- skills
- tasks

Each milestone must contain 3 to 5 practical tasks.

The milestones should progressively move the student toward career readiness.

Return exactly this JSON structure:

{
  "career": "string",
  "field": "string",
  "summary": "string",
  "estimatedDuration": "string",
  "milestones": [
    {
      "id": 1,
      "title": "string",
      "description": "string",
      "duration": "string",
      "skills": [
        "string"
      ],
      "tasks": [
        "string",
        "string",
        "string"
      ]
    }
  ]
}

Important:

- Return 4 to 6 milestones.
- Every milestone must have 3 to 5 tasks.
- Tasks must be practical.
- Do not return Markdown.
- Return ONLY valid JSON.
`;

    // =========================================
    // OPENROUTER REQUEST
    // =========================================

    let openRouterResponse = null;
    let responseText = "";
    let data = null;

    try {
      openRouterResponse =
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
                "PathPilot",
            },

            body: JSON.stringify({
              // OpenRouter model fallback chain
              models: [
  "qwen/qwen3.8-27b:free",
  "openai/gpt-oss-20b:free",
  "google/gemma-4-31b-it:free",
],

              messages: [
                {
                  role: "system",
                  content:
                    systemPrompt,
                },

                {
                  role: "user",
                  content:
                    userPrompt,
                },
              ],

              temperature: 0.4,

              response_format: {
                type: "json_object",
              },
            }),
          }
        );

      responseText =
        await openRouterResponse.text();

      try {
        data = JSON.parse(
          responseText
        );
      } catch (parseError) {
        console.error(
          "OpenRouter returned non-JSON response:"
        );

        console.error(
          responseText
        );

        data = null;
      }

    } catch (networkError) {
      console.error(
        "OpenRouter network error:",
        networkError
      );

      openRouterResponse = null;
    }

    // =========================================
    // HANDLE AI FAILURE
    // =========================================

    if (
      !openRouterResponse ||
      !openRouterResponse.ok
    ) {
      const status =
        openRouterResponse?.status ||
        500;

      const errorMessage =
        data?.error?.message ||
        data?.error?.metadata?.raw ||
        "OpenRouter request failed.";

      console.error(
        "OpenRouter HTTP status:",
        status
      );

      console.error(
        "OpenRouter error:",
        JSON.stringify(
          data,
          null,
          2
        )
      );

      // =======================================
      // RATE LIMIT FALLBACK
      // =======================================

      console.log(
  "OpenRouter provider failed with status:",
  status
);

console.log(
  "Using PathPilot local fallback roadmap."
);

const fallbackRoadmap =
  createFallbackRoadmap({
    name,
    field,
    career,
    careerDescription,
    education,
    skills,
    interests,
    goals,
    studyTime,
  });

return res.status(200).json({
  success: true,
  roadmap: fallbackRoadmap,
  aiFallback: true,
});

      // =======================================
      // OTHER AI ERROR
      // =======================================

      return res.status(
        status
      ).json({
        success: false,

        error:
          errorMessage,

        details:
          data?.error ||
          null,
      });
    }

    // =========================================
    // EXTRACT AI CONTENT
    // =========================================

    const rawContent =
      data?.choices?.[0]
        ?.message?.content;

    if (!rawContent) {
      console.error(
        "OpenRouter returned empty content:"
      );

      console.error(
        JSON.stringify(
          data,
          null,
          2
        )
      );

      // Use local fallback instead of
      // breaking the student's journey
      const fallbackRoadmap =
        createFallbackRoadmap({
          name,
          field,
          career,
          careerDescription,
          education,
          skills,
          interests,
          goals,
          studyTime,
        });

      return res.status(200).json({
        success: true,
        roadmap:
          fallbackRoadmap,
        aiFallback: true,
      });
    }

    console.log(
      "AI response received successfully."
    );

    // =========================================
    // PARSE AI JSON
    // =========================================

    let roadmap;

    try {
      roadmap =
        typeof rawContent === "string"
          ? JSON.parse(
              rawContent
            )
          : rawContent;

    } catch (parseError) {
      console.error(
        "AI JSON parsing error:",
        parseError
      );

      console.error(
        "Raw AI response:",
        rawContent
      );

      // ---------------------------------------
      // TRY CLEANING MARKDOWN CODE FENCES
      // ---------------------------------------

      try {
        const cleanedContent =
          String(rawContent)
            .replace(
              /^```json\s*/i,
              ""
            )
            .replace(
              /^```\s*/i,
              ""
            )
            .replace(
              /\s*```$/i,
              ""
            )
            .trim();

        roadmap =
          JSON.parse(
            cleanedContent
          );

      } catch (fallbackParseError) {
        console.error(
          "Cleaned JSON parsing failed:",
          fallbackParseError
        );

        const fallbackRoadmap =
          createFallbackRoadmap({
            name,
            field,
            career,
            careerDescription,
            education,
            skills,
            interests,
            goals,
            studyTime,
          });

        return res.status(200).json({
          success: true,
          roadmap:
            fallbackRoadmap,
          aiFallback: true,
        });
      }
    }

    // =========================================
    // VALIDATE ROADMAP
    // =========================================

    if (
      !roadmap ||
      !Array.isArray(
        roadmap.milestones
      )
    ) {
      console.error(
        "Invalid roadmap structure:",
        roadmap
      );

      const fallbackRoadmap =
        createFallbackRoadmap({
          name,
          field,
          career,
          careerDescription,
          education,
          skills,
          interests,
          goals,
          studyTime,
        });

      return res.status(200).json({
        success: true,
        roadmap:
          fallbackRoadmap,
        aiFallback: true,
      });
    }

    // =========================================
    // NORMALIZE MILESTONES
    // =========================================

    roadmap.milestones =
      roadmap.milestones.map(
        (
          milestone,
          index
        ) => ({
          id:
            milestone?.id ||
            index + 1,

          title:
            milestone?.title ||
            `Milestone ${
              index + 1
            }`,

          description:
            milestone?.description ||
            "",

          duration:
            milestone?.duration ||
            "",

          skills:
            Array.isArray(
              milestone?.skills
            )
              ? milestone.skills
              : [],

          tasks:
            Array.isArray(
              milestone?.tasks
            )
              ? milestone.tasks
              : [],

          // Completion is controlled
          // by the student
          completed:
            false,
        })
      );

    // =========================================
    // MAKE SURE THERE ARE ENOUGH MILESTONES
    // =========================================

    if (
      roadmap.milestones.length <
      4
    ) {
      console.error(
        "AI returned fewer than 4 milestones."
      );

      const fallbackRoadmap =
        createFallbackRoadmap({
          name,
          field,
          career,
          careerDescription,
          education,
          skills,
          interests,
          goals,
          studyTime,
        });

      return res.status(200).json({
        success: true,
        roadmap:
          fallbackRoadmap,
        aiFallback: true,
      });
    }

    // =========================================
    // FINAL SUCCESS
    // =========================================

    console.log(
      "Roadmap generated successfully with",
      roadmap.milestones.length,
      "milestones."
    );

    return res.status(200).json({
      success: true,
      roadmap,
      aiFallback: false,
    });

  } catch (error) {
    // =========================================
    // GENERAL ERROR
    // =========================================

    console.error(
      "Journey generation error:",
      error
    );

    // Last-resort fallback so the journey
    // doesn't completely fail
    try {
      const fallbackRoadmap =
        createFallbackRoadmap(
          req.body || {}
        );

      return res.status(200).json({
        success: true,
        roadmap:
          fallbackRoadmap,
        aiFallback: true,
      });

    } catch (fallbackError) {
      console.error(
        "Fallback roadmap failed:",
        fallbackError
      );

      return res.status(500).json({
        success: false,

        error:
          error?.message ||
          "Failed to generate journey.",
      });
    }
  }
}


// ======================================================
// LOCAL FALLBACK ROADMAP
// ======================================================

function createFallbackRoadmap(profile) {
  const {
    name,
    field,
    career,
    careerDescription,
    skills,
    interests,
    goals,
    studyTime,
  } = profile || {};

  const safeSkills =
    Array.isArray(skills)
      ? skills
      : [];

  const safeInterests =
    Array.isArray(interests)
      ? interests
      : [];

  const skillText =
    safeSkills.length > 0
      ? safeSkills
          .slice(0, 4)
          .join(", ")
      : "your existing skills";

  const interestText =
    safeInterests.length > 0
      ? safeInterests
          .slice(0, 3)
          .join(", ")
      : "your interests";

  const primaryGoal =
    goals?.primary ||
    "Build career readiness";

  const dailyStudy =
    studyTime?.daily ||
    "a manageable daily study schedule";

  return {
    career:
      career ||
      "Career Destination",

    field:
      field ||
      "Selected Field",

    summary:
      `${name || "Student"}, this roadmap is designed to help you move toward ${career || "your selected career"} by building on ${skillText}, connecting your learning with ${interestText}, and working toward your goal of ${primaryGoal}.`,

    estimatedDuration:
      "8–12 weeks",

    milestones: [
      {
        id: 1,

        title:
          "Build Your Foundation",

        description:
          `Start with the essential concepts and knowledge required for ${career || "your chosen career"}. Focus on understanding the basics before moving to advanced topics.`,

        duration:
          "2 weeks",

        skills: [
          "Core concepts",
          "Fundamentals",
          "Learning strategy",
        ],

        tasks: [
          `Review the fundamental concepts related to ${career || "your career"}.`,

          `Identify 3 important skills required for ${career || "your career"}.`,

          `Create a simple study plan based on your available time of ${dailyStudy}.`,

          "Complete a beginner-level practical exercise.",
        ],

        completed:
          false,
      },

      {
        id: 2,

        title:
          "Develop Career Skills",

        description:
          `Strengthen the practical and technical skills that are most relevant to ${career || "your target career"}.`,

        duration:
          "2–3 weeks",

        skills: [
          "Practical skills",
          "Problem solving",
          "Tools and techniques",
        ],

        tasks: [
          `Practice one important skill required for ${career || "your career"} every day.`,

          "Complete two small hands-on exercises.",

          `Connect your existing skills (${skillText}) with your target career.`,

          "Track your progress and note the areas that need more practice.",
        ],

        completed:
          false,
      },

      {
        id: 3,

        title:
          "Apply Through Practice",

        description:
          "Turn your learning into practical experience through a small project, case study, activity, or portfolio task.",

        duration:
          "2–3 weeks",

        skills: [
          "Practical application",
          "Project work",
          "Problem solving",
        ],

        tasks: [
          `Choose a small project related to ${career || "your career"}.`,

          "Break the project into smaller achievable tasks.",

          "Complete and document the project.",

          "Review the result and identify improvements.",
        ],

        completed:
          false,
      },

      {
        id: 4,

        title:
          "Prepare for Career Readiness",

        description:
          `Build confidence and prepare for real-world opportunities related to ${career || "your target career"}.`,

        duration:
          "2–3 weeks",

        skills: [
          "Portfolio building",
          "Communication",
          "Interview preparation",
          "Career planning",
        ],

        tasks: [
          "Create or update a career-focused portfolio.",

          "Prepare a short introduction about your skills and career goals.",

          "Practice common interview or discussion questions related to your field.",

          "Identify suitable internships, projects, competitions, or entry-level opportunities.",
        ],

        completed:
          false,
      },
    ],
  };
}