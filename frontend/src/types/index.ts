export type UserRole = 'platform_owner' | 'pg_owner' | 'owner' | 'manager';

export type SubscriptionPlan = 'starter' | 'growth' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trial' | 'suspended';

export interface PGOwnerAccount {
  id: string;
  ownerName: string;
  businessName: string;
  email: string;
  phone: string;
  city: string;
  plan: SubscriptionPlan;
  monthlyFee: number;
  maxProperties: number;
  propertiesCount: number;
  totalBedsCount: number;
  subscriptionStatus: SubscriptionStatus;
  onboardedDate: string;
  gstin?: string;
  panNumber?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  assignedPropertyIds: string[];
  avatar: string;
  panNumber?: string;
  businessName?: string;
}

export type PropertyType = 'boys' | 'girls' | 'co-living';
export type PropertyStatus = 'active' | 'archived';

export interface Property {
  id: string;
  name: string;
  code: string;
  type: PropertyType;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPhone: string;
  contactEmail: string;
  managerId: string;
  managerName: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  monthlyRevenue: number;
  status: PropertyStatus;
  amenities: string[];
  imageUrl: string;
  description: string;
}

export type RoomSharingType = 'single' | 'double' | 'triple' | 'four';
export type RoomStatus = 'available' | 'full' | 'maintenance';
export type ACType = 'ac' | 'non-ac';
export type WashroomType = 'attached' | 'common';

export interface Room {
  id: string;
  propertyId: string;
  propertyName: string;
  roomNumber: string;
  floor: number;
  type: RoomSharingType;
  totalBeds: number;
  occupiedBeds: number;
  baseRentPerBed: number;
  acType: ACType;
  washroomType: WashroomType;
  hasBalcony: boolean;
  status: RoomStatus;
  amenities: string[];
}

export type BedStatus = 'occupied' | 'vacant' | 'maintenance' | 'reserved';

export interface Bed {
  id: string;
  roomId: string;
  roomNumber: string;
  propertyId: string;
  bedNumber: string; // 'A', 'B', 'C', 'D'
  status: BedStatus;
  residentId?: string;
  residentName?: string;
  monthlyRent: number;
}

export type KYCStatus = 'verified' | 'pending' | 'rejected';
export type ResidencyStatus = 'active' | 'notice_period' | 'checked_out';
export type ResidentPaymentStatus = 'paid' | 'pending' | 'overdue';

export interface Resident {
  id: string;
  name: string;
  phone: string;
  email: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  permanentAddress: string;
  city: string;
  state: string;
  aadhaarNumber: string;
  aadhaarVerified: boolean;
  kycStatus: KYCStatus;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomNumber: string;
  bedId: string;
  bedNumber: string;
  moveInDate: string;
  noticeDate?: string;
  moveOutDate?: string;
  monthlyRent: number;
  securityDeposit: number;
  depositStatus: 'paid' | 'partial' | 'pending';
  rentCycleDay: number;
  paymentStatus: ResidentPaymentStatus;
  residencyStatus: ResidencyStatus;
  collegeOrCompany?: string;
  vehicleNumber?: string;
  notes?: string;
}

export type PaymentMethod = 'upi' | 'bank_transfer' | 'cash' | 'cheque';
export type PaymentStatus = 'paid' | 'partially_paid' | 'pending' | 'overdue';

export interface Payment {
  id: string;
  residentId: string;
  residentName: string;
  propertyId: string;
  propertyName: string;
  roomNumber: string;
  bedNumber: string;
  billingMonth: string; // e.g. "October 2026"
  amountDue: number;
  amountPaid: number;
  balanceDue: number;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  status: PaymentStatus;
  receiptNumber: string;
  notes?: string;
}

export type ExpenseCategory =
  | 'electricity'
  | 'water'
  | 'internet'
  | 'housekeeping'
  | 'food_cook'
  | 'staff_salary'
  | 'maintenance'
  | 'repairs'
  | 'other';

export interface Expense {
  id: string;
  propertyId: string;
  propertyName: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  vendorName: string;
  paidBy: string;
  paymentMethod: PaymentMethod;
  description: string;
  receiptUrl?: string;
  invoiceNumber?: string;
}

export type StaffRole = 'manager' | 'warden' | 'cook' | 'housekeeping' | 'security';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  email: string;
  assignedPropertyIds: string[];
  status: 'active' | 'inactive';
  joinedDate: string;
  salaryMonthly: number;
  permissions: {
    canCollectRent: boolean;
    canAddResidents: boolean;
    canViewFinancials: boolean;
    canManageRooms: boolean;
  };
}

export type NotificationType =
  | 'rent_overdue'
  | 'rent_due'
  | 'move_out'
  | 'kyc_pending'
  | 'maintenance'
  | 'info';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  linkRoute?: string;
  linkParams?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ActivityLog {
  id: string;
  propertyId: string;
  propertyName: string;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
  category: 'resident' | 'payment' | 'room' | 'expense' | 'system';
}

export interface KpiMetrics {
  totalProperties: number;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
  revenueGrowthPct: number;
  pendingRentAmount: number;
  pendingResidentsCount: number;
  overdueRentAmount: number;
  overdueResidentsCount: number;
  vacantBeds: number;
  underMaintenanceBeds: number;
  upcomingMoveIns: number;
  upcomingMoveOuts: number;
}
