import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import User from '../models/userModel.js';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import Session from '../models/sessionModel.js';
import { sendEmail } from '../utils/sendMail.js';
import userModel from '../models/userModel.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { SMTP, TEMPLATES_DIR } from '../constants/index.js';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

export const removeSessionByToken = async (refreshToken) => {
  await Session.findOneAndDelete({ refreshToken });
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw createHttpError(409, 'Email in use');

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ name, email, password: hashedPassword });

  return { id: newUser._id, name: newUser.name, email: newUser.email };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(401, 'Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createHttpError(401, 'Invalid email or password');

  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  await Session.deleteOne({ userId: user._id });

  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });

  return { accessToken, newRefreshToken: refreshToken };
};

export const removeSession = async (sessionId) => {
  await Session.findByIdAndDelete(sessionId);
};

export const createSession = async (userId, accessToken, refreshToken) => {
  return await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }

  const user = await User.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await userModel.updateOne({ _id: user._id }, { password: encryptedPassword });
};

export const requestResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createError(404, 'User not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '5m',
    }
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html'
  );

  try {
    const templateSource = (
      await fs.readFile(resetPasswordTemplatePath)
    ).toString();

    const template = handlebars.compile(templateSource);
    const html = template({
      name: user.name,
      link: `${getEnvVar('APP_DOMAIN')}/reset-pwd?token=${resetToken}`,
    });

    await sendEmail({
      from: getEnvVar('SMTP_FROM'),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (err) {
    console.error('JWT verification error:', err);
    throw createError(500, 'Failed to send the email, please try again later.');
  }
};
