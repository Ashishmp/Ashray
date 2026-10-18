import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Room } from '../../../types/room';
import { formatCurrency } from '../../../utils/formatters';
import { BedDouble, CheckCircle2, User, AlertCircle, Wrench } from 'lucide-react';

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onEdit: (room: Room) => void;
  onAssignTenant?: (roomId: string, bedId: string) => void;
}

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  isOpen,
  onClose,
  room,
  onEdit,
  onAssignTenant
}) => {
  if (!room) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Room ${room.roomNumber} Details`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onEdit(room);
            }}
          >
            Edit Room
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header summary */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
              {room.propertyName} • Floor {room.floor}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '2px' }}>
              {room.type} Occupancy ({room.capacity} Beds)
            </div>
          </div>
          <StatusBadge status={room.status} />
        </div>

        {/* Pricing & Status Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--slate-50)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Rent per Bed</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '2px' }}>
              {formatCurrency(room.rentPerBed)}/mo
            </div>
          </div>
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--slate-50)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Occupied</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {room.occupiedBeds} Beds
            </div>
          </div>
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--success-50)', borderRadius: '8px', border: '1px solid var(--success-200)' }}>
            <span style={{ fontSize: '11px', color: 'var(--success-800)', fontWeight: 600 }}>Available</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--success-700)', marginTop: '2px' }}>
              {room.availableBeds} Vacant
            </div>
          </div>
        </div>

        {/* Individual Bed Slots Tracker */}
        <div>
          <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Bed Allocation Map ({room.beds.length} Slots)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {room.beds.map(bed => (
              <div
                key={bed.id}
                className={`bed-slot-card ${bed.isOccupied ? 'occupied' : 'vacant'}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: bed.isOccupied ? 'var(--primary-100)' : 'var(--success-100)',
                      color: bed.isOccupied ? 'var(--primary-700)' : 'var(--success-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}
                  >
                    <BedDouble size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {bed.bedCode}
                    </div>
                    {bed.isOccupied ? (
                      <div style={{ fontSize: '12px', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={12} /> Resident: <strong>{bed.tenantName || 'Assigned Tenant'}</strong>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--success-700)' }}>
                        Vacant • Available for allocation
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>
                    {formatCurrency(bed.monthlyRent)}/mo
                  </span>
                  <div>
                    <StatusBadge status={bed.isOccupied ? 'Occupied' : 'Available'} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        {room.amenities.length > 0 && (
          <div>
            <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Room Inclusions
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {room.amenities.map(a => (
                <span
                  key={a}
                  style={{
                    fontSize: '11.5px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--slate-100)',
                    color: 'var(--slate-700)'
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Maintenance Notes */}
        {room.notes && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--slate-50)',
              borderRadius: '6px',
              fontSize: '12.5px',
              color: 'var(--text-secondary)'
            }}
          >
            <strong>Notes:</strong> {room.notes}
          </div>
        )}
      </div>
    </Modal>
  );
};
