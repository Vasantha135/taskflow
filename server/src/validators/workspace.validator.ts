import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const assignableRole = z.enum(['admin', 'member', 'viewer']);

export const createWorkspaceSchema = z.object({
  body: z.object({ name: z.string().min(2).max(60) }),
});

export const workspaceIdSchema = z.object({
  params: z.object({ workspaceId: objectId }),
});

export const addMemberSchema = z.object({
  params: z.object({ workspaceId: objectId }),
  body: z.object({
    email: z.string().email(),
    role: assignableRole.default('member'),
  }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({ workspaceId: objectId, userId: objectId }),
  body: z.object({ role: assignableRole }),
});

export const removeMemberSchema = z.object({
  params: z.object({ workspaceId: objectId, userId: objectId }),
});