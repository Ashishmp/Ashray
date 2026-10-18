import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Building,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storageService } from '../../services/storageService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Complaint, ComplaintCategory, ComplaintPriority } from '../../types/complaint';
import { generateId, formatDate } from '../../utils/formatters';

export const TenantComplaintsPage: React.FC = () => {
  const { currentTenant } = useAuth();
  const { showToast } = useToast();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New ticket state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Plumbing');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');

  const loadData = () => {
    if (!currentTenant) return;
    const profile = storageService.getTenantFullProfile(currentTenant.id);
    if (profile) {
      const allComplaints = storageService.getComplaints(profile.ownerId);
      const mine = allComplaints.filter(c => c.tenantId === currentTenant.id || c.roomId === currentTenant.roomId);
      setComplaints(mine);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !title.trim()) return;

    const profile = storageService.getTenantFullProfile(currentTenant.id);
    if (!profile) return;

    const newTicket: Complaint = {
      id: generateId('cmp'),
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      propertyId: currentTenant.propertyId,
      propertyName: currentTenant.propertyName || 'StayNest Elite',
      roomId: currentTenant.roomId,
      roomNumber: currentTenant.roomNumber || '102',
      category,
      priority,
      title: title.trim(),
      description: description.trim(),
      status: 'Open',
      assignedStaffName: 'Ramu (Property Technician)',
      maintenanceCost: 0,
      internalNotes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existing = storageService.getComplaints(profile.ownerId);
    storageService.saveComplaints(profile.ownerId, [newTicket, ...existing]);

    setTitle('');
    setDescription('');
    setIsModalOpen(false);
    showToast('Ticket Submitted!', `Service ticket #${newTicket.ticketNumber} logged for Property Manager review.`, 'success');
    loadData();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Maintenance & Service Requests"
        subtitle="Report room repairs, Wi-Fi connectivity issues, or housekeeping needs directly to the property warden."
        actions={
          <Button
            variant="primary"
            icon={<Plus size={15} />}
            onClick={() => setIsModalOpen(true)}
          >
            New Service Request
          </Button>
        }
      />

      {/* Ticket List */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xs)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--slate-900)' }}>
            My Active & Resolved Requests ({complaints.length})
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {complaints.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--slate-500)' }}>
              No service requests reported. Your room facilities are running smoothly!
            </div>
          ) : (
            complaints.map(ticket => (
              <div
                key={ticket.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: 'var(--primary-700)' }}>
                      {ticket.ticketNumber}
                    </span>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {ticket.title}
                    </h4>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--slate-100)',
                        color: 'var(--slate-700)',
                        fontWeight: 600
                      }}
                    >
                      {ticket.category}
                    </span>
                  </div>

                  <p style={{ fontSize: '12.5px', color: 'var(--slate-600)', marginTop: '4px' }}>
                    {ticket.description || 'No additional details provided.'}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', color: 'var(--slate-500)', marginTop: '6px' }}>
                    <span>Logged on {formatDate(ticket.createdAt)}</span>
                    {ticket.assignedStaffName && <span>Assigned to: <strong>{ticket.assignedStaffName}</strong></span>}
                  </div>
                </div>

                <StatusBadge
                  status={ticket.status}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit New Service Request"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<Send size={15} />}
              onClick={handleCreateTicket}
              type="button"
            >
              Submit Ticket
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Issue Summary *"
            placeholder="e.g. Geyser not heating water in bathroom"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Select
              label="Category"
              value={category}
              onChange={e => setCategory(e.target.value as ComplaintCategory)}
              options={[
                { value: 'Plumbing', label: 'Plumbing (Tap / Drain / Geyser)' },
                { value: 'Electrical', label: 'Electrical (Fan / Light / Switch)' },
                { value: 'Wi-Fi & Internet', label: 'Wi-Fi & High-Speed Internet' },
                { value: 'Air Conditioning', label: 'Air Conditioning / Remote' },
                { value: 'Cleaning & Housekeeping', label: 'Cleaning & Housekeeping' },
                { value: 'Other', label: 'Other Facility Concern' }
              ]}
            />

            <Select
              label="Urgency / Priority"
              value={priority}
              onChange={e => setPriority(e.target.value as ComplaintPriority)}
              options={[
                { value: 'Low', label: 'Low (Within 48 hours)' },
                { value: 'Medium', label: 'Medium (Within 24 hours)' },
                { value: 'High', label: 'High (Same day)' },
                { value: 'Urgent', label: 'Urgent (Immediate attention)' }
              ]}
            />
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--slate-700)', display: 'block', marginBottom: '6px' }}>
              Detailed Description
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Describe the issue and when the technician can enter the room..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
