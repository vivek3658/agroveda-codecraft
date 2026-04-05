const steps = [
  {
    title: "Join the workspace",
    description:
      "Sign in as a farmer or consumer and reach the tools relevant to your role without switching products.",
  },
  {
    title: "Operate with live data",
    description:
      "Manage crops, place orders, upload soil reports, and keep profile information synced with real APIs.",
  },
  {
    title: "Grow with guidance",
    description:
      "Use analytics, course resources, storage discovery, and AI-backed soil guidance to act faster with confidence.",
  },
];

const JourneySection = () => {
  return (
    <section className="welcome-section welcome-section--cream" id="journey">
      <div className="welcome-section__header">
        <p className="welcome-section-tag">Journey</p>
        <h2>A simpler path from observation to action.</h2>
        <p>
          The welcome page now explains the product clearly instead of acting like a
          standalone HTML demo.
        </p>
      </div>

      <div className="welcome-journey-grid">
        {steps.map((step, index) => (
          <article className="welcome-journey-card" key={step.title}>
            <span className="welcome-journey-card__index">0{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default JourneySection;
