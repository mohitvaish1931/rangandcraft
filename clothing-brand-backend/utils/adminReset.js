import User from '../models/User.js';

const DEFAULT_ADMIN_EMAIL = 'admin@rangandcraft.store';
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Lets the store owner recover the admin login from the host's environment
 * settings alone (no shell needed): set ADMIN_RESET_PASSWORD (and optionally
 * ADMIN_RESET_EMAIL), restart, sign in, then delete the variable.
 * Returns the email that was reset, or null when nothing was done.
 */
export const applyAdminReset = async () => {
  const password = process.env.ADMIN_RESET_PASSWORD;
  if (!password) return null;
  if (password.length < 8) {
    console.error('ADMIN_RESET_PASSWORD must be at least 8 characters; admin password was not changed.');
    return null;
  }
  const email = (process.env.ADMIN_RESET_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();

  let user = await User.findOne({ email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' } });
  if (user) {
    user.password = password; // hashed by the pre-save hook
    user.isAdmin = true;
    await user.save();
  } else {
    user = await User.create({ name: 'Admin', email, password, isAdmin: true });
  }
  console.warn(`Admin password set for ${email} from ADMIN_RESET_PASSWORD. Remove that variable from the environment now.`);
  return email;
};
