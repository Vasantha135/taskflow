import { NextFunction, Request, Response } from 'express';
import { Role, Workspace } from '../models/Workspace';
import { ApiError } from '../utils/ApiError';
import './auth'; // loads the req.workspace type

export const requireWorkspaceRole =
  (...allowed: Role[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const workspace = await Workspace.findById(req.params.workspaceId);
      if (!workspace) throw ApiError.notFound('Workspace not found');

      const member = workspace.members.find((m) => m.user.toString() === req.user!.id);
      // 404 and not 403, so outsiders cannot find out which workspaces exist
      if (!member) throw ApiError.notFound('Workspace not found');

      if (allowed.length && !allowed.includes(member.role as Role)) {
        throw ApiError.forbidden('You do not have permission to do this');
      }

      req.workspace = workspace;
      req.memberRole = member.role as Role;
      next();
    } catch (err) {
      next(err);
    }
  };