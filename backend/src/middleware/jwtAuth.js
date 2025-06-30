import passport from 'passport';
import createHttpError from 'http-errors';

const jwtAuth = (req, res, next) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) return next(err);

      if (!user) {
        return next(createHttpError(401, info?.message || 'Unauthorized'));
      }

      req.user = user;
      next();
    }
  )(req, res, next);
};

export default jwtAuth;
