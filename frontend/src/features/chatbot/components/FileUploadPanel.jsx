import { useEffect, useMemo, useState } from "react";
import { validateSoilFile } from "../validation/chatbotValidation";

const configByMode = {
  image: {
    title: "Upload soil image",
    description: "PNG, JPG, or JPEG up to 5MB.",
    accept: ".png,.jpg,.jpeg",
    buttonLabel: "Upload Image",
  },
  pdf: {
    title: "Upload soil PDF",
    description: "PDF reports up to 10MB.",
    accept: ".pdf",
    buttonLabel: "Upload PDF",
  },
};

const FileUploadPanel = ({ mode, loading, onSubmit }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const config = configByMode[mode];

  const previewUrl = useMemo(
    () => (mode === "image" && file ? URL.createObjectURL(file) : ""),
    [file, mode]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSelect = (event) => {
    const nextFile = event.target.files?.[0] || null;
    if (!nextFile) {
      setFile(null);
      setError("");
      return;
    }

    const result = validateSoilFile(nextFile, mode);
    if (!result.valid) {
      setFile(null);
      setError(result.error);
      return;
    }

    setFile(nextFile);
    setError("");
  };

  return (
    <section className="panel chatbot-panel">
      <div className="panel-header">
        <p className="feature-kicker">{mode === "image" ? "Image Upload" : "PDF Upload"}</p>
        <h2>{config.title}</h2>
        <p>{config.description}</p>
      </div>

      <label className="chatbot-dropzone">
        <input type="file" accept={config.accept} onChange={handleSelect} disabled={loading} />
        <strong>{file ? file.name : "Choose file"}</strong>
        <span>{config.description}</span>
      </label>

      {previewUrl ? (
        <div className="chatbot-file-preview">
          <img src={previewUrl} alt="Selected soil file" />
        </div>
      ) : null}

      {error ? <div className="notice notice-error">{error}</div> : null}

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={loading || !file}
          onClick={() => onSubmit(file)}
        >
          {loading ? "Uploading..." : config.buttonLabel}
        </button>
      </div>
    </section>
  );
};

export default FileUploadPanel;
