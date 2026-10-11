import cloudinary from 'cloudinary';

// Accepts either CLOUDINARY_URL (cloudinary://<key>:<secret>@<cloud>, which the
// SDK reads on its own) or the three separate variables. Only defined values
// are passed, so the separate variables never blank out CLOUDINARY_URL.
const separate = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};
cloudinary.v2.config({
  ...Object.fromEntries(Object.entries(separate).filter(([, v]) => v)),
  secure: true,
});

export const cloudinaryConfigured = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.v2.config();
  return Boolean(cloud_name && api_key && api_secret);
};

/**
 * Wraps a multer upload middleware so a failed upload answers with a clear
 * message instead of a generic 500, including when Cloudinary isn't set up.
 */
export const withUploadErrors = (middleware) => (req, res, next) =>
  middleware(req, res, (err) => {
    if (!err) return next();
    if (!cloudinaryConfigured()) {
      return res.status(503).json({ message: 'Image uploads aren’t set up on the server yet. Add CLOUDINARY_URL to the backend environment.' });
    }
    console.error('Upload failed:', err.message || err);
    if (err.http_code === 403 || err.http_code === 401) {
      return res.status(502).json({ message: `Cloudinary refused the upload (${err.http_code}). Open Admin → Store status for the exact reason from Cloudinary.` });
    }
    const tooBig = err.code === 'LIMIT_FILE_SIZE';
    return res.status(tooBig ? 413 : 400).json({ message: tooBig ? 'That file is too large.' : `Upload failed: ${err.message || 'please try another file.'}` });
  });

// 1×1 transparent PNG used for the connection test.
const TEST_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/**
 * Does a real signed upload of a tiny image (always the same public id, so it
 * never piles up) and returns Cloudinary's own answer. The SDK hides the body
 * of 403 replies, so this talks to the upload API directly.
 */
export const checkUploads = async () => {
  const { cloud_name, api_key, api_secret } = cloudinary.v2.config();
  if (!cloud_name || !api_key || !api_secret) {
    return { ok: false, configured: false, message: 'Not set up: add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) on the server.' };
  }
  const params = { overwrite: 'true', public_id: 'rangandcraft-upload-check', timestamp: String(Math.floor(Date.now() / 1000)) };
  const signature = cloudinary.v2.utils.api_sign_request(params, api_secret);
  const body = new URLSearchParams({ ...params, api_key, signature, file: TEST_IMAGE });
  const who = { cloudName: cloud_name, apiKey: `…${String(api_key).slice(-4)}` };
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud_name)}/image/upload`, { method: 'POST', body });
    const text = await res.text();
    let message = '';
    try { message = JSON.parse(text)?.error?.message || ''; } catch { message = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200); }
    if (res.ok) return { ok: true, configured: true, status: res.status, message: 'Test upload succeeded.', ...who };
    return { ok: false, configured: true, status: res.status, message: message || `Cloudinary answered ${res.status}.`, ...who };
  } catch (err) {
    return { ok: false, configured: true, status: 0, message: `Couldn’t reach Cloudinary: ${err.message}`, ...who };
  }
};

export default cloudinary.v2;
