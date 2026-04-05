const success = (res, status, payload = {}) => res.status(status).json({
  success: true,
  ...payload
});

const failure = (res, status, message, extra = {}) => res.status(status).json({
  success: false,
  message,
  ...extra
});

module.exports = {
  success,
  failure
};
