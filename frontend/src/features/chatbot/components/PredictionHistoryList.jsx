const formatDate = (value) => {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const PredictionHistoryList = ({ predictions, loading, onUsePrediction }) => {
  return (
    <section className="panel chatbot-panel">
      <div className="panel-header">
        <p className="feature-kicker">Prediction History</p>
        <h2>Previous predictions</h2>
        <p>Reuse earlier predictions inside chat without entering the same data again.</p>
      </div>

      {loading ? (
        <div className="loading-panel chatbot-inline-loading">Loading prediction history...</div>
      ) : predictions.length === 0 ? (
        <div className="mini-empty">No predictions found yet.</div>
      ) : (
        <div className="chatbot-history-list">
          {predictions.map((item) => (
            <article className="chatbot-history-card" key={item.id}>
              <p className="feature-kicker">{item.sourceType}</p>
              <h3>{item.recommendations?.[0]?.crop || "No recommendation"}</h3>
              <p>{formatDate(item.createdAt)}</p>
              <div className="chatbot-history-meta">
                <span>N: {item.extracted.N ?? "--"}</span>
                <span>P: {item.extracted.P ?? "--"}</span>
                <span>K: {item.extracted.K ?? "--"}</span>
                <span>pH: {item.extracted.ph ?? "--"}</span>
              </div>
              <button type="button" className="btn btn-secondary" onClick={() => onUsePrediction(item)}>
                Use in Chat
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default PredictionHistoryList;
