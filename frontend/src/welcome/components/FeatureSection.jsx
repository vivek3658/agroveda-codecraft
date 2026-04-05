const features = [
  {
    title: "Crop Management",
    description:
      "Track your listed crops, update availability, and keep production details organized from one dashboard.",
  },
  {
    title: "Farmer Analytics",
    description:
      "See revenue movement, crop performance, and marketplace activity without manually building reports.",
  },
  {
    title: "Marketplace and Orders",
    description:
      "Let both farmers and consumers browse listings, place orders, and revisit purchase history with invoices.",
  },
  {
    title: "Soil Report Assistant",
    description:
      "Upload a soil report or enter values manually to get crop recommendations and follow-up chatbot guidance.",
  },
  {
    title: "Storage Discovery",
    description:
      "Search storage locations by city, crop, and state, then contact facilities directly through phone or email.",
  },
  {
    title: "Learning Hub",
    description:
      "Guide new farmers with curated courses, resources, and practical farming content for continuous growth.",
  },
];

const FeatureSection = () => {
  return (
    <section className="welcome-section welcome-section--soft" id="features">
      <div className="welcome-section__header">
        <p className="welcome-section-tag">Platform Features</p>
        <h2>Everything important to a growing farm, connected together.</h2>
        <p>
          The original HTML had a lot of visual richness, so this React version keeps
          that feeling but organizes the experience into reusable sections and cards.
        </p>
      </div>

      <div className="welcome-feature-grid">
        {features.map((feature) => (
          <article className="welcome-feature-card" key={feature.title}>
            <div className="welcome-feature-card__icon" />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;
