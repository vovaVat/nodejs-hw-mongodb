import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Unauthorized');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      throw createError(401, 'Access token expired');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw createError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
