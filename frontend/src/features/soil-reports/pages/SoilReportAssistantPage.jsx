import { useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import ChatPanel from "../components/ChatPanel";
import FileUploadCard from "../components/FileUploadCard";
import ManualSoilForm from "../components/ManualSoilForm";
import PredictionHistoryList from "../components/PredictionHistoryList";
import PredictionResultCard from "../components/PredictionResultCard";
import { usePredictionHistory } from "../hooks/usePredictionHistory";
import { useSoilChat } from "../hooks/useSoilChat";
import { useSoilPrediction } from "../hooks/useSoilPrediction";
import "../soilReports.css";

const inputTabs = [
  { id: "manual", label: "Manual Input" },
  { id: "image", label: "Image Upload" },
  { id: "pdf", label: "PDF Upload" },
];

const SoilReportAssistantPage = () => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("manual");
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const {
    predictions,
    sessions,
    loadingPredictions,
    loadingSessions,
    error: historyError,
    refreshPredictions,
    refreshSessions,
  } = usePredictionHistory(session?.token);

  const {
    sessionId,
    messages,
    loading: chatLoading,
    error: chatError,
    bindPrediction,
    loadSession,
    sendMessage,
  } = useSoilChat(session?.token);

  const predictionSuccessHandler = async (result) => {
    setCurrentPrediction(result);
    bindPrediction(result);
    setFeedback({ type: "success", message: "Soil analysis completed successfully." });
    await Promise.allSettled([refreshPredictions(), refreshSessions()]);
  };

  const {
    loading: predictionLoading,
    error: predictionError,
    runManualPrediction,
    runFilePrediction,
  } = useSoilPrediction(session?.token, predictionSuccessHandler);

  const activeError = predictionError || historyError;
  const isBusy = predictionLoading || chatLoading || loadingSessions;

  const helperCopy = useMemo(() => {
    if (activeTab === "manual") {
      return "Enter precise soil metrics to get the cleanest crop recommendation.";
    }

    if (activeTab === "image") {
      return "Upload a report photo or scan. We will use the backend OCR pipeline to extract values.";
    }

    return "Upload a lab PDF report and continue into crop guidance and follow-up chat.";
  }, [activeTab]);

  const handlePredictionSelect = async (prediction) => {
    setCurrentPrediction(prediction);
    bindPrediction(prediction);
    setFeedback({ type: "success", message: "Previous prediction loaded." });

    if (prediction.sessionId) {
      await loadSession(prediction.sessionId).catch(() => {});
    }
  };

  const renderActiveInput = () => {
    if (activeTab === "manual") {
      return <ManualSoilForm loading={predictionLoading} onSubmit={runManualPrediction} />;
    }

    if (activeTab === "image") {
      return (
        <FileUploadCard mode="image" loading={predictionLoading} onSubmit={runFilePrediction} />
      );
    }

    return <FileUploadCard mode="pdf" loading={predictionLoading} onSubmit={runFilePrediction} />;
  };

  return (
    <div className="page-shell soil-page">
      <section className="topbar">
        <div>
          <p className="eyebrow">Soil Report Assistant</p>
          <h1>Turn soil reports into crop decisions</h1>
          <p className="section-copy">
            Submit soil data manually, from report images, or from PDFs, then continue with crop guidance through the assistant chatbot.
          </p>
        </div>
      </section>

      {feedback ? (
        <div className={`notice ${feedback.type === "success" ? "notice-success" : "notice-error"}`}>
          {feedback.message}
        </div>
      ) : null}
      {activeError ? <div className="notice notice-error">{activeError}</div> : null}

      <section className="soil-layout">
        <div className="soil-main-column">
          <section className="panel soil-intro-panel">
            <div className="panel-header">
              <p className="feature-kicker">Data Sources</p>
              <h2>Choose How You Want to Analyze Soil</h2>
              <p>{helperCopy}</p>
            </div>

            <div className="soil-tab-row">
              {inputTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`soil-tab ${activeTab === tab.id ? "soil-tab-active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {renderActiveInput()}
          </section>

          <PredictionResultCard prediction={currentPrediction} />
          <ChatPanel
            messages={messages}
            sessions={sessions}
            activeSessionId={sessionId}
            loading={isBusy}
            error={chatError}
            onSelectSession={(id) => {
              if (!id) {
                bindPrediction(currentPrediction);
                return;
              }

              loadSession(id).catch(() => {});
            }}
            onSendMessage={sendMessage}
          />
        </div>

        <aside className="soil-side-column">
          <section className="panel soil-quick-panel">
            <div className="panel-header">
              <p className="feature-kicker">How It Works</p>
              <h2>Fast Workflow</h2>
              <p>Designed for quick field decisions on both desktop and mobile.</p>
            </div>
            <div className="soil-steps">
              <article>
                <strong>1. Submit soil data</strong>
                <p>Enter soil values directly or upload an image/PDF report.</p>
              </article>
              <article>
                <strong>2. Review prediction</strong>
                <p>See extracted values, top recommendations, and the best matching crop.</p>
              </article>
              <article>
                <strong>3. Ask follow-up questions</strong>
                <p>Use the assistant for fertilizer, irrigation, and crop planning guidance.</p>
              </article>
            </div>
          </section>

          <PredictionHistoryList
            predictions={predictions}
            loading={loadingPredictions}
            onSelectPrediction={handlePredictionSelect}
          />
        </aside>
      </section>
    </div>
  );
};

export default SoilReportAssistantPage;
