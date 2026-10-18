import { BaseEntity } from './common';

export type PaymentMethod = 'UPI' | 'Card' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Other';
export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue';

export interface PaymentRecord extends BaseEntity {
  receiptNumber: string; // e.g. "REC-2026-1001"
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomNumber: string;
  billingMonth: string; // e.g. "October 2026"
  baseRent: number;
  maintenanceFee?: number;
  lateFee: number;
  discount: number;
  totalDue: number; // baseRent + maintenanceFee + lateFee - discount
  amountPaid: number;
  balanceDue: number;
  paymentDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  transactionRef?: string; // UPI UTR or bank ref
  status: PaymentStatus;
  notes?: string;
}
