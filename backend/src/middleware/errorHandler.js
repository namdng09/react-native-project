import { apiResponse } from '../types/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  if (status >= 400 && status < 500) {
    const message = err.message || 'Client Error';
    res.status(status).json(apiResponse.failed(message));
    return;
  }

  const message =
    process.env.NODE_ENV === 'production' && err instanceof Error
      ? 'Internal Server Error'
      : err.message;

  res.status(500).json(apiResponse.error(message));
};
