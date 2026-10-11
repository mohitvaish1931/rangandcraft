import User from '../models/User.js';

const DEFAULT_ADMIN_EMAIL = 'admin@rangandcraft.store';
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Keeps the admin login in the host's environment settings (no shell needed):
 * ADMIN_EMAIL + ADMIN_PASSWORD are applied on every start, creating the admin
 * if it doesn't exist. ADMIN_RESET_PASSWORD / ADMIN_RESET_EMAIL take priority
 * for a one-off recovery. Returns the email that was set, or null.
 */
export const applyAdminReset = async () => {
  const password = process.env.ADMIN_RESET_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!password) return null;
  if (password.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters; admin login was not set.');
    return null;
  }
  const email = (process.env.ADMIN_RESET_EMAIL || process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();

  let user = await User.findOne({ email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' } });
  if (user) {
    user.password = password; // hashed by the pre-save hook
    user.isAdmin = true;
    await user.save();
  } else {
    user = await User.create({ name: 'Admin', email, password, isAdmin: true });
  }
  console.log(`Admin login ready for ${email}.`);
  return email;
};
