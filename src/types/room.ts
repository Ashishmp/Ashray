import { BaseEntity } from './common';

export type RoomType = 'Single' | 'Double' | 'Triple' | 'Four';
export type RoomStatus = 'Available' | 'Full' | 'Maintenance';

export interface Bed {
  id: string;
  roomId: string;
  bedCode: string; // e.g. "Bed A", "Bed B"
  isOccupied: boolean;
  tenantId?: string;
  tenantName?: string;
  monthlyRent: number;
}

export interface Room extends BaseEntity {
  roomNumber: string;
  propertyId: string;
  propertyName?: string;
  floor: number;
  type: RoomType;
  capacity: number; // Max beds (1, 2, 3, 4)
  occupiedBeds: number;
  availableBeds: number;
  rentPerBed: number; // in INR
  status: RoomStatus;
  amenities: string[];
  beds: Bed[];
  notes?: string;
}
