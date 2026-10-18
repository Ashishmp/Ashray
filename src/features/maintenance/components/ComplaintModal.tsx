import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../../types/complaint';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Complaint, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'internalNotes'>) => void;
  initialData?: Complaint;
}

const CATEGORIES: ComplaintCategory[] = [
  'Plumbing',
  'Electrical',
  'Wi-Fi',
  'Cleaning',
  'Furniture',
  'Food',
  'Air Conditioning',
  'Other'
];

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const { properties, rooms, staff } = useApp();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [roomId, setRoomId] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Plumbing');
  const [priority, setPriority] = useState<ComplaintPriority>('High');
  const [status, setStatus] = useState<ComplaintStatus>('Open');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [maintenanceCost, setMaintenanceCost] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const propRooms = rooms.filter(r => r.propertyId === propertyId);
  const eligibleStaff = staff.filter(s => s.assignedPropertyIds.includes(propertyId));

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setPropertyId(initialData.propertyId);
      setRoomId(initialData.roomId || '');
      setCategory(initialData.category);
      setPriority(initialData.priority);
      setStatus(initialData.status);
      setAssignedStaffId(initialData.assignedStaffId || '');
      setMaintenanceCost(initialData.maintenanceCost || 0);
    } else {
      setTitle('');
      setDescription('');
      const defaultProp = properties[0]?.id || '';
      setPropertyId(defaultProp);
      setRoomId('');
      setCategory('Plumbing');
      setPriority('High');
      setStatus('Open');
      setAssignedStaffId('');
      setMaintenanceCost(0);
    }
    setErrors({});
  }, [initialData, isOpen, properties]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Issue title is required';
    if (!description.trim()) newErrors.description = 'Please describe the maintenance issue';
    if (!propertyId) newErrors.propertyId = 'Please select a property';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const matchedProp = properties.find(p => p.id === propertyId);
    const matchedRoom = rooms.find(r => r.id === roomId);
    const matchedStaff = staff.find(s => s.id === assignedStaffId);

    onSubmit({
      title,
      description,
      propertyId,
      propertyName: matchedProp?.name || '',
      roomId: roomId || undefined,
      roomNumber: matchedRoom?.roomNumber || undefined,
      category,
      priority,
      status,
      assignedStaffId: assignedStaffId || undefined,
      assignedStaffName: matchedStaff?.name || undefined,
      maintenanceCost: Number(maintenanceCost) || 0
    });

    showToast(
      initialData ? 'Complaint Updated' : 'Ticket Created',
      `Ticket "${title}" logged with priority: ${priority}.`,
      priority === 'Urgent' ? 'warning' : 'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Complaint / Task' : 'Log Maintenance Request'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          {properties.length > 0 && (
            <Button variant="primary" onClick={handleSubmit} type="button">
              {initialData ? 'Save Changes' : 'Create Ticket'}
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
            Please register a PG property first before creating maintenance tickets.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Issue Summary / Subject"
            placeholder="e.g. Geyser tripping circuit breaker in Room 204"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            error={errors.title}
          />

        <div className="form-row">
          <Select
            label="Property"
            required
            value={propertyId}
            onChange={e => {
              setPropertyId(e.target.value);
              setRoomId('');
              setAssignedStaffId('');
            }}
            options={properties.map(p => ({ value: p.id, label: p.name }))}
            error={errors.propertyId}
          />
          <Select
            label="Room (Optional)"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            options={[
              { value: '', label: 'Common Area / General PG' },
              ...propRooms.map(r => ({ value: r.id, label: `Room ${r.roomNumber}` }))
            ]}
          />
        </div>

        <div className="form-row">
          <Select
            label="Category"
            required
            value={category}
            onChange={e => setCategory(e.target.value as ComplaintCategory)}
            options={CATEGORIES.map(c => ({ value: c, label: c }))}
          />
          <Select
            label="Priority"
            required
            value={priority}
            onChange={e => setPriority(e.target.value as ComplaintPriority)}
            options={[
              { value: 'Urgent', label: 'Urgent (Water/Power outage)' },
              { value: 'High', label: 'High (Immediate attention)' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low (Cosmetic/Minor)' }
            ]}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Detailed Description of Problem</label>
          <textarea
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            rows={3}
            required
            placeholder="Specify symptoms, location, and tenant contact details if applicable..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          {errors.description && <span className="form-error-msg">{errors.description}</span>}
        </div>

        <div className="form-row">
          <Select
            label="Assign Staff Member"
            value={assignedStaffId}
            onChange={e => setAssignedStaffId(e.target.value)}
            options={[
              { value: '', label: 'Unassigned (Assign Later)' },
              ...eligibleStaff.map(s => ({ value: s.id, label: `${s.name} (${s.role})` }))
            ]}
          />
          <Input
            label="Estimated / Incurred Repair Cost (₹)"
            type="number"
            value={maintenanceCost}
            onChange={e => setMaintenanceCost(Number(e.target.value))}
          />
        </div>
      </form>
      )}
    </Modal>
  );
};
