import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

// forward slashes are needed so the file search works on Windows
const routesGlob = path.join(__dirname, '../routes/*.{ts,js}').replace(/\\/g, '/');

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'TaskFlow API', version: '0.1.0' },
    servers: [{ url: '/api/v1' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: [routesGlob],
});