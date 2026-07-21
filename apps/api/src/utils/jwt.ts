import jwt from 'jsonwebtoken';
import { appConfig, jwtConfig } from '../config';

export const signAccessToken = (userId: string) => {
  return jwt.sign({ userId }, jwtConfig.secret, {
    expiresIn: '15m',
  });
};

export const signRefreshToken = (sessionId: string) => {
  return jwt.sign({ sessionId }, jwtConfig.secret, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, jwtConfig.secret) as { userId?: string; sessionId?: string };
  } catch (error) {
    return null;
  }
};
