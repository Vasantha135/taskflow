import crypto from 'crypto';
import { HydratedDocument } from 'mongoose';
import { User } from '../models/User';
import { IWorkspace, Role, Workspace } from '../models/Workspace';
import { ApiError } from '../utils/ApiError';

type AssignableRole = Exclude<Role, 'owner'>;

const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const toDto = (w: HydratedDocument<IWorkspace>) => ({
  id: String(w._id),
  name: w.name,
  slug: w.slug,
  members: w.members.map((m) => ({ user: String(m.user), role: m.role })),
});

export async function createWorkspace(userId: string, name: string) {
  const slug = `${slugify(name) || 'workspace'}-${crypto.randomBytes(3).toString('hex')}`;
  const ws = await Workspace.create({
    name,
    slug,
    createdBy: userId,
    members: [{ user: userId, role: 'owner' }],
  });
  return toDto(ws);
}

export async function listWorkspaces(userId: string) {
  const list = await Workspace.find({ 'members.user': userId }).sort({ createdAt: -1 });
  return list.map(toDto);
}

export async function addMember(
  ws: HydratedDocument<IWorkspace>,
  email: string,
  role: AssignableRole,
) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw ApiError.notFound('No user with that email');
  if (ws.members.some((m) => m.user.toString() === String(user._id))) {
    throw ApiError.conflict('User is already a member');
  }
  ws.members.push({ user: user._id, role });
  await ws.save();
  return toDto(ws);
}

export async function updateMemberRole(
  ws: HydratedDocument<IWorkspace>,
  userId: string,
  role: AssignableRole,
) {
  const member = ws.members.find((m) => m.user.toString() === userId);
  if (!member) throw ApiError.notFound('Member not found');
  if (member.role === 'owner') throw ApiError.badRequest('Cannot change the owner role');
  member.role = role;
  await ws.save();
  return toDto(ws);
}

export async function removeMember(
  ws: HydratedDocument<IWorkspace>,
  actorRole: Role,
  userId: string,
) {
  const index = ws.members.findIndex((m) => m.user.toString() === userId);
  if (index === -1) throw ApiError.notFound('Member not found');

  const target = ws.members[index];
  if (target.role === 'owner') throw ApiError.badRequest('The owner cannot be removed');
  if (actorRole === 'admin' && target.role === 'admin') {
    throw ApiError.forbidden('Admins cannot remove other admins');
  }

  ws.members.splice(index, 1);
  await ws.save();
  return toDto(ws);
}