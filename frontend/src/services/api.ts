import {
  User,
  PGOwnerAccount,
  SubscriptionPlan,
  SubscriptionStatus,
  Property,
  Room,
  Bed,
  Resident,
  Payment,
  PaymentMethod,
  Expense,
  StaffMember,
  NotificationItem,
  ActivityLog,
  KpiMetrics,
  ServiceRequest,
  TenantDocument,
} from '../types';
import {
  mockUsers,
  mockPGOwners,
  mockProperties,
  mockRooms,
  mockBeds,
  mockResidents,
  mockPayments,
  mockExpenses,
  mockStaff,
  mockNotifications,
  mockActivityLogs,
  mockServiceRequests,
} from '../mock/mockData';

const STORAGE_KEYS = {
  PG_OWNERS: 'nivaas_pg_owners_v1',
  PROPERTIES: 'nivaas_properties_v1',
  ROOMS: 'nivaas_rooms_v1',
  BEDS: 'nivaas_beds_v1',
  RESIDENTS: 'nivaas_residents_v1',
  PAYMENTS: 'nivaas_payments_v1',
  EXPENSES: 'nivaas_expenses_v1',
  STAFF: 'nivaas_staff_v1',
  NOTIFICATIONS: 'nivaas_notifications_v1',
  ACTIVITY: 'nivaas_activity_v1',
  USERS: 'nivaas_users_v1',
  SERVICE_REQUESTS: 'nivaas_service_requests_v1',
};

// Helper for local storage persistence
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

class NivaasApiService {
  private pgOwners: PGOwnerAccount[];
  private users: User[];
  private properties: Property[];
  private rooms: Room[];
  private beds: Bed[];
  private residents: Resident[];
  private payments: Payment[];
  private expenses: Expense[];
  private staff: StaffMember[];
  private notifications: NotificationItem[];
  private activityLogs: ActivityLog[];
  private serviceRequests: ServiceRequest[];

