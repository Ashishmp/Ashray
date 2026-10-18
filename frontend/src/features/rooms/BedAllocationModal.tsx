import React, { useState, useEffect } from 'react';
import { Bed, Resident } from '../../types';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { formatINR } from '../../utils/formatters';

interface BedAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bed: Bed | null;
  onSuccess: () => void;
}

export const BedAllocationModal: React.FC<BedAllocationModalProps> = ({
  isOpen,
  onClose,
  bed,
  onSuccess,
}) => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getResidents().then((list) => {
        // Show active residents or residents without beds
        setResidents(list);
        if (list.length > 0) {
          setSelectedResidentId(list[0].id);
        }
      });
      setError('');
    }
  }, [isOpen]);

  if (!bed) return null;

  const handleAllocate = async () => {
    if (bed.status === 'occupied') {
      setError('Cannot allocate: This bed is already occupied! Double allocation prevented.');
      return;
    }
    if (bed.status === 'maintenance') {
      setError('Cannot allocate: This bed is currently under maintenance.');
      return;
    }

    const resident = residents.find((r) => r.id === selectedResidentId);
    if (!resident) {
      setError('Please select a resident to allocate to this bed.');
      return;
    }

    setIsLoading(true);
    try {
      await api.allocateBed(bed.id, resident.id, resident.name);
      await api.updateResident(resident.id, {
        roomId: bed.roomId,
        roomNumber: bed.roomNumber,
        bedId: bed.id,
        bedNumber: bed.bedNumber,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to allocate bed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Allocate Bed ${bed.roomNumber}-${bed.bedNumber}`}
      subtitle="Assign an active resident to this vacant bed space"
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#716A63] hover:text-[#24211F] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAllocate}
            disabled={isLoading || bed.status !== 'vacant'}
            className="px-4 py-2 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Allocating...' : 'Confirm Allocation'}
          </button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Bed summary card */}
        <div className="p-3.5 bg-[#F8F6F2] rounded-xl border border-[#E8E1D9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-[#24211F]">
                Room {bed.roomNumber} — Bed {bed.bedNumber}
              </p>
              <p className="text-[11px] text-[#716A63]">Monthly Base Rent: {formatINR(bed.monthlyRent)}</p>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                bed.status === 'vacant'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              Status: {bed.status.toUpperCase()}
            </span>
          </div>
        </div>

        {bed.status !== 'vacant' && (
          <div className="p-3 bg-[#FDF0F0] border border-[#F7C6C6] text-[#D64545] rounded-xl">
            <p className="font-bold">Bed Not Available</p>
            <p className="mt-0.5 text-[11px]">
              This bed is currently marked as {bed.status}. System rules prevent double booking.
            </p>
          </div>
        )}

        {/* Resident selector */}
        {bed.status === 'vacant' && (
          <div>
            <label className="block font-semibold text-[#24211F] mb-1.5">
              Select Resident for Allocation
            </label>
            <select
              value={selectedResidentId}
              onChange={(e) => setSelectedResidentId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            >
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.phone}) — Currently Room {r.roomNumber || 'None'}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p className="p-2.5 bg-rose-50 border border-rose-200 text-[#D64545] rounded-lg text-xs">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
};
