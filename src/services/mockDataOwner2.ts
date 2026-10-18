import { Property } from '../types/property';
import { Room } from '../types/room';
import { Tenant } from '../types/tenant';
import { PaymentRecord } from '../types/payment';
import { Expense } from '../types/expense';
import { Complaint } from '../types/complaint';
import { StaffMember } from '../types/staff';
import { OwnerProfile, NotificationItem } from '../types/common';

// ==========================================
// OWNER 2: PRIYA SUNDARAM (Blossom Living)
// ==========================================

export const PRIYA_OWNER_PROFILE: OwnerProfile = {
  id: 'usr_owner_02',
  name: 'Priya Sundaram',
  email: 'priya.sundaram@staynest.in',
  phone: '9886011223',
  password: 'owner123',
  role: 'owner',
  businessName: 'Blossom Living PGs & Hostels',
  panNumber: 'BZXPS5678K',
  gstNumber: '29BZXPS5678K1Z3',
  address: '#12, 100 Feet Road, Indiranagar, Bengaluru, Karnataka - 560038',
  tagline: 'Premium boutique Ladies and Co-living residences across East Bengaluru',
  defaultCurrency: 'INR',
  defaultRentDueDay: 1,
  gracePeriodDays: 3,
  defaultSecurityDepositMonths: 2,
  notifications: {
    whatsappReminders: true,
    smsAlerts: true,
    emailMonthlyReports: true
  }
};

export const PRIYA_PROPERTIES: Property[] = [
  {
    id: 'prop_priya_01',
    name: 'Blossom Ladies Luxury PG - Indiranagar',
    type: 'Ladies',
    address: '24, 12th Main, HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560038',
    contactPhone: '9886011223',
    contactEmail: 'indiranagar@blossomliving.in',
    numberOfFloors: 4,
    totalRooms: 4,
    totalBeds: 9,
    amenities: [
      'High-Speed Wi-Fi',
      'Air Conditioning',
      'Daily Housekeeping',
      '3-Time Homestyle Food',
      'Geyser / Hot Water',
      'Washing Machine',
      '24x7 Power Backup',
      'CCTV Surveillance',
      'Biometric Access'
    ],
    description: 'Safe, premium boutique Ladies PG located in peaceful HAL 2nd Stage Indiranagar. Walking distance to Metro station and 100 Feet Road.',
    status: 'Active',
    managerName: 'Kavitha Murthy',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-10-10T10:00:00Z'
  },
  {
    id: 'prop_priya_02',
    name: 'Blossom Executive Coliving - HSR Layout',
    type: 'Co-living',
    address: '89, 27th Main, Sector 1, HSR Layout',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560102',
    contactPhone: '9886022334',
    contactEmail: 'hsr@blossomliving.in',
    numberOfFloors: 3,
    totalRooms: 3,
    totalBeds: 6,
    amenities: [
      'High-Speed Wi-Fi',
      'Air Conditioning',
      'Daily Housekeeping',
      'Geyser / Hot Water',
      'Washing Machine',
      '24x7 Power Backup',
      'CCTV Surveillance',
      'RO Purified Water'
    ],
    description: 'High-end co-living facility designed for tech entrepreneurs and working professionals with ergonomic work pods and high-speed fiber.',
    status: 'Active',
    managerName: 'Arun Kulkarni',
    createdAt: '2026-03-15T11:00:00Z',
    updatedAt: '2026-10-12T12:00:00Z'
  }
];

