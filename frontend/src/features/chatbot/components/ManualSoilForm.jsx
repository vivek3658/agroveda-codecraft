import { useMemo, useState } from "react";
import {
  defaultManualValues,
  normalizeManualValues,
  validateManualSoilInput,
} from "../validation/chatbotValidation";

const fields = [
  { key: "N", label: "Nitrogen (N)" },
  { key: "P", label: "Phosphorus (P)" },
  { key: "K", label: "Potassium (K)" },
  { key: "temperature", label: "Temperature" },
  { key: "humidity", label: "Humidity" },
  { key: "rainfall", label: "Rainfall" },
  { key: "ph", label: "pH" },
];

const ManualSoilForm = ({ loading, onSubmit }) => {
  const [values, setValues] = useState(defaultManualValues);
  const [errors, setErrors] = useState({});
  const hasValues = useMemo(() => Object.values(values).some((value) => value !== ""), [values]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = validateManualSoilInput(values);
    setErrors(result.errors);

    if (!result.valid) {
      return;
    }

    await onSubmit(normalizeManualValues(values));
  };

  return (
    <section className="panel chatbot-panel">
      <div className="panel-header">
        <p className="feature-kicker">Manual JSON Input</p>
        <h2>Enter soil values</h2>
        <p>Use direct field readings when you already know the soil values.</p>
      </div>

      <form className="chatbot-form-grid" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <label className="field" key={field.key}>
            <span>{field.label}</span>
            <input
              type="number"
              step="any"
              value={values[field.key]}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
              }
              disabled={loading}
            />
            {errors[field.key] ? <em className="field-error">{errors[field.key]}</em> : null}
          </label>
        ))}

        <div className="form-actions field-full">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Predicting..." : "Predict Crop"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading || !hasValues}
            onClick={() => {
              setValues(defaultManualValues);
              setErrors({});
            }}
          >
            Clear
          </button>
        </div>
      </form>
    </section>
  );
};

export default ManualSoilForm;
