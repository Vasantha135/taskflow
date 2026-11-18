import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

const publicUser = (u: { _id: unknown; name: string; email: string }) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
});

async function issueTokens(userId: string) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  await User.findByIdAndUpdate(userId, { refreshTokenHash: hashToken(refreshToken) });
  return { accessToken, refreshToken };
}

export async function register(input: { name: string; email: string; password: string }) {
  const exists = await User.exists({ email: input.email.toLowerCase() });
  if (exists) throw ApiError.conflict('Email already registered');

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({ name: input.name, email: input.email, passwordHash });
  const tokens = await issueTokens(String(user._id));
  return { user: publicUser(user), ...tokens };
}

export async function login(input: { email: string; password: string }) {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash');
  const ok = user && (await bcrypt.compare(input.password, user.passwordHash));
  if (!user || !ok) throw ApiError.unauthorized('Invalid email or password');

  const tokens = await issueTokens(String(user._id));
  return { user: publicUser(user), ...tokens };
}

// Each refresh token can be used only once (rotation)
export async function refresh(token?: string) {
  if (!token) throw ApiError.unauthorized('Missing refresh token');

  let userId: string;
  try {
    userId = verifyRefreshToken(token).sub;
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const user = await User.findById(userId).select('+refreshTokenHash');
  if (!user || user.refreshTokenHash !== hashToken(token)) {
    // Reused or fake token: end the session for safety
    if (user) await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
    throw ApiError.unauthorized('Invalid refresh token');
  }
  return issueTokens(userId);
}

export async function logout(userId: string) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
}

export async function getMe(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return publicUser(user);
}