export const PRIYA_ROOMS: Room[] = [
  // Indiranagar Rooms
  {
    id: 'room_priya_101',
    roomNumber: '101',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    floor: 1,
    type: 'Single',
    capacity: 1,
    occupiedBeds: 1,
    availableBeds: 0,
    rentPerBed: 21000,
    status: 'Full',
    amenities: ['Attached Bathroom', 'Balcony', 'AC', 'Wardrobe', 'Study Table'],
    beds: [
      { id: 'bed_p101_A', roomId: 'room_priya_101', bedCode: 'Bed A', isOccupied: true, tenantId: 'tnt_p01', tenantName: 'Ananya Iyer', monthlyRent: 21000 }
    ],
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'room_priya_102',
    roomNumber: '102',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    floor: 1,
    type: 'Double',
    capacity: 2,
    occupiedBeds: 2,
    availableBeds: 0,
    rentPerBed: 14500,
    status: 'Full',
    amenities: ['Attached Bathroom', 'AC', 'Wardrobe', 'Study Table'],
    beds: [
      { id: 'bed_p102_A', roomId: 'room_priya_102', bedCode: 'Bed A', isOccupied: true, tenantId: 'tnt_p02', tenantName: 'Sneha Reddy', monthlyRent: 14500 },
      { id: 'bed_p102_B', roomId: 'room_priya_102', bedCode: 'Bed B', isOccupied: true, tenantId: 'tnt_p03', tenantName: 'Pooja Deshmukh', monthlyRent: 14500 }
    ],
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'room_priya_201',
    roomNumber: '201',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    floor: 2,
    type: 'Triple',
    capacity: 3,
    occupiedBeds: 2,
    availableBeds: 1,
    rentPerBed: 11000,
    status: 'Available',
    amenities: ['Attached Bathroom', 'Balcony', 'Wardrobe'],
    beds: [
      { id: 'bed_p201_A', roomId: 'room_priya_201', bedCode: 'Bed A', isOccupied: true, tenantId: 'tnt_p04', tenantName: 'Divya Rao', monthlyRent: 11000 },
      { id: 'bed_p201_B', roomId: 'room_priya_201', bedCode: 'Bed B', isOccupied: true, tenantId: 'tnt_p05', tenantName: 'Meera Nair', monthlyRent: 11000 },
      { id: 'bed_p201_C', roomId: 'room_priya_201', bedCode: 'Bed C', isOccupied: false, monthlyRent: 11000 }
    ],
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'room_priya_202',
    roomNumber: '202',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    floor: 2,
    type: 'Triple',
    capacity: 3,
    occupiedBeds: 1,
    availableBeds: 2,
    rentPerBed: 11000,
    status: 'Available',
    amenities: ['Attached Bathroom', 'Wardrobe'],
    beds: [
      { id: 'bed_p202_A', roomId: 'room_priya_202', bedCode: 'Bed A', isOccupied: true, tenantId: 'tnt_p06', tenantName: 'Tanvi Joshi', monthlyRent: 11000 },
      { id: 'bed_p202_B', roomId: 'room_priya_202', bedCode: 'Bed B', isOccupied: false, monthlyRent: 11000 },
      { id: 'bed_p202_C', roomId: 'room_priya_202', bedCode: 'Bed C', isOccupied: false, monthlyRent: 11000 }
    ],
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },

  // HSR Layout Rooms
  {
    id: 'room_priya_hsr_101',
    roomNumber: '101',
    propertyId: 'prop_priya_02',
    propertyName: 'Blossom Executive Coliving - HSR Layout',
    floor: 1,
    type: 'Double',
    capacity: 2,
    occupiedBeds: 2,
    availableBeds: 0,
    rentPerBed: 16000,
    status: 'Full',
    amenities: ['Attached Bathroom', 'AC', 'Wardrobe', 'Study Table'],
    beds: [
      { id: 'bed_phsr_101_A', roomId: 'room_priya_hsr_101', bedCode: 'Bed A', isOccupied: true, tenantId: 'tnt_p07', tenantName: 'Nisha Pillai', monthlyRent: 16000 },
      { id: 'bed_phsr_101_B', roomId: 'room_priya_hsr_101', bedCode: 'Bed B', isOccupied: true, tenantId: 'tnt_p08', tenantName: 'Kirti Singhania', monthlyRent: 16000 }
    ],
    createdAt: '2026-03-15T11:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'room_priya_hsr_102',
    roomNumber: '102',
    propertyId: 'prop_priya_02',
    propertyName: 'Blossom Executive Coliving - HSR Layout',
    floor: 1,
    type: 'Double',
    capacity: 2,
    occupiedBeds: 1,
    availableBeds: 1,
    rentPerBed: 16000,
    status: 'Available',
    amenities: ['Attached Bathroom', 'AC', 'Wardrobe'],
    beds: [
      { id: 'bed_phsr_102_A', roomId: 'room_priya_hsr_102', bedCode: 'Bed A', isOccupied: true, tenantId: 'tnt_p09', tenantName: 'Ritu Sen', monthlyRent: 16000 },
      { id: 'bed_phsr_102_B', roomId: 'room_priya_hsr_102', bedCode: 'Bed B', isOccupied: false, monthlyRent: 16000 }
    ],
    createdAt: '2026-03-15T11:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  }
];

export const PRIYA_TENANTS: Tenant[] = [
  {
    id: 'tnt_p01',
    name: 'Ananya Iyer',
    phone: '9845011991',
    email: 'ananya.iyer@gmail.com',
    gender: 'Female',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    roomId: 'room_priya_101',
    roomNumber: '101',
    bedId: 'bed_p101_A',
    bedCode: 'Bed A',
    moveInDate: '2026-02-10',
    agreementStartDate: '2026-02-10',
    agreementEndDate: '2027-02-09',
    monthlyRent: 21000,
    securityDeposit: 42000,
    rentDueDay: 1,
    status: 'Active',
    rentStatus: 'Paid',
    outstandingBalance: 0,
    idProofType: 'Aadhaar',
    idProofNumber: '7890-1234-5678',
    workplaceOrCollege: 'Google India (RMZ Infinity)',
    emergencyContact: {
      name: 'Ramaswamy Iyer',
      relationship: 'Father',
      phone: '9845099881'
    },
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'tnt_p02',
    name: 'Sneha Reddy',
    phone: '9845022882',
    email: 'sneha.reddy@outlook.com',
    gender: 'Female',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    roomId: 'room_priya_102',
    roomNumber: '102',
    bedId: 'bed_p102_A',
    bedCode: 'Bed A',
    moveInDate: '2026-03-01',
    agreementStartDate: '2026-03-01',
    agreementEndDate: '2027-02-28',
    monthlyRent: 14500,
    securityDeposit: 29000,
    rentDueDay: 1,
    status: 'Active',
    rentStatus: 'Paid',
    outstandingBalance: 0,
    idProofType: 'Aadhaar',
    idProofNumber: '6543-2109-8765',
    workplaceOrCollege: 'Flipkart Internet Pvt Ltd',
    emergencyContact: {
      name: 'Venkata Reddy',
      relationship: 'Father',
      phone: '9845088772'
    },
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'tnt_p03',
    name: 'Pooja Deshmukh',
    phone: '9845033773',
    email: 'pooja.deshmukh@gmail.com',
    gender: 'Female',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    roomId: 'room_priya_102',
    roomNumber: '102',
    bedId: 'bed_p102_B',
    bedCode: 'Bed B',
    moveInDate: '2026-03-15',
    agreementStartDate: '2026-03-15',
    agreementEndDate: '2027-03-14',
    monthlyRent: 14500,
    securityDeposit: 29000,
    rentDueDay: 1,
    status: 'Active',
    rentStatus: 'Pending',
    outstandingBalance: 14500,
    idProofType: 'Aadhaar',
    idProofNumber: '5432-1098-7654',
    workplaceOrCollege: 'Swiggy',
    emergencyContact: {
      name: 'Sanjay Deshmukh',
      relationship: 'Father',
      phone: '9845077663'
    },
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-10-05T10:00:00Z'
  },
  {
    id: 'tnt_p04',
    name: 'Divya Rao',
    phone: '9845044664',
    email: 'divya.rao@gmail.com',
    gender: 'Female',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    roomId: 'room_priya_201',
    roomNumber: '201',
    bedId: 'bed_p201_A',
    bedCode: 'Bed A',
    moveInDate: '2026-04-01',
    agreementStartDate: '2026-04-01',
    agreementEndDate: '2027-03-31',
    monthlyRent: 11000,
    securityDeposit: 22000,
    rentDueDay: 1,
    status: 'Active',
    rentStatus: 'Paid',
    outstandingBalance: 0,
    idProofType: 'Passport',
    idProofNumber: 'P7891234',
    workplaceOrCollege: 'National Institute of Design (NID)',
    emergencyContact: {
      name: 'Geetha Rao',
      relationship: 'Mother',
      phone: '9845066554'
    },
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'tnt_p05',
    name: 'Meera Nair',
    phone: '9845055555',
    email: 'meera.nair@accenture.com',
    gender: 'Female',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    roomId: 'room_priya_201',
    roomNumber: '201',
    bedId: 'bed_p201_B',
    bedCode: 'Bed B',
    moveInDate: '2026-04-10',
    agreementStartDate: '2026-04-10',
    agreementEndDate: '2027-04-09',
    monthlyRent: 11000,
    securityDeposit: 22000,
    rentDueDay: 1,
    status: 'Active',
    rentStatus: 'Paid',
    outstandingBalance: 0,
    idProofType: 'Aadhaar',
    idProofNumber: '4321-0987-6543',
    workplaceOrCollege: 'Accenture Solutions',
    emergencyContact: {
      name: 'Kishore Nair',
      relationship: 'Father',
      phone: '9845055443'
    },
    createdAt: '2026-04-10T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'tnt_p06',
    name: 'Tanvi Joshi',
    phone: '9845066446',
    email: 'tanvi.joshi@amazon.com',
    gender: 'Female',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    roomId: 'room_priya_202',
    roomNumber: '202',
    bedId: 'bed_p202_A',
    bedCode: 'Bed A',
    moveInDate: '2026-05-01',
    agreementStartDate: '2026-05-01',
    agreementEndDate: '2027-04-30',
    monthlyRent: 11000,
    securityDeposit: 22000,
    rentDueDay: 1,
    status: 'Active',
    rentStatus: 'Overdue',
    outstandingBalance: 11000,
    idProofType: 'Aadhaar',
    idProofNumber: '3210-9876-5432',
    workplaceOrCollege: 'Amazon Development Centre',
    emergencyContact: {
      name: 'Sunil Joshi',
      relationship: 'Father',
      phone: '9845044332'
    },
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-10-08T10:00:00Z'
  },
  {
    id: 'tnt_p07',
    name: 'Nisha Pillai',
    phone: '9845077337',
    email: 'nisha.pillai@oracle.com',
    gender: 'Female',
    propertyId: 'prop_priya_02',
    propertyName: 'Blossom Executive Coliving - HSR Layout',
    roomId: 'room_priya_hsr_101',
    roomNumber: '101',
    bedId: 'bed_phsr_101_A',
    bedCode: 'Bed A',
    moveInDate: '2026-05-15',
    agreementStartDate: '2026-05-15',
    agreementEndDate: '2027-05-14',
    monthlyRent: 16000,
    securityDeposit: 32000,
    rentDueDay: 1,
    status: 'Active',
    rentStatus: 'Paid',
    outstandingBalance: 0,
    idProofType: 'Aadhaar',
    idProofNumber: '2109-8765-4321',
    workplaceOrCollege: 'Oracle India',
    emergencyContact: {
      name: 'Gopinath Pillai',
      relationship: 'Father',
      phone: '9845033221'
    },
    createdAt: '2026-05-15T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'tnt_p08',
    name: 'Kirti Singhania',
    phone: '9845088228',
    email: 'kirti.singhania@goldmansachs.com',
    gender: 'Female',
    propertyId: 'prop_priya_02',
    propertyName: 'Blossom Executive Coliving - HSR Layout',
    roomId: 'room_priya_hsr_101',
    roomNumber: '101',
    bedId: 'bed_phsr_101_B',
    bedCode: 'Bed B',
    moveInDate: '2026-06-01',
    agreementStartDate: '2026-06-01',
    agreementEndDate: '2027-05-31',
    monthlyRent: 16000,
    securityDeposit: 32000,
    rentDueDay: 1,
    status: 'Active',
    rentStatus: 'Paid',
    outstandingBalance: 0,
    idProofType: 'PAN',
    idProofNumber: 'BKFPS1298H',
    workplaceOrCollege: 'Goldman Sachs Services',
    emergencyContact: {
      name: 'Anand Singhania',
      relationship: 'Father',
      phone: '9845022110'
    },
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'tnt_p09',
    name: 'Ritu Sen',
    phone: '9845099119',
    email: 'ritu.sen@deloitte.com',
    gender: 'Female',
    propertyId: 'prop_priya_02',
    propertyName: 'Blossom Executive Coliving - HSR Layout',
    roomId: 'room_priya_hsr_102',
    roomNumber: '102',
    bedId: 'bed_phsr_102_A',
    bedCode: 'Bed A',
    moveInDate: '2026-06-15',
    agreementStartDate: '2026-06-15',
    agreementEndDate: '2027-06-14',
    monthlyRent: 16000,
    securityDeposit: 32000,
    rentDueDay: 1,
    status: 'Active',
    rentStatus: 'Paid',
    outstandingBalance: 0,
    idProofType: 'Aadhaar',
    idProofNumber: '1098-7654-3210',
    workplaceOrCollege: 'Deloitte USI',
    emergencyContact: {
      name: 'Dipankar Sen',
      relationship: 'Father',
      phone: '9845011009'
    },
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  }
];

export const PRIYA_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay_priya_01',
    receiptNumber: 'REC-2026-10-901',
    tenantId: 'tnt_p01',
    tenantName: 'Ananya Iyer',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    roomId: 'room_priya_101',
    roomNumber: '101',
    billingMonth: 'October 2026',
    baseRent: 21000,
    lateFee: 0,
    discount: 0,
    totalDue: 21000,
    amountPaid: 21000,
    balanceDue: 0,
    paymentDate: '2026-10-01',
    dueDate: '2026-10-01',
    paymentMethod: 'UPI',
    transactionRef: 'UPI/BLOSSOM/OCT01/99281',
    status: 'Paid',
    notes: 'Paid on the 1st via Google Pay',
    createdAt: '2026-10-01T09:30:00Z',
    updatedAt: '2026-10-01T09:30:00Z'
  },
  {
    id: 'pay_priya_02',
    receiptNumber: 'REC-2026-10-902',
    tenantId: 'tnt_p02',
    tenantName: 'Sneha Reddy',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    roomId: 'room_priya_102',
    roomNumber: '102',
    billingMonth: 'October 2026',
    baseRent: 14500,
    lateFee: 0,
    discount: 0,
    totalDue: 14500,
    amountPaid: 14500,
    balanceDue: 0,
    paymentDate: '2026-10-02',
    dueDate: '2026-10-01',
    paymentMethod: 'UPI',
    transactionRef: 'UPI/BLOSSOM/OCT02/10482',
    status: 'Paid',
    notes: 'Monthly rent for October',
    createdAt: '2026-10-02T11:15:00Z',
    updatedAt: '2026-10-02T11:15:00Z'
  },
  {
    id: 'pay_priya_03',
    receiptNumber: 'REC-2026-10-903',
    tenantId: 'tnt_p07',
    tenantName: 'Nisha Pillai',
    propertyId: 'prop_priya_02',
    propertyName: 'Blossom Executive Coliving - HSR Layout',
    roomId: 'room_priya_hsr_101',
    roomNumber: '101',
    billingMonth: 'October 2026',
    baseRent: 16000,
    lateFee: 0,
    discount: 0,
    totalDue: 16000,
    amountPaid: 16000,
    balanceDue: 0,
    paymentDate: '2026-10-03',
    dueDate: '2026-10-01',
    paymentMethod: 'Bank Transfer',
    transactionRef: 'NEFT/HDFC/20261003/991',
    status: 'Paid',
    notes: 'HDFC NetBanking transfer',
    createdAt: '2026-10-03T14:00:00Z',
    updatedAt: '2026-10-03T14:00:00Z'
  },
  {
    id: 'pay_priya_04',
    receiptNumber: 'REC-2026-10-904',
    tenantId: 'tnt_p06',
    tenantName: 'Tanvi Joshi',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    roomId: 'room_priya_202',
    roomNumber: '202',
    billingMonth: 'October 2026',
    baseRent: 11000,
    lateFee: 0,
    discount: 0,
    totalDue: 11000,
    amountPaid: 0,
    balanceDue: 11000,
    paymentDate: '',
    dueDate: '2026-10-01',
    paymentMethod: 'UPI',
    transactionRef: '',
    status: 'Overdue',
    notes: 'Reminder sent via WhatsApp',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-08T00:00:00Z'
  }
];

