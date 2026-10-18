export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'manager' | 'tenant' | 'admin';
  avatar?: string;
}

export interface OwnerProfile extends User {
  businessName: string;
  panNumber: string;
  gstNumber?: string;
  address: string;
  password?: string;
  tagline?: string;
  defaultCurrency: 'INR';
  defaultRentDueDay: number; // e.g. 5 (5th of each month)
  gracePeriodDays: number; // e.g. 5 days
  defaultSecurityDepositMonths: number; // e.g. 2 months
  notifications: {
    whatsappReminders: boolean;
    smsAlerts: boolean;
    emailMonthlyReports: boolean;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'payment' | 'complaint' | 'tenant' | 'system';
  link?: string;
}

export type TrendDirection = 'up' | 'down' | 'neutral';
