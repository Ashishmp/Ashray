import { BaseEntity } from './common';

export type StaffRole =
  | 'Property Manager'
  | 'Warden'
  | 'Electrician'
  | 'Plumber'
  | 'Housekeeping Staff'
  | 'Head Cook'
  | 'Security Guard';

export type EmploymentStatus = 'Active' | 'On Leave' | 'Inactive';

export interface StaffMember extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  role: StaffRole;
  assignedPropertyIds: string[];
  assignedPropertyNames?: string[];
  joiningDate: string; // YYYY-MM-DD
  monthlySalary: number;
  employmentStatus: EmploymentStatus;
  responsibilities: string;
  assignedTaskCount?: number;
}
