import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Property } from '../../../types/property';
import { useApp } from '../../../context/AppContext';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Layers,
  BedDouble,
  CheckCircle2,
  Users
} from 'lucide-react';
import { formatPhone, formatCurrency } from '../../../utils/formatters';

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onEdit: (property: Property) => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  isOpen,
  onClose,
  property,
  onEdit
}) => {
  const { rooms, tenants } = useApp();

  if (!property) return null;

  const propRooms = rooms.filter(r => r.propertyId === property.id);
  const propTenants = tenants.filter(t => t.propertyId === property.id && t.status !== 'Moved Out');

  const totalBeds = propRooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = propRooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
  const vacantBeds = totalBeds - occupiedBeds;
  const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={property.name}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onEdit(property);
            }}
          >
            Edit Property
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Banner with status and badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StatusBadge status={property.type} />
            <StatusBadge status={property.status} />
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              {property.city}, {property.state}
            </span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-700)' }}>
            Manager: {property.managerName || 'Assigned Staff'}
          </div>
        </div>

        {/* 4 Stat Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--slate-50)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Total Rooms</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>{propRooms.length}</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'var(--slate-50)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Total Beds</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>{totalBeds}</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'var(--primary-50)', borderRadius: '8px', border: '1px solid var(--primary-200)' }}>
            <span style={{ fontSize: '11px', color: 'var(--primary-800)', fontWeight: 600 }}>Occupied Beds</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '2px' }}>
              {occupiedBeds} ({occupancyPercent}%)
            </div>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'var(--success-50)', borderRadius: '8px', border: '1px solid var(--success-200)' }}>
            <span style={{ fontSize: '11px', color: 'var(--success-800)', fontWeight: 600 }}>Available Beds</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success-700)', marginTop: '2px' }}>
              {vacantBeds}
            </div>
          </div>
        </div>

        {/* Location and Contacts */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            backgroundColor: 'var(--slate-50)',
            padding: '16px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
              <MapPin size={14} /> Full Address
            </div>
            <div style={{ fontSize: '13px', color: 'var(--slate-800)', fontWeight: 500 }}>
              {property.address}, {property.city}, {property.state} - {property.pinCode}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Floors: {property.numberOfFloors} Floors Structure
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
              <Phone size={14} /> Caretaker Contact
            </div>
            <div style={{ fontSize: '13px', color: 'var(--slate-800)', fontWeight: 600 }}>
              {formatPhone(property.contactPhone)}
            </div>
            {property.contactEmail && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {property.contactEmail}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <div>
            <h4 style={{ fontSize: '13px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Overview & House Guidelines
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {property.description}
            </p>
          </div>
        )}

        {/* Amenities */}
        <div>
          <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Included Amenities ({property.amenities.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {property.amenities.map(a => (
              <span
                key={a}
                style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <CheckCircle2 size={12} color="var(--success-600)" />
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Active Residents Preview */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Current Residents ({propTenants.length})
            </h4>
          </div>
          {propTenants.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No active residents assigned.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {propTenants.map(t => (
                <div
                  key={t.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
                      Rm {t.roomNumber} ({t.bedCode})
                    </div>
                  </div>
                  <StatusBadge status={t.rentStatus} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