export const PRIYA_EXPENSES: Expense[] = [
  {
    id: 'exp_priya_01',
    title: 'Weekly Kitchen Provisions & Groceries',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    category: 'Food and groceries',
    amount: 32000,
    expenseDate: '2026-10-04',
    paymentMethod: 'Bank Transfer',
    vendor: 'Sri Krishna Provisions & Organic Store',
    notes: 'Weekly kitchen rations, dairy, and breakfast supplies',
    createdAt: '2026-10-04T10:00:00Z',
    updatedAt: '2026-10-04T10:00:00Z'
  },
  {
    id: 'exp_priya_02',
    title: 'BESCOM Electricity Bill - Indiranagar',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    category: 'Electricity',
    amount: 18450,
    expenseDate: '2026-10-06',
    paymentMethod: 'UPI',
    vendor: 'BESCOM Karnataka',
    notes: 'Electricity bill for Indiranagar property (Consumer #E-48192)',
    createdAt: '2026-10-06T15:00:00Z',
    updatedAt: '2026-10-06T15:00:00Z'
  },
  {
    id: 'exp_priya_03',
    title: 'ACT Fibernet Gigabit Leased Line',
    propertyId: 'prop_priya_02',
    propertyName: 'Blossom Executive Coliving - HSR Layout',
    category: 'Internet',
    amount: 4500,
    expenseDate: '2026-10-05',
    paymentMethod: 'UPI',
    vendor: 'ACT Fibernet Bengaluru',
    notes: 'Gigabit fiber commercial leased line',
    createdAt: '2026-10-05T12:00:00Z',
    updatedAt: '2026-10-05T12:00:00Z'
  }
];

