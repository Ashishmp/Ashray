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
import { OwnerAccount, RegisterOwnerInput, SuperAdminAccount, TenantAccount, UserRole } from '../types/auth';
import { TenantDocument } from '../types/tenant';
import { PaymentMethod } from '../types/payment';
import { generateId } from '../utils/formatters';

const STORAGE_KEYS = {
  ACTIVE_ROLE: 'staynest_active_role_v2',
  ACTIVE_OWNER_ID: 'staynest_active_owner_id_v2',
  ACTIVE_TENANT_ID: 'staynest_active_tenant_id_v2',
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

export const SUPER_ADMIN_ACCOUNT: SuperAdminAccount = {
  id: 'usr_super_admin',
  name: 'Vikramaditya Rao',
  email: 'admin@staynest.in',
  phone: '9845000001',
  role: 'superadmin',
  title: 'Platform Super Administrator'
};

export const DEFAULT_TENANT_ACCOUNTS: TenantAccount[] = [
  {
    id: 'tnt_02',
    name: 'Rohan Verma',
    email: 'rohan.verma@techcorp.com',
    phone: '9845223344',
    role: 'tenant',
    propertyId: 'prop_01',
    propertyName: 'StayNest Elite - Koramangala',
    roomId: 'room_102',
    roomNumber: '102',
    bedCode: 'Bed A',
    ownerId: INITIAL_OWNER_PROFILE.id,
    monthlyRent: 13500
  },
  {
    id: 'tnt_04',
    name: 'Karthik Subramanian',
    email: 'karthik.s@zomato.com',
    phone: '9845445566',
    role: 'tenant',
    propertyId: 'prop_01',
    propertyName: 'StayNest Elite - Koramangala',
    roomId: 'room_103',
    roomNumber: '103',
    bedCode: 'Bed A',
    ownerId: INITIAL_OWNER_PROFILE.id,
    monthlyRent: 13500
  }
];

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
      const stored = this.get<PaymentRecord[]>(key, []);
      if (ownerId === INITIAL_OWNER_PROFILE.id && stored.length <= 7) {
        const existingIds = new Set(stored.map(p => p.id));
        const merged = [...stored, ...INITIAL_PAYMENTS.filter(p => !existingIds.has(p.id))];
        this.savePayments(ownerId, merged);
        return merged;
      }
      return stored;
    }

    if (ownerId === INITIAL_OWNER_PROFILE.id) {
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_PAYMENTS);
      if (legacy !== null) {
        const parsed = JSON.parse(legacy) as PaymentRecord[];
        const existingIds = new Set(parsed.map(p => p.id));
        const merged = [...parsed, ...INITIAL_PAYMENTS.filter(p => !existingIds.has(p.id))];
        this.savePayments(ownerId, merged);
        return merged;
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
      const stored = this.get<Expense[]>(key, []);
      if (ownerId === INITIAL_OWNER_PROFILE.id && stored.length <= 7) {
        const existingIds = new Set(stored.map(e => e.id));
        const merged = [...stored, ...INITIAL_EXPENSES.filter(e => !existingIds.has(e.id))];
        this.saveExpenses(ownerId, merged);
        return merged;
      }
      return stored;
    }

    if (ownerId === INITIAL_OWNER_PROFILE.id) {
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_EXPENSES);
      if (legacy !== null) {
        const parsed = JSON.parse(legacy) as Expense[];
        const existingIds = new Set(parsed.map(e => e.id));
        const merged = [...parsed, ...INITIAL_EXPENSES.filter(e => !existingIds.has(e.id))];
        this.saveExpenses(ownerId, merged);
        return merged;
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

  // ==========================================
  // ROLE & TENANT MANAGEMENT
  // ==========================================

  getActiveRole(): UserRole {
    const role = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) as UserRole | null;
    return role || 'owner';
  }

  setActiveRole(role: UserRole): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
  }

  getActiveTenantId(): string {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_TENANT_ID);
    return id || 'tnt_02';
  }

  setActiveTenantId(id: string | null): void {
    if (!id) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TENANT_ID);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, id);
    }
  }

  getRegisteredTenants(): TenantAccount[] {
    return DEFAULT_TENANT_ACCOUNTS;
  }

  getTenantAccountById(tenantId: string): TenantAccount | null {
    const account = DEFAULT_TENANT_ACCOUNTS.find(t => t.id === tenantId);
    if (account) return account;

    // Fallback: search in loaded owners
    const owners = this.getRegisteredOwners();
    for (const owner of owners) {
      const tenants = this.getTenants(owner.id);
      const match = tenants.find(t => t.id === tenantId);
      if (match) {
        return {
          id: match.id,
          name: match.name,
          email: match.email,
          phone: match.phone,
          role: 'tenant',
          propertyId: match.propertyId,
          propertyName: match.propertyName,
          roomId: match.roomId,
          roomNumber: match.roomNumber,
          bedCode: match.bedCode,
          ownerId: owner.id,
          monthlyRent: match.monthlyRent
        };
      }
    }
    return null;
  }

  getTenantFullProfile(tenantId: string): { tenant: Tenant; ownerId: string } | null {
    const owners = this.getRegisteredOwners();
    for (const owner of owners) {
      const tenants = this.getTenants(owner.id);
      const match = tenants.find(t => t.id === tenantId);
      if (match) {
        // Ensure default lifestyle & KYC docs exist if empty
        if (!match.documents || match.documents.length === 0) {
          match.documents = [
            {
              id: 'doc_aadhaar_01',
              type: 'aadhaar',
              title: 'Aadhaar Card (Front & Back)',
              fileName: 'aadhaar_card_verified.pdf',
              fileSize: '1.4 MB',
              uploadedAt: '2026-10-01T10:30:00Z',
              status: 'verified',
              documentNumber: match.idProofType === 'Aadhaar' ? match.idProofNumber : '4829-1029-3841',
              verificationNotes: 'UIDAI QR Code electronically validated & approved by Property Manager.'
            },
            {
              id: 'doc_pan_01',
              type: 'pan',
              title: 'Permanent Account Number (PAN)',
              fileName: 'pan_card.jpg',
              fileSize: '780 KB',
              uploadedAt: '2026-10-01T11:00:00Z',
              status: 'verified',
              documentNumber: match.idProofType === 'PAN' ? match.idProofNumber : 'ABCDE1234F',
              verificationNotes: 'ITD Database PAN active & name match verified.'
            },
            {
              id: 'doc_work_01',
              type: 'college_work_id',
              title: 'Workplace / Student Identity Card',
              fileName: 'company_id_badge.png',
              fileSize: '1.2 MB',
              uploadedAt: '2026-10-02T14:15:00Z',
              status: 'verified',
              documentNumber: 'EMP-90241',
              verificationNotes: 'Verified against current HR employment letter.'
            },
            {
              id: 'doc_police_01',
              type: 'police_verification',
              title: 'Police Verification Form',
              fileName: 'police_tenant_verification.pdf',
              fileSize: '2.1 MB',
              uploadedAt: '2026-10-05T16:00:00Z',
              status: 'pending',
              verificationNotes: 'Submitted to local jurisdictional police station. Awaiting acknowledgment seal.'
            }
          ];
          match.bloodGroup = match.bloodGroup || 'B+';
          match.foodPreference = match.foodPreference || 'Veg';
          match.permanentAddress = match.permanentAddress || 'Plot 42, Green Glen Layout, Bellandur, Bengaluru 560103';
          this.saveTenants(owner.id, tenants);
        }
        return { tenant: match, ownerId: owner.id };
      }
    }
    return null;
  }

  updateTenantFullProfile(tenantId: string, updates: Partial<Tenant>): Tenant | null {
    const owners = this.getRegisteredOwners();
    for (const owner of owners) {
      const tenants = this.getTenants(owner.id);
      const idx = tenants.findIndex(t => t.id === tenantId);
      if (idx !== -1) {
        tenants[idx] = {
          ...tenants[idx],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        this.saveTenants(owner.id, tenants);
        return tenants[idx];
      }
    }
    return null;
  }

  uploadTenantKYCDocument(tenantId: string, doc: TenantDocument): TenantDocument {
    const profile = this.getTenantFullProfile(tenantId);
    if (!profile) return doc;

    const tenant = profile.tenant;
    const docs = tenant.documents ? [...tenant.documents] : [];
    const existingIndex = docs.findIndex(d => d.type === doc.type);

    if (existingIndex !== -1) {
      docs[existingIndex] = { ...docs[existingIndex], ...doc, uploadedAt: new Date().toISOString() };
    } else {
      docs.push({ ...doc, id: doc.id || generateId('doc'), uploadedAt: new Date().toISOString() });
    }

    this.updateTenantFullProfile(tenantId, { documents: docs });
    return doc;
  }

  payRentOnline(
    tenantId: string,
    data: {
      baseRent: number;
      maintenanceFee?: number;
      lateFee?: number;
      totalPaid: number;
      paymentMethod: PaymentMethod;
      transactionRef: string;
      billingMonth: string;
      notes?: string;
    }
  ): { payment: PaymentRecord; tenant: Tenant } {
    const profile = this.getTenantFullProfile(tenantId);
    if (!profile) throw new Error('Tenant record not found.');

    const { tenant, ownerId } = profile;
    const paymentId = generateId('pay');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `REC-2026-${randomDigits}`;

    const newPayment: PaymentRecord = {
      id: paymentId,
      receiptNumber,
      tenantId: tenant.id,
      tenantName: tenant.name,
      propertyId: tenant.propertyId,
      propertyName: tenant.propertyName || 'StayNest Residence',
      roomId: tenant.roomId,
      roomNumber: tenant.roomNumber || '102',
      billingMonth: data.billingMonth || 'October 2026',
      baseRent: data.baseRent,
      maintenanceFee: data.maintenanceFee || 450,
      lateFee: data.lateFee || 0,
      discount: 0,
      totalDue: data.totalPaid,
      amountPaid: data.totalPaid,
      balanceDue: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod,
      transactionRef: data.transactionRef,
      status: 'Paid',
      notes: data.notes || `Online payment processed via ${data.paymentMethod}. Self-service tenant clearance.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save payment to owner ledger
    const existingPayments = this.getPayments(ownerId);
    this.savePayments(ownerId, [newPayment, ...existingPayments]);

    // Update tenant balance & status
    const updatedTenant = this.updateTenantFullProfile(tenantId, {
      rentStatus: 'Paid',
      outstandingBalance: 0
    });

    return { payment: newPayment, tenant: updatedTenant || tenant };
  }

  getTenantPaymentHistory(tenantId: string): PaymentRecord[] {
    const profile = this.getTenantFullProfile(tenantId);
    if (!profile) return [];
    const payments = this.getPayments(profile.ownerId);
    return payments.filter(p => p.tenantId === tenantId);
  }

  // ==========================================
  // SUPER ADMIN AGGREGATIONS
  // ==========================================

  getAllOwnersOverviewForSuperAdmin(): Array<{
    owner: OwnerAccount;
    propertyCount: number;
    roomCount: number;
    bedCount: number;
    tenantCount: number;
    monthlyRevenue: number;
  }> {
    const owners = this.getRegisteredOwners();
    return owners.map(owner => {
      const properties = this.getProperties(owner.id);
      const rooms = this.getRooms(owner.id);
      const tenants = this.getTenants(owner.id);
      const payments = this.getPayments(owner.id);

      const bedCount = rooms.reduce((acc, r) => acc + r.capacity, 0);
      const monthlyRevenue = payments
        .filter(p => p.status === 'Paid')
        .reduce((acc, p) => acc + p.amountPaid, 0);

      return {
        owner,
        propertyCount: properties.length,
        roomCount: rooms.length,
        bedCount,
        tenantCount: tenants.filter(t => t.status === 'Active').length,
        monthlyRevenue
      };
    });
  }

  updateOwnerStatus(ownerId: string, status: 'verified' | 'pending' | 'suspended'): void {
    const owners = this.getRegisteredOwners();
    const updated = owners.map(o => (o.id === ownerId ? { ...o, status } : o));
    this.saveRegisteredOwners(updated);
  }
}

export const storageService = new StorageService();
