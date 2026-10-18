import { BaseEntity } from './common';

export type ExpenseCategory =
  | 'Electricity'
  | 'Water'
  | 'Internet'
  | 'Food and groceries'
  | 'Housekeeping'
  | 'Maintenance and repairs'
  | 'Staff salaries'
  | 'Rent or lease'
  | 'Municipal Taxes'
  | 'Other';

export interface Expense extends BaseEntity {
  title: string;
  propertyId: string;
  propertyName?: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string; // YYYY-MM-DD
  paymentMethod: 'UPI' | 'Bank Transfer' | 'Cash' | 'Credit Card' | 'Cheque';
  vendor: string;
  notes?: string;
  receiptAttachment?: string;
}
