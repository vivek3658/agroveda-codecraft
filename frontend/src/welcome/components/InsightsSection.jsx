const insights = [
  { value: "Soil", label: "Reports can feed crop guidance and next-step recommendations." },
  { value: "Market", label: "Listings, orders, and analytics become one connected loop." },
  { value: "Storage", label: "Post-harvest planning is easier when facilities are searchable." },
  { value: "Learn", label: "New farmers can keep improving without leaving the platform." },
];

const InsightsSection = () => {
  return (
    <section className="welcome-section welcome-section--sage" id="insights">
      <div className="welcome-section__header">
        <p className="welcome-section-tag">Why It Matters</p>
        <h2>Built to reduce friction across the full farming workflow.</h2>
        <p>
          AgroVeda is strongest when users do not have to jump between disconnected
          tools for soil, sales, storage, and learning.
        </p>
      </div>

      <div className="welcome-insight-grid">
        {insights.map((item) => (
          <article className="welcome-insight-card" key={item.value}>
            <strong>{item.value}</strong>
            <p>{item.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default InsightsSection;
