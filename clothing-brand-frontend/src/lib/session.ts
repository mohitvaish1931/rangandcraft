import type { User } from '../context/AppContext';

// Normalises the auth response from the API into the stored session shape.
export const toSessionUser = (data: { _id?: string; id?: string; name: string; email: string; phone?: string; isAdmin?: boolean; token: string }): User => ({
  id: String(data._id ?? data.id),
  _id: String(data._id ?? data.id),
  name: data.name,
  email: data.email,
  phone: data.phone,
  isAdmin: Boolean(data.isAdmin),
  token: data.token,
});

// Only allow same-site relative redirects after sign-in.
export const safeRedirect = (value: string | null, fallback: string) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
