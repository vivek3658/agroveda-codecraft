const formatDate = (value) => {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

const getTopCropLabel = (prediction) => {
  if (typeof prediction.bestCrop === "string") {
    return prediction.bestCrop;
  }

  return prediction.bestCrop?.name || prediction.recommendations?.[0]?.name || "Not available";
};

const PredictionHistoryList = ({ predictions, loading, onSelectPrediction }) => {
  return (
    <section className="panel soil-panel">
      <div className="panel-header">
        <p className="feature-kicker">Prediction History</p>
        <h2>Recent Soil Analyses</h2>
        <p>Reopen previous results and continue the related chatbot guidance whenever needed.</p>
      </div>

      {loading ? (
        <div className="loading-panel soil-inline-state">Loading prediction history...</div>
      ) : predictions.length === 0 ? (
        <div className="mini-empty">No soil predictions yet. Your recent analyses will appear here.</div>
      ) : (
        <div className="history-list">
          {predictions.map((prediction, index) => (
            <article
              className="history-card"
              key={prediction.id || prediction.raw?._id || `${prediction.sourceType}-${index}`}
            >
              <div className="history-meta">
                <span className="status-pill">{prediction.sourceType || "json"}</span>
                <strong>{getTopCropLabel(prediction)}</strong>
                <p>{formatDate(prediction.raw?.createdAt || prediction.createdAt)}</p>
              </div>

              <div className="history-values">
                {Object.entries(prediction.extractedValues || {})
                  .slice(0, 4)
                  .map(([key, value]) => (
                    <span key={key}>
                      {key}: {String(value)}
                    </span>
                  ))}
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onSelectPrediction(prediction)}
              >
                Open Result
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default PredictionHistoryList;
