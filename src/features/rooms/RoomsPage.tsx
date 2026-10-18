import React, { useState, useMemo, useEffect } from 'react';
import {
  BedDouble,
  Plus,
  Search,
  Building,
  CheckCircle2,
  Users,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RoomModal } from './components/RoomModal';
import { RoomDetailsModal } from './components/RoomDetailsModal';
import { Room } from '../../types/room';
import { formatCurrency } from '../../utils/formatters';

export const RoomsPage: React.FC = () => {
  const { filteredRooms, rooms, properties, selectedPropertyId, addRoom, updateRoom, deleteRoom } = useApp();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [filterFloor, setFilterFloor] = useState<string>('all');

  // Compute dynamic max floors based on the selected property or active properties
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const maxFloors = useMemo(() => {
    if (selectedProperty) {
      return Math.max(1, selectedProperty.numberOfFloors || 1);
    }
    const propMax = properties.length > 0 ? Math.max(...properties.map(p => p.numberOfFloors || 1)) : 1;
    const roomMax = filteredRooms.length > 0 ? Math.max(...filteredRooms.map(r => r.floor || 1)) : 1;
    return Math.max(propMax, roomMax, 1);
  }, [selectedProperty, properties, filteredRooms]);

  // Dynamic floor options strictly matching the selected PG structure
  const floorOptions = useMemo(() => {
    const opts = [{ value: 'all', label: 'All Floors' }];
    for (let f = 1; f <= maxFloors; f++) {
      const suffix = f === 1 ? 'st' : f === 2 ? 'nd' : f === 3 ? 'rd' : 'th';
      opts.push({ value: String(f), label: `${f}${suffix} Floor` });
    }
    return opts;
  }, [maxFloors]);

  // Reset floor filter if current selection exceeds the building's floor structure
  useEffect(() => {
    if (filterFloor !== 'all' && Number(filterFloor) > maxFloors) {
      setFilterFloor('all');
    }
  }, [maxFloors, filterFloor]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [detailsRoom, setDetailsRoom] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  // Filtered rooms
  const displayRooms = useMemo(() => {
    return filteredRooms.filter(room => {
      const matchesSearch =
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.propertyName && room.propertyName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'all' || room.type === filterType;
      const matchesFloor = filterFloor === 'all' || String(room.floor) === filterFloor;

      let matchesAvailability = true;
      if (filterAvailability === 'available') {
        matchesAvailability = room.availableBeds > 0 && room.status !== 'Maintenance';
      } else if (filterAvailability === 'full') {
        matchesAvailability = room.availableBeds === 0;
      } else if (filterAvailability === 'maintenance') {
        matchesAvailability = room.status === 'Maintenance';
      }

      return matchesSearch && matchesType && matchesFloor && matchesAvailability;
    });
  }, [filteredRooms, searchQuery, filterType, filterFloor, filterAvailability]);

  // Overall metric counters
  const totalBeds = filteredRooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = filteredRooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
  const vacantBeds = filteredRooms.reduce((acc, r) => acc + r.availableBeds, 0);

  const handleDelete = () => {
    if (roomToDelete) {
      if (roomToDelete.occupiedBeds > 0) {
        alert('Cannot delete room with active residents. Please transfer or vacate tenants first.');
        setRoomToDelete(null);
        return;
      }
      deleteRoom(roomToDelete.id);
      showToast('Room Deleted', `Room ${roomToDelete.roomNumber} has been deleted.`, 'info');
      setRoomToDelete(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Rooms & Beds Management"
        subtitle={`Total ${filteredRooms.length} rooms • ${totalBeds} beds (${occupiedBeds} occupied, ${vacantBeds} vacant)`}
        actions={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Room
          </Button>
        }
      />

      {/* Summary KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Total Rooms</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>{filteredRooms.length}</div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Total Beds Capacity</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>{totalBeds}</div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '12px', color: 'var(--primary-800)', fontWeight: 600 }}>Occupied Beds</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '2px' }}>
            {occupiedBeds}
          </div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--success-50)', border: '1px solid var(--success-200)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '12px', color: 'var(--success-800)', fontWeight: 600 }}>Available (Vacant) Beds</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success-700)', marginTop: '2px' }}>
            {vacantBeds}
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="toolbar-container">
        <div className="toolbar-filters">
          <div className="filter-search-box">
            <Search className="filter-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by room # (e.g. 101, 202)..."
              className="form-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            options={[
              { value: 'all', label: 'All Sharing Types' },
              { value: 'Single', label: 'Single Occupancy' },
              { value: 'Double', label: 'Double Sharing' },
              { value: 'Triple', label: 'Triple Sharing' },
              { value: 'Four', label: 'Four Sharing' }
            ]}
          />

          <Select
            value={filterAvailability}
            onChange={e => setFilterAvailability(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'available', label: 'Available (Has Vacant Beds)' },
              { value: 'full', label: 'Fully Occupied' },
              { value: 'maintenance', label: 'Under Maintenance' }
            ]}
          />

          <Select
            value={filterFloor}
            onChange={e => setFilterFloor(e.target.value)}
            options={floorOptions}
          />
        </div>
      </div>

      {/* Table listing */}
      {displayRooms.length === 0 ? (
        <EmptyState
          icon={<BedDouble size={32} />}
          title="No rooms match your filter"
          description="Adjust your search criteria or register a new room and bed slots."
          actionText="Add Room"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Room #</th>
                <th>PG Property</th>
                <th>Floor</th>
                <th>Sharing Type</th>
                <th>Bed Allocation</th>
                <th>Rent / Bed</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayRooms.map(room => (
                <tr key={room.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--slate-900)' }}>
                      Room {room.roomNumber}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{room.propertyName}</div>
                  </td>
                  <td>
                    Floor {room.floor}
                  </td>
                  <td>
                    <StatusBadge status={room.type} size="sm" />
                  </td>
                  <td>
                    {/* Visual mini bed blocks */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {room.beds.map(bed => (
                          <span
                            key={bed.id}
                            title={`${bed.bedCode}: ${bed.isOccupied ? 'Occupied by ' + (bed.tenantName || 'Tenant') : 'Vacant'}`}
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '3px',
                              backgroundColor: bed.isOccupied ? 'var(--primary-600)' : 'var(--success-500)',
                              display: 'inline-block'
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {room.occupiedBeds}/{room.capacity}
                      </span>
                      {room.availableBeds > 0 && (
                        <span style={{ fontSize: '11px', color: 'var(--success-700)', fontWeight: 600 }}>
                          ({room.availableBeds} vacant)
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                      {formatCurrency(room.rentPerBed)}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>per month</div>
                  </td>
                  <td>
                    <StatusBadge status={room.status} size="sm" />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px' }}
                        onClick={() => setDetailsRoom(room)}
                        title="View Bed Details"
                        aria-label="View Bed Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px' }}
                        onClick={() => setEditingRoom(room)}
                        title="Edit Room"
                        aria-label="Edit Room"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px', color: 'var(--danger-600)' }}
                        onClick={() => setRoomToDelete(room)}
                        title="Delete Room"
                        aria-label="Delete Room"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <RoomModal
        isOpen={isAddModalOpen || Boolean(editingRoom)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRoom(null);
        }}
        onSubmit={data => {
          if (editingRoom) {
            updateRoom(editingRoom.id, data);
          } else {
            addRoom(data);
          }
        }}
        initialData={editingRoom || undefined}
      />

      {/* Room Details Modal */}
      <RoomDetailsModal
        isOpen={Boolean(detailsRoom)}
        onClose={() => setDetailsRoom(null)}
        room={detailsRoom}
        onEdit={r => {
          setDetailsRoom(null);
          setEditingRoom(r);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(roomToDelete)}
        onClose={() => setRoomToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete Room ${roomToDelete?.roomNumber}? This cannot be undone.`}
        confirmText="Delete Room"
      />
    </div>
  );
};
