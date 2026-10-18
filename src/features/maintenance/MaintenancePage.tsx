import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Eye,
  User,
  Building
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Tabs } from '../../components/ui/Tabs';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ComplaintDetailsModal } from './components/ComplaintDetailsModal';
import { Complaint, ComplaintPriority, ComplaintStatus, ComplaintCategory } from '../../types/complaint';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const MaintenancePage: React.FC = () => {
  const { filteredComplaints } = useApp();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modals state
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);

  // Filtered complaints
  const displayComplaints = useMemo(() => {
    return filteredComplaints.filter(c => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.tenantName && c.tenantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.roomNumber && c.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = filterPriority === 'all' || c.priority === filterPriority;
      const matchesCat = filterCategory === 'all' || c.category === filterCategory;

      let matchesTab = true;
      if (activeTab === 'open') matchesTab = c.status === 'Open';
      else if (activeTab === 'in_progress') matchesTab = c.status === 'In Progress';
      else if (activeTab === 'urgent') matchesTab = c.priority === 'Urgent';
      else if (activeTab === 'resolved') matchesTab = c.status === 'Resolved' || c.status === 'Closed';

      return matchesSearch && matchesPriority && matchesCat && matchesTab;
    });
  }, [filteredComplaints, searchQuery, filterPriority, filterCategory, activeTab]);

  const openCount = filteredComplaints.filter(c => c.status === 'Open').length;
  const inProgressCount = filteredComplaints.filter(c => c.status === 'In Progress').length;
  const urgentCount = filteredComplaints.filter(c => c.priority === 'Urgent').length;
  const resolvedCount = filteredComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div>
      <PageHeader
        title="Complaints & Maintenance"
        subtitle="Review, track, and resolve maintenance tickets registered by PG residents"
      />

      {/* Urgent Alert Banner */}
      {urgentCount > 0 && (
        <div
          style={{
            backgroundColor: 'var(--danger-50)',
            border: '1px solid var(--danger-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="var(--danger-600)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger-900)' }}>
              {urgentCount} Urgent Maintenance Ticket(s) currently open requiring emergency response.
            </span>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setActiveTab('urgent');
              setFilterPriority('Urgent');
            }}
          >
            View Urgent Tickets
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'all', label: 'All Requests', count: filteredComplaints.length },
          { id: 'open', label: 'Open (Unattended)', count: openCount },
          { id: 'in_progress', label: 'In Progress', count: inProgressCount },
          { id: 'urgent', label: 'Urgent', count: urgentCount },
          { id: 'resolved', label: 'Resolved / Closed', count: resolvedCount }
        ]}
      />

      {/* Search and Filter Toolbar */}
      <div className="toolbar-container">
        <div className="toolbar-filters">
          <div className="filter-search-box">
            <Search className="filter-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search ticket #, title, resident, room..."
              className="form-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'Urgent', label: 'Urgent' },
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' }
            ]}
          />

          <Select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'Plumbing', label: 'Plumbing' },
              { value: 'Electrical', label: 'Electrical' },
              { value: 'Wi-Fi', label: 'Wi-Fi' },
              { value: 'Air Conditioning', label: 'Air Conditioning' },
              { value: 'Cleaning', label: 'Cleaning' },
              { value: 'Furniture', label: 'Furniture' },
              { value: 'Food', label: 'Food' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </div>
      </div>

      {/* Complaints Table */}
      {displayComplaints.length === 0 ? (
        <EmptyState
          icon={<Wrench size={32} />}
          title="No complaints registered"
          description={
            searchQuery || filterPriority !== 'all' || filterCategory !== 'all' || activeTab !== 'all'
              ? 'No registered complaints match the selected filter criteria.'
              : 'All systems operational. There are currently no maintenance complaints registered by residents.'
          }
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket # & Title</th>
                <th>PG & Room</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Assigned Staff</th>
                <th>Cost (INR)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayComplaints.map(complaint => (
                <tr key={complaint.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--slate-900)' }}>
                      {complaint.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      #{complaint.ticketNumber} • Reported by {complaint.tenantName || 'Staff'} ({formatDate(complaint.createdAt)})
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{complaint.propertyName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {complaint.roomNumber ? `Room ${complaint.roomNumber}` : 'Common Area'}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={complaint.category} size="sm" />
                  </td>
                  <td>
                    <StatusBadge status={complaint.priority} size="sm" />
                  </td>
                  <td>
                    {complaint.assignedStaffName ? (
                      <div style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--primary-700)' }}>
                        {complaint.assignedStaffName}
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    {complaint.maintenanceCost > 0 ? (
                      <span style={{ fontWeight: 600 }}>{formatCurrency(complaint.maintenanceCost)}</span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={complaint.status} size="sm" />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye size={14} />}
                      onClick={() => setActiveComplaint(complaint)}
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ticket Details & Action Modal */}
      <ComplaintDetailsModal
        isOpen={Boolean(activeComplaint)}
        onClose={() => setActiveComplaint(null)}
        complaint={activeComplaint}
      />
    </div>
  );
};
