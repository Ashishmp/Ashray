import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Room, RoomType } from '../../../types/room';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Room, 'id' | 'createdAt' | 'updatedAt' | 'occupiedBeds' | 'availableBeds' | 'beds'>) => void;
  initialData?: Room;
}

const ROOM_AMENITIES_LIST = [
  'Attached Bathroom',
  'Air Conditioning',
  'Private Balcony',
  'Individual Wardrobe',
  'Study Table & Chair',
  'Geyser',
  'Smart TV',
  'High-Speed LAN'
];

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const { properties } = useApp();
  const { showToast } = useToast();

  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState<number>(1);
  const [type, setType] = useState<RoomType>('Double');
  const [rentPerBed, setRentPerBed] = useState<number>(12000);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const matchedProp = properties.find(p => p.id === propertyId);
  const maxFloors = Math.max(1, matchedProp?.numberOfFloors || 3);

  // Automatically cap floor if building structure has fewer floors
  useEffect(() => {
    if (floor > maxFloors) {
      setFloor(maxFloors);
    }
  }, [maxFloors, floor]);

  useEffect(() => {
    if (initialData) {
      setPropertyId(initialData.propertyId);
      setRoomNumber(initialData.roomNumber);
      setFloor(initialData.floor);
      setType(initialData.type);
      setRentPerBed(initialData.rentPerBed);
      setAmenities(initialData.amenities || []);
      setNotes(initialData.notes || '');
    } else {
      setPropertyId(properties[0]?.id || '');
      setRoomNumber('');
      setFloor(1);
      setType('Double');
      setRentPerBed(12000);
      setAmenities(['Attached Bathroom', 'Individual Wardrobe', 'Study Table & Chair']);
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen, properties]);

  const getCapacityForType = (t: RoomType): number => {
    switch (t) {
      case 'Single': return 1;
      case 'Double': return 2;
      case 'Triple': return 3;
      case 'Four': return 4;
      default: return 2;
    }
  };

  const toggleAmenity = (item: string) => {
    setAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!propertyId) newErrors.propertyId = 'Please select a property';
    if (!roomNumber.trim()) newErrors.roomNumber = 'Room number is required';
    if (!rentPerBed || rentPerBed <= 0) newErrors.rentPerBed = 'Please enter valid monthly rent';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const matchedProp = properties.find(p => p.id === propertyId);
    const capacity = getCapacityForType(type);

    onSubmit({
      propertyId,
      propertyName: matchedProp?.name || '',
      roomNumber,
      floor: Number(floor) || 1,
      type,
      capacity,
      rentPerBed: Number(rentPerBed),
      status: initialData ? initialData.status : 'Available',
      amenities,
      notes
    });

    showToast(
      initialData ? 'Room Updated' : 'Room Created',
      `Room ${roomNumber} (${type} Sharing) configured with ${capacity} beds.`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Room' : 'Add Room to PG'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          {properties.length > 0 && (
            <Button variant="primary" onClick={handleSubmit} type="button">
              {initialData ? 'Save Changes' : 'Create Room & Bed Slots'}
            </Button>
          )}
        </>
      }
    >
      {properties.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', backgroundColor: 'var(--warning-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning-200)' }}>
          <p style={{ color: 'var(--warning-900)', fontSize: '13.5px', marginBottom: '6px', fontWeight: 700 }}>
            No PG Property Found
          </p>
          <p style={{ color: 'var(--warning-800)', fontSize: '12.5px' }}>
            Please add your PG property first (via 'Add Property') before configuring rooms and bed capacities.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select
            label="PG Property"
            required
            value={propertyId}
            onChange={e => setPropertyId(e.target.value)}
            options={properties.map(p => ({ value: p.id, label: p.name }))}
            error={errors.propertyId}
          />

        <div className="form-row">
          <Input
            label="Room Number / Identifier"
            placeholder="e.g. 101, 204B"
            required
            value={roomNumber}
            onChange={e => setRoomNumber(e.target.value)}
            error={errors.roomNumber}
          />
          <Select
            label={`Floor (${matchedProp?.name || 'Building'} has ${maxFloors} ${maxFloors === 1 ? 'Floor' : 'Floors'})`}
            required
            value={String(floor)}
            onChange={e => setFloor(Number(e.target.value))}
            options={Array.from({ length: maxFloors }, (_, i) => {
              const f = i + 1;
              const suffix = f === 1 ? 'st' : f === 2 ? 'nd' : f === 3 ? 'rd' : 'th';
              return { value: String(f), label: `${f}${suffix} Floor` };
            })}
          />
        </div>

        <div className="form-row">
          <Select
            label="Room Sharing Type"
            required
            value={type}
            onChange={e => setType(e.target.value as RoomType)}
            options={[
              { value: 'Single', label: 'Single Occupancy (1 Bed)' },
              { value: 'Double', label: 'Double Sharing (2 Beds)' },
              { value: 'Triple', label: 'Triple Sharing (3 Beds)' },
              { value: 'Four', label: 'Four Sharing (4 Beds)' }
            ]}
          />
          <Input
            label="Monthly Rent per Bed (₹)"
            type="number"
            placeholder="12000"
            required
            prefixIcon={<span>₹</span>}
            value={rentPerBed}
            onChange={e => setRentPerBed(Number(e.target.value))}
            error={errors.rentPerBed}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Room Amenities</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '8px',
              padding: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--slate-50)'
            }}
          >
            {ROOM_AMENITIES_LIST.map(item => (
              <label
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={amenities.includes(item)}
                  onChange={() => toggleAmenity(item)}
                  style={{ accentColor: 'var(--primary-600)' }}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <input
            className="form-input"
            placeholder="e.g. Corner room with large window, East facing"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </form>
    )}
  </Modal>
  );
};
