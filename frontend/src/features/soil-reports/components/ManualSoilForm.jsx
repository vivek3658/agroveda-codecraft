import { useMemo, useState } from "react";
import {
  defaultSoilFormValues,
  normalizeSoilForm,
  validateSoilForm,
} from "../validation/soilValidation";

const soilFields = [
  { name: "N", label: "Nitrogen (N)", unit: "kg/ha" },
  { name: "P", label: "Phosphorus (P)", unit: "kg/ha" },
  { name: "K", label: "Potassium (K)", unit: "kg/ha" },
  { name: "temperature", label: "Temperature", unit: "°C" },
  { name: "humidity", label: "Humidity", unit: "%" },
  { name: "rainfall", label: "Rainfall", unit: "mm" },
  { name: "ph", label: "Soil pH", unit: "pH" },
];

const ManualSoilForm = ({ onSubmit, loading }) => {
  const [values, setValues] = useState(defaultSoilFormValues);
  const [errors, setErrors] = useState({});

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);
  const hasValues = useMemo(
    () => Object.values(values).some((value) => value !== ""),
    [values]
  );

  const handleChange = (field, value) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);

    if (errors[field]) {
      const validation = validateSoilForm(nextValues);
      setErrors(validation.errors);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validation = validateSoilForm(values);
    setErrors(validation.errors);

    if (!validation.valid) {
      return;
    }

    await onSubmit(normalizeSoilForm(values));
  };

  const handleReset = () => {
    setValues(defaultSoilFormValues);
    setErrors({});
  };

  return (
    <section className="panel soil-panel">
      <div className="panel-header">
        <p className="feature-kicker">Manual Input</p>
        <h2>Enter Soil Data</h2>
        <p>Use direct soil metrics when you already have tested field values available.</p>
      </div>

      <form className="soil-form-grid" onSubmit={handleSubmit}>
        {soilFields.map((field) => (
          <label className="field" key={field.name}>
            <span>
              {field.label} <small>{field.unit}</small>
            </span>
            <input
              type="number"
              step="any"
              min="0"
              value={values[field.name]}
              onChange={(event) => handleChange(field.name, event.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              disabled={loading}
            />
            {errors[field.name] ? <em className="field-error">{errors[field.name]}</em> : null}
          </label>
        ))}

        <div className="form-actions field-full">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Predicting..." : "Predict Crops"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={loading || (!hasErrors && !hasValues)}
          >
            Clear Form
          </button>
        </div>
      </form>
    </section>
  );
};

export default ManualSoilForm;
