import { Pool } from 'pg';
import { createApp } from './app.js';
import { PostgresProductRepository } from './infrastructure/postgres-product-repository.js';

const port = Number(process.env.PORT ?? 3000);
const connectionString = process.env.DATABASE_URL;

if (!connectionString) throw new Error('DATABASE_URL must be configured before starting the API.');

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on('error', (error) => console.error('Unexpected PostgreSQL pool error:', error));

const app = createApp(new PostgresProductRepository(pool));
const server = app.listen(port, '0.0.0.0', () => console.info('PantryPal API listening on port ' + port));

async function shutdown(signal: string) {
  console.info('Received ' + signal + '; shutting down gracefully.');
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