  constructor() {
    this.pgOwners = loadFromStorage(STORAGE_KEYS.PG_OWNERS, mockPGOwners);
    this.users = loadFromStorage(STORAGE_KEYS.USERS, mockUsers);
    this.properties = loadFromStorage(STORAGE_KEYS.PROPERTIES, mockProperties);
    this.rooms = loadFromStorage(STORAGE_KEYS.ROOMS, mockRooms);
    this.beds = loadFromStorage(STORAGE_KEYS.BEDS, mockBeds);
    this.residents = loadFromStorage(STORAGE_KEYS.RESIDENTS, mockResidents);
    this.payments = loadFromStorage(STORAGE_KEYS.PAYMENTS, mockPayments);
    this.expenses = loadFromStorage(STORAGE_KEYS.EXPENSES, mockExpenses);
    this.staff = loadFromStorage(STORAGE_KEYS.STAFF, mockStaff);
    this.notifications = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, mockNotifications);
    this.activityLogs = loadFromStorage(STORAGE_KEYS.ACTIVITY, mockActivityLogs);
    this.serviceRequests = loadFromStorage(STORAGE_KEYS.SERVICE_REQUESTS, mockServiceRequests);
  }

  public resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PG_OWNERS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.BEDS);
    localStorage.removeItem(STORAGE_KEYS.RESIDENTS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY);
    localStorage.removeItem(STORAGE_KEYS.SERVICE_REQUESTS);

    this.pgOwners = [...mockPGOwners];
    this.users = [...mockUsers];
    this.properties = [...mockProperties];
    this.rooms = [...mockRooms];
    this.beds = [...mockBeds];
    this.residents = [...mockResidents];
    this.payments = [...mockPayments];
    this.expenses = [...mockExpenses];
    this.staff = [...mockStaff];
    this.notifications = [...mockNotifications];
    this.activityLogs = [...mockActivityLogs];
    this.serviceRequests = [...mockServiceRequests];
  }

  // /api/v1/dashboard/summary
  public async getDashboardSummary(propertyId?: string): Promise<{
    metrics: KpiMetrics;
    needsAttention: NotificationItem[];
    recentActivity: ActivityLog[];
    monthlyFinancials: { month: string; revenue: number; expenses: number }[];
    occupancyBreakdown: { propertyName: string; occupied: number; total: number; percentage: number }[];
  }> {
    const activeProperties = propertyId && propertyId !== 'all'
      ? this.properties.filter((p) => p.id === propertyId)
      : this.properties.filter((p) => p.status === 'active');

    const propertyIds = new Set(activeProperties.map((p) => p.id));

    const beds = this.beds.filter((b) => propertyIds.has(b.propertyId));
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
    const vacantBeds = beds.filter((b) => b.status === 'vacant').length;
    const underMaintenanceBeds = beds.filter((b) => b.status === 'maintenance').length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const payments = this.payments.filter((p) => propertyIds.has(p.propertyId));
    const monthlyRevenue = payments
      .filter((p) => p.status === 'paid' || p.status === 'partially_paid')
      .reduce((sum, p) => sum + p.amountPaid, 0);

    const pendingPayments = payments.filter((p) => p.status === 'pending');
    const pendingRentAmount = pendingPayments.reduce((sum, p) => sum + p.balanceDue, 0);

    const overduePayments = payments.filter((p) => p.status === 'overdue');
    const overdueRentAmount = overduePayments.reduce((sum, p) => sum + p.balanceDue, 0);

    const metrics: KpiMetrics = {
      totalProperties: activeProperties.length,
      totalBeds,
      occupiedBeds,
      occupancyRate,
      monthlyRevenue: monthlyRevenue || 324000,
      lastMonthRevenue: 298800,
      revenueGrowthPct: 8.4,
      pendingRentAmount: pendingRentAmount || 48000,
      pendingResidentsCount: pendingPayments.length + 1,
      overdueRentAmount: overdueRentAmount || 16000,
      overdueResidentsCount: overduePayments.length || 1,
      vacantBeds,
      underMaintenanceBeds,
      upcomingMoveIns: 5,
      upcomingMoveOuts: 2,
    };

    const needsAttention = this.notifications.filter(
      (n) => n.priority === 'high' || n.priority === 'medium'
    );

    const recentActivity = this.activityLogs.filter(
      (a) => propertyId === 'all' || !propertyId || a.propertyId === propertyId
    );

    const monthlyFinancials = [
      { month: 'May 26', revenue: 275000, expenses: 142000 },
      { month: 'Jun 26', revenue: 288000, expenses: 151000 },
      { month: 'Jul 26', revenue: 294000, expenses: 148000 },
      { month: 'Aug 26', revenue: 305000, expenses: 159000 },
      { month: 'Sep 26', revenue: 298800, expenses: 154000 },
      { month: 'Oct 26', revenue: 324000, expenses: 165000 },
    ];

    const occupancyBreakdown = activeProperties.map((p) => {
      const pBeds = this.beds.filter((b) => b.propertyId === p.id);
      const pOccupied = pBeds.filter((b) => b.status === 'occupied').length;
      const pct = pBeds.length > 0 ? Math.round((pOccupied / pBeds.length) * 100) : 0;
      return {
        propertyName: p.name,
        occupied: pOccupied,
        total: pBeds.length,
        percentage: pct,
      };
    });

    return {
      metrics,
      needsAttention,
      recentActivity,
      monthlyFinancials,
      occupancyBreakdown,
    };
  }

  // /api/v1/properties
  public async getProperties(): Promise<Property[]> {
    return [...this.properties];
  }

  public async getPropertyById(id: string): Promise<Property | undefined> {
    return this.properties.find((p) => p.id === id);
  }

  public async createProperty(propertyData: Omit<Property, 'id' | 'occupiedBeds' | 'monthlyRevenue'>): Promise<Property> {
    const newProperty: Property = {
      ...propertyData,
      id: `prop_${Date.now()}`,
      occupiedBeds: 0,
      monthlyRevenue: 0,
    };
    this.properties.unshift(newProperty);
    saveToStorage(STORAGE_KEYS.PROPERTIES, this.properties);

    this.logActivity({
      propertyId: newProperty.id,
      propertyName: newProperty.name,
      action: 'Property Created',
      description: `Added new property: ${newProperty.name} (${newProperty.city})`,
      performedBy: 'Current User',
      category: 'system',
    });

    return newProperty;
  }

  public async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const index = this.properties.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Property not found');
    this.properties[index] = { ...this.properties[index], ...updates };
    saveToStorage(STORAGE_KEYS.PROPERTIES, this.properties);
    return this.properties[index];
  }

  public async archiveProperty(id: string): Promise<void> {
    const index = this.properties.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.properties[index].status = 'archived';
      saveToStorage(STORAGE_KEYS.PROPERTIES, this.properties);
    }
  }

  // /api/v1/rooms & beds
  public async getRooms(propertyId?: string): Promise<Room[]> {
    if (propertyId && propertyId !== 'all') {
      return this.rooms.filter((r) => r.propertyId === propertyId);
    }
    return [...this.rooms];
  }

  public async getBeds(propertyId?: string, roomId?: string): Promise<Bed[]> {
    let result = [...this.beds];
    if (propertyId && propertyId !== 'all') {
      result = result.filter((b) => b.propertyId === propertyId);
    }
    if (roomId) {
      result = result.filter((b) => b.roomId === roomId);
    }
    return result;
  }

  public async createRoom(roomData: Omit<Room, 'id' | 'occupiedBeds' | 'status'>): Promise<Room> {
    const newRoom: Room = {
      ...roomData,
      id: `rm_${Date.now()}`,
      occupiedBeds: 0,
      status: 'available',
    };
    this.rooms.push(newRoom);
    saveToStorage(STORAGE_KEYS.ROOMS, this.rooms);

    // Create corresponding beds
    const letters = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < newRoom.totalBeds; i++) {
      const bed: Bed = {
        id: `b_${newRoom.id}_${letters[i]}`,
        roomId: newRoom.id,
        roomNumber: newRoom.roomNumber,
        propertyId: newRoom.propertyId,
        bedNumber: letters[i],
        status: 'vacant',
        monthlyRent: newRoom.baseRentPerBed,
      };
      this.beds.push(bed);
    }
    saveToStorage(STORAGE_KEYS.BEDS, this.beds);

    return newRoom;
  }

  public async allocateBed(bedId: string, residentId: string, residentName: string): Promise<Bed> {
    const bedIndex = this.beds.findIndex((b) => b.id === bedId);
    if (bedIndex === -1) throw new Error('Bed not found');
    if (this.beds[bedIndex].status === 'occupied') {
      throw new Error('This bed is already occupied! Double allocation prevented.');
    }

    this.beds[bedIndex] = {
      ...this.beds[bedIndex],
      status: 'occupied',
      residentId,
      residentName,
    };
    saveToStorage(STORAGE_KEYS.BEDS, this.beds);

    // Update room occupancy
    const roomId = this.beds[bedIndex].roomId;
    const roomBeds = this.beds.filter((b) => b.roomId === roomId);
    const occupied = roomBeds.filter((b) => b.status === 'occupied').length;
    const roomIndex = this.rooms.findIndex((r) => r.id === roomId);
    if (roomIndex !== -1) {
      this.rooms[roomIndex].occupiedBeds = occupied;
      this.rooms[roomIndex].status = occupied >= this.rooms[roomIndex].totalBeds ? 'full' : 'available';
      saveToStorage(STORAGE_KEYS.ROOMS, this.rooms);
    }

    return this.beds[bedIndex];
  }

  // /api/v1/residents
  public async getResidents(propertyId?: string): Promise<Resident[]> {
    if (propertyId && propertyId !== 'all') {
      return this.residents.filter((r) => r.propertyId === propertyId);
    }
    return [...this.residents];
  }

  public async getResidentById(id: string): Promise<Resident | undefined> {
    return this.residents.find((r) => r.id === id);
  }

  public async createResident(residentData: Omit<Resident, 'id'>): Promise<Resident> {
    const newResident: Resident = {
      ...residentData,
      id: `res_${Date.now()}`,
    };
    this.residents.unshift(newResident);
    saveToStorage(STORAGE_KEYS.RESIDENTS, this.residents);

    // If bed allocated, mark bed as occupied
    if (newResident.bedId) {
      await this.allocateBed(newResident.bedId, newResident.id, newResident.name);
    }

    // Auto-create initial security deposit & first month rent payment records
    const initialPayment: Payment = {
      id: `pay_${Date.now()}`,
      residentId: newResident.id,
      residentName: newResident.name,
      propertyId: newResident.propertyId,
      propertyName: newResident.propertyName,
      roomNumber: newResident.roomNumber,
      bedNumber: newResident.bedNumber,
      billingMonth: 'October 2026',
      amountDue: newResident.monthlyRent,
      amountPaid: newResident.paymentStatus === 'paid' ? newResident.monthlyRent : 0,
      balanceDue: newResident.paymentStatus === 'paid' ? 0 : newResident.monthlyRent,
      dueDate: '2026-10-05',
      paidDate: newResident.paymentStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
      paymentMethod: newResident.paymentStatus === 'paid' ? 'upi' : undefined,
      status: newResident.paymentStatus === 'paid' ? 'paid' : 'pending',
      receiptNumber: `NIV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: 'Initial rent on onboarding',
    };
    this.payments.unshift(initialPayment);
    saveToStorage(STORAGE_KEYS.PAYMENTS, this.payments);

    this.logActivity({
      propertyId: newResident.propertyId,
      propertyName: newResident.propertyName,
      action: 'Resident Onboarded',
      description: `Onboarded ${newResident.name} to Room ${newResident.roomNumber}-${newResident.bedNumber}`,
      performedBy: 'Current User',
      category: 'resident',
    });

    return newResident;
  }

  public async updateResident(id: string, updates: Partial<Resident>): Promise<Resident> {
    const index = this.residents.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Resident not found');
    this.residents[index] = { ...this.residents[index], ...updates };
    saveToStorage(STORAGE_KEYS.RESIDENTS, this.residents);
    return this.residents[index];
  }

  public async checkoutResident(
    residentId: string,
    settlementDetails: {
      moveOutDate: string;
      deductions: number;
      refundAmount: number;
      refundMode: PaymentMethod;
      notes: string;
    }
  ): Promise<void> {
    const index = this.residents.findIndex((r) => r.id === residentId);
    if (index === -1) throw new Error('Resident not found');

    const resident = this.residents[index];
    resident.residencyStatus = 'checked_out';
    resident.moveOutDate = settlementDetails.moveOutDate;
    resident.notes = (resident.notes ? resident.notes + ' | ' : '') + `Checked out. Refund: ₹${settlementDetails.refundAmount}. Deductions: ₹${settlementDetails.deductions} (${settlementDetails.notes})`;
    saveToStorage(STORAGE_KEYS.RESIDENTS, this.residents);

    // Free the bed
    if (resident.bedId) {
      const bedIndex = this.beds.findIndex((b) => b.id === resident.bedId);
      if (bedIndex !== -1) {
        this.beds[bedIndex].status = 'vacant';
        this.beds[bedIndex].residentId = undefined;
        this.beds[bedIndex].residentName = undefined;
        saveToStorage(STORAGE_KEYS.BEDS, this.beds);

        // Update room occupancy
        const roomId = this.beds[bedIndex].roomId;
        const roomBeds = this.beds.filter((b) => b.roomId === roomId);
        const occupied = roomBeds.filter((b) => b.status === 'occupied').length;
        const roomIndex = this.rooms.findIndex((r) => r.id === roomId);
        if (roomIndex !== -1) {
          this.rooms[roomIndex].occupiedBeds = occupied;
          this.rooms[roomIndex].status = occupied >= this.rooms[roomIndex].totalBeds ? 'full' : 'available';
          saveToStorage(STORAGE_KEYS.ROOMS, this.rooms);
        }
      }
    }

    this.logActivity({
      propertyId: resident.propertyId,
      propertyName: resident.propertyName,
      action: 'Resident Checked Out',
      description: `Checked out ${resident.name} from Room ${resident.roomNumber}. Refund settled: ₹${settlementDetails.refundAmount}`,
      performedBy: 'Current User',
      category: 'resident',
    });
  }

  // /api/v1/payments
  public async getPayments(propertyId?: string): Promise<Payment[]> {
    if (propertyId && propertyId !== 'all') {
      return this.payments.filter((p) => p.propertyId === propertyId);
    }
    return [...this.payments];
  }

  public async recordPayment(paymentData: {
    residentId: string;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    transactionRef?: string;
    notes?: string;
    paidDate?: string;
  }): Promise<Payment> {
    const resident = this.residents.find((r) => r.id === paymentData.residentId);
    if (!resident) throw new Error('Resident not found');

    const paymentDate = paymentData.paidDate || new Date().toISOString().split('T')[0];
    const isFullPayment = paymentData.amountPaid >= resident.monthlyRent;

    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      residentId: resident.id,
      residentName: resident.name,
      propertyId: resident.propertyId,
      propertyName: resident.propertyName,
      roomNumber: resident.roomNumber,
      bedNumber: resident.bedNumber,
      billingMonth: 'October 2026',
      amountDue: resident.monthlyRent,
      amountPaid: paymentData.amountPaid,
      balanceDue: Math.max(0, resident.monthlyRent - paymentData.amountPaid),
      dueDate: '2026-10-05',
      paidDate: paymentDate,
      paymentMethod: paymentData.paymentMethod,
      transactionRef: paymentData.transactionRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: isFullPayment ? 'paid' : 'partially_paid',
      receiptNumber: `NIV-2026-${Math.floor(2000 + Math.random() * 8000)}`,
      notes: paymentData.notes,
    };

    this.payments.unshift(newPayment);
    saveToStorage(STORAGE_KEYS.PAYMENTS, this.payments);

    // Update resident payment status
    resident.paymentStatus = isFullPayment ? 'paid' : 'pending';
    saveToStorage(STORAGE_KEYS.RESIDENTS, this.residents);

    this.logActivity({
      propertyId: resident.propertyId,
      propertyName: resident.propertyName,
      action: 'Payment Recorded',
      description: `Recorded ₹${paymentData.amountPaid.toLocaleString('en-IN')} via ${paymentData.paymentMethod.toUpperCase()} from ${resident.name}`,
      performedBy: 'Current User',
      category: 'payment',
    });

    return newPayment;
  }

  // /api/v1/expenses
  public async getExpenses(propertyId?: string): Promise<Expense[]> {
    if (propertyId && propertyId !== 'all') {
      return this.expenses.filter((e) => e.propertyId === propertyId);
    }
    return [...this.expenses];
  }

  public async createExpense(expenseData: Omit<Expense, 'id'>): Promise<Expense> {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
    };
    this.expenses.unshift(newExpense);
    saveToStorage(STORAGE_KEYS.EXPENSES, this.expenses);

    this.logActivity({
      propertyId: newExpense.propertyId,
      propertyName: newExpense.propertyName,
      action: 'Expense Added',
      description: `Added expense ₹${newExpense.amount.toLocaleString('en-IN')} for ${newExpense.category} (${newExpense.vendorName})`,
      performedBy: 'Current User',
      category: 'expense',
    });

    return newExpense;
  }

  // /api/v1/staff
  public async getStaff(): Promise<StaffMember[]> {
    return [...this.staff];
  }

  public async inviteStaff(staffData: Omit<StaffMember, 'id' | 'joinedDate' | 'status'>): Promise<StaffMember> {
    const newStaff: StaffMember = {
      ...staffData,
      id: `stf_${Date.now()}`,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    this.staff.unshift(newStaff);
    saveToStorage(STORAGE_KEYS.STAFF, this.staff);

    this.logActivity({
      propertyId: staffData.assignedPropertyIds[0] || 'global',
      propertyName: 'Staff Admin',
      action: 'Staff Invited',
      description: `Invited ${newStaff.name} as ${newStaff.role}`,
      performedBy: 'Owner',
      category: 'system',
    });

    return newStaff;
  }

  public async updateStaffStatus(id: string, status: 'active' | 'inactive'): Promise<StaffMember> {
    const index = this.staff.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Staff member not found');
    this.staff[index].status = status;
    saveToStorage(STORAGE_KEYS.STAFF, this.staff);
    return this.staff[index];
  }

  // Notifications
  public async getNotifications(): Promise<NotificationItem[]> {
    return [...this.notifications];
  }

  public async markNotificationRead(id: string): Promise<void> {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    }
  }

  public async markAllNotificationsRead(): Promise<void> {
    this.notifications.forEach((n) => (n.isRead = true));
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  // User and Platform Owner Account Management
  public async getUsers(): Promise<User[]> {
    return [...this.users];
  }

  public async createPlatformOwnerAccount(ownerData: {
    name: string;
    email: string;
    phone: string;
    businessName: string;
    panNumber?: string;
    city?: string;
    initialPropertyName?: string;
    initialPropertyAddress?: string;
    initialRooms?: number;
  }): Promise<{ user: User; property?: Property }> {
    const newOwner: User = {
      id: `usr_owner_${Date.now()}`,
      name: ownerData.name,
      email: ownerData.email,
      phone: ownerData.phone,
      role: 'owner',
      assignedPropertyIds: [],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      businessName: ownerData.businessName,
      panNumber: ownerData.panNumber || 'ABCDE1234F',
    };

    let createdProp: Property | undefined;
    if (ownerData.initialPropertyName) {
      createdProp = await this.createProperty({
        name: ownerData.initialPropertyName,
        code: `NV-${ownerData.initialPropertyName.substring(0, 3).toUpperCase()}`,
        type: 'co-living',
        address: ownerData.initialPropertyAddress || `${ownerData.initialPropertyName}, 1st Main Road`,
        city: ownerData.city || 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034',
        contactPhone: ownerData.phone,
        contactEmail: ownerData.email,
        managerId: newOwner.id,
        managerName: newOwner.name,
        totalRooms: ownerData.initialRooms || 8,
        totalBeds: (ownerData.initialRooms || 8) * 2,
        status: 'active',
        amenities: ['High-Speed Wi-Fi', 'Power Backup 24x7', 'Daily Housekeeping', 'RO Water'],
        imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80',
        description: `Flagship property for ${ownerData.businessName}`,
      });
      newOwner.assignedPropertyIds = [createdProp.id];
    } else {
      newOwner.assignedPropertyIds = this.properties.map((p) => p.id);
    }

    this.users.unshift(newOwner);
    saveToStorage(STORAGE_KEYS.USERS, this.users);

    this.logActivity({
      propertyId: createdProp?.id || 'global',
      propertyName: createdProp?.name || 'Platform Security',
      action: 'Platform Owner Created',
      description: `Provisioned new Platform Owner Admin account for ${newOwner.name} (${newOwner.businessName})`,
      performedBy: 'System Admin',
      category: 'system',
    });

    return { user: newOwner, property: createdProp };
  }

  // ==========================================
  // Platform Owner Rights: PG Owner Onboarding & Management
  // ==========================================
  public async getPGOwners(): Promise<PGOwnerAccount[]> {
    return [...this.pgOwners];
  }

  public async onboardPGOwner(data: {
    ownerName: string;
    businessName: string;
    email: string;
    phone: string;
    city: string;
    plan: SubscriptionPlan;
    maxProperties: number;
    initialBedsCount?: number;
    gstin?: string;
    panNumber?: string;
  }): Promise<PGOwnerAccount> {
    const feeMap: Record<SubscriptionPlan, number> = {
      starter: 2499,
      growth: 4999,
      enterprise: 9999,
    };

    const newOwnerAccount: PGOwnerAccount = {
      id: `pg_owner_${Date.now()}`,
      ownerName: data.ownerName,
      businessName: data.businessName,
      email: data.email,
      phone: data.phone,
      city: data.city,
      plan: data.plan,
      monthlyFee: feeMap[data.plan] || 4999,
      maxProperties: data.maxProperties || (data.plan === 'starter' ? 2 : data.plan === 'growth' ? 5 : 12),
      propertiesCount: 1,
      totalBedsCount: data.initialBedsCount || 24,
      subscriptionStatus: 'active',
      onboardedDate: new Date().toISOString().split('T')[0],
      gstin: data.gstin,
      panNumber: data.panNumber,
    };

    this.pgOwners.unshift(newOwnerAccount);
    saveToStorage(STORAGE_KEYS.PG_OWNERS, this.pgOwners);

    // Also register user profile for the PG Owner to access their own PG dashboard
    const newUser: User = {
      id: `usr_${newOwnerAccount.id}`,
      name: data.ownerName,
      email: data.email,
      phone: data.phone,
      role: 'pg_owner',
      assignedPropertyIds: [],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      businessName: data.businessName,
      panNumber: data.panNumber,
    };
    this.users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, this.users);

    this.logActivity({
      propertyId: 'global',
      propertyName: 'Platform SaaS',
      action: 'PG Owner Onboarded',
      description: `Platform Owner onboarded ${newOwnerAccount.ownerName} (${newOwnerAccount.businessName}) on ${newOwnerAccount.plan.toUpperCase()} tier`,
      performedBy: 'Platform Owner',
      category: 'system',
    });

    return newOwnerAccount;
  }

  public async updatePGOwnerStatus(
    id: string,
    status: SubscriptionStatus
  ): Promise<PGOwnerAccount> {
    const idx = this.pgOwners.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('PG Owner not found');
    this.pgOwners[idx] = {
      ...this.pgOwners[idx],
      subscriptionStatus: status,
    };
    saveToStorage(STORAGE_KEYS.PG_OWNERS, this.pgOwners);

    this.logActivity({
      propertyId: 'global',
      propertyName: 'Platform SaaS',
      action: 'Subscription Updated',
      description: `Status for ${this.pgOwners[idx].businessName} set to ${status.toUpperCase()}`,
      performedBy: 'Platform Owner',
      category: 'system',
    });

    return this.pgOwners[idx];
  }

  public async getPlatformSummary(): Promise<{
    totalPGOwners: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    suspendedSubscriptions: number;
    totalManagedBeds: number;
    totalProperties: number;
    monthlyRecurringRevenue: number;
    avgRevenuePerPG: number;
    recentOnboardings: PGOwnerAccount[];
  }> {
    const totalPGOwners = this.pgOwners.length;
    const activeSubscriptions = this.pgOwners.filter((o) => o.subscriptionStatus === 'active').length;
    const trialSubscriptions = this.pgOwners.filter((o) => o.subscriptionStatus === 'trial').length;
    const suspendedSubscriptions = this.pgOwners.filter((o) => o.subscriptionStatus === 'suspended').length;
    const totalManagedBeds = this.pgOwners.reduce((sum, o) => sum + (o.totalBedsCount || 0), 0);
    const totalProperties = this.pgOwners.reduce((sum, o) => sum + (o.propertiesCount || 0), 0);
    const monthlyRecurringRevenue = this.pgOwners
      .filter((o) => o.subscriptionStatus === 'active')
      .reduce((sum, o) => sum + (o.monthlyFee || 0), 0);
    const avgRevenuePerPG = activeSubscriptions > 0 ? Math.round(monthlyRecurringRevenue / activeSubscriptions) : 0;

    return {
      totalPGOwners,
      activeSubscriptions,
      trialSubscriptions,
      suspendedSubscriptions,
      totalManagedBeds,
      totalProperties,
      monthlyRecurringRevenue,
      avgRevenuePerPG,
      recentOnboardings: this.pgOwners.slice(0, 5),
    };
  }

  // ==========================================
  // Tenant Portal APIs
  // ==========================================
  public async updateResidentProfile(
    residentId: string,
    updates: Partial<Resident>
  ): Promise<Resident> {
    const idx = this.residents.findIndex((r) => r.id === residentId);
    if (idx === -1) throw new Error('Resident record not found');

    this.residents[idx] = {
      ...this.residents[idx],
      ...updates,
      id: residentId, // prevent ID overwrite
    };
    saveToStorage(STORAGE_KEYS.RESIDENTS, this.residents);

    this.logActivity({
      propertyId: this.residents[idx].propertyId,
      propertyName: this.residents[idx].propertyName,
      action: 'Profile Updated',
      description: `${this.residents[idx].name} updated their resident profile information`,
      performedBy: this.residents[idx].name,
      category: 'resident',
    });

    return this.residents[idx];
  }

  public async uploadResidentDocument(
    residentId: string,
    doc: Omit<TenantDocument, 'id' | 'uploadDate'>
  ): Promise<TenantDocument> {
    const idx = this.residents.findIndex((r) => r.id === residentId);
    if (idx === -1) throw new Error('Resident record not found');

    const newDoc: TenantDocument = {
      ...doc,
      id: `doc_${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'verified',
    };

    const currentDocs = this.residents[idx].documents || [];
    const filteredDocs = currentDocs.filter((d) => d.type !== doc.type);
    filteredDocs.push(newDoc);

    this.residents[idx] = {
      ...this.residents[idx],
      documents: filteredDocs,
      kycStatus: 'verified',
      aadhaarVerified: doc.type.startsWith('aadhaar') ? true : this.residents[idx].aadhaarVerified,
    };
    saveToStorage(STORAGE_KEYS.RESIDENTS, this.residents);

    this.logActivity({
      propertyId: this.residents[idx].propertyId,
      propertyName: this.residents[idx].propertyName,
      action: 'Document Uploaded',
      description: `${this.residents[idx].name} uploaded ${newDoc.name} (${newDoc.type})`,
      performedBy: this.residents[idx].name,
      category: 'resident',
    });

    return newDoc;
  }

  public async getResidentPayments(residentId: string): Promise<Payment[]> {
    return this.payments.filter((p) => p.residentId === residentId);
  }

  public async payRentOnline(data: {
    residentId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    billingMonth: string;
    notes?: string;
    transactionRef?: string;
  }): Promise<Payment> {
    const res = this.residents.find((r) => r.id === data.residentId);
    if (!res) throw new Error('Resident record not found');

    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      residentId: res.id,
      residentName: res.name,
      propertyId: res.propertyId,
      propertyName: res.propertyName,
      roomNumber: res.roomNumber,
      bedNumber: res.bedNumber,
      billingMonth: data.billingMonth,
      amountDue: data.amount,
      amountPaid: data.amount,
      balanceDue: 0,
      paidDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod,
      status: 'paid',
      transactionRef:
        data.transactionRef || `UPI/NIV/${Date.now().toString().slice(-8)}`,
      receiptNumber: `NV-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: data.notes || 'Paid via Nivaas Tenant Portal',
    };

    this.payments.unshift(newPayment);
    saveToStorage(STORAGE_KEYS.PAYMENTS, this.payments);

    // Update resident payment status
    const resIdx = this.residents.findIndex((r) => r.id === data.residentId);
    if (resIdx !== -1) {
      this.residents[resIdx].paymentStatus = 'paid';
      saveToStorage(STORAGE_KEYS.RESIDENTS, this.residents);
    }

    this.logActivity({
      propertyId: res.propertyId,
      propertyName: res.propertyName,
      action: 'Rent Paid Online',
      description: `${res.name} paid ₹${data.amount.toLocaleString('en-IN')} for ${data.billingMonth} via ${data.paymentMethod.toUpperCase()}`,
      performedBy: res.name,
      category: 'payment',
    });

    return newPayment;
  }

  public async getServiceRequests(residentId?: string): Promise<ServiceRequest[]> {
    if (residentId) {
      return this.serviceRequests.filter((s) => s.residentId === residentId);
    }
    return [...this.serviceRequests];
  }

  public async createServiceRequest(
    data: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<ServiceRequest> {
    const newReq: ServiceRequest = {
      ...data,
      id: `sr_${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'open',
    };

    this.serviceRequests.unshift(newReq);
    saveToStorage(STORAGE_KEYS.SERVICE_REQUESTS, this.serviceRequests);

    this.logActivity({
      propertyId: data.propertyId,
      propertyName: data.propertyName,
      action: 'Maintenance Request',
      description: `${data.residentName} raised maintenance request: "${data.title}"`,
      performedBy: data.residentName,
      category: 'system',
    });

    return newReq;
  }

  // Activity Logs
  private logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const newLog: ActivityLog = {
      ...activity,
      id: `act_${Date.now()}`,
      timestamp: 'Just now',
    };
    this.activityLogs.unshift(newLog);
    if (this.activityLogs.length > 50) {
      this.activityLogs.pop();
    }
    saveToStorage(STORAGE_KEYS.ACTIVITY, this.activityLogs);
  }
}

export const api = new NivaasApiService();
