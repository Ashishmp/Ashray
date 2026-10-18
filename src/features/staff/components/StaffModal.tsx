import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { StaffMember, StaffRole, EmploymentStatus } from '../../../types/staff';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: StaffMember;
}

const ROLES: StaffRole[] = [
  'Property Manager',
  'Warden',
  'Electrician',
  'Plumber',
  'Housekeeping Staff',
  'Head Cook',
  'Security Guard'
];

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const { properties } = useApp();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('Property Manager');
  const [assignedPropertyIds, setAssignedPropertyIds] = useState<string[]>([]);
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [monthlySalary, setMonthlySalary] = useState<number>(20000);
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('Active');
  const [responsibilities, setResponsibilities] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setEmail(initialData.email || '');
      setRole(initialData.role);
      setAssignedPropertyIds(initialData.assignedPropertyIds || []);
      setJoiningDate(initialData.joiningDate);
      setMonthlySalary(initialData.monthlySalary);
      setEmploymentStatus(initialData.employmentStatus);
      setResponsibilities(initialData.responsibilities || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setRole('Property Manager');
      setAssignedPropertyIds(properties.slice(0, 1).map(p => p.id));
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setMonthlySalary(20000);
      setEmploymentStatus('Active');
      setResponsibilities('');
    }
    setErrors({});
  }, [initialData, isOpen, properties]);

  const toggleProperty = (id: string) => {
    setAssignedPropertyIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!phone.trim() || phone.length < 10) newErrors.phone = 'Valid 10-digit phone number is required';
    if (assignedPropertyIds.length === 0) newErrors.properties = 'Assign at least one property';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const assignedNames = properties
      .filter(p => assignedPropertyIds.includes(p.id))
      .map(p => p.name);

    onSubmit({
      name,
      phone,
      email: email.trim() || undefined,
      role,
      assignedPropertyIds,
      assignedPropertyNames: assignedNames,
      joiningDate,
      monthlySalary: Number(monthlySalary) || 0,
      employmentStatus,
      responsibilities
    });

    showToast(
      initialData ? 'Staff Member Updated' : 'Staff Member Added',
      `${name} registered as ${role}.`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Staff Member' : 'Add Staff Member'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          {properties.length > 0 && (
            <Button variant="primary" onClick={handleSubmit} type="button">
              {initialData ? 'Save Changes' : 'Register Staff'}
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
            Please register a PG property first before assigning caretakers or staff.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full Name"
            placeholder="e.g. Suresh Gowda"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            error={errors.name}
          />

        <div className="form-row">
          <Input
            label="Mobile Phone"
            placeholder="9845012345"
            required
            prefixIcon={<span>+91</span>}
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            error={errors.phone}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="staff@staynest.in"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="form-row">
          <Select
            label="Designation / Role"
            required
            value={role}
            onChange={e => setRole(e.target.value as StaffRole)}
            options={ROLES.map(r => ({ value: r, label: r }))}
          />
          <Select
            label="Employment Status"
            required
            value={employmentStatus}
            onChange={e => setEmploymentStatus(e.target.value as EmploymentStatus)}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'On Leave', label: 'On Leave' },
              { value: 'Inactive', label: 'Inactive' }
            ]}
          />
        </div>

        <div className="form-row">
          <Input
            label="Monthly Salary (₹)"
            type="number"
            value={monthlySalary}
            onChange={e => setMonthlySalary(Number(e.target.value))}
          />
          <Input
            label="Joining Date"
            type="date"
            required
            value={joiningDate}
            onChange={e => setJoiningDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Assigned Properties <span className="required-star">*</span>
          </label>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '10px 14px',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${errors.properties ? 'var(--danger-500)' : 'var(--border-color)'}`
            }}
          >
            {properties.map(p => (
              <label
                key={p.id}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={assignedPropertyIds.includes(p.id)}
                  onChange={() => toggleProperty(p.id)}
                  style={{ accentColor: 'var(--primary-600)' }}
                />
                <span>{p.name}</span>
              </label>
            ))}
          </div>
          {errors.properties && <span className="form-error-msg">{errors.properties}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Core Responsibilities</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Key daily duties, shifts, gate duty, or on-call emergency repairs..."
            value={responsibilities}
            onChange={e => setResponsibilities(e.target.value)}
          />
        </div>
      </form>
      )}
    </Modal>
  );
};
