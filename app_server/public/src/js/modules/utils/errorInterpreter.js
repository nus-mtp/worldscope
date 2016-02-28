/**
 * 'errorInterpreter' returns humanized error details.
 */
const UNKNOWN_ERROR = 'An unknown error has occurred.';

const validationErrors = {};

const formatContextError = function (msg, ctx) {
  if (!ctx) {
    return msg;
  }

  return msg.replace(/{{.*?}}/g, function (match) {
    return ctx[match.substring(2, match.length - 2)];
  });
};

const interpretValidationErrors = function (details) {
  return details.map(function(error) {
    let errMsg = error.type.split('.').reduce(function (prev, cur) {
      return prev[cur];
    }, validationErrors) || UNKNOWN_ERROR;

    return {
      param: error.context.key,
      msg: formatContextError(errMsg, error.context)
    };
  });
};

const formatErrors = function (errors) {
  return errors.map((err) => err.msg);
};

const errorInterpreter = module.exports = {
  interpret: (err) => err.validation && err.details ?
      formatErrors(interpretValidationErrors(err.details)) : err.message
};
