import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import type { Product, ProductInput } from '../src/domain/product.js';
import type { ProductRepository } from '../src/domain/product-repository.js';

const sample: Product = {
  id: '7e1c5ae0-d4e0-47f7-9f2a-1b2c3d4e5f60',
  name: 'Whole Milk',
  quantity: 1,
  unit: 'L',
  category: 'dairy',
  expirationDate: '2026-10-30',
  createdAt: '2026-10-25T15:00:00.000Z',
  updatedAt: '2026-10-25T15:00:00.000Z'
};

class InMemoryProductRepository implements ProductRepository {
  products: Product[] = [{ ...sample }];

  async list(): Promise<Product[]> { return [...this.products]; }
  async findById(id: string): Promise<Product | null> { return this.products.find((product) => product.id === id) ?? null; }
  async create(input: ProductInput): Promise<Product> {
    const product: Product = {
      ...input,
      id: '8e1c5ae0-d4e0-47f7-9f2a-1b2c3d4e5f60',
      createdAt: '2026-10-29T12:00:00.000Z',
      updatedAt: '2026-10-29T12:00:00.000Z'
    };
    this.products.push(product);
    return product;
  }
  async update(id: string, input: ProductInput): Promise<Product | null> {
    const index = this.products.findIndex((product) => product.id === id);
    if (index < 0) return null;
    const previous = this.products[index]!;
    const updated: Product = { ...previous, ...input, updatedAt: '2026-10-29T12:30:00.000Z' };
    this.products[index] = updated;
    return updated;
  }
  async delete(id: string): Promise<boolean> {
    const before = this.products.length;
    this.products = this.products.filter((product) => product.id !== id);
    return this.products.length < before;
  }
}

describe('PantryPal products API', () => {
  it('returns products from the repository', async () => {
    const response = await request(createApp(new InMemoryProductRepository())).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Whole Milk');
  });

  it('creates a product after validating the request', async () => {
    const response = await request(createApp(new InMemoryProductRepository())).post('/api/products').send({
      name: 'Rice', quantity: 1.5, unit: 'kg', category: 'pantry_staples', expirationDate: null
    });
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Rice');
    expect(response.body.expirationDate).toBeNull();
    expect(response.headers.location).toContain(response.body.id);
  });

  it('rejects invalid product fields with a field error envelope', async () => {
    const response = await request(createApp(new InMemoryProductRepository())).post('/api/products').send({
      name: '   ', quantity: 0, unit: 'unit', category: 'dairy', expirationDate: null
    });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.fieldErrors.name).toBeDefined();
    expect(response.body.error.fieldErrors.quantity).toBeDefined();
  });

  it('rejects a malformed product ID', async () => {
    const response = await request(createApp(new InMemoryProductRepository())).delete('/api/products/not-a-uuid');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_ID');
  });

  it('returns a distinct 404 for a valid but unknown product ID', async () => {
    const response = await request(createApp(new InMemoryProductRepository())).get('/api/products/11111111-1111-4111-8111-111111111111');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });
});
