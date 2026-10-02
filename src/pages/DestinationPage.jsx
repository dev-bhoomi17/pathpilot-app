import "./DestinationPage.css";

function DestinationPage({ selectedField, onBack, onSelectCareer }) {
  const careersByField = {
    Technology: [
      {
        icon: "💻",
        title: "Software Development",
        description: "Build websites, apps and software.",
      },
      {
        icon: "🛡️",
        title: "Cyber Security",
        description: "Protect systems, networks and data.",
      },
      {
        icon: "🤖",
        title: "AI & Machine Learning",
        description: "Build intelligent systems with AI.",
      },
      {
        icon: "📊",
        title: "Data Science",
        description: "Turn data into meaningful insights.",
      },
      {
        icon: "☁️",
        title: "Cloud Computing",
        description: "Build and manage modern cloud systems.",
      },
      {
        icon: "🎨",
        title: "UI/UX Design",
        description: "Create beautiful digital experiences.",
      },
    ],

    Healthcare: [
      {
        icon: "🩺",
        title: "Medicine",
        description: "Explore medical and clinical careers.",
      },
      {
        icon: "👩‍⚕️",
        title: "Nursing",
        description: "Build a career in patient care and healthcare.",
      },
      {
        icon: "💊",
        title: "Pharmacy",
        description:
          "Explore medicines, healthcare and pharmaceutical careers.",
      },
      {
        icon: "🔬",
        title: "Medical Research",
        description:
          "Discover careers in healthcare research and innovation.",
      },
      {
        icon: "🌍",
        title: "Public Health",
        description: "Improve health outcomes across communities.",
      },
      {
        icon: "🏥",
        title: "Healthcare Administration",
        description: "Manage healthcare systems and services.",
      },
    ],

    "Business & Finance": [
      {
        icon: "💰",
        title: "Finance",
        description: "Build a career in financial planning and analysis.",
      },
      {
        icon: "📒",
        title: "Accounting",
        description:
          "Work with accounting, auditing and financial reporting.",
      },
      {
        icon: "📣",
        title: "Marketing",
        description:
          "Create strategies for brands, products and growth.",
      },
      {
        icon: "💼",
        title: "Business Management",
        description: "Lead teams, operations and business strategy.",
      },
      {
        icon: "🚀",
        title: "Entrepreneurship",
        description: "Build and grow your own business ideas.",
      },
      {
        icon: "🤝",
        title: "Human Resources",
        description:
          "Work with people, recruitment and organizational growth.",
      },
    ],

    "Arts & Creative": [
      {
        icon: "🎨",
        title: "Graphic Design",
        description: "Create visual identities and digital designs.",
      },
      {
        icon: "🎬",
        title: "Film & Media",
        description: "Explore filmmaking, production and media careers.",
      },
      {
        icon: "📸",
        title: "Photography",
        description:
          "Turn visual storytelling into a creative career.",
      },
      {
        icon: "✍️",
        title: "Content Creation",
        description:
          "Build careers through writing, video and digital content.",
      },
      {
        icon: "🎞️",
        title: "Animation",
        description: "Create animated stories, graphics and experiences.",
      },
      {
        icon: "🎭",
        title: "Performing Arts",
        description:
          "Explore careers in acting, music and performance.",
      },
    ],

    "Science & Research": [
      {
        icon: "🧪",
        title: "Biotechnology",
        description:
          "Explore biology, technology and life sciences.",
      },
      {
        icon: "⚗️",
        title: "Chemistry",
        description:
          "Build careers in chemical science and research.",
      },
      {
        icon: "🔭",
        title: "Physics",
        description:
          "Explore physical science, research and technology.",
      },
      {
        icon: "🌱",
        title: "Environmental Science",
        description:
          "Work toward sustainable and environmental solutions.",
      },
      {
        icon: "🔬",
        title: "Scientific Research",
        description:
          "Pursue research and scientific discovery.",
      },
      {
        icon: "🧠",
        title: "Psychology",
        description:
          "Understand human behavior, mind and wellbeing.",
      },
    ],

    "Law & Public Service": [
      {
        icon: "⚖️",
        title: "Law",
        description:
          "Explore legal practice, advocacy and justice.",
      },
      {
        icon: "🏛️",
        title: "Civil Services",
        description:
          "Build a career in public administration and governance.",
      },
      {
        icon: "📜",
        title: "Public Administration",
        description:
          "Work in government systems and public policy.",
      },
      {
        icon: "🌐",
        title: "International Relations",
        description:
          "Explore diplomacy, global affairs and policy.",
      },
    ],

    Education: [
      {
        icon: "👩‍🏫",
        title: "Teaching",
        description: "Help students learn and grow.",
      },
      {
        icon: "📚",
        title: "Academic Research",
        description: "Explore research and higher education.",
      },
      {
        icon: "🎓",
        title: "Higher Education",
        description:
          "Build a career in universities and academia.",
      },
      {
        icon: "🧑‍💻",
        title: "Educational Technology",
        description:
          "Combine education with technology and innovation.",
      },
    ],

    "Engineering & Architecture": [
      {
        icon: "⚙️",
        title: "Mechanical Engineering",
        description:
          "Design machines, systems and mechanical solutions.",
      },
      {
        icon: "🏗️",
        title: "Civil Engineering",
        description:
          "Build infrastructure, structures and cities.",
      },
      {
        icon: "⚡",
        title: "Electrical Engineering",
        description:
          "Work with electrical systems and technology.",
      },
      {
        icon: "🏛️",
        title: "Architecture",
        description:
          "Design spaces, buildings and environments.",
      },
      {
        icon: "🧰",
        title: "Electronics Engineering",
        description:
          "Build electronic systems and connected devices.",
      },
      {
        icon: "🚗",
        title: "Automobile Engineering",
        description:
          "Explore vehicle design and automotive technology.",
      },
    ],

    "Environment & Agriculture": [
      {
        icon: "🌾",
        title: "Agriculture",
        description:
          "Build careers in farming, technology and food systems.",
      },
      {
        icon: "🌱",
        title: "Sustainable Development",
        description:
          "Create solutions for a more sustainable future.",
      },
      {
        icon: "🌍",
        title: "Environmental Management",
        description:
          "Protect and manage natural resources.",
      },
      {
        icon: "💧",
        title: "Water & Resource Management",
        description:
          "Work on sustainable resource solutions.",
      },
    ],

    "Travel & Hospitality": [
      {
        icon: "✈️",
        title: "Aviation",
        description:
          "Explore careers across the aviation industry.",
      },
      {
        icon: "🏨",
        title: "Hotel Management",
        description:
          "Build a career in hospitality and hotel operations.",
      },
      {
        icon: "🌍",
        title: "Tourism",
        description:
          "Work in travel, tourism and destination management.",
      },
      {
        icon: "🎫",
        title: "Travel Management",
        description:
          "Plan and manage travel experiences.",
      },
    ],
  };

  const destinations = selectedField
    ? careersByField[selectedField.title] || []
    : [];

  return (
    <main className="destination-page">

      <button
        className="back-button"
        onClick={onBack}
      >
        ← Back
      </button>

      <section className="destination-content">

        <p className="destination-label">
          STEP 2 · YOUR CAREER
        </p>

        <h1>
          Choose your
          <br />
          career path
        </h1>

        <p className="destination-subtitle">
          Explore careers in{" "}
          <strong>{selectedField?.title}</strong> and choose
          the destination that feels right for you.
        </p>

        <div className="destination-grid">

          {destinations.map((destination) => (
  <button
    className="destination-card"
    key={destination.title}
    onClick={() => onSelectCareer(destination)}
  >
              <span className="destination-icon">
                {destination.icon}
              </span>

              <span className="destination-title">
                {destination.title}
              </span>

              <span className="destination-description">
                {destination.description}
              </span>

              <span className="destination-arrow">
                →
              </span>
            </button>
          ))}

        </div>

      </section>

    </main>
  );
}

export default DestinationPage;