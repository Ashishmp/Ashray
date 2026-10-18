import React, { useState } from 'react';
import { ExpenseCategory, PaymentMethod } from '../../types';
import { useProperty } from '../../context/PropertyContext';
import { Modal } from '../../components/common/Modal';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expenseData: any) => Promise<void>;
  isLoading?: boolean;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { properties, selectedPropertyId } = useProperty();

  const [propertyId, setPropertyId] = useState(
    selectedPropertyId !== 'all' ? selectedPropertyId : properties[0]?.id || 'prop_1'
  );
  const [category, setCategory] = useState<ExpenseCategory>('electricity');
  const [amount, setAmount] = useState<number>(3500);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendorName, setVendorName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [description, setDescription] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Please provide a valid expense amount');
      return;
    }
    if (!vendorName.trim()) {
      setError('Please provide vendor / payee name');
      return;
    }

    const selectedProp = properties.find((p) => p.id === propertyId);

    await onSubmit({
      propertyId,
      propertyName: selectedProp?.name || 'Nivaas Property',
      category,
      amount: Number(amount),
      expenseDate,
      vendorName: vendorName.trim(),
      paidBy: 'Current User',
      paymentMethod,
      description: description.trim() || `${category} expense`,
      invoiceNumber: invoiceNumber.trim(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Property Expense"
      subtitle="Log operational utility, repair, food, or housekeeping bill"
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
            className="px-4 py-2 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            {isLoading ? 'Recording...' : 'Record Expense'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#24211F] mb-1">Select Property</label>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Expense Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            >
              <option value="electricity">Electricity (BESCOM)</option>
              <option value="water">Water & Tanker (BWSSB)</option>
              <option value="internet">Commercial Internet / WiFi</option>
              <option value="food_cook">Cook Wages & Food Grocery</option>
              <option value="housekeeping">Housekeeping & Cleaning</option>
              <option value="staff_salary">Staff Salary</option>
              <option value="repairs">Repairs & Plumbing</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other Operational</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">
              Amount (₹) <span className="text-[#D64545]">*</span>
            </label>
            <input
              type="number"
              step={50}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">
              Vendor / Paid To <span className="text-[#D64545]">*</span>
            </label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g. BESCOM, Balaji Water Suppliers"
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            >
              <option value="upi">UPI / Online</option>
              <option value="bank_transfer">Bank Transfer / NEFT</option>
              <option value="cash">Cash Voucher</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Expense Date</label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Invoice / Bill # (Optional)</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="e.g. INV-8921"
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#24211F] mb-1">Description / Bill Notes</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Monthly electricity meter reading cycle"
            className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
          />
        </div>

        {error && (
          <p className="p-2.5 bg-rose-50 border border-rose-200 text-[#D64545] rounded-lg text-xs">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
};
