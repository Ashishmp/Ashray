import { OwnerProfile } from './common';

export interface OwnerAccount extends OwnerProfile {
  password?: string;
  tagline?: string;
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
  preloadDemoData?: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}
