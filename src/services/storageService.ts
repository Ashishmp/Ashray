import {
  INITIAL_PROPERTIES,
  INITIAL_ROOMS,
  INITIAL_TENANTS,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_COMPLAINTS,
  INITIAL_STAFF,
  INITIAL_OWNER_PROFILE,
  INITIAL_NOTIFICATIONS
} from './mockData';

import {
  PRIYA_OWNER_PROFILE,
  PRIYA_PROPERTIES,
  PRIYA_ROOMS,
  PRIYA_TENANTS,
  PRIYA_PAYMENTS,
  PRIYA_EXPENSES,
  PRIYA_COMPLAINTS,
  PRIYA_STAFF,
  PRIYA_NOTIFICATIONS,
  VIKRAM_OWNER_PROFILE,
  VIKRAM_PROPERTIES,
  VIKRAM_ROOMS,
  VIKRAM_TENANTS,
  VIKRAM_PAYMENTS,
  VIKRAM_EXPENSES,
  VIKRAM_COMPLAINTS,
  VIKRAM_STAFF,
  VIKRAM_NOTIFICATIONS
} from './mockDataOwner2';

import { Property } from '../types/property';
import { Room } from '../types/room';
import { Tenant } from '../types/tenant';
import { PaymentRecord } from '../types/payment';
import { Expense } from '../types/expense';
import { Complaint } from '../types/complaint';
import { StaffMember } from '../types/staff';
import { OwnerProfile, NotificationItem } from '../types/common';
import { OwnerAccount, RegisterOwnerInput } from '../types/auth';
import { generateId } from '../utils/formatters';

const STORAGE_KEYS = {
  ACTIVE_OWNER_ID: 'staynest_active_owner_id_v2',
  REGISTERED_OWNERS: 'staynest_registered_owners_v2',
  LEGACY_PROPERTIES: 'staynest_properties_clean_v3',
  LEGACY_ROOMS: 'staynest_rooms_clean_v3',
  LEGACY_TENANTS: 'staynest_tenants_clean_v3',
  LEGACY_PAYMENTS: 'staynest_payments_clean_v3',
  LEGACY_EXPENSES: 'staynest_expenses_clean_v3',
  LEGACY_COMPLAINTS: 'staynest_complaints_clean_v3',
  LEGACY_STAFF: 'staynest_staff_clean_v3',
  LEGACY_OWNER: 'staynest_owner_clean_v3',
  LEGACY_NOTIFICATIONS: 'staynest_notifications_clean_v3'
};

export const DEFAULT_OWNERS: OwnerAccount[] = [
  INITIAL_OWNER_PROFILE,
  PRIYA_OWNER_PROFILE,
  VIKRAM_OWNER_PROFILE
];

