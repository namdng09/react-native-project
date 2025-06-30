import createHttpError from 'http-errors';

export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    const user = req.user;

    if (!user) {
      throw createHttpError(401, 'Unauthenticated');
    }

    if (!allowedRoles.includes(user.role)) {
      throw createHttpError(403, 'Forbidden');
    }

    next();
  };
