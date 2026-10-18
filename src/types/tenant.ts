import { BaseEntity } from './common';

export type TenantStatus = 'Active' | 'Notice Period' | 'Moved Out';
export type TenantRentStatus = 'Paid' | 'Pending' | 'Overdue';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export type DocumentType = 'aadhaar' | 'pan' | 'college_work_id' | 'police_verification';
export type DocumentStatus = 'verified' | 'pending' | 'rejected' | 'not_uploaded';

export interface TenantDocument {
  id: string;
  type: DocumentType;
  title: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: DocumentStatus;
  verificationNotes?: string;
  documentNumber?: string;
  previewUrl?: string;
}

export interface Tenant extends BaseEntity {
  name: string;
  phone: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  propertyId: string;
  propertyName?: string;
  roomId: string;
  roomNumber?: string;
  bedId: string;
  bedCode?: string;
  moveInDate: string; // YYYY-MM-DD
  moveOutDate?: string; // YYYY-MM-DD
  agreementStartDate: string;
  agreementEndDate: string;
  monthlyRent: number;
  securityDeposit: number;
  rentDueDay: number; // e.g., 5th of every month
  status: TenantStatus;
  rentStatus: TenantRentStatus;
  outstandingBalance: number;
  emergencyContact: EmergencyContact;
  idProofType?: 'Aadhaar' | 'PAN' | 'Passport' | 'Driving License';
  idProofNumber?: string;
  workplaceOrCollege?: string;
  notes?: string;
  bloodGroup?: string;
  foodPreference?: 'Veg' | 'Non-Veg' | 'Eggetarian' | 'Jain';
  permanentAddress?: string;
  documents?: TenantDocument[];
}

