import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Complaint, ComplaintStatus, ComplaintPriority } from '../../../types/complaint';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { Wrench, User, Calendar, MessageSquare, Send } from 'lucide-react';

interface ComplaintDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
}

export const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  isOpen,
  onClose,
  complaint
}) => {
  const { staff, updateComplaint, addComplaintNote } = useApp();
  const { showToast } = useToast();

  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Open');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [noteText, setNoteText] = useState('');

  React.useEffect(() => {
    if (complaint) {
      setNewStatus(complaint.status);
      setAssignedStaffId(complaint.assignedStaffId || '');
      setCost(complaint.maintenanceCost || 0);
      setNoteText('');
    }
  }, [complaint, isOpen]);

  if (!complaint) return null;

  const eligibleStaff = staff.filter(s => s.assignedPropertyIds.includes(complaint.propertyId));

  const handleUpdate = () => {
    const matchedStaff = staff.find(s => s.id === assignedStaffId);
    updateComplaint(complaint.id, {
      status: newStatus,
      assignedStaffId: assignedStaffId || undefined,
      assignedStaffName: matchedStaff?.name || undefined,
      maintenanceCost: Number(cost) || 0,
      resolvedAt: newStatus === 'Resolved' || newStatus === 'Closed' ? new Date().toISOString() : undefined
    });

    showToast('Ticket Updated', `Ticket #${complaint.ticketNumber} status set to ${newStatus}.`, 'success');
    onClose();
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addComplaintNote(complaint.id, noteText.trim());
    setNoteText('');
    showToast('Note Added', 'Internal maintenance note logged.', 'info');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ticket #${complaint.ticketNumber}: ${complaint.title}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate} type="button">
            Save Ticket Updates
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Ticket Header Banner */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StatusBadge status={complaint.priority} />
            <StatusBadge status={complaint.category} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Logged on {formatDate(complaint.createdAt)}
            </span>
          </div>

          <div>
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Location & Tenant context */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Property</div>
            <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>{complaint.propertyName}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Room Location</div>
            <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>
              {complaint.roomNumber ? `Room ${complaint.roomNumber}` : 'Common Area'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Reporting Resident</div>
            <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>
              {complaint.tenantName || 'Management Logged'}
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div>
          <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Problem Description
          </h4>
          <p
            style={{
              fontSize: '13.5px',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              padding: '12px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            {complaint.description}
          </p>
        </div>

        {/* Manage & Assignment Controls */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <h4 style={{ fontSize: '13px', color: 'var(--primary-800)' }}>
            Assignment & Status Management
          </h4>
          <div className="form-row">
            <Select
              label="Ticket Status"
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as ComplaintStatus)}
              options={[
                { value: 'Open', label: 'Open' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'On Hold', label: 'On Hold' },
                { value: 'Resolved', label: 'Resolved' },
                { value: 'Closed', label: 'Closed' }
              ]}
            />
            <Select
              label="Assigned Staff Member"
              value={assignedStaffId}
              onChange={e => setAssignedStaffId(e.target.value)}
              options={[
                { value: '', label: 'Unassigned' },
                ...eligibleStaff.map(s => ({ value: s.id, label: `${s.name} (${s.role})` }))
              ]}
            />
            <Input
              label="Repair / Vendor Cost (₹)"
              type="number"
              prefixIcon={<span>₹</span>}
              value={cost}
              onChange={e => setCost(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Internal Activity & Notes Log */}
        <div>
          <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Internal Maintenance Notes ({complaint.internalNotes.length})
          </h4>

          <div
            style={{
              maxHeight: '160px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '10px'
            }}
          >
            {complaint.internalNotes.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', padding: '8px 0' }}>
                No internal notes recorded yet.
              </div>
            ) : (
              complaint.internalNotes.map(n => (
                <div
                  key={n.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--slate-50)',
                    border: '1px solid var(--border-color)',
                    fontSize: '12.5px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)', fontSize: '11px', marginBottom: '2px' }}>
                    <strong>{n.author}</strong>
                    <span>{formatDate(n.createdAt)}</span>
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>{n.note}</div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Add technician observation or update notes..."
              className="form-input"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            />
            <Button variant="secondary" size="sm" type="submit" icon={<Send size={14} />}>
              Add Note
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
};
