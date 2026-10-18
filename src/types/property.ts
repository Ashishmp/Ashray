import { BaseEntity } from './common';

export type PropertyType = 'Gents' | 'Ladies' | 'Co-living';
export type PropertyStatus = 'Active' | 'Under Renovation' | 'Inactive';

export interface Property extends BaseEntity {
  name: string;
  type: PropertyType;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  contactPhone: string;
  contactEmail: string;
  numberOfFloors: number;
  totalRooms: number;
  totalBeds: number;
  amenities: string[];
  description: string;
  status: PropertyStatus;
  managerName?: string;
  imageUrl?: string;
}

export const COMMON_AMENITIES = [
  'High-Speed Wi-Fi',
  'Air Conditioning',
  'Daily Housekeeping',
  '3-Time Homestyle Food',
  'Geyser / Hot Water',
  'Washing Machine',
  '24x7 Power Backup',
  'CCTV Surveillance',
  'Biometric Access',
  'Refrigerator',
  'RO Purified Water',
  'Two-Wheeler Parking'
] as const;
