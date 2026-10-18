import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Expense, ExpenseCategory } from '../../../types/expense';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/formatters';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Expense;
}

const CATEGORIES: ExpenseCategory[] = [
  'Electricity',
  'Water',
  'Internet',
  'Food and groceries',
  'Housekeeping',
  'Maintenance and repairs',
  'Staff salaries',
  'Rent or lease',
  'Municipal Taxes',
  'Other'
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const { properties } = useApp();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [category, setCategory] = useState<ExpenseCategory>('Electricity');
  const [amount, setAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Credit Card' | 'Cheque'>('UPI');
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setPropertyId(initialData.propertyId);
      setCategory(initialData.category);
      setAmount(initialData.amount);
      setExpenseDate(initialData.expenseDate);
      setPaymentMethod(initialData.paymentMethod);
      setVendor(initialData.vendor);
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setPropertyId(properties[0]?.id || '');
      setCategory('Electricity');
      setAmount(0);
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setVendor('');
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen, properties]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title / description is required';
    if (!propertyId) newErrors.propertyId = 'Please select a property';
    if (!amount || amount <= 0) newErrors.amount = 'Please enter a valid amount';
    if (!vendor.trim()) newErrors.vendor = 'Vendor / payee name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const matchedProp = properties.find(p => p.id === propertyId);

    onSubmit({
      title,
      propertyId,
      propertyName: matchedProp?.name || '',
      category,
      amount: Number(amount),
      expenseDate,
      paymentMethod,
      vendor,
      notes
    });

    showToast(
      initialData ? 'Expense Updated' : 'Expense Recorded',
      `${title} of ${formatCurrency(amount)} recorded under ${category}.`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Expense' : 'Record Operating Expense'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          {properties.length > 0 && (
            <Button variant="primary" onClick={handleSubmit} type="button">
              {initialData ? 'Save Changes' : 'Record Expense'}
            </Button>
          )}
        </>
      }
    >
      {properties.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', backgroundColor: 'var(--warning-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning-200)' }}>
          <p style={{ color: 'var(--warning-900)', fontSize: '13.5px', marginBottom: '6px', fontWeight: 700 }}>
            No PG Property Found
          </p>
          <p style={{ color: 'var(--warning-800)', fontSize: '12.5px' }}>
            Please register a PG property first before logging operational utility bills and expenses.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Expense Title"
            placeholder="e.g. BESCOM Monthly Power Bill, Water Tanker"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            error={errors.title}
          />

        <div className="form-row">
          <Select
            label="Property"
            required
            value={propertyId}
            onChange={e => setPropertyId(e.target.value)}
            options={properties.map(p => ({ value: p.id, label: p.name }))}
            error={errors.propertyId}
          />
          <Select
            label="Category"
            required
            value={category}
            onChange={e => setCategory(e.target.value as ExpenseCategory)}
            options={CATEGORIES.map(c => ({ value: c, label: c }))}
          />
        </div>

        <div className="form-row">
          <Input
            label="Amount (₹)"
            type="number"
            required
            prefixIcon={<span>₹</span>}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            error={errors.amount}
          />
          <Input
            label="Expense Date"
            type="date"
            required
            value={expenseDate}
            onChange={e => setExpenseDate(e.target.value)}
          />
        </div>

        <div className="form-row">
          <Input
            label="Vendor / Payee / Bill Account"
            placeholder="e.g. BESCOM, Cauvery Water, CleanCare"
            required
            value={vendor}
            onChange={e => setVendor(e.target.value)}
            error={errors.vendor}
          />
          <Select
            label="Payment Mode"
            required
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as any)}
            options={[
              { value: 'UPI', label: 'UPI' },
              { value: 'Bank Transfer', label: 'Bank Transfer (NEFT/RTGS)' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Credit Card', label: 'Credit Card' },
              { value: 'Cheque', label: 'Cheque' }
            ]}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes / Bill Reference</label>
          <input
            className="form-input"
            placeholder="Invoice / consumer ID or notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </form>
    )}
  </Modal>
  );
};
