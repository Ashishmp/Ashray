import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { Property } from '../types/property';
import { Room, Bed } from '../types/room';
import { Tenant } from '../types/tenant';
import { PaymentRecord } from '../types/payment';
import { Expense } from '../types/expense';
import { Complaint, ComplaintNote } from '../types/complaint';
import { StaffMember } from '../types/staff';
import { OwnerProfile, NotificationItem } from '../types/common';
import { generateId } from '../utils/formatters';
import { useAuth } from './AuthContext';

interface AppContextValue {
  selectedPropertyId: string; // 'all' or propertyId
  setSelectedPropertyId: (id: string) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Data
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  payments: PaymentRecord[];
  expenses: Expense[];
  complaints: Complaint[];
  staff: StaffMember[];
  ownerProfile: OwnerProfile;
  notifications: NotificationItem[];
  unreadNotifCount: number;

  // Filtered views based on selectedPropertyId
  filteredProperties: Property[];
  filteredRooms: Room[];
  filteredTenants: Tenant[];
  filteredPayments: PaymentRecord[];
  filteredExpenses: Expense[];
  filteredComplaints: Complaint[];
  filteredStaff: StaffMember[];

  // Property Actions
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  // Room Actions
  addRoom: (room: Omit<Room, 'id' | 'createdAt' | 'updatedAt' | 'occupiedBeds' | 'availableBeds' | 'beds'> & { bedCodes?: string[] }) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