export const PRIYA_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp_priya_01',
    ticketNumber: 'TKT-2081',
    title: 'Bathroom exhaust fan making vibrating noise',
    description: 'The exhaust fan in Room 102 bathroom has started making a loud rattling sound whenever turned on.',
    propertyId: 'prop_priya_01',
    propertyName: 'Blossom Ladies Luxury PG - Indiranagar',
    roomId: 'room_priya_102',
    roomNumber: '102',
    tenantId: 'tnt_p03',
    tenantName: 'Pooja Deshmukh',
    category: 'Electrical',
    priority: 'Medium',
    status: 'In Progress',
    maintenanceCost: 350,
    internalNotes: [
      {
        id: 'note_p01',
        author: 'Priya Sundaram (Owner)',
        note: 'Electrician Raju scheduled to visit Tuesday morning.',
        createdAt: '2026-10-15T11:00:00Z'
      }
    ],
    createdAt: '2026-10-14T09:00:00Z',
    updatedAt: '2026-10-15T11:00:00Z'
  }
];

export const PRIYA_STAFF: StaffMember[] = [
  {
    id: 'stf_priya_01',
    name: 'Kavitha Murthy',
    role: 'Property Manager',
    phone: '9886099112',
    email: 'kavitha@blossomliving.in',
    assignedPropertyIds: ['prop_priya_01'],
    assignedPropertyNames: ['Blossom Ladies Luxury PG - Indiranagar'],
    monthlySalary: 28000,
    joiningDate: '2026-02-01',
    employmentStatus: 'Active',
    responsibilities: 'Overall tenant relations, inventory, and check-ins',
    assignedTaskCount: 2,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'stf_priya_02',
    name: 'Lakshmi Devi',
    role: 'Head Cook',
    phone: '9886099223',
    email: '',
    assignedPropertyIds: ['prop_priya_01'],
    assignedPropertyNames: ['Blossom Ladies Luxury PG - Indiranagar'],
    monthlySalary: 22000,
    joiningDate: '2026-02-01',
    employmentStatus: 'Active',
    responsibilities: 'Homestyle South & North Indian meal preparation',
    assignedTaskCount: 1,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'stf_priya_03',
    name: 'Arun Kulkarni',
    role: 'Property Manager',
    phone: '9886099334',
    email: 'arun@blossomliving.in',
    assignedPropertyIds: ['prop_priya_02'],
    assignedPropertyNames: ['Blossom Executive Coliving - HSR Layout'],
    monthlySalary: 26000,
    joiningDate: '2026-03-15',
    employmentStatus: 'Active',
    responsibilities: 'HSR coliving branch manager and facilities lead',
    assignedTaskCount: 0,
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  }
];

