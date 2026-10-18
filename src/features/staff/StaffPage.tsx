import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  Building,
  Wrench,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StaffModal } from './components/StaffModal';
import { StaffMember } from '../../types/staff';
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters';

export const StaffPage: React.FC = () => {
  const { filteredStaff, complaints, addStaff, updateStaff, deleteStaff } = useApp();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  // Compute live assigned maintenance task count for each staff member
  const staffWithTasks = useMemo(() => {
    return filteredStaff.map(s => {
      const activeTasks = complaints.filter(
        c => c.assignedStaffId === s.id && (c.status === 'Open' || c.status === 'In Progress')
      ).length;
      return {
        ...s,
        calculatedTasks: activeTasks
      };
    });
  }, [filteredStaff, complaints]);

  const displayStaff = useMemo(() => {
    return staffWithTasks.filter(s => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'all' || s.role === filterRole;
      const matchesStatus = filterStatus === 'all' || s.employmentStatus === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staffWithTasks, searchQuery, filterRole, filterStatus]);

  const handleDelete = () => {
    if (staffToDelete) {
      deleteStaff(staffToDelete.id);
      showToast('Staff Member Removed', `${staffToDelete.name} has been removed.`, 'info');
      setStaffToDelete(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Staff & Caretakers"
        subtitle={`Managing property managers, wardens, maintenance technicians, cooks, and cleaning crew`}
        actions={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Staff Member
          </Button>
        }
      />

      {/* Filter and Search Toolbar */}
      <div className="toolbar-container">
        <div className="toolbar-filters">
          <div className="filter-search-box">
            <Search className="filter-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by name, phone, or role..."
              className="form-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            options={[
              { value: 'all', label: 'All Designations' },
              { value: 'Property Manager', label: 'Property Manager' },
              { value: 'Warden', label: 'Warden' },
              { value: 'Electrician', label: 'Electrician' },
              { value: 'Plumber', label: 'Plumber' },
              { value: 'Housekeeping Staff', label: 'Housekeeping Staff' },
              { value: 'Head Cook', label: 'Head Cook' },
              { value: 'Security Guard', label: 'Security Guard' }
            ]}
          />

          <Select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'On Leave', label: 'On Leave' },
              { value: 'Inactive', label: 'Inactive' }
            ]}
          />
        </div>
      </div>

      {/* Staff Grid Cards */}
      {displayStaff.length === 0 ? (
        <EmptyState
          icon={<UserCheck size={32} />}
          title="No staff members found"
          description="Try broadening search filters or register a new staff employee."
          actionText="Add Staff Member"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}
        >
          {displayStaff.map(staffMember => (
            <div key={staffMember.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '13px'
                    }}
                  >
                    {staffMember.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="card-title" style={{ fontSize: '1.05rem' }}>
                      {staffMember.name}
                    </h3>
                    <div style={{ fontSize: '11.5px', color: 'var(--primary-700)', fontWeight: 600 }}>
                      {staffMember.role}
                    </div>
                  </div>
                </div>
                <StatusBadge status={staffMember.employmentStatus} size="sm" />
              </div>

              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <Phone size={15} color="var(--slate-400)" />
                  <span>{formatPhone(staffMember.phone)}</span>
                </div>

                {staffMember.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <Mail size={15} color="var(--slate-400)" />
                    <span>{staffMember.email}</span>
                  </div>
                )}

                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '11px', textTransform: 'uppercase' }}>
                    Assigned Properties:
                  </span>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>
                    {staffMember.assignedPropertyNames?.join(', ') || 'General Fleet'}
                  </div>
                </div>

                {staffMember.responsibilities && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, backgroundColor: 'var(--slate-50)', padding: '8px 10px', borderRadius: '6px' }}>
                    {staffMember.responsibilities}
                  </div>
                )}

                {/* Open Tasks Counter */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: staffMember.calculatedTasks > 0 ? 'var(--warning-50)' : 'var(--slate-50)',
                    border: `1px solid ${staffMember.calculatedTasks > 0 ? 'var(--warning-200)' : 'var(--border-color)'}`,
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wrench size={14} color={staffMember.calculatedTasks > 0 ? 'var(--warning-700)' : 'var(--slate-500)'} />
                    <span style={{ fontWeight: 600, color: staffMember.calculatedTasks > 0 ? 'var(--warning-900)' : 'var(--slate-700)' }}>
                      Active Tickets: {staffMember.calculatedTasks}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    Joined {formatDate(staffMember.joiningDate)}
                  </span>
                </div>
              </div>

              <div className="card-footer" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Salary: {formatCurrency(staffMember.monthlySalary)}/mo
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: '6px' }}
                    onClick={() => setEditingStaff(staffMember)}
                    title="Edit Staff Member"
                    aria-label="Edit Staff"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: '6px', color: 'var(--danger-600)' }}
                    onClick={() => setStaffToDelete(staffMember)}
                    title="Remove Staff Member"
                    aria-label="Remove Staff"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      <StaffModal
        isOpen={isAddModalOpen || Boolean(editingStaff)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingStaff(null);
        }}
        onSubmit={data => {
          if (editingStaff) {
            updateStaff(editingStaff.id, data);
          } else {
            addStaff(data);
          }
        }}
        initialData={editingStaff || undefined}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(staffToDelete)}
        onClose={() => setStaffToDelete(null)}
        onConfirm={handleDelete}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${staffToDelete?.name} (${staffToDelete?.role}) from the staff registry?`}
        confirmText="Remove Staff"
      />
    </div>
  );
};
