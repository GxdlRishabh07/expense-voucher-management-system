import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key_development_only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databasePath: path.resolve(__dirname, '../..', process.env.DATABASE_PATH || 'src/db/voucher_system.sqlite'),
  uploadDir: path.resolve(__dirname, '../../uploads/signatures'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};