export const PRIYA_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_p01',
    title: 'Rent Overdue Alert',
    message: 'Tanvi Joshi (Room 202) has overdue rent of ₹11,000 for October',
    timestamp: '4 hours ago',
    read: false,
    type: 'payment',
    link: '/payments'
  },
  {
    id: 'notif_p02',
    title: 'Maintenance Update',
    message: 'Electrician assigned to Ticket #TKT-2081 (Room 102 Exhaust)',
    timestamp: 'Yesterday',
    read: true,
    type: 'complaint',
    link: '/maintenance'
  }
];

// ==========================================
// OWNER 3: VIKRAM PATEL (UrbanNest Living)
// ==========================================

export const VIKRAM_OWNER_PROFILE: OwnerProfile = {
  id: 'usr_owner_03',
  name: 'Vikram Patel',
  email: 'vikram.patel@staynest.in',
  phone: '9741088990',
  password: 'owner123',
  role: 'owner',
  businessName: 'UrbanNest Premium Living',
  panNumber: 'CDEVP9876M',
  address: '#88, EPIP Zone, Whitefield, Bengaluru - 560066',
  tagline: 'Modern tech-enabled coliving spaces for Whitefield IT corridors',
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

export const VIKRAM_PROPERTIES: Property[] = [
  {
    id: 'prop_vikram_01',
    name: 'UrbanNest Techies PG - Whitefield',
    type: 'Gents',
    address: 'Plot 44, Near ITPL Main Gate, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560066',
    contactPhone: '9741088990',
    contactEmail: 'whitefield@urbannest.in',
    numberOfFloors: 3,
    totalRooms: 3,
    totalBeds: 6,
    amenities: [
      'High-Speed Wi-Fi',
      'Air Conditioning',
      'Daily Housekeeping',
      'Geyser / Hot Water',
      'Washing Machine',
      '24x7 Power Backup',
      'CCTV Surveillance'
    ],
    description: 'Modern executive PG situated 500m from ITPL Whitefield with ergonomic workstations and high-speed Wi-Fi.',
    status: 'Active',
    managerName: 'Sanjay Rawat',
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  }
];

export const VIKRAM_ROOMS: Room[] = [
  {
    id: 'room_vikram_101',
    roomNumber: '101',
    propertyId: 'prop_vikram_01',
    propertyName: 'UrbanNest Techies PG - Whitefield',
    floor: 1,
    type: 'Double',
    capacity: 2,
    occupiedBeds: 2,
    availableBeds: 0,
    rentPerBed: 15000,
    status: 'Full',
    amenities: ['Attached Bathroom', 'AC', 'Wardrobe', 'Study Table'],
    beds: [
      { id: 'bed_v101_A', roomId: 'room_vikram_101', bedCode: 'Bed A', isOccupied: true, tenantId: 'tnt_v01', tenantName: 'Manish Tiwari', monthlyRent: 15000 },
      { id: 'bed_v101_B', roomId: 'room_vikram_101', bedCode: 'Bed B', isOccupied: true, tenantId: 'tnt_v02', tenantName: 'Saurabh Ganguly', monthlyRent: 15000 }
    ],
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'room_vikram_102',
    roomNumber: '102',
    propertyId: 'prop_vikram_01',
    propertyName: 'UrbanNest Techies PG - Whitefield',
    floor: 1,
    type: 'Double',
    capacity: 2,
    occupiedBeds: 1,
    availableBeds: 1,
    rentPerBed: 15000,
    status: 'Available',
    amenities: ['Attached Bathroom', 'AC', 'Wardrobe'],
    beds: [
      { id: 'bed_v102_A', roomId: 'room_vikram_102', bedCode: 'Bed A', isOccupied: true, tenantId: 'tnt_v03', tenantName: 'Rahul Mehra', monthlyRent: 15000 },
      { id: 'bed_v102_B', roomId: 'room_vikram_102', bedCode: 'Bed B', isOccupied: false, monthlyRent: 15000 }
    ],
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  }
];

export const VIKRAM_TENANTS: Tenant[] = [
  {
    id: 'tnt_v01',
    name: 'Manish Tiwari',
    phone: '9811099221',
    email: 'manish.tiwari@tcs.com',
    gender: 'Male',
    propertyId: 'prop_vikram_01',
    propertyName: 'UrbanNest Techies PG - Whitefield',
    roomId: 'room_vikram_101',
    roomNumber: '101',
    bedId: 'bed_v101_A',
    bedCode: 'Bed A',
    moveInDate: '2026-04-10',
    agreementStartDate: '2026-04-10',
    agreementEndDate: '2027-04-09',
    monthlyRent: 15000,
    securityDeposit: 30000,
    rentDueDay: 5,
    status: 'Active',
    rentStatus: 'Paid',
    outstandingBalance: 0,
    idProofType: 'Aadhaar',
    idProofNumber: '9988-7766-5544',
    workplaceOrCollege: 'Tata Consultancy Services',
    emergencyContact: {
      name: 'Kamal Tiwari',
      relationship: 'Father',
      phone: '9811099000'
    },
    createdAt: '2026-04-10T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'tnt_v02',
    name: 'Saurabh Ganguly',
    phone: '9811088332',
    email: 'saurabh.g@wipro.com',
    gender: 'Male',
    propertyId: 'prop_vikram_01',
    propertyName: 'UrbanNest Techies PG - Whitefield',
    roomId: 'room_vikram_101',
    roomNumber: '101',
    bedId: 'bed_v101_B',
    bedCode: 'Bed B',
    moveInDate: '2026-04-15',
    agreementStartDate: '2026-04-15',
    agreementEndDate: '2027-04-14',
    monthlyRent: 15000,
    securityDeposit: 30000,
    rentDueDay: 5,
    status: 'Active',
    rentStatus: 'Paid',
    outstandingBalance: 0,
    idProofType: 'Aadhaar',
    idProofNumber: '8877-6655-4433',
    workplaceOrCollege: 'Wipro Technologies',
    emergencyContact: {
      name: 'Subir Ganguly',
      relationship: 'Father',
      phone: '9811088000'
    },
    createdAt: '2026-04-15T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'tnt_v03',
    name: 'Rahul Mehra',
    phone: '9811077443',
    email: 'rahul.mehra@sap.com',
    gender: 'Male',
    propertyId: 'prop_vikram_01',
    propertyName: 'UrbanNest Techies PG - Whitefield',
    roomId: 'room_vikram_102',
    roomNumber: '102',
    bedId: 'bed_v102_A',
    bedCode: 'Bed A',
    moveInDate: '2026-05-01',
    agreementStartDate: '2026-05-01',
    agreementEndDate: '2027-04-30',
    monthlyRent: 15000,
    securityDeposit: 30000,
    rentDueDay: 5,
    status: 'Active',
    rentStatus: 'Paid',
    outstandingBalance: 0,
    idProofType: 'Aadhaar',
    idProofNumber: '7766-5544-3322',
    workplaceOrCollege: 'SAP Labs India',
    emergencyContact: {
      name: 'Ashok Mehra',
      relationship: 'Father',
      phone: '9811077000'
    },
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  }
];

export const VIKRAM_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay_vikram_01',
    receiptNumber: 'REC-2026-10-801',
    tenantId: 'tnt_v01',
    tenantName: 'Manish Tiwari',
    propertyId: 'prop_vikram_01',
    propertyName: 'UrbanNest Techies PG - Whitefield',
    roomId: 'room_vikram_101',
    roomNumber: '101',
    billingMonth: 'October 2026',
    baseRent: 15000,
    lateFee: 0,
    discount: 0,
    totalDue: 15000,
    amountPaid: 15000,
    balanceDue: 0,
    paymentDate: '2026-10-03',
    dueDate: '2026-10-05',
    paymentMethod: 'UPI',
    transactionRef: 'UPI/URBANNEST/OCT03/8892',
    status: 'Paid',
    notes: 'Paid via PhonePe',
    createdAt: '2026-10-03T10:00:00Z',
    updatedAt: '2026-10-03T10:00:00Z'
  }
];

