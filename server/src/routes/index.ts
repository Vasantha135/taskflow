import { Router } from 'express';
import authRoutes from './auth.routes';
import workspaceRoutes from './workspace.routes';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: API is up
 */
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);

export default router;