class StorageService {
  private get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data === null || data === undefined) {
        return fallback;
      }
      return JSON.parse(data) as T;
    } catch (e) {
      console.warn(`Error reading localStorage for key ${key}:`, e);
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to localStorage for key ${key}:`, e);
    }
  }

  private getScopedKey(category: string, ownerId: string): string {
    return `staynest_${category}_${ownerId}`;
  }

  // ==========================================
  // AUTH & OWNER ACCOUNT MANAGEMENT
  // ==========================================

  getRegisteredOwners(): OwnerAccount[] {
    const stored = this.get<OwnerAccount[]>(STORAGE_KEYS.REGISTERED_OWNERS, []);
    if (!stored || stored.length === 0) {
      this.set(STORAGE_KEYS.REGISTERED_OWNERS, DEFAULT_OWNERS);
      return DEFAULT_OWNERS;
    }
    return stored;
  }

  saveRegisteredOwners(owners: OwnerAccount[]): void {
    this.set(STORAGE_KEYS.REGISTERED_OWNERS, owners);
  }

  getActiveOwnerId(): string | null {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_OWNER_ID);
    if (stored === '__LOGGED_OUT__') {
      return null;
    }
    if (!stored) {
      // First visit defaults to Rajesh Sharma
      localStorage.setItem(STORAGE_KEYS.ACTIVE_OWNER_ID, INITIAL_OWNER_PROFILE.id);
      return INITIAL_OWNER_PROFILE.id;
    }
    return stored;
  }

  setActiveOwnerId(id: string | null): void {
    if (!id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_OWNER_ID, '__LOGGED_OUT__');
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_OWNER_ID, id);
    }
  }

  getOwnerAccountById(ownerId: string): OwnerAccount | null {
    const owners = this.getRegisteredOwners();
    return owners.find(o => o.id === ownerId) || null;
  }

  getOwnerAccountByEmail(email: string): OwnerAccount | null {
    const owners = this.getRegisteredOwners();
    const cleanEmail = email.trim().toLowerCase();
    return owners.find(o => o.email.trim().toLowerCase() === cleanEmail) || null;
  }

  registerOwner(data: RegisterOwnerInput): OwnerAccount {
    const owners = this.getRegisteredOwners();
    const existing = owners.find(o => o.email.trim().toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      throw new Error(`An owner account with email ${data.email} already exists.`);
    }

    const newOwnerId = generateId('usr_owner');
    const newOwner: OwnerAccount = {
      id: newOwnerId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      password: data.password || 'owner123',
      role: 'owner',
      businessName: data.businessName.trim(),
      panNumber: data.panNumber?.trim() || '',
      gstNumber: data.gstNumber?.trim() || '',
      address: data.address?.trim() || 'India',
      tagline: `${data.businessName} - Modern Hostels & Residences`,
      defaultCurrency: 'INR',
      defaultRentDueDay: 5,
      gracePeriodDays: 5,
      defaultSecurityDepositMonths: 2,
      notifications: {
        whatsappReminders: true,
        smsAlerts: true,
        emailMonthlyReports: true
      }
    };

    const updatedOwners = [...owners, newOwner];
    this.saveRegisteredOwners(updatedOwners);
    this.saveOwnerProfile(newOwnerId, newOwner);

    if (data.preloadDemoData) {
      // Preload with modern starter dataset
      this.loadDemoData(newOwnerId);
    } else {
      // Clean slate
      this.saveProperties(newOwnerId, []);
      this.saveRooms(newOwnerId, []);
      this.saveTenants(newOwnerId, []);
      this.savePayments(newOwnerId, []);
      this.saveExpenses(newOwnerId, []);
      this.saveComplaints(newOwnerId, []);
      this.saveStaff(newOwnerId, []);
      this.saveNotifications(newOwnerId, [
        {
          id: generateId('notif'),
          title: 'Welcome to StayNest!',
          message: `Your owner workspace for ${newOwner.businessName} is ready. Add your first PG property to begin.`,
          timestamp: 'Just now',
          read: false,
          type: 'system',
          link: '/properties'
        }
      ]);
    }

    this.setActiveOwnerId(newOwnerId);
    return newOwner;
  }

  updateOwnerInRegistry(ownerId: string, updates: Partial<OwnerAccount>): void {
    const owners = this.getRegisteredOwners();
    const updated = owners.map(o => (o.id === ownerId ? { ...o, ...updates } : o));
    this.saveRegisteredOwners(updated);
  }

  // ==========================================
  // PER-OWNER DATA SCOPED STORAGE
  // ==========================================

  // Properties
  getProperties(ownerId: string): Property[] {
    const key = this.getScopedKey('properties', ownerId);
    const existing = localStorage.getItem(key);
    if (existing !== null) {
      return this.get<Property[]>(key, []);
    }

    // Check legacy migration for Rajesh Sharma
    if (ownerId === INITIAL_OWNER_PROFILE.id) {
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_PROPERTIES);
      if (legacy !== null) {
        const parsed = JSON.parse(legacy) as Property[];
        this.saveProperties(ownerId, parsed);
        return parsed;
      }
      this.saveProperties(ownerId, INITIAL_PROPERTIES);
      return INITIAL_PROPERTIES;
    }

    // Default seed for Priya Sundaram
    if (ownerId === PRIYA_OWNER_PROFILE.id) {
      this.saveProperties(ownerId, PRIYA_PROPERTIES);
      return PRIYA_PROPERTIES;
    }

    // Default seed for Vikram Patel
    if (ownerId === VIKRAM_OWNER_PROFILE.id) {
      this.saveProperties(ownerId, VIKRAM_PROPERTIES);
      return VIKRAM_PROPERTIES;
    }

    return [];
  }

  saveProperties(ownerId: string, properties: Property[]): void {
    this.set(this.getScopedKey('properties', ownerId), properties);
  }

  // Rooms
  getRooms(ownerId: string): Room[] {
    const key = this.getScopedKey('rooms', ownerId);
    const existing = localStorage.getItem(key);
    if (existing !== null) {
      return this.get<Room[]>(key, []);
    }

    if (ownerId === INITIAL_OWNER_PROFILE.id) {
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_ROOMS);
      if (legacy !== null) {
        const parsed = JSON.parse(legacy) as Room[];
        this.saveRooms(ownerId, parsed);
        return parsed;
      }
      this.saveRooms(ownerId, INITIAL_ROOMS);
      return INITIAL_ROOMS;
    }

    if (ownerId === PRIYA_OWNER_PROFILE.id) {
      this.saveRooms(ownerId, PRIYA_ROOMS);
      return PRIYA_ROOMS;
    }

    if (ownerId === VIKRAM_OWNER_PROFILE.id) {
      this.saveRooms(ownerId, VIKRAM_ROOMS);
      return VIKRAM_ROOMS;
    }

    return [];
  }

  saveRooms(ownerId: string, rooms: Room[]): void {
    this.set(this.getScopedKey('rooms', ownerId), rooms);
  }

  // Tenants
  getTenants(ownerId: string): Tenant[] {
    const key = this.getScopedKey('tenants', ownerId);
    const existing = localStorage.getItem(key);
    if (existing !== null) {
      return this.get<Tenant[]>(key, []);
    }

    if (ownerId === INITIAL_OWNER_PROFILE.id) {
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_TENANTS);
      if (legacy !== null) {
        const parsed = JSON.parse(legacy) as Tenant[];
        this.saveTenants(ownerId, parsed);
        return parsed;
      }
      this.saveTenants(ownerId, INITIAL_TENANTS);
      return INITIAL_TENANTS;
    }

    if (ownerId === PRIYA_OWNER_PROFILE.id) {
      this.saveTenants(ownerId, PRIYA_TENANTS);
      return PRIYA_TENANTS;
    }

    if (ownerId === VIKRAM_OWNER_PROFILE.id) {
      this.saveTenants(ownerId, VIKRAM_TENANTS);
      return VIKRAM_TENANTS;
    }

    return [];
  }

  saveTenants(ownerId: string, tenants: Tenant[]): void {
    this.set(this.getScopedKey('tenants', ownerId), tenants);
  }

  // Payments
  getPayments(ownerId: string): PaymentRecord[] {
    const key = this.getScopedKey('payments', ownerId);
    const existing = localStorage.getItem(key);
    if (existing !== null) {
      return this.get<PaymentRecord[]>(key, []);
    }

    if (ownerId === INITIAL_OWNER_PROFILE.id) {
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_PAYMENTS);
      if (legacy !== null) {
        const parsed = JSON.parse(legacy) as PaymentRecord[];
        this.savePayments(ownerId, parsed);
        return parsed;
      }
      this.savePayments(ownerId, INITIAL_PAYMENTS);
      return INITIAL_PAYMENTS;
    }

    if (ownerId === PRIYA_OWNER_PROFILE.id) {
      this.savePayments(ownerId, PRIYA_PAYMENTS);
      return PRIYA_PAYMENTS;
    }

    if (ownerId === VIKRAM_OWNER_PROFILE.id) {
      this.savePayments(ownerId, VIKRAM_PAYMENTS);
      return VIKRAM_PAYMENTS;
    }

    return [];
  }

  savePayments(ownerId: string, payments: PaymentRecord[]): void {
    this.set(this.getScopedKey('payments', ownerId), payments);
  }

  // Expenses
  getExpenses(ownerId: string): Expense[] {
    const key = this.getScopedKey('expenses', ownerId);
    const existing = localStorage.getItem(key);
    if (existing !== null) {
      return this.get<Expense[]>(key, []);
    }

    if (ownerId === INITIAL_OWNER_PROFILE.id) {
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_EXPENSES);
      if (legacy !== null) {
        const parsed = JSON.parse(legacy) as Expense[];
        this.saveExpenses(ownerId, parsed);
        return parsed;
      }
      this.saveExpenses(ownerId, INITIAL_EXPENSES);
      return INITIAL_EXPENSES;
    }

    if (ownerId === PRIYA_OWNER_PROFILE.id) {
      this.saveExpenses(ownerId, PRIYA_EXPENSES);
      return PRIYA_EXPENSES;
    }

    if (ownerId === VIKRAM_OWNER_PROFILE.id) {
      this.saveExpenses(ownerId, VIKRAM_EXPENSES);
      return VIKRAM_EXPENSES;
    }

    return [];
  }

  saveExpenses(ownerId: string, expenses: Expense[]): void {
    this.set(this.getScopedKey('expenses', ownerId), expenses);
  }

  // Complaints
  getComplaints(ownerId: string): Complaint[] {
    const key = this.getScopedKey('complaints', ownerId);
    const existing = localStorage.getItem(key);
    if (existing !== null) {
      return this.get<Complaint[]>(key, []);
    }

    if (ownerId === INITIAL_OWNER_PROFILE.id) {
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_COMPLAINTS);
      if (legacy !== null) {
        const parsed = JSON.parse(legacy) as Complaint[];
        this.saveComplaints(ownerId, parsed);
        return parsed;
      }
      this.saveComplaints(ownerId, INITIAL_COMPLAINTS);
      return INITIAL_COMPLAINTS;
    }

    if (ownerId === PRIYA_OWNER_PROFILE.id) {
      this.saveComplaints(ownerId, PRIYA_COMPLAINTS);
      return PRIYA_COMPLAINTS;
    }

    if (ownerId === VIKRAM_OWNER_PROFILE.id) {
      this.saveComplaints(ownerId, VIKRAM_COMPLAINTS);
      return VIKRAM_COMPLAINTS;
    }

    return [];
  }

  saveComplaints(ownerId: string, complaints: Complaint[]): void {
    this.set(this.getScopedKey('complaints', ownerId), complaints);
  }

  // Staff
  getStaff(ownerId: string): StaffMember[] {
    const key = this.getScopedKey('staff', ownerId);
    const existing = localStorage.getItem(key);
    if (existing !== null) {
      return this.get<StaffMember[]>(key, []);
    }

    if (ownerId === INITIAL_OWNER_PROFILE.id) {
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_STAFF);
      if (legacy !== null) {
        const parsed = JSON.parse(legacy) as StaffMember[];
        this.saveStaff(ownerId, parsed);
        return parsed;
      }
      this.saveStaff(ownerId, INITIAL_STAFF);
      return INITIAL_STAFF;
    }

    if (ownerId === PRIYA_OWNER_PROFILE.id) {
      this.saveStaff(ownerId, PRIYA_STAFF);
      return PRIYA_STAFF;
    }

    if (ownerId === VIKRAM_OWNER_PROFILE.id) {
      this.saveStaff(ownerId, VIKRAM_STAFF);
      return VIKRAM_STAFF;
    }

    return [];
  }

  saveStaff(ownerId: string, staff: StaffMember[]): void {
    this.set(this.getScopedKey('staff', ownerId), staff);
  }

  // Owner Profile
  getOwnerProfile(ownerId: string): OwnerProfile {
    const key = this.getScopedKey('owner', ownerId);
    const existing = localStorage.getItem(key);
    if (existing !== null) {
      return this.get<OwnerProfile>(key, INITIAL_OWNER_PROFILE);
    }

    const account = this.getOwnerAccountById(ownerId);
    if (account) {
      this.saveOwnerProfile(ownerId, account);
      return account;
    }

    if (ownerId === PRIYA_OWNER_PROFILE.id) {
      this.saveOwnerProfile(ownerId, PRIYA_OWNER_PROFILE);
      return PRIYA_OWNER_PROFILE;
    }

    if (ownerId === VIKRAM_OWNER_PROFILE.id) {
      this.saveOwnerProfile(ownerId, VIKRAM_OWNER_PROFILE);
      return VIKRAM_OWNER_PROFILE;
    }

    return INITIAL_OWNER_PROFILE;
  }

  saveOwnerProfile(ownerId: string, profile: OwnerProfile): void {
    this.set(this.getScopedKey('owner', ownerId), profile);
    this.updateOwnerInRegistry(ownerId, profile);
  }

  // Notifications
  getNotifications(ownerId: string): NotificationItem[] {
    const key = this.getScopedKey('notifications', ownerId);
    const existing = localStorage.getItem(key);
    if (existing !== null) {
      return this.get<NotificationItem[]>(key, []);
    }

    if (ownerId === INITIAL_OWNER_PROFILE.id) {
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_NOTIFICATIONS);
      if (legacy !== null) {
        const parsed = JSON.parse(legacy) as NotificationItem[];
        this.saveNotifications(ownerId, parsed);
        return parsed;
      }
      this.saveNotifications(ownerId, INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }

    if (ownerId === PRIYA_OWNER_PROFILE.id) {
      this.saveNotifications(ownerId, PRIYA_NOTIFICATIONS);
      return PRIYA_NOTIFICATIONS;
    }

    if (ownerId === VIKRAM_OWNER_PROFILE.id) {
      this.saveNotifications(ownerId, VIKRAM_NOTIFICATIONS);
      return VIKRAM_NOTIFICATIONS;
    }

    return [];
  }

  saveNotifications(ownerId: string, notifications: NotificationItem[]): void {
    this.set(this.getScopedKey('notifications', ownerId), notifications);
  }

  // Clear all data for a specific owner
  clearAll(ownerId: string): void {
    this.saveProperties(ownerId, []);
    this.saveRooms(ownerId, []);
    this.saveTenants(ownerId, []);
    this.savePayments(ownerId, []);
    this.saveExpenses(ownerId, []);
    this.saveComplaints(ownerId, []);
    this.saveStaff(ownerId, []);
    this.saveNotifications(ownerId, []);
  }

  // Load demo data for a specific owner
  loadDemoData(ownerId: string): void {
    if (ownerId === PRIYA_OWNER_PROFILE.id) {
      this.saveProperties(ownerId, PRIYA_PROPERTIES);
      this.saveRooms(ownerId, PRIYA_ROOMS);
      this.saveTenants(ownerId, PRIYA_TENANTS);
      this.savePayments(ownerId, PRIYA_PAYMENTS);
      this.saveExpenses(ownerId, PRIYA_EXPENSES);
      this.saveComplaints(ownerId, PRIYA_COMPLAINTS);
      this.saveStaff(ownerId, PRIYA_STAFF);
      this.saveNotifications(ownerId, PRIYA_NOTIFICATIONS);
    } else if (ownerId === VIKRAM_OWNER_PROFILE.id) {
      this.saveProperties(ownerId, VIKRAM_PROPERTIES);
      this.saveRooms(ownerId, VIKRAM_ROOMS);
      this.saveTenants(ownerId, VIKRAM_TENANTS);
      this.savePayments(ownerId, VIKRAM_PAYMENTS);
      this.saveExpenses(ownerId, VIKRAM_EXPENSES);
      this.saveComplaints(ownerId, VIKRAM_COMPLAINTS);
      this.saveStaff(ownerId, VIKRAM_STAFF);
      this.saveNotifications(ownerId, VIKRAM_NOTIFICATIONS);
    } else {
      this.saveProperties(ownerId, INITIAL_PROPERTIES);
      this.saveRooms(ownerId, INITIAL_ROOMS);
      this.saveTenants(ownerId, INITIAL_TENANTS);
      this.savePayments(ownerId, INITIAL_PAYMENTS);
      this.saveExpenses(ownerId, INITIAL_EXPENSES);
      this.saveComplaints(ownerId, INITIAL_COMPLAINTS);
      this.saveStaff(ownerId, INITIAL_STAFF);
      this.saveNotifications(ownerId, INITIAL_NOTIFICATIONS);
    }
  }
}

export const storageService = new StorageService();
