// Express 4 does not forward rejected promises to the error handler, so an
// unawaited throw in an async route would hang the request (or crash the
// process). Wrap every async route with this.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
