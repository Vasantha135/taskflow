import { CookieOptions, Response } from 'express';
import { env } from '../config/env';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions: CookieOptions = {
  httpOnly: true, // JavaScript in the browser cannot read this cookie
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  path: '/api/v1/auth',
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
};

type AuthResult = Awaited<ReturnType<typeof authService.login>>;

const send = (res: Response, status: number, data: AuthResult) => {
  res.cookie(REFRESH_COOKIE, data.refreshToken, cookieOptions);
  res.status(status).json({ user: data.user, accessToken: data.accessToken });
};

export const register = asyncHandler(async (req, res) => {
  send(res, 201, await authService.register(req.body));
});

export const login = asyncHandler(async (req, res) => {
  send(res, 200, await authService.login(req.body));
});

export const refresh = asyncHandler(async (req, res) => {
  const tokens = await authService.refresh(req.cookies?.[REFRESH_COOKIE]);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOptions);
  res.json({ accessToken: tokens.accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user!.id);
  res.clearCookie(REFRESH_COOKIE, { path: cookieOptions.path });
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: await authService.getMe(req.user!.id) });
});