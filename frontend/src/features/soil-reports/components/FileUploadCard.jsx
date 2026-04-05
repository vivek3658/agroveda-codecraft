import { useEffect, useMemo, useState } from "react";
import { validateUploadFile } from "../validation/soilValidation";

const modeConfig = {
  image: {
    kicker: "Image Upload",
    title: "Upload Soil Report Image",
    description: "Accepts PNG or JPG images up to 5MB. Great for scanned sheets or report photos.",
    accept: ".png,.jpg,.jpeg",
    buttonLabel: "Upload Image",
  },
  pdf: {
    kicker: "PDF Upload",
    title: "Upload Soil Report PDF",
    description: "Accepts PDF documents up to 10MB. Best for full digital soil lab reports.",
    accept: ".pdf",
    buttonLabel: "Upload PDF",
  },
};

const FileUploadCard = ({ mode, onSubmit, loading }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const config = modeConfig[mode];
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

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;

    if (!nextFile) {
      setFile(null);
      setError("");
      return;
    }

    const validation = validateUploadFile(nextFile, mode);
    if (!validation.valid) {
      setFile(null);
      setError(validation.error);
      return;
    }

    setFile(nextFile);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please choose a file before uploading.");
      return;
    }

    await onSubmit(file);
  };

  return (
    <section className="panel soil-panel">
      <div className="panel-header">
        <p className="feature-kicker">{config.kicker}</p>
        <h2>{config.title}</h2>
        <p>{config.description}</p>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="upload-dropzone">
          <input
            type="file"
            accept={config.accept}
            onChange={handleFileChange}
            disabled={loading}
          />
          <strong>{file ? file.name : "Choose a file"}</strong>
          <span>{mode === "image" ? "PNG / JPG up to 5MB" : "PDF up to 10MB"}</span>
        </label>

        {previewUrl ? (
          <div className="upload-preview">
            <img src={previewUrl} alt="Selected soil report preview" />
          </div>
        ) : null}

        {error ? <div className="notice notice-error">{error}</div> : null}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading || !file}>
            {loading ? "Uploading..." : config.buttonLabel}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setFile(null);
              setError("");
            }}
            disabled={loading || !file}
          >
            Remove File
          </button>
        </div>
      </form>
    </section>
  );
};

export default FileUploadCard;
