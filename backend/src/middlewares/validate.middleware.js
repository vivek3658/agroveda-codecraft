const validateRequiredFields = (requiredFields = []) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  validateRequiredFields
};
