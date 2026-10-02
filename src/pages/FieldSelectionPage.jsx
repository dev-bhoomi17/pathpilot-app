import "./FieldSelectionPage.css";

function FieldSelectionPage({ onBack, onSelectField }) {
  const fields = [
    {
      icon: "💻",
      title: "Technology",
      description: "Software, cybersecurity, AI, data and more.",
    },
    {
      icon: "🩺",
      title: "Healthcare",
      description: "Medicine, nursing, pharmacy and healthcare.",
    },
    {
      icon: "💼",
      title: "Business & Finance",
      description: "Management, finance, marketing and entrepreneurship.",
    },
    {
      icon: "🎨",
      title: "Arts & Creative",
      description: "Design, animation, media and creative careers.",
    },
    {
      icon: "🔬",
      title: "Science & Research",
      description: "Scientific research, biotechnology and discovery.",
    },
    {
      icon: "⚖️",
      title: "Law & Public Service",
      description: "Law, civil services and public administration.",
    },
    {
      icon: "🎓",
      title: "Education",
      description: "Teaching, training and academic careers.",
    },
    {
      icon: "🏗️",
      title: "Engineering & Architecture",
      description: "Engineering, architecture and infrastructure.",
    },
    {
      icon: "🌱",
      title: "Environment & Agriculture",
      description: "Sustainability, agriculture and environmental careers.",
    },
    {
      icon: "✈️",
      title: "Travel & Hospitality",
      description: "Tourism, aviation, hotels and hospitality.",
    },
  ];

  return (
    <main className="field-page">

      <button className="field-back-button" onClick={onBack}>
        ← Back
      </button>

      <section className="field-content">

        <p className="field-label">
  STEP 1 · CHOOSE YOUR FIELD
</p>

        <h1>
          What field
          <br />
          interests you?
        </h1>

        <p className="field-subtitle">
          Choose a field that matches your interests.
          You can explore different career paths inside it.
        </p>

        <div className="field-grid">

          {fields.map((field) => (
            <button
              className="field-card"
              key={field.title}
              onClick={() => onSelectField(field)}
            >
              <span className="field-icon">
                {field.icon}
              </span>

              <span className="field-title">
                {field.title}
              </span>

              <span className="field-description">
                {field.description}
              </span>

              <span className="field-arrow">
                →
              </span>
            </button>
          ))}

        </div>

      </section>

    </main>
  );
}

export default FieldSelectionPage;