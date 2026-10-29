import type { Pool } from 'pg';
import type { Product, ProductInput } from '../domain/product.js';
import type { ProductRepository } from '../domain/product-repository.js';

interface ProductRow {
  id: string;
  name: string;
  quantity: string | number;
  unit: Product['unit'];
  category: Product['category'];
  expirationDate: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    quantity: Number(row.quantity),
    unit: row.unit,
    category: row.category,
    expirationDate: row.expirationDate,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt
  };
}

const productColumns = 'id, name, quantity, unit, category, expiration_date AS "expirationDate", created_at AS "createdAt", updated_at AS "updatedAt"';

export class PostgresProductRepository implements ProductRepository {
  constructor(private readonly pool: Pool) {}

  async list(): Promise<Product[]> {
    const result = await this.pool.query<ProductRow>(
      'SELECT ' + productColumns + ' FROM products ORDER BY expiration_date ASC NULLS LAST, created_at ASC'
    );
    return result.rows.map(toProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.pool.query<ProductRow>(
      'SELECT ' + productColumns + ' FROM products WHERE id = $1',
      [id]
    );
    return result.rows[0] ? toProduct(result.rows[0]) : null;
  }

  async create(input: ProductInput): Promise<Product> {
    const result = await this.pool.query<ProductRow>(
      'INSERT INTO products (name, quantity, unit, category, expiration_date) VALUES ($1, $2, $3, $4, $5) RETURNING ' + productColumns,
      [input.name, input.quantity, input.unit, input.category, input.expirationDate]
    );
    const row = result.rows[0];
    if (!row) throw new Error('The database did not return the created product.');
    return toProduct(row);
  }

  async update(id: string, input: ProductInput): Promise<Product | null> {
    const result = await this.pool.query<ProductRow>(
      'UPDATE products SET name = $2, quantity = $3, unit = $4, category = $5, expiration_date = $6 WHERE id = $1 RETURNING ' + productColumns,
      [id, input.name, input.quantity, input.unit, input.category, input.expirationDate]
    );
    return result.rows[0] ? toProduct(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