export const VIKRAM_EXPENSES: Expense[] = [
  {
    id: 'exp_vikram_01',
    title: 'Airtel Xstream Fiber Leased Connection',
    propertyId: 'prop_vikram_01',
    propertyName: 'UrbanNest Techies PG - Whitefield',
    category: 'Internet',
    amount: 3500,
    expenseDate: '2026-10-05',
    paymentMethod: 'UPI',
    vendor: 'Airtel Xstream Fiber',
    notes: '300 Mbps commercial fiber connection',
    createdAt: '2026-10-05T10:00:00Z',
    updatedAt: '2026-10-05T10:00:00Z'
  }
];

export const VIKRAM_COMPLAINTS: Complaint[] = [];

export const VIKRAM_STAFF: StaffMember[] = [
  {
    id: 'stf_vikram_01',
    name: 'Sanjay Rawat',
    role: 'Property Manager',
    phone: '9741099881',
    email: 'sanjay@urbannest.in',
    assignedPropertyIds: ['prop_vikram_01'],
    assignedPropertyNames: ['UrbanNest Techies PG - Whitefield'],
    monthlySalary: 25000,
    joiningDate: '2026-04-01',
    employmentStatus: 'Active',
    responsibilities: 'Whitefield branch operations and check-ins',
    assignedTaskCount: 0,
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  }
];

export const VIKRAM_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_v01',
    title: 'Rent Collection Received',
    message: '₹15,000 received from Manish Tiwari via UPI',
    timestamp: '3 days ago',
    read: true,
    type: 'payment',
    link: '/payments'
  }
];
