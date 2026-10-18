import { BaseEntity } from './common';

export type ComplaintCategory =
  | 'Plumbing'
  | 'Electrical'
  | 'Wi-Fi'
  | 'Cleaning'
  | 'Furniture'
  | 'Food'
  | 'Air Conditioning'
  | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ComplaintStatus = 'Open' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed';

export interface ComplaintNote {
  id: string;
  author: string;
  note: string;
  createdAt: string;
}

export interface Complaint extends BaseEntity {
  ticketNumber: string; // e.g. "TKT-1042"
  title: string;
  description: string;
  propertyId: string;
  propertyName?: string;
  roomId?: string;
  roomNumber?: string;
  tenantId?: string;
  tenantName?: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  maintenanceCost: number;
  internalNotes: ComplaintNote[];
  resolvedAt?: string;
}
