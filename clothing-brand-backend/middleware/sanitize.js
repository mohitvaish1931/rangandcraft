// Strips MongoDB operator keys ("$gt", "a.b") from user input so values like
// { "email": { "$ne": null } } cannot turn into query operators.
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];
      } else {
        value[key] = clean(value[key]);
      }
    }
  }
  return value;
};

const sanitize = (req, res, next) => {
  if (req.body) clean(req.body);
  if (req.params) clean(req.params);
  // req.query is a getter in newer Express versions; mutate in place.
  if (req.query) clean(req.query);
  next();
};

export default sanitize;
