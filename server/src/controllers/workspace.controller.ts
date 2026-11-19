import * as workspaceService from '../services/workspace.service';
import { asyncHandler } from '../utils/asyncHandler';

export const create = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.createWorkspace(req.user!.id, req.body.name);
  res.status(201).json({ workspace });
});

export const list = asyncHandler(async (req, res) => {
  res.json({ workspaces: await workspaceService.listWorkspaces(req.user!.id) });
});

export const getOne = asyncHandler(async (req, res) => {
  res.json({ workspace: workspaceService.toDto(req.workspace!), role: req.memberRole });
});

export const addMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const workspace = await workspaceService.addMember(req.workspace!, email, role);
  res.status(201).json({ workspace });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.updateMemberRole(
    req.workspace!,
    String(req.params.userId),
    req.body.role,
  );
  res.json({ workspace });
});

export const removeMember = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.removeMember(
    req.workspace!,
    req.memberRole!,
    String(req.params.userId),
  );
  res.json({ workspace });
});