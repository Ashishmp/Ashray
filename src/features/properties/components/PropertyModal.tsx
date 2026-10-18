import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Property, PropertyType, COMMON_AMENITIES } from '../../../types/property';
import { useToast } from '../../../context/ToastContext';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Property;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [type, setType] = useState<PropertyType>('Gents');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pinCode, setPinCode] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [numberOfFloors, setNumberOfFloors] = useState<number>(3);
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setAddress(initialData.address);
      setCity(initialData.city);
      setState(initialData.state);
      setPinCode(initialData.pinCode);
      setContactPhone(initialData.contactPhone);
      setContactEmail(initialData.contactEmail || '');
      setNumberOfFloors(initialData.numberOfFloors);
      setDescription(initialData.description || '');
      setAmenities(initialData.amenities || []);
    } else {
      setName('');
      setType('Gents');
      setAddress('');
      setCity('Bengaluru');
      setState('Karnataka');
      setPinCode('');
      setContactPhone('');
      setContactEmail('');
      setNumberOfFloors(3);
      setDescription('');
      setAmenities([
        'High-Speed Wi-Fi',
        'Daily Housekeeping',
        '3-Time Homestyle Food',
        'Geyser / Hot Water',
        '24x7 Power Backup'
      ]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const toggleAmenity = (item: string) => {
    setAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Property name is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!pinCode.trim() || pinCode.length < 6) newErrors.pinCode = 'Valid 6-digit PIN code required';
    if (!contactPhone.trim() || contactPhone.length < 10) newErrors.contactPhone = 'Valid 10-digit mobile number required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name,
      type,
      address,
      city,
      state,
      pinCode,
      contactPhone,
      contactEmail,
      numberOfFloors: Number(numberOfFloors) || 1,
      totalRooms: initialData ? initialData.totalRooms : 0,
      totalBeds: initialData ? initialData.totalBeds : 0,
      amenities,
      description,
      status: initialData ? initialData.status : 'Active'
    });

    showToast(
      initialData ? 'Property Updated' : 'Property Added',
      `${name} has been ${initialData ? 'updated' : 'registered'} successfully.`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Property Details' : 'Register New PG Property'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} type="button">
            {initialData ? 'Save Changes' : 'Create Property'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-row">
          <Input
            label="Property Name"
            placeholder="e.g. StayNest Prime - Indiranagar"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            error={errors.name}
          />
          <Select
            label="PG Accommodation Type"
            required
            value={type}
            onChange={e => setType(e.target.value as PropertyType)}
            options={[
              { value: 'Gents', label: 'Gents PG' },
              { value: 'Ladies', label: 'Ladies PG' },
              { value: 'Co-living', label: 'Co-living / Unisex' }
            ]}
          />
        </div>

        <Input
          label="Full Street Address"
          placeholder="#12, 100 Feet Road, Near Metro Station"
          required
          value={address}
          onChange={e => setAddress(e.target.value)}
          error={errors.address}
        />

        <div className="form-row">
          <Input
            label="City"
            required
            value={city}
            onChange={e => setCity(e.target.value)}
          />
          <Input
            label="State"
            required
            value={state}
            onChange={e => setState(e.target.value)}
          />
          <Input
            label="PIN Code"
            placeholder="560034"
            required
            value={pinCode}
            onChange={e => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            error={errors.pinCode}
          />
        </div>

        <div className="form-row">
          <Input
            label="Manager / Caretaker Phone"
            placeholder="9845012345"
            required
            value={contactPhone}
            onChange={e => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            error={errors.contactPhone}
          />
          <Input
            label="Official Email"
            type="email"
            placeholder="property@staynest.in"
            value={contactEmail}
            onChange={e => setContactEmail(e.target.value)}
          />
          <Input
            label="Number of Floors"
            type="number"
            min={1}
            max={20}
            value={numberOfFloors}
            onChange={e => setNumberOfFloors(Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Amenities Included</label>
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
            {COMMON_AMENITIES.map(amenity => {
              const checked = amenities.includes(amenity);
              return (
                <label
                  key={amenity}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAmenity(amenity)}
                    style={{ accentColor: 'var(--primary-600)', cursor: 'pointer' }}
                  />
                  <span>{amenity}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Property Description / Notes</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Key landmark, gate rules, dining timings, or nearby tech parks..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
