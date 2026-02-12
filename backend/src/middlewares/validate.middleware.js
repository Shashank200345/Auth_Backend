const { sendError } = require('../utils/response');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return sendError(res, 400, 'Validation failed.', fieldErrors);
    }

    req[source] = result.data;
    next();
  };
};

module.exports = validate;
