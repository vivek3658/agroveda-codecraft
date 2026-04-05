require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const mongoUri = process.env.MONGODB_URI;

if (isProduction && !mongoUri) {
  console.error('CRITICAL: MONGODB_URI is not set in production environment!');
}

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: mongoUri || 'mongodb://127.0.0.1:27017/backend-db',
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminJwtSecret: process.env.ADMIN_JWT_SECRET || 'your_super_secret_admin_jwt_key',
  adminJwtExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '12h',
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id_here',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: String(process.env.SMTP_SECURE || 'false') === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'AgroVeda <noreply@agroveda.com>',
  dailyFarmerEmailCron: process.env.CRON_TIME_DAILY_FARMER_EMAIL || '0 7 * * *',
  cronTimezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata',
  tesseractCmd: process.env.TESSERACT_CMD || ''
};
