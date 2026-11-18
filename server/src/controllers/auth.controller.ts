import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ user });
});