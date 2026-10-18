import { OwnerProfile } from './common';

export type UserRole = 'superadmin' | 'owner' | 'manager' | 'tenant';

export interface OwnerAccount extends OwnerProfile {
  password?: string;
  tagline?: string;
  status?: 'verified' | 'pending' | 'suspended';
}

export interface TenantAccount {
  id: string; // matches Tenant.id (e.g. 'tnt_02')
  name: string;
  email: string;
  phone: string;
  role: 'tenant';
  propertyId: string;
  propertyName?: string;
  roomId: string;
  roomNumber?: string;
  bedCode?: string;
  ownerId: string;
  monthlyRent: number;
}

export interface SuperAdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'superadmin';
  title: string;
}

export interface RegisterOwnerInput {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  password?: string;
  panNumber?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  numberOfProperties?: number;
  plan?: 'starter' | 'growth' | 'enterprise';
  preloadDemoData?: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

