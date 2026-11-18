import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';

export async function register(input: { name: string; email: string; password: string }) {
  const exists = await User.exists({ email: input.email.toLowerCase() });
  if (exists) throw ApiError.conflict('Email already registered');

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({ name: input.name, email: input.email, passwordHash });

  return { id: String(user._id), name: user.name, email: user.email };
}