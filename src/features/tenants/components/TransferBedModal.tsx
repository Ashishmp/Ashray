import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Tenant } from '../../../types/tenant';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/formatters';

interface TransferBedModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
}

export const TransferBedModal: React.FC<TransferBedModalProps> = ({
  isOpen,
  onClose,
  tenant
}) => {
  const { properties, rooms, transferTenantBed } = useApp();
  const { showToast } = useToast();

  const [targetPropertyId, setTargetPropertyId] = useState('');
  const [targetRoomId, setTargetRoomId] = useState('');
  const [targetBedId, setTargetBedId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (tenant) {
      setTargetPropertyId(tenant.propertyId);
      // Find candidate vacant rooms
      const candRoom = rooms.find(
        r => r.propertyId === tenant.propertyId && r.availableBeds > 0 && r.id !== tenant.roomId
      );
      if (candRoom) {
        setTargetRoomId(candRoom.id);
        const vacantBed = candRoom.beds.find(b => !b.isOccupied);
        setTargetBedId(vacantBed?.id || '');
      } else {
        setTargetRoomId('');
        setTargetBedId('');
      }
      setError('');
    }
  }, [tenant, isOpen, rooms]);

  if (!tenant) return null;

  const availableRooms = rooms.filter(
    r => r.propertyId === targetPropertyId && (r.availableBeds > 0 || r.id === tenant.roomId)
  );

  const selectedRoom = rooms.find(r => r.id === targetRoomId);
  const vacantBeds = selectedRoom?.beds.filter(b => !b.isOccupied) || [];

  const handleRoomChange = (rId: string) => {
    setTargetRoomId(rId);
    const room = rooms.find(r => r.id === rId);
    const firstVacant = room?.beds.find(b => !b.isOccupied);
    setTargetBedId(firstVacant?.id || '');
  };

  const handleTransfer = () => {
    if (!targetPropertyId || !targetRoomId || !targetBedId) {
      setError('Please select a target room and available bed slot.');
      return;
    }

    if (targetRoomId === tenant.roomId && targetBedId === tenant.bedId) {
      setError('Tenant is already assigned to this bed slot.');
      return;
    }

    transferTenantBed(tenant.id, targetPropertyId, targetRoomId, targetBedId);

    const targetRoom = rooms.find(r => r.id === targetRoomId);
    const targetBed = targetRoom?.beds.find(b => b.id === targetBedId);

    showToast(
      'Bed Transfer Complete',
      `${tenant.name} transferred to Room ${targetRoom?.roomNumber} (${targetBed?.bedCode}). Previous bed slot freed up.`,
      'success'
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Tenant Bed / Room"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleTransfer} type="button">
            Confirm Bed Reassignment
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Current Assignment banner */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--slate-50)',
            border: '1px solid var(--border-color)',
            fontSize: '13px'
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tenant.name}</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
            Current Assignment: <strong>{tenant.propertyName}</strong> • Room <strong>{tenant.roomNumber}</strong> ({tenant.bedCode})
          </div>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '4px' }}>
            Current Rent: {formatCurrency(tenant.monthlyRent)}/month
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Select the destination property, room, and vacant bed slot. The previous bed will automatically become available for new tenants.
        </p>

        <Select
          label="Destination Property"
          required
          value={targetPropertyId}
          onChange={e => {
            setTargetPropertyId(e.target.value);
            const r = rooms.find(rm => rm.propertyId === e.target.value && rm.availableBeds > 0);
            if (r) handleRoomChange(r.id);
            else {
              setTargetRoomId('');
              setTargetBedId('');
            }
          }}
          options={properties.map(p => ({ value: p.id, label: p.name }))}
        />

        <div className="form-row">
          <Select
            label="Destination Room"
            required
            value={targetRoomId}
            onChange={e => handleRoomChange(e.target.value)}
            options={availableRooms.map(r => ({
              value: r.id,
              label: `Room ${r.roomNumber} (${r.type} - ${r.availableBeds} beds vacant)`
            }))}
          />

          <Select
            label="Vacant Bed Slot"
            required
            value={targetBedId}
            onChange={e => setTargetBedId(e.target.value)}
            options={vacantBeds.map(b => ({
              value: b.id,
              label: `${b.bedCode} (${formatCurrency(b.monthlyRent)}/mo)`
            }))}
          />
        </div>

        {error && <span className="form-error-msg">{error}</span>}
      </div>
    </Modal>
  );
};
