import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import routes from './routes';

export const app = express();

// Swagger goes before helmet so its page is not blocked
app.get('/api/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);