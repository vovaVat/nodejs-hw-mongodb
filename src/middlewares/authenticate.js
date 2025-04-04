import sessionModel from '../models/sessionModel.js';
import userModel from '../models/userModel.js';
import createHttpError from 'http-errors';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      next(createHttpError(401, 'Please provide Authorization header'));
      return;
    }

    const bearer = authHeader.split(' ')[0];
    const token = authHeader.split(' ')[1];

    if (bearer !== 'Bearer' || !token) {
      next(createHttpError(401, 'Auth header should be of type Bearer'));
      return;
    }

    const session = await sessionModel.findOne({ accessToken: token });

    if (!session) {
      next(createHttpError(401, 'Session not found'));
      return;
    }

    const isAccessTokenExpired =
      new Date() > new Date(session.accessTokenValidUntil);

    if (isAccessTokenExpired) {
      next(createHttpError(401, 'Access token expired'));
    }

    const user = await userModel.findById(session.userId);

    if (!user) {
      next(createHttpError(401));
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
