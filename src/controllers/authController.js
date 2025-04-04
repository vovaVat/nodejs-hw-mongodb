import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import User from '../models/userModel.js';
import { registerSchema } from '../validation/authValidation.js';
import { loginSchema } from '../validation/authValidation.js';
import createError from 'http-errors';
import { randomBytes } from 'crypto';
import {
  verifyToken,
  generateTokens,
  removeSession,
  createSession,
} from '../services/authService.js';
import Session from '../models/sessionModel.js';
import { removeSessionByToken } from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    // Валідація даних
    const { error } = registerSchema.validate(req.body);
    if (error) throw createHttpError(400, error.details[0].message);

    const { name, email, password } = req.body;

    // Перевіряємо, чи існує користувач
    const existingUser = await User.findOne({ email });
    if (existingUser) throw createHttpError(409, 'Email in use');

    // Хешуємо пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створюємо нового користувача
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    next(error);
  }
};

const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '30d';

export const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) throw createHttpError(400, error.details[0].message);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw createHttpError(401, 'Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw createHttpError(401, 'Invalid email or password');

    await Session.deleteOne({ userId: user._id });

    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    const session = await Session.create({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie('sessionId', session._id, {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshSession = async (req, res, next) => {
  try {
    const { refreshToken: refreshTokenCookie } = req.cookies;
    const { sessionId } = req.cookies;

    const session = await Session.findOne({
      _id: sessionId,
      refreshToken: refreshTokenCookie,
    });

    if (!session) {
      throw createHttpError(401, 'Session not found');
    }

    const isSessionTokenExpired =
      new Date() > new Date(session.refreshTokenValidUntil);

    if (isSessionTokenExpired) {
      throw createHttpError(401, 'Session token expired');
    }

    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    const newSession = await Session.create({
      userId: session.userId,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie('sessionId', newSession._id, {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw createError(401, 'No refresh token provided');
    }

    await removeSessionByToken(refreshToken);

    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