  // Tenant Actions
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'outstandingBalance' | 'rentStatus'>) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  transferTenantBed: (tenantId: string, newPropertyId: string, newRoomId: string, newBedId: string) => void;
  vacateTenant: (tenantId: string, moveOutDate: string) => void;

  // Payment Actions
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt' | 'receiptNumber'>) => PaymentRecord;
  updatePayment: (id: string, updates: Partial<PaymentRecord>) => void;

  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Complaint Actions
  createComplaint: (complaint: Omit<Complaint, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'internalNotes'>) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  addComplaintNote: (complaintId: string, noteText: string, authorName?: string) => void;

  // Staff Actions
  addStaff: (staff: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;

  // Owner Actions
  updateOwnerProfile: (updates: Partial<OwnerProfile>) => void;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // System
  clearAllData: () => void;
  loadSampleData: () => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentOwner, updateCurrentProfile: authUpdateProfile } = useAuth();
  const activeOwnerId = currentOwner?.id || 'usr_owner_01';

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [properties, setProperties] = useState<Property[]>(() => storageService.getProperties(activeOwnerId));
  const [rooms, setRooms] = useState<Room[]>(() => storageService.getRooms(activeOwnerId));
  const [tenants, setTenants] = useState<Tenant[]>(() => storageService.getTenants(activeOwnerId));
  const [payments, setPayments] = useState<PaymentRecord[]>(() => storageService.getPayments(activeOwnerId));
  const [expenses, setExpenses] = useState<Expense[]>(() => storageService.getExpenses(activeOwnerId));
  const [complaints, setComplaints] = useState<Complaint[]>(() => storageService.getComplaints(activeOwnerId));
  const [staff, setStaff] = useState<StaffMember[]>(() => storageService.getStaff(activeOwnerId));
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>(() => storageService.getOwnerProfile(activeOwnerId));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storageService.getNotifications(activeOwnerId));

  // Switch context whenever active owner changes
  useEffect(() => {
    if (!currentOwner) {
      setProperties([]);
      setRooms([]);
      setTenants([]);
      setPayments([]);
      setExpenses([]);
      setComplaints([]);
      setStaff([]);
      setNotifications([]);
      return;
    }
    const id = currentOwner.id;
    setProperties(storageService.getProperties(id));
    setRooms(storageService.getRooms(id));
    setTenants(storageService.getTenants(id));
    setPayments(storageService.getPayments(id));
    setExpenses(storageService.getExpenses(id));
    setComplaints(storageService.getComplaints(id));
    setStaff(storageService.getStaff(id));
    setOwnerProfile(storageService.getOwnerProfile(id));
    setNotifications(storageService.getNotifications(id));
    setSelectedPropertyId('all');
    setGlobalSearch('');
  }, [currentOwner?.id]);

  // Auto-sync state changes to storageService for this owner
  useEffect(() => { if (currentOwner) storageService.saveProperties(currentOwner.id, properties); }, [currentOwner, properties]);
  useEffect(() => { if (currentOwner) storageService.saveRooms(currentOwner.id, rooms); }, [currentOwner, rooms]);
  useEffect(() => { if (currentOwner) storageService.saveTenants(currentOwner.id, tenants); }, [currentOwner, tenants]);
  useEffect(() => { if (currentOwner) storageService.savePayments(currentOwner.id, payments); }, [currentOwner, payments]);
  useEffect(() => { if (currentOwner) storageService.saveExpenses(currentOwner.id, expenses); }, [currentOwner, expenses]);
  useEffect(() => { if (currentOwner) storageService.saveComplaints(currentOwner.id, complaints); }, [currentOwner, complaints]);
  useEffect(() => { if (currentOwner) storageService.saveStaff(currentOwner.id, staff); }, [currentOwner, staff]);
  useEffect(() => { if (currentOwner) storageService.saveOwnerProfile(currentOwner.id, ownerProfile); }, [currentOwner, ownerProfile]);
  useEffect(() => { if (currentOwner) storageService.saveNotifications(currentOwner.id, notifications); }, [currentOwner, notifications]);

  // Derived filtered collections
  const filteredProperties = properties.filter(p => selectedPropertyId === 'all' || p.id === selectedPropertyId);
  const filteredRooms = rooms.filter(r => selectedPropertyId === 'all' || r.propertyId === selectedPropertyId);
  const filteredTenants = tenants.filter(t => selectedPropertyId === 'all' || t.propertyId === selectedPropertyId);
  const filteredPayments = payments.filter(p => selectedPropertyId === 'all' || p.propertyId === selectedPropertyId);
  const filteredExpenses = expenses.filter(e => selectedPropertyId === 'all' || e.propertyId === selectedPropertyId);
  const filteredComplaints = complaints.filter(c => selectedPropertyId === 'all' || c.propertyId === selectedPropertyId);
  const filteredStaff = staff.filter(s =>
    selectedPropertyId === 'all' || s.assignedPropertyIds.includes(selectedPropertyId)
  );

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  // Property handlers
  const addProperty = useCallback((propData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProp: Property = {
      ...propData,
      id: generateId('prop'),
      createdAt: now,
      updatedAt: now
    };
    setProperties(prev => [newProp, ...prev]);
  }, []);

  const updateProperty = useCallback((id: string, updates: Partial<Property>) => {
    setProperties(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  }, []);

  const deleteProperty = useCallback((id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  }, []);

  // Room handlers
  const addRoom = useCallback((roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt' | 'occupiedBeds' | 'availableBeds' | 'beds'> & { bedCodes?: string[] }) => {
    const roomId = generateId('room');
    const now = new Date().toISOString();
    const letters = ['A', 'B', 'C', 'D'];
    const generatedBeds: Bed[] = Array.from({ length: roomData.capacity }, (_, i) => ({
      id: `${roomId}_bed_${letters[i] || i + 1}`,
      roomId,
      bedCode: `Bed ${letters[i] || i + 1}`,
      isOccupied: false,
      monthlyRent: roomData.rentPerBed
    }));

    const newRoom: Room = {
      ...roomData,
      id: roomId,
      occupiedBeds: 0,
      availableBeds: roomData.capacity,
      beds: generatedBeds,
      createdAt: now,
      updatedAt: now
    };

    setRooms(prev => [...prev, newRoom]);

    // Update property counts
    setProperties(prev =>
      prev.map(p => {
        if (p.id === roomData.propertyId) {
          return {
            ...p,
            totalRooms: p.totalRooms + 1,
            totalBeds: p.totalBeds + roomData.capacity
          };
        }
        return p;
      })
    );
  }, []);

  const updateRoom = useCallback((id: string, updates: Partial<Room>) => {
    setRooms(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
  }, []);

  const deleteRoom = useCallback((id: string) => {
    const room = rooms.find(r => r.id === id);
    if (!room) return;
    setRooms(prev => prev.filter(r => r.id !== id));

    // Update property count
    setProperties(prev =>
      prev.map(p => {
        if (p.id === room.propertyId) {
          return {
            ...p,
            totalRooms: Math.max(0, p.totalRooms - 1),
            totalBeds: Math.max(0, p.totalBeds - room.capacity)
          };
        }
        return p;
      })
    );
  }, [rooms]);

  // Tenant handlers
  const addTenant = useCallback((tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'outstandingBalance' | 'rentStatus'>) => {
    const tenantId = generateId('tnt');
    const now = new Date().toISOString();

    const newTenant: Tenant = {
      ...tenantData,
      id: tenantId,
      outstandingBalance: 0,
      rentStatus: 'Paid',
      createdAt: now,
      updatedAt: now
    };

    // Update Tenant List
    setTenants(prev => [newTenant, ...prev]);

    // Update Room & Bed occupancy
    setRooms(prevRooms =>
      prevRooms.map(r => {
        if (r.id === tenantData.roomId) {
          const updatedBeds = r.beds.map(b => {
            if (b.id === tenantData.bedId) {
              return {
                ...b,
                isOccupied: true,
                tenantId,
                tenantName: tenantData.name
              };
            }
            return b;
          });
          const occCount = updatedBeds.filter(b => b.isOccupied).length;
          return {
            ...r,
            beds: updatedBeds,
            occupiedBeds: occCount,
            availableBeds: Math.max(0, r.capacity - occCount),
            status: occCount >= r.capacity ? 'Full' : 'Available',
            updatedAt: now
          };
        }
        return r;
      })
    );
  }, []);

  const updateTenant = useCallback((id: string, updates: Partial<Tenant>) => {
    setTenants(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  }, []);

  const transferTenantBed = useCallback((tenantId: string, newPropertyId: string, newRoomId: string, newBedId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    const oldRoomId = tenant.roomId;
    const oldBedId = tenant.bedId;
    const newProperty = properties.find(p => p.id === newPropertyId);
    const newRoom = rooms.find(r => r.id === newRoomId);
    const targetBed = newRoom?.beds.find(b => b.id === newBedId);
    const now = new Date().toISOString();

    // 1. Free old bed
    // 2. Occupy new bed
    setRooms(prevRooms =>
      prevRooms.map(r => {
        if (r.id === oldRoomId) {
          const freedBeds = r.beds.map(b => (b.id === oldBedId ? { ...b, isOccupied: false, tenantId: undefined, tenantName: undefined } : b));
          const occ = freedBeds.filter(b => b.isOccupied).length;
          return {
            ...r,
            beds: freedBeds,
            occupiedBeds: occ,
            availableBeds: r.capacity - occ,
            status: occ >= r.capacity ? 'Full' : 'Available'
          };
        }
        if (r.id === newRoomId) {
          const updatedBeds = r.beds.map(b => (b.id === newBedId ? { ...b, isOccupied: true, tenantId, tenantName: tenant.name } : b));
          const occ = updatedBeds.filter(b => b.isOccupied).length;
          return {
            ...r,
            beds: updatedBeds,
            occupiedBeds: occ,
            availableBeds: r.capacity - occ,
            status: occ >= r.capacity ? 'Full' : 'Available'
          };
        }
        return r;
      })
    );

    // 3. Update tenant
    setTenants(prev =>
      prev.map(t => {
        if (t.id === tenantId) {
          return {
            ...t,
            propertyId: newPropertyId,
            propertyName: newProperty?.name,
            roomId: newRoomId,
            roomNumber: newRoom?.roomNumber,
            bedId: newBedId,
            bedCode: targetBed?.bedCode,
            monthlyRent: targetBed?.monthlyRent || t.monthlyRent,
            updatedAt: now
          };
        }
        return t;
      })
    );
  }, [tenants, properties, rooms]);

  const vacateTenant = useCallback((tenantId: string, moveOutDate: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    const now = new Date().toISOString();

    // Free bed
    setRooms(prevRooms =>
      prevRooms.map(r => {
        if (r.id === tenant.roomId) {
          const freedBeds = r.beds.map(b => (b.id === tenant.bedId ? { ...b, isOccupied: false, tenantId: undefined, tenantName: undefined } : b));
          const occ = freedBeds.filter(b => b.isOccupied).length;
          return {
            ...r,
            beds: freedBeds,
            occupiedBeds: occ,
            availableBeds: r.capacity - occ,
            status: occ >= r.capacity ? 'Full' : 'Available'
          };
        }
        return r;
      })
    );

    // Update tenant status
    setTenants(prev =>
      prev.map(t => (t.id === tenantId ? { ...t, status: 'Moved Out', moveOutDate, updatedAt: now } : t))
    );
  }, [tenants]);

  // Payment handlers
  const recordPayment = useCallback((paymentData: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt' | 'receiptNumber'>) => {
    const now = new Date().toISOString();
    const receiptNum = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: PaymentRecord = {
      ...paymentData,
      id: generateId('pay'),
      receiptNumber: receiptNum,
      createdAt: now,
      updatedAt: now
    };

    setPayments(prev => [newPayment, ...prev]);

    // Update tenant's balance & rent status
    setTenants(prev =>
      prev.map(t => {
        if (t.id === paymentData.tenantId) {
          const newBalance = Math.max(0, paymentData.balanceDue);
          return {
            ...t,
            outstandingBalance: newBalance,
            rentStatus: newBalance === 0 ? 'Paid' : 'Pending',
            updatedAt: now
          };
        }
        return t;
      })
    );

    return newPayment;
  }, []);

  const updatePayment = useCallback((id: string, updates: Partial<PaymentRecord>) => {
    setPayments(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  }, []);

  // Expense handlers
  const addExpense = useCallback((expData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newExp: Expense = {
      ...expData,
      id: generateId('exp'),
      createdAt: now,
      updatedAt: now
    };
    setExpenses(prev => [newExp, ...prev]);
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  // Complaint handlers
  const createComplaint = useCallback((complaintData: Omit<Complaint, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'internalNotes'>) => {
    const now = new Date().toISOString();
    const ticketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newComplaint: Complaint = {
      ...complaintData,
      id: generateId('cmp'),
      ticketNumber,
      internalNotes: [],
      createdAt: now,
      updatedAt: now
    };
    setComplaints(prev => [newComplaint, ...prev]);
  }, []);

  const updateComplaint = useCallback((id: string, updates: Partial<Complaint>) => {
    setComplaints(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  }, []);

  const addComplaintNote = useCallback((complaintId: string, noteText: string, authorName: string = 'Rajesh Sharma (Owner)') => {
    const newNote: ComplaintNote = {
      id: generateId('note'),
      author: authorName,
      note: noteText,
      createdAt: new Date().toISOString()
    };
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            internalNotes: [...c.internalNotes, newNote],
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );
  }, []);

  // Staff handlers
  const addStaff = useCallback((staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newStaff: StaffMember = {
      ...staffData,
      id: generateId('stf'),
      assignedTaskCount: 0,
      createdAt: now,
      updatedAt: now
    };
    setStaff(prev => [newStaff, ...prev]);
  }, []);

  const updateStaff = useCallback((id: string, updates: Partial<StaffMember>) => {
    setStaff(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
    );
  }, []);

  const deleteStaff = useCallback((id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  }, []);

  // Owner profile
  const updateOwnerProfile = useCallback((updates: Partial<OwnerProfile>) => {
    setOwnerProfile(prev => ({ ...prev, ...updates }));
    authUpdateProfile(updates);
  }, [authUpdateProfile]);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Clear all data to fresh empty slate
  const clearAllData = useCallback(() => {
    if (!currentOwner) return;
    storageService.clearAll(currentOwner.id);
    setProperties([]);
    setRooms([]);
    setTenants([]);
    setPayments([]);
    setExpenses([]);
    setComplaints([]);
    setStaff([]);
    setNotifications([]);
    setSelectedPropertyId('all');
  }, [currentOwner]);

  // Load sample demo data on demand
  const loadSampleData = useCallback(() => {
    if (!currentOwner) return;
    storageService.loadDemoData(currentOwner.id);
    setProperties(storageService.getProperties(currentOwner.id));
    setRooms(storageService.getRooms(currentOwner.id));
    setTenants(storageService.getTenants(currentOwner.id));
    setPayments(storageService.getPayments(currentOwner.id));
    setExpenses(storageService.getExpenses(currentOwner.id));
    setComplaints(storageService.getComplaints(currentOwner.id));
    setStaff(storageService.getStaff(currentOwner.id));
    setOwnerProfile(storageService.getOwnerProfile(currentOwner.id));
    setNotifications(storageService.getNotifications(currentOwner.id));
    setSelectedPropertyId('all');
  }, [currentOwner]);

  const resetDemoData = clearAllData;

  const value: AppContextValue = {
    selectedPropertyId,
    setSelectedPropertyId,
    globalSearch,
    setGlobalSearch,
    properties,
    rooms,
    tenants,
    payments,
    expenses,
    complaints,
    staff,
    ownerProfile,
    notifications,
    unreadNotifCount,
    filteredProperties,
    filteredRooms,
    filteredTenants,
    filteredPayments,
    filteredExpenses,
    filteredComplaints,
    filteredStaff,
    addProperty,
    updateProperty,
    deleteProperty,
    addRoom,
    updateRoom,
    deleteRoom,
    addTenant,
    updateTenant,
    transferTenantBed,
    vacateTenant,
    recordPayment,
    updatePayment,
    addExpense,
    updateExpense,
    deleteExpense,
    createComplaint,
    updateComplaint,
    addComplaintNote,
    addStaff,
    updateStaff,
    deleteStaff,
    updateOwnerProfile,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllData,
    loadSampleData,
    resetDemoData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
