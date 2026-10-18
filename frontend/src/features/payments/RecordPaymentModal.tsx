import React, { useState, useEffect } from 'react';
import { PaymentMethod, Resident } from '../../types';
import { api } from '../../services/api';
import { useProperty } from '../../context/PropertyContext';
import { Modal } from '../../components/common/Modal';
import { formatINR } from '../../utils/formatters';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    residentId: string;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    transactionRef?: string;
    notes?: string;
    paidDate?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { selectedPropertyId } = useProperty();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [amountPaid, setAmountPaid] = useState<number>(11000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [transactionRef, setTransactionRef] = useState('');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getResidents(selectedPropertyId).then((list) => {
        setResidents(list);
        if (list.length > 0) {
          setSelectedResidentId(list[0].id);
          setAmountPaid(list[0].monthlyRent);
        }
      });
      setTransactionRef(`UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`);
    }
  }, [isOpen, selectedPropertyId]);

  const handleResidentChange = (id: string) => {
    setSelectedResidentId(id);
    const res = residents.find((r) => r.id === id);
    if (res) {
      setAmountPaid(res.monthlyRent);
    }
  };

  const selectedResident = residents.find((r) => r.id === selectedResidentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId || !amountPaid) return;

    await onSubmit({
      residentId: selectedResidentId,
      amountPaid: Number(amountPaid),
      paymentMethod,
      transactionRef: transactionRef.trim(),
      notes: notes.trim(),
      paidDate,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Rent Payment"
      subtitle="Log incoming rent or deposit payment and generate official receipt"
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
            disabled={isLoading || !selectedResidentId || amountPaid <= 0}
            className="px-4 py-2 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Recording...' : 'Record Payment & Issue Receipt'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#24211F] mb-1">
            Select Resident <span className="text-[#D64545]">*</span>
          </label>
          <select
            value={selectedResidentId}
            onChange={(e) => handleResidentChange(e.target.value)}
            className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
          >
            {residents.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — Room {r.roomNumber}-{r.bedNumber} ({r.propertyName})
              </option>
            ))}
          </select>
        </div>

        {selectedResident && (
          <div className="p-3 bg-[#F8F6F2] rounded-xl border border-[#E8E1D9] flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#716A63]">Expected Monthly Rent:</p>
              <p className="font-bold text-sm text-[#24211F]">
                {formatINR(selectedResident.monthlyRent)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#716A63]">Current Status:</p>
              <span className="font-bold text-[11px] uppercase text-[#D99118]">
                {selectedResident.paymentStatus}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">
              Amount Received (₹) <span className="text-[#D64545]">*</span>
            </label>
            <input
              type="number"
              step={100}
              value={amountPaid}
              onChange={(e) => setAmountPaid(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Payment Date</label>
            <input
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Payment Channel</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            >
              <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
              <option value="bank_transfer">IMPS / NEFT Direct Bank</option>
              <option value="cash">Cash Payment</option>
              <option value="cheque">Bank Cheque</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">
              Transaction Ref / UTR #
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. UPI/629103829101"
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#24211F] mb-1">Operational Notes (Optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. October rent paid via Google Pay"
            className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};
