const formatConfidence = (value) => `${Math.round(Number(value || 0) * 100)}%`;

const fieldLabels = [
  ["N", "Nitrogen"],
  ["P", "Phosphorus"],
  ["K", "Potassium"],
  ["temperature", "Temperature"],
  ["humidity", "Humidity"],
  ["rainfall", "Rainfall"],
  ["ph", "Soil pH"],
];

const PredictionResultCard = ({ prediction }) => {
  if (!prediction) {
    return (
      <section className="panel chatbot-panel">
        <div className="panel-header">
          <p className="feature-kicker">Prediction Result</p>
          <h2>Waiting for analysis</h2>
          <p>Submit manual values or upload a soil file to see real backend predictions.</p>
        </div>
      </section>
    );
  }

  const topRecommendation = prediction.recommendations?.[0];

  return (
    <section className="panel chatbot-panel">
      <div className="panel-header">
        <p className="feature-kicker">Prediction Result</p>
        <h2>{topRecommendation ? topRecommendation.crop : "No crop recommendation"}</h2>
        <p>{prediction.chatbotReply || "Prediction completed successfully."}</p>
      </div>

      <div className="chatbot-highlight-card">
        <span className="status-pill">Best crop</span>
        <strong>{topRecommendation?.crop || "Not available"}</strong>
        <p>
          {topRecommendation
            ? `Confidence: ${formatConfidence(topRecommendation.confidence)}`
            : "No confidence score returned."}
        </p>
      </div>

      <div className="chatbot-extracted-grid">
        {fieldLabels.map(([key, label]) => (
          <article className="chatbot-stat-card" key={key}>
            <span>{label}</span>
            <strong>{prediction.extracted?.[key] ?? "--"}</strong>
          </article>
        ))}
      </div>

      <div className="chatbot-recommendation-list">
        {(prediction.recommendations || []).map((recommendation) => (
          <article className="chatbot-recommendation-card" key={recommendation.id}>
            <strong>{recommendation.crop}</strong>
            <span>{formatConfidence(recommendation.confidence)}</span>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PredictionResultCard;
