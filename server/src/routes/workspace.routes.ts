import { Router } from 'express';
import * as ctrl from '../controllers/workspace.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { requireWorkspaceRole } from '../middlewares/workspaceAccess';
import {
  addMemberSchema,
  createWorkspaceSchema,
  removeMemberSchema,
  updateMemberRoleSchema,
  workspaceIdSchema,
} from '../validators/workspace.validator';

const router = Router();
router.use(authenticate); // every workspace route needs a logged-in user

/**
 * @openapi
 * /workspaces:
 *   post:
 *     tags: [Workspaces]
 *     summary: Create a workspace (you become the owner)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: Acme Corp }
 *     responses:
 *       201:
 *         description: Workspace created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not logged in
 */
router.post('/', validate(createWorkspaceSchema), ctrl.create);

/**
 * @openapi
 * /workspaces:
 *   get:
 *     tags: [Workspaces]
 *     summary: List the workspaces you belong to
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of workspaces
 *       401:
 *         description: Not logged in
 */
router.get('/', ctrl.list);

/**
 * @openapi
 * /workspaces/{workspaceId}:
 *   get:
 *     tags: [Workspaces]
 *     summary: Get one workspace (any member)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The workspace and your role
 *       404:
 *         description: Not found, or you are not a member
 */
router.get('/:workspaceId', validate(workspaceIdSchema), requireWorkspaceRole(), ctrl.getOne);

/**
 * @openapi
 * /workspaces/{workspaceId}/members:
 *   post:
 *     tags: [Workspaces]
 *     summary: Add an existing user to the workspace (owner, admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *               role:
 *                 type: string
 *                 enum: [admin, member, viewer]
 *                 default: member
 *     responses:
 *       201:
 *         description: Member added
 *       403:
 *         description: Your role is not allowed
 *       404:
 *         description: Workspace or user not found
 *       409:
 *         description: Already a member
 */
router.post(
  '/:workspaceId/members',
  validate(addMemberSchema),
  requireWorkspaceRole('owner', 'admin'),
  ctrl.addMember,
);

/**
 * @openapi
 * /workspaces/{workspaceId}/members/{userId}:
 *   patch:
 *     tags: [Workspaces]
 *     summary: Change a member's role (owner only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, member, viewer]
 *     responses:
 *       200:
 *         description: Role updated
 *       403:
 *         description: Only the owner can do this
 */
router.patch(
  '/:workspaceId/members/:userId',
  validate(updateMemberRoleSchema),
  requireWorkspaceRole('owner'),
  ctrl.updateMemberRole,
);

/**
 * @openapi
 * /workspaces/{workspaceId}/members/{userId}:
 *   delete:
 *     tags: [Workspaces]
 *     summary: Remove a member (owner, admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Member removed
 *       403:
 *         description: Your role is not allowed
 */
router.delete(
  '/:workspaceId/members/:userId',
  validate(removeMemberSchema),
  requireWorkspaceRole('owner', 'admin'),
  ctrl.removeMember,
);

export default router;