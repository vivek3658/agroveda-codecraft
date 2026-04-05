import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getPredictionHistory } from "../../../services/chatbot.service";
import ChatbotPanel from "../components/ChatbotPanel";
import ChatSessionList from "../components/ChatSessionList";
import FileUploadPanel from "../components/FileUploadPanel";
import ManualSoilForm from "../components/ManualSoilForm";
import PredictionHistoryList from "../components/PredictionHistoryList";
import PredictionResultCard from "../components/PredictionResultCard";
import { useChatbotMessages } from "../hooks/useChatbotMessages";
import { useChatbotPrediction } from "../hooks/useChatbotPrediction";
import { useChatbotSessions } from "../hooks/useChatbotSessions";
import "../chatbot.css";

const tabs = [
  { id: "manual", label: "Manual Input" },
  { id: "image", label: "Image Upload" },
  { id: "pdf", label: "PDF Upload" },
];

const SoilAssistantPage = () => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("manual");
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [predictionError, setPredictionError] = useState("");

  const {
    sessions,
    activeSession,
    loadingSessions,
    loadingActiveSession,
    error: sessionError,
    setActiveSession,
    refreshSessions,
    loadSession,
    startSession,
  } = useChatbotSessions(session?.token);

  const refreshPredictionHistory = async () => {
    if (!session?.token) {
      return;
    }

    setLoadingPredictions(true);
    try {
      const data = await getPredictionHistory(session.token);
      setPredictionHistory(data);
      setPredictionError("");
    } catch (err) {
      setPredictionError(err.message || "Unable to load prediction history.");
    } finally {
      setLoadingPredictions(false);
    }
  };

  useEffect(() => {
    refreshPredictionHistory();
  }, [session?.token]);

  const handlePredictionSuccess = async (result) => {
    setCurrentPrediction(result);
    await refreshPredictionHistory();

    if (!activeSession && !loadingActiveSession) {
      await startSession({ title: "Soil Assistant Chat" }).catch(() => {});
    }
  };

  const {
    loading: predictionLoading,
    error: livePredictionError,
    runManualPrediction,
    runFileUpload,
  } = useChatbotPrediction(session?.token, handlePredictionSuccess);

  const {
    loading: messageLoading,
    error: messageError,
    sendMessage,
  } = useChatbotMessages(session?.token, async (nextSession) => {
    setActiveSession(nextSession);
    await refreshSessions().catch(() => {});
  });

  const activeError = livePredictionError || predictionError || sessionError || messageError;

  return (
    <div className="page-shell chatbot-page">
      <section className="topbar">
        <div>
          <p className="eyebrow">Soil Assistant</p>
          <h1>Chat with your soil prediction system</h1>
          <p className="section-copy">
            Submit soil values manually, upload images or PDFs, and continue through a real backend chatbot session.
          </p>
        </div>
      </section>

      {activeError ? <div className="notice notice-error">{activeError}</div> : null}

      <section className="chatbot-layout">
        <aside className="chatbot-left">
          <section className="panel chatbot-panel">
            <div className="panel-header">
              <p className="feature-kicker">Input Methods</p>
              <h2>Select a submission mode</h2>
              <p>Choose the input format that matches the soil data you have right now.</p>
            </div>

            <div className="chatbot-tab-row">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`chatbot-tab${activeTab === tab.id ? " chatbot-tab-active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {activeTab === "manual" ? (
            <ManualSoilForm loading={predictionLoading} onSubmit={runManualPrediction} />
          ) : (
            <FileUploadPanel
              mode={activeTab}
              loading={predictionLoading}
              onSubmit={runFileUpload}
            />
          )}
        </aside>

        <div className="chatbot-main">
          <PredictionResultCard prediction={currentPrediction} />
          <ChatbotPanel
            session={activeSession}
            loading={messageLoading || loadingActiveSession}
            error={messageError}
            onCreateSession={() => startSession({ title: "Soil Assistant Chat" })}
            onSendMessage={sendMessage}
            predictionId={currentPrediction?.id}
            prediction={currentPrediction}
          />
        </div>

        <aside className="chatbot-right">
          <PredictionHistoryList
            predictions={predictionHistory}
            loading={loadingPredictions}
            onUsePrediction={(prediction) => setCurrentPrediction(prediction)}
          />
          <ChatSessionList
            sessions={sessions}
            loading={loadingSessions}
            activeSessionId={activeSession?.id}
            onSelectSession={loadSession}
          />
        </aside>
      </section>
    </div>
  );
};

export default SoilAssistantPage;
