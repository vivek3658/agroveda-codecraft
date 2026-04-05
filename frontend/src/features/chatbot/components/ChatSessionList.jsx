const formatUpdatedAt = (value) => {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const ChatSessionList = ({ sessions, loading, activeSessionId, onSelectSession }) => {
  return (
    <section className="panel chatbot-panel">
      <div className="panel-header">
        <p className="feature-kicker">Chat Sessions</p>
        <h2>Saved conversations</h2>
        <p>Open any earlier session to continue the discussion with the backend assistant.</p>
      </div>

      {loading ? (
        <div className="loading-panel chatbot-inline-loading">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="mini-empty">No chat sessions available yet.</div>
      ) : (
        <div className="chatbot-session-list">
          {sessions.map((session) => (
            <button
              type="button"
              className={`chatbot-session-item${activeSessionId === session.id ? " active" : ""}`}
              key={session.id}
              onClick={() => onSelectSession(session.id)}
            >
              <strong>{session.title}</strong>
              <span>{formatUpdatedAt(session.updatedAt)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default ChatSessionList;
