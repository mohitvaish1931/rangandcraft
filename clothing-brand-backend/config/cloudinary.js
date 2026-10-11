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
    const tooBig = err.code === 'LIMIT_FILE_SIZE';
    return res.status(tooBig ? 413 : 400).json({ message: tooBig ? 'That file is too large.' : `Upload failed: ${err.message || 'please try another file.'}` });
  });

export default cloudinary.v2;
