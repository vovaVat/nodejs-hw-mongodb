import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import User from '../models/userModel.js';
import { registerSchema } from '../validations/authValidation.js';
import createError from 'http-errors';
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

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRATION }
    );

    await Session.deleteOne({ userId: user._id });

    const session = await Session.create({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
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
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw createError(401, 'Refresh token missing');
    }

    const session = await Session.findOne({ refreshToken });

    if (!session) {
      throw createError(403, 'Invalid refresh token');
    }

    const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (!decoded) {
      await removeSession(session._id);
      throw createError(403, 'Invalid or expired refresh token');
    }

    // Видаляємо стару сесію
    await removeSession(session._id);

    // Генеруємо нові токени
    const { accessToken, newRefreshToken } = generateTokens(decoded.userId);

    // Створюємо нову сесію
    await createSession(decoded.userId, accessToken, newRefreshToken);

    // Записуємо новий refreshToken у кукі
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
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

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
