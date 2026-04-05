const numberField = (label, min, max) => (value) => {
  if (value === "" || value === null || value === undefined) {
    return `${label} is required.`;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return `${label} must be a number.`;
  }

  if (parsed < min || parsed > max) {
    return `${label} must be between ${min} and ${max}.`;
  }

  return "";
};

const validators = {
  N: numberField("N", 0, 150),
  P: numberField("P", 0, 150),
  K: numberField("K", 0, 250),
  temperature: numberField("Temperature", 0, 50),
  humidity: numberField("Humidity", 0, 100),
  rainfall: numberField("Rainfall", 0, 3000),
  ph: numberField("pH", 0, 14),
};

export const defaultSoilFormValues = {
  N: "",
  P: "",
  K: "",
  temperature: "",
  humidity: "",
  rainfall: "",
  ph: "",
};

export const validateSoilForm = (values) => {
  const errors = {};

  Object.entries(validators).forEach(([key, validator]) => {
    const message = validator(values[key]);
    if (message) {
      errors[key] = message;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const normalizeSoilForm = (values) =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, Number(value)])
  );

export const validateUploadFile = (file, mode) => {
  if (!file) {
    return {
      valid: false,
      error: "Please select a file.",
    };
  }

  if (mode === "image") {
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Only PNG, JPG, and JPEG images are allowed.",
      };
    }
    if (file.size > 5 * 1024 * 1024) {
      return {
        valid: false,
        error: "Image size must be 5MB or less.",
      };
    }
  }

  if (mode === "pdf") {
    if (file.type !== "application/pdf") {
      return {
        valid: false,
        error: "Only PDF files are allowed.",
      };
    }
    if (file.size > 10 * 1024 * 1024) {
      return {
        valid: false,
        error: "PDF size must be 10MB or less.",
      };
    }
  }

  return {
    valid: true,
    error: "",
  };
};
