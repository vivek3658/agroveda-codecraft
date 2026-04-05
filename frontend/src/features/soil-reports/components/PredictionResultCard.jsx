const formatNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return "Not available";
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(2).replace(/\.00$/, "") : String(value);
};

const normalizeRecommendation = (item, index) => {
  if (typeof item === "string") {
    return {
      id: `${item}-${index}`,
      name: item,
      confidence: null,
    };
  }

  return {
    id: item?.id || item?._id || `${item?.name || item?.crop || "crop"}-${index}`,
    name: item?.name || item?.crop || item?.label || `Crop ${index + 1}`,
    confidence: item?.confidence ?? item?.score ?? item?.percentage ?? null,
  };
};

const soilLabels = {
  N: "Nitrogen",
  P: "Phosphorus",
  K: "Potassium",
  temperature: "Temperature",
  humidity: "Humidity",
  rainfall: "Rainfall",
  ph: "Soil pH",
};

const PredictionResultCard = ({ prediction }) => {
  if (!prediction) {
    return (
      <section className="panel soil-panel">
        <div className="panel-header">
          <p className="feature-kicker">Prediction Result</p>
          <h2>Waiting for Soil Analysis</h2>
          <p>Submit soil values or upload a report to see extracted data and crop recommendations here.</p>
        </div>
      </section>
    );
  }

  const extractedValues = prediction.extractedValues || {};
  const recommendations = (prediction.recommendations || []).slice(0, 3).map(normalizeRecommendation);
  const bestCrop = prediction.bestCrop || recommendations[0]?.name || "Not available";

  return (
    <section className="panel soil-panel">
      <div className="panel-header">
        <p className="feature-kicker">Prediction Result</p>
        <h2>Best Crop: {typeof bestCrop === "string" ? bestCrop : bestCrop?.name}</h2>
        <p>Source: <strong>{prediction.sourceType?.toUpperCase?.() || "UNKNOWN"}</strong></p>
      </div>

      <div className="prediction-highlight">
        <div>
          <span className="prediction-badge">Best Match</span>
          <strong>{typeof bestCrop === "string" ? bestCrop : bestCrop?.name}</strong>
        </div>
        <p>{prediction.summary || "Your soil profile has been analyzed successfully."}</p>
      </div>

      <div className="soil-values-grid">
        {Object.entries(soilLabels).map(([key, label]) => (
          <article className="metric-card soil-value-card" key={key}>
            <span>{label}</span>
            <strong>{formatNumber(extractedValues[key])}</strong>
          </article>
        ))}
      </div>

      <div className="panel-subsection">
        <h3>Top Recommendations</h3>
        {recommendations.length === 0 ? (
          <div className="mini-empty">No ranked recommendations were returned by the backend.</div>
        ) : (
          <div className="recommendation-list">
            {recommendations.map((item, index) => (
              <article className="recommendation-card" key={item.id}>
                <span className="recommendation-rank">#{index + 1}</span>
                <strong>{item.name}</strong>
                <span>
                  {item.confidence !== null && item.confidence !== undefined
                    ? `${formatNumber(item.confidence)}% confidence`
                    : "Confidence not provided"}
                </span>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PredictionResultCard;
