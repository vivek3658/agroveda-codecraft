const nodemailer = require('nodemailer');
const config = require('./index');

let transporter;

const getMailer = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: config.smtpUser && config.smtpPass ? {
        user: config.smtpUser,
        pass: config.smtpPass
      } : undefined
    });
  }

  return transporter;
};

module.exports = {
  getMailer
};
