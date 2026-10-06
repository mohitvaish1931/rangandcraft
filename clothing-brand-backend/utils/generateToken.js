import crypto from 'crypto';
import jwt from 'jsonwebtoken';

let warned = false;
let ephemeralSecret = null;

// A hard-coded fallback secret would let anyone forge admin tokens, so when
// JWT_SECRET is missing we use a random per-process secret instead. Sessions
// then reset on restart, which is safe but inconvenient — set JWT_SECRET.
export const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (!ephemeralSecret) ephemeralSecret = crypto.randomBytes(48).toString('hex');
  if (!warned) {
    console.warn('[auth] JWT_SECRET is not set; using a random per-process secret. Users will be signed out on every restart.');
    warned = true;
  }
  return ephemeralSecret;
};

const generateToken = (userId) =>
  jwt.sign({ userId: String(userId) }, getJwtSecret(), { expiresIn: '30d' });

export default generateToken;
