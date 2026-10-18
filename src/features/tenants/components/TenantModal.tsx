import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Tenant, TenantStatus } from '../../../types/tenant';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'outstandingBalance' | 'rentStatus'>) => void;
  initialData?: Tenant;
}

export const TenantModal: React.FC<TenantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const { properties, rooms } = useApp();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [roomId, setRoomId] = useState('');
  const [bedId, setBedId] = useState('');
  const [monthlyRent, setMonthlyRent] = useState<number>(12000);
  const [securityDeposit, setSecurityDeposit] = useState<number>(24000);
  const [rentDueDay, setRentDueDay] = useState<number>(5);
  const [moveInDate, setMoveInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [agreementStartDate, setAgreementStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [agreementEndDate, setAgreementEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('Parent');
  const [workplace, setWorkplace] = useState('');
  const [idProofType, setIdProofType] = useState<'Aadhaar' | 'PAN' | 'Passport' | 'Driving License'>('Aadhaar');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [status, setStatus] = useState<TenantStatus>('Active');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter available rooms for selected property
  const availableRooms = rooms.filter(r => r.propertyId === propertyId);
  const selectedRoom = rooms.find(r => r.id === roomId);

  // Available beds for selected room (or currently assigned bed if editing)
  const availableBeds = selectedRoom?.beds.filter(
    b => !b.isOccupied || (initialData && b.id === initialData.bedId)
  ) || [];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setEmail(initialData.email);
      setGender(initialData.gender);
      setPropertyId(initialData.propertyId);
      setRoomId(initialData.roomId);
      setBedId(initialData.bedId);
      setMonthlyRent(initialData.monthlyRent);
      setSecurityDeposit(initialData.securityDeposit);
      setRentDueDay(initialData.rentDueDay);
      setMoveInDate(initialData.moveInDate);
      setAgreementStartDate(initialData.agreementStartDate);
      setAgreementEndDate(initialData.agreementEndDate);
      setEmergencyName(initialData.emergencyContact.name);
      setEmergencyPhone(initialData.emergencyContact.phone);
      setEmergencyRel(initialData.emergencyContact.relationship);
      setWorkplace(initialData.workplaceOrCollege || '');
      setIdProofType(initialData.idProofType || 'Aadhaar');
      setIdProofNumber(initialData.idProofNumber || '');
      setStatus(initialData.status);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setGender('Male');
      const defaultProp = properties[0]?.id || '';
      setPropertyId(defaultProp);
      const firstRoom = rooms.find(r => r.propertyId === defaultProp && r.availableBeds > 0);
      if (firstRoom) {
        setRoomId(firstRoom.id);
        const firstVacantBed = firstRoom.beds.find(b => !b.isOccupied);
        setBedId(firstVacantBed?.id || '');
        setMonthlyRent(firstVacantBed?.monthlyRent || firstRoom.rentPerBed);
        setSecurityDeposit((firstVacantBed?.monthlyRent || firstRoom.rentPerBed) * 2);
      } else {
        setRoomId('');
        setBedId('');
        setMonthlyRent(12000);
        setSecurityDeposit(24000);
      }
      setRentDueDay(5);
      setEmergencyName('');
      setEmergencyPhone('');
      setEmergencyRel('Parent');
      setWorkplace('');
      setIdProofType('Aadhaar');
      setIdProofNumber('');
      setStatus('Active');
    }
    setErrors({});
  }, [initialData, isOpen, properties]);

  // When room changes, select first available bed & update rent
  const handleRoomChange = (newRoomId: string) => {
    setRoomId(newRoomId);
    const room = rooms.find(r => r.id === newRoomId);
    const vacantBed = room?.beds.find(b => !b.isOccupied);
    if (vacantBed) {
      setBedId(vacantBed.id);
      setMonthlyRent(vacantBed.monthlyRent);
      setSecurityDeposit(vacantBed.monthlyRent * 2);
    } else {
      setBedId('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!phone.trim() || phone.length < 10) newErrors.phone = 'Valid 10-digit phone number is required';
    if (!propertyId) newErrors.propertyId = 'Property selection required';
    if (!roomId) newErrors.roomId = 'Room selection required';
    if (!bedId) newErrors.bedId = 'Bed allocation required. Please select an available bed.';
    if (!emergencyName.trim()) newErrors.emergencyName = 'Emergency contact person is required';
    if (!emergencyPhone.trim() || emergencyPhone.length < 10) newErrors.emergencyPhone = 'Emergency phone is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const matchedProp = properties.find(p => p.id === propertyId);
    const matchedRoom = rooms.find(r => r.id === roomId);
    const matchedBed = matchedRoom?.beds.find(b => b.id === bedId);

    onSubmit({
      name,
      phone,
      email,
      gender,
      propertyId,
      propertyName: matchedProp?.name || '',
      roomId,
      roomNumber: matchedRoom?.roomNumber || '',
      bedId,
      bedCode: matchedBed?.bedCode || 'Bed A',
      moveInDate,
      agreementStartDate,
      agreementEndDate,
      monthlyRent: Number(monthlyRent),
      securityDeposit: Number(securityDeposit),
      rentDueDay: Number(rentDueDay) || 5,
      status,
      workplaceOrCollege: workplace,
      idProofType,
      idProofNumber,
      emergencyContact: {
        name: emergencyName,
        relationship: emergencyRel,
        phone: emergencyPhone
      }
    });

    showToast(
      initialData ? 'Tenant Details Updated' : 'Tenant Onboarded',
      `${name} assigned to Room ${matchedRoom?.roomNumber} (${matchedBed?.bedCode}).`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Tenant Information' : 'Register & Onboard New Tenant'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          {properties.length > 0 && rooms.length > 0 && (
            <Button variant="primary" onClick={handleSubmit} type="button">
              {initialData ? 'Save Changes' : 'Confirm & Allocate Bed'}
            </Button>
          )}
        </>
      }
    >
      {properties.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', backgroundColor: 'var(--warning-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning-200)' }}>
          <p style={{ color: 'var(--warning-900)', fontSize: '13.5px', marginBottom: '6px', fontWeight: 700 }}>
            No PG Properties Found
          </p>
          <p style={{ color: 'var(--warning-800)', fontSize: '12.5px' }}>
            Please add a PG property first before registering residents.
          </p>
        </div>
      ) : rooms.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', backgroundColor: 'var(--warning-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning-200)' }}>
          <p style={{ color: 'var(--warning-900)', fontSize: '13.5px', marginBottom: '6px', fontWeight: 700 }}>
            No Rooms Available
          </p>
          <p style={{ color: 'var(--warning-800)', fontSize: '12.5px' }}>
            Please add rooms with bed capacity in the 'Rooms & Beds' tab before allocating beds to residents.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ color: 'var(--primary-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            Personal & Contact Details
          </h4>

        <div className="form-row">
          <Input
            label="Full Name"
            placeholder="e.g. Rohan Verma"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            error={errors.name}
          />
          <Input
            label="Mobile Phone Number"
            placeholder="9845012345"
            required
            prefixIcon={<span>+91</span>}
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            error={errors.phone}
          />
          <Select
            label="Gender"
            value={gender}
            onChange={e => setGender(e.target.value as any)}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </div>

        <div className="form-row">
          <Input
            label="Email Address"
            type="email"
            placeholder="rohan@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            label="Company / College"
            placeholder="e.g. Infosys / Christ University"
            value={workplace}
            onChange={e => setWorkplace(e.target.value)}
          />
        </div>

        <div className="form-row">
          <Select
            label="ID Proof Type"
            value={idProofType}
            onChange={e => setIdProofType(e.target.value as any)}
            options={[
              { value: 'Aadhaar', label: 'Aadhaar Card' },
              { value: 'PAN', label: 'PAN Card' },
              { value: 'Passport', label: 'Passport' },
              { value: 'Driving License', label: 'Driving License' }
            ]}
          />
          <Input
            label="ID Proof Number"
            placeholder="XXXX-XXXX-XXXX"
            value={idProofNumber}
            onChange={e => setIdProofNumber(e.target.value)}
          />
        </div>

        <h4 style={{ color: 'var(--primary-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginTop: '8px' }}>
          Room & Bed Allocation
        </h4>

        <div className="form-row">
          <Select
            label="Assigned Property"
            required
            value={propertyId}
            onChange={e => {
              setPropertyId(e.target.value);
              const firstR = rooms.find(r => r.propertyId === e.target.value && r.availableBeds > 0);
              if (firstR) handleRoomChange(firstR.id);
            }}
            options={properties.map(p => ({ value: p.id, label: p.name }))}
            error={errors.propertyId}
          />
          <Select
            label="Room"
            required
            value={roomId}
            onChange={e => handleRoomChange(e.target.value)}
            options={availableRooms.map(r => ({
              value: r.id,
              label: `Room ${r.roomNumber} (${r.type} Sharing - ${r.availableBeds} beds vacant)`
            }))}
            error={errors.roomId}
          />
          <Select
            label="Bed Slot"
            required
            value={bedId}
            onChange={e => setBedId(e.target.value)}
            options={availableBeds.map(b => ({
              value: b.id,
              label: `${b.bedCode} (${b.isOccupied ? 'Occupied by ' + b.tenantName : 'Available'})`
            }))}
            error={errors.bedId}
          />
        </div>

        <div className="form-row">
          <Input
            label="Monthly Rent (₹)"
            type="number"
            required
            value={monthlyRent}
            onChange={e => setMonthlyRent(Number(e.target.value))}
          />
          <Input
            label="Security Deposit (₹)"
            type="number"
            required
            value={securityDeposit}
            onChange={e => setSecurityDeposit(Number(e.target.value))}
          />
          <Input
            label="Rent Due Day of Month"
            type="number"
            min={1}
            max={28}
            required
            value={rentDueDay}
            onChange={e => setRentDueDay(Number(e.target.value))}
            hint="e.g. 5th of every month"
          />
        </div>

        <div className="form-row">
          <Input
            label="Move-In Date"
            type="date"
            required
            value={moveInDate}
            onChange={e => setMoveInDate(e.target.value)}
          />
          <Input
            label="Agreement Start Date"
            type="date"
            required
            value={agreementStartDate}
            onChange={e => setAgreementStartDate(e.target.value)}
          />
          <Input
            label="Agreement End Date"
            type="date"
            required
            value={agreementEndDate}
            onChange={e => setAgreementEndDate(e.target.value)}
          />
        </div>

        <h4 style={{ color: 'var(--primary-700)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginTop: '8px' }}>
          Emergency Contact Verification
        </h4>

        <div className="form-row">
          <Input
            label="Contact Person Name"
            placeholder="e.g. Father / Mother / Guardian"
            required
            value={emergencyName}
            onChange={e => setEmergencyName(e.target.value)}
            error={errors.emergencyName}
          />
          <Input
            label="Emergency Contact Phone"
            placeholder="9845099887"
            required
            prefixIcon={<span>+91</span>}
            value={emergencyPhone}
            onChange={e => setEmergencyPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            error={errors.emergencyPhone}
          />
          <Select
            label="Relationship"
            value={emergencyRel}
            onChange={e => setEmergencyRel(e.target.value)}
            options={[
              { value: 'Father', label: 'Father' },
              { value: 'Mother', label: 'Mother' },
              { value: 'Sibling', label: 'Brother / Sister' },
              { value: 'Guardian', label: 'Local Guardian' },
              { value: 'Spouse', label: 'Spouse' }
            ]}
          />
        </div>
      </form>
    )}
  </Modal>
  );
};
