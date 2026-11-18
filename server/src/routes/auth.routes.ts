import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../validators/auth.validator';

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
 *         description: Account created. Refresh token is set as an httpOnly cookie.
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already registered
 */
router.post('/register', validate(registerSchema), ctrl.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Returns the user and an accessToken
 *       401:
 *         description: Wrong email or password
 */
router.post('/login', validate(loginSchema), ctrl.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Get a new access token using the refresh cookie
 *     description: Each refresh token can be used only once.
 *     responses:
 *       200:
 *         description: New accessToken
 *       401:
 *         description: Missing or invalid refresh token
 */
router.post('/refresh', ctrl.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Logged out
 *       401:
 *         description: Not logged in
 */
router.post('/logout', authenticate, ctrl.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user
 *       401:
 *         description: Missing or invalid access token
 */
router.get('/me', authenticate, ctrl.me);

export default router;