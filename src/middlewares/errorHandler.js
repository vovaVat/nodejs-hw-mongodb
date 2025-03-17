import createError from 'http-errors';

const errorHandler = (err, req, res, next) => {
  let { status, message } = err;

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid contact ID format';
  }

  res.status(status || 500).json({
    status: status || 500,
    message: message || 'Internal Server Error',
    data: null,
  });
};

export default errorHandler;
