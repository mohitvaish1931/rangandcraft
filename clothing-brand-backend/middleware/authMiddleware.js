import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getJwtSecret } from '../utils/generateToken.js';

const readToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

const resolveUser = async (req) => {
  const token = readToken(req);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return await User.findById(decoded.userId).select('-password');
  } catch {
    return null;
  }
};

// Requires a valid bearer token.
export const protect = async (req, res, next) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Please sign in to continue.' });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Attaches req.user when a valid token is present, but never rejects.
export const optionalAuth = async (req, res, next) => {
  try {
    req.user = (await resolveUser(req)) || undefined;
    next();
  } catch (error) {
    next(error);
  }
};

// Must run after `protect`.
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  return res.status(403).json({ message: 'Admin access required.' });
};
