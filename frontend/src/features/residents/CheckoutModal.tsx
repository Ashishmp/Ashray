import React, { useState } from 'react';
import { Resident, PaymentMethod } from '../../types';
import { Modal } from '../../components/common/Modal';
import { formatINR } from '../../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: Resident | null;
  onConfirmCheckout: (data: {
    moveOutDate: string;
    deductions: number;
    refundAmount: number;
    refundMode: PaymentMethod;
    notes: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  resident,
  onConfirmCheckout,
  isLoading = false,
}) => {
  if (!resident) return null;

  const [moveOutDate, setMoveOutDate] = useState(new Date().toISOString().split('T')[0]);
  const [deductions, setDeductions] = useState(1500); // e.g. room deep cleaning / touchup
  const [refundMode, setRefundMode] = useState<PaymentMethod>('upi');
  const [notes, setNotes] = useState('Room cleaning & wall paint deductions');

  const depositHeld = resident.securityDeposit || 20000;
  const refundAmount = Math.max(0, depositHeld - deductions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmCheckout({
      moveOutDate,
      deductions,
      refundAmount,
      refundMode,
      notes,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Checkout & Settle: ${resident.name}`}
      subtitle="Finalize settlement, free room bed, and calculate deposit refund"
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
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-[#D64545] hover:bg-[#B93838] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            {isLoading ? 'Settling...' : 'Confirm Move-Out & Settle Refund'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-[#F8F6F2] rounded-xl border border-[#E8E1D9] flex items-center justify-between">
          <div>
            <p className="font-bold text-[#24211F]">{resident.name}</p>
            <p className="text-[11px] text-[#716A63]">
              Room {resident.roomNumber} - Bed {resident.bedNumber} • {resident.propertyName}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#716A63]">Deposit Held</span>
            <p className="font-bold text-[#16845B]">{formatINR(depositHeld)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Move-Out Date</label>
            <input
              type="date"
              value={moveOutDate}
              onChange={(e) => setMoveOutDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Deductions (₹)</label>
            <input
              type="number"
              value={deductions}
              onChange={(e) => setDeductions(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#24211F] mb-1">Deduction Reason</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Painting touchup, cleaning, electricity adjustment"
            className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
          />
        </div>

        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-900">Net Refund Payable to Resident:</span>
            <span className="text-base font-bold text-emerald-700">{formatINR(refundAmount)}</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#24211F] mb-1">Refund Payment Mode</label>
          <select
            value={refundMode}
            onChange={(e) => setRefundMode(e.target.value as PaymentMethod)}
            className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
          >
            <option value="upi">UPI Transfer (Instant)</option>
            <option value="bank_transfer">IMPS / NEFT Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};
