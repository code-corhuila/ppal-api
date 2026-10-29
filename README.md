# ppal-api

PantryPal's REST API is the only component allowed to read or write PostgreSQL. It validates product input and exposes the product endpoints defined by the project contract.

## MVP boundaries

- One demonstration pantry; no accounts, login, tokens, or per-user isolation.
- Online-only operations. Network failures are errors, never an empty inventory.
- Intended for local development and controlled demonstrations only. Do not expose this unauthenticated API as a public multi-user service or store sensitive personal data.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | /health | Liveness check |
| GET | /api/products | List products ordered by expiration date, undated records last |
| GET | /api/products/{id} | Retrieve one product |
| POST | /api/products | Validate and create a product |
| PUT | /api/products/{id} | Validate and update a product |
| DELETE | /api/products/{id} | Delete a product |

Successful create returns 201, update returns 200, and delete returns 204. Validation errors use an error envelope with fieldErrors. Unknown IDs return 404. The API never accepts client-supplied IDs or timestamps.

## Product rules

- Name must be nonblank and at most 120 characters.
- Quantity must be finite, greater than zero, and have at most three decimal places. Units and Packages require integer quantities.
- Unit/category values are fixed by the MVP domain model.
- expirationDate is nullable and must be a real YYYY-MM-DD calendar date when present.
- The API validates requests independently of the mobile client.

## Run locally

Requirements: Node.js 22+ and PostgreSQL, or the Docker Compose stack from ppal-infra.

1. Copy .env.example to .env and set DATABASE_URL for your local database.
2. Install dependencies with npm install.
3. Run npm test.
4. Run npm run build.
5. Start the development server with npm run dev.

The container uses the included Dockerfile. The database migration and demo seed are maintained in ppal-db.

## Tests

The current test suite exercises the HTTP contract with an in-memory repository. These tests do not replace PostgreSQL integration tests; those are a follow-up once the local Compose stack is running.

## Configuration

- PORT defaults to 3000.
- DATABASE_URL is required.
- CORS_ORIGINS is a comma-separated allowlist for local browser and Capacitor origins.

Do not commit .env files, passwords, or production credentials.
