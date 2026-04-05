import { useState } from "react";

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const ChatbotPanel = ({
  session,
  loading,
  error,
  onCreateSession,
  onSendMessage,
  predictionId,
  prediction,
}) => {
  const [draft, setDraft] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.trim()) {
      return;
    }

    await onSendMessage({
      sessionId: session?.id,
      message: draft.trim(),
      predictionId: predictionId || undefined,
      messages: session?.messages || [],
      prediction,
    });
    setDraft("");
  };

  return (
    <section className="panel chatbot-panel">
      <div className="panel-header">
        <p className="feature-kicker">Chatbot</p>
        <h2>{session?.title || "Soil Assistant Chat"}</h2>
        <p>Ask follow-up questions about season suitability, crop planning, and soil decisions.</p>
      </div>

      {!session ? (
        <div className="chatbot-empty">
          <p>Create a session to start chatting with the backend assistant.</p>
          <button type="button" className="btn btn-primary" onClick={onCreateSession} disabled={loading}>
            {loading ? "Creating..." : "Create Chat Session"}
          </button>
        </div>
      ) : (
        <>
          <div className="chatbot-message-list">
            {session.messages?.length ? (
              session.messages.map((item) => (
                <article
                  className={`chatbot-message-bubble chatbot-message-bubble-${item.role === "user" ? "user" : "assistant"}`}
                  key={item.id}
                >
                  <header>
                    <strong>{item.role === "user" ? "You" : "Assistant"}</strong>
                    <span>{formatTime(item.createdAt)}</span>
                  </header>
                  <p>{item.message}</p>
                </article>
              ))
            ) : (
              <div className="mini-empty">No messages yet. Start the conversation below.</div>
            )}
          </div>

          {error ? <div className="notice notice-error">{error}</div> : null}

          <form className="chatbot-composer" onSubmit={handleSubmit}>
            <label className="field field-full">
              <span>Your question</span>
              <textarea
                rows="3"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Can I grow this crop in summer?"
                disabled={loading}
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading || !draft.trim()}>
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  );
};

export default ChatbotPanel;
