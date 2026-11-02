import { z } from 'zod';
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '../domain/product.js';

function isRealCalendarDate(value: string): boolean {
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

const expirationDateSchema = z.string().refine(
  isRealCalendarDate,
  'Expiration date must be a real YYYY-MM-DD calendar date.'
);

export const productInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120, 'Name must be at most 120 characters.'),
  quantity: z.number().finite().positive('Quantity must be greater than zero.'),
  unit: z.enum(PRODUCT_UNITS),
  category: z.enum(PRODUCT_CATEGORIES),
  expirationDate: expirationDateSchema.nullable().optional()
}).strict().superRefine((value, context) => {
  if ((value.unit === 'unit' || value.unit === 'package') && !Number.isInteger(value.quantity)) {
    context.addIssue({
      code: 'custom',
      path: ['quantity'],
      message: 'Quantity must be an integer for Units and Packages.'
    });
  }
  if (value.quantity > 999999999) {
    context.addIssue({
      code: 'custom',
      path: ['quantity'],
      message: 'Quantity is above the supported maximum.'
    });
  }
  if (Math.abs(value.quantity - Math.round(value.quantity * 1000) / 1000) > 1e-9) {
    context.addIssue({
      code: 'custom',
      path: ['quantity'],
      message: 'Quantity supports up to three decimal places.'
    });
  }
}).transform((value) => ({ ...value, expirationDate: value.expirationDate ?? null }));

export type ValidProductInput = z.output<typeof productInputSchema>;

export function formatValidationIssues(issues: ReadonlyArray<{ path: readonly unknown[]; message: string }>) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && fieldErrors[field] === undefined) fieldErrors[field] = issue.message;
  }
  return fieldErrors;
}
