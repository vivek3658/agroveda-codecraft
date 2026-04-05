import { useMemo, useState } from "react";

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const ChatPanel = ({
  messages,
  sessions,
  activeSessionId,
  loading,
  error,
  onSelectSession,
  onSendMessage,
}) => {
  const [draft, setDraft] = useState("");

  const sessionOptions = useMemo(
    () =>
      sessions.map((session) => ({
        value: session.id,
        label: session.title || "Soil Assistant Session",
      })),
    [sessions]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.trim()) {
      return;
    }

    await onSendMessage(draft);
    setDraft("");
  };

  return (
    <section className="panel soil-panel">
      <div className="panel-header">
        <p className="feature-kicker">Chatbot</p>
        <h2>Ask Follow-up Questions</h2>
        <p>Continue with the current prediction or reopen any past conversation.</p>
      </div>

      <div className="chat-toolbar">
        <label className="field">
          <span>Previous Sessions</span>
          <select
            value={activeSessionId || ""}
            onChange={(event) => onSelectSession(event.target.value)}
            disabled={loading || sessions.length === 0}
          >
            <option value="">Current session</option>
            {sessionOptions.map((session) => (
              <option key={session.value} value={session.value}>
                {session.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="chat-thread">
        {messages.length === 0 ? (
          <div className="mini-empty">
            Submit a soil report first, then ask questions like fertilizer advice, irrigation guidance, or crop suitability.
          </div>
        ) : (
          messages.map((message, index) => (
            <article
              className={`chat-message ${message.role === "user" ? "chat-user" : "chat-assistant"}`}
              key={message.id || `${message.role}-${index}`}
            >
              <header>
                <strong>{message.role === "user" ? "You" : "AgroVeda Assistant"}</strong>
                <span>{formatTime(message.createdAt)}</span>
              </header>
              <p>{message.content || message.message || "No message content"}</p>
            </article>
          ))
        )}
      </div>

      {error ? <div className="notice notice-error">{error}</div> : null}

      <form className="chat-composer" onSubmit={handleSubmit}>
        <label className="field field-full">
          <span>Ask a question</span>
          <textarea
            rows="3"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Example: Which fertilizer is best for this soil and how often should I irrigate?"
            disabled={loading}
          />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading || !draft.trim()}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChatPanel;
