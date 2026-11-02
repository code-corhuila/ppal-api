import cors from 'cors';
import express, { type ErrorRequestHandler, type Request, type Response } from 'express';
import helmet from 'helmet';
import type { ProductInput } from './domain/product.js';
import type { ProductRepository } from './domain/product-repository.js';
import { formatValidationIssues, productInputSchema } from './http/product-schemas.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sendError(response: Response, status: number, code: string, message: string, fieldErrors?: Record<string, string>): void {
  response.status(status).json({
    error: {
      code,
      message,
      ...(fieldErrors && Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {})
    }
  });
}

function parseProductId(response: Response, rawId: string): string | null {
  if (!UUID_PATTERN.test(rawId)) {
    sendError(response, 400, 'INVALID_ID', 'The product ID is invalid.');
    return null;
  }
  return rawId;
}

export function createApp(repository: ProductRepository) {
  const app = express();
  const allowedOrigins = (process.env.CORS_ORIGINS
    ?? 'http://localhost:4200,http://127.0.0.1:4200,http://localhost:8100,http://localhost,https://localhost,capacitor://localhost')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin is not allowed by the development CORS policy.'));
    }
  }));
  app.use(express.json({ limit: '32kb' }));

  app.get('/health', (_request, response) => response.status(200).json({ status: 'ok' }));

  app.get('/api/products', async (_request, response, next) => {
    try {
      response.status(200).json(await repository.list());
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/products/:id', async (request, response, next) => {
    try {
      const id = parseProductId(response, request.params['id'] ?? '');
      if (!id) return;
      const product = await repository.findById(id);
      if (!product) {
        sendError(response, 404, 'PRODUCT_NOT_FOUND', 'The requested product was not found.');
        return;
      }
      response.status(200).json(product);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/products', async (request, response, next) => {
    try {
      const parsed = productInputSchema.safeParse(request.body);
      if (!parsed.success) {
        sendError(response, 400, 'VALIDATION_ERROR', 'Review the product fields.', formatValidationIssues(parsed.error.issues));
        return;
      }
      const input: ProductInput = parsed.data;
      const product = await repository.create(input);
      response.location('/api/products/' + product.id).status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/products/:id', async (request, response, next) => {
    try {
      const id = parseProductId(response, request.params['id'] ?? '');
      if (!id) return;
      const parsed = productInputSchema.safeParse(request.body);
      if (!parsed.success) {
        sendError(response, 400, 'VALIDATION_ERROR', 'Review the product fields.', formatValidationIssues(parsed.error.issues));
        return;
      }
      const input: ProductInput = parsed.data;
      const product = await repository.update(id, input);
      if (!product) {
        sendError(response, 404, 'PRODUCT_NOT_FOUND', 'The requested product was not found.');
        return;
      }
      response.status(200).json(product);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/products/:id', async (request, response, next) => {
    try {
      const id = parseProductId(response, request.params['id'] ?? '');
      if (!id) return;
      const deleted = await repository.delete(id);
      if (!deleted) {
        sendError(response, 404, 'PRODUCT_NOT_FOUND', 'The requested product was not found.');
        return;
      }
      response.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.use((_request: Request, response: Response) => sendError(response, 404, 'NOT_FOUND', 'The requested endpoint was not found.'));

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof SyntaxError && 'body' in error) {
      sendError(response, 400, 'INVALID_JSON', 'The request body is not valid JSON.');
      return;
    }
    if (error instanceof Error && error.message.includes('CORS policy')) {
      sendError(response, 403, 'ORIGIN_NOT_ALLOWED', 'This origin is not allowed by the development API.');
      return;
    }
    console.error('Unhandled API error:', error);
    sendError(response, 500, 'INTERNAL_ERROR', 'An unexpected server error occurred.');
  };
  app.use(errorHandler);

  return app;
}
