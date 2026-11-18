import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { registerSchema } from '../validators/auth.validator';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Create an account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Asha Kumar }
 *               email: { type: string, format: email, example: asha@example.com }
 *               password: { type: string, minLength: 8, example: Str0ngPassw0rd }
 *     responses:
 *       201:
 *         description: Account created
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already registered
 */
router.post('/register', validate(registerSchema), ctrl.register);

export default router;