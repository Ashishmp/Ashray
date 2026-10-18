import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Download,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Receipt,
  FileText,
} from 'lucide-react';
import { Payment } from '../../types';
import { api } from '../../services/api';
import { useProperty } from '../../context/PropertyContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RecordPaymentModal } from './RecordPaymentModal';
import { RentReceiptModal } from './RentReceiptModal';
import { formatINR, formatDate } from '../../utils/formatters';

interface PaymentsPageProps {
  onOpenReceipt?: (payment: Payment) => void;
  activeReceiptPayment?: Payment | null;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  onOpenReceipt,
  activeReceiptPayment,
}) => {
  const { selectedPropertyId } = useProperty();
  const toast = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(
    activeReceiptPayment || null
  );

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const list = await api.getPayments(selectedPropertyId);
      setPayments(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedPropertyId]);

  useEffect(() => {
    if (activeReceiptPayment) {
      setSelectedReceipt(activeReceiptPayment);
    }
  }, [activeReceiptPayment]);

  const handleRecordPayment = async (data: any) => {
    const newPayment = await api.recordPayment(data);
    toast.success('Payment Recorded', `Recorded ${formatINR(data.amountPaid)} successfully.`);
    await fetchPayments();
    setSelectedReceipt(newPayment);
  };

  const handleExportCSV = () => {
    const headers = [
      'Receipt #',
      'Resident',
      'Property',
      'Room',
      'Billing Month',
      'Amount Due',
      'Amount Paid',
      'Status',
      'Payment Mode',
      'Ref Number',
    ];
    const rows = payments.map((p) => [
      p.receiptNumber,
      `"${p.residentName}"`,
      `"${p.propertyName}"`,
      `${p.roomNumber}-${p.bedNumber}`,
      p.billingMonth,
      p.amountDue,
      p.amountPaid,
      p.status,
      p.paymentMethod || 'N/A',
      p.transactionRef || 'N/A',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nivaas_Rent_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Export Complete', 'Rent payment records exported as CSV.');
  };

  // Calculations for summary cards
  const totalCollected = payments
    .filter((p) => p.status === 'paid' || p.status === 'partially_paid')
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.balanceDue, 0);

  const totalOverdue = payments
    .filter((p) => p.status === 'overdue')
    .reduce((sum, p) => sum + p.balanceDue, 0);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesMonth = monthFilter === 'all' || p.billingMonth === monthFilter;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E8E1D9] shadow-sm border-l-4 border-l-[#16845B]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#716A63]">
            Total Collected
          </p>
          <h3 className="text-2xl font-bold text-[#24211F] mt-1.5">{formatINR(totalCollected)}</h3>
          <p className="text-xs text-[#16845B] mt-2 font-medium">Realized to Bank / Cash</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8E1D9] shadow-sm border-l-4 border-l-[#D99118]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#716A63]">
            Pending Within Due
          </p>
          <h3 className="text-2xl font-bold text-[#24211F] mt-1.5">{formatINR(totalPending)}</h3>
          <p className="text-xs text-[#716A63] mt-2">Expected in current billing cycle</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8E1D9] shadow-sm border-l-4 border-l-[#D64545]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#716A63]">
            Overdue Balance
          </p>
          <h3 className="text-2xl font-bold text-[#D64545] mt-1.5">{formatINR(totalOverdue)}</h3>
          <p className="text-xs text-[#D64545] mt-2 font-medium">Notice & Nudge Required</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8E1D9] shadow-sm border-l-4 border-l-[#2786B8]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#716A63]">
            Security Deposits Held
          </p>
          <h3 className="text-2xl font-bold text-[#24211F] mt-1.5">₹4,80,000</h3>
          <p className="text-xs text-[#716A63] mt-2">Refundable escrow reserves</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-[#E8E1D9] shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#716A63] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resident, receipt #..."
              className="pl-8 pr-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] placeholder-[#9E968E] outline-none w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] outline-none cursor-pointer"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] outline-none cursor-pointer"
          >
            <option value="all">All Billing Cycles</option>
            <option value="October 2026">October 2026</option>
            <option value="September 2026">September 2026</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white hover:bg-stone-50 text-[#716A63] hover:text-[#24211F] text-xs font-semibold rounded-lg border border-[#E8E1D9] shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRecordModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-[#E8E1D9] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFFEFC] border-b border-[#E8E1D9] text-[#716A63] font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Property & Room</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D9]">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-[#FDF4F0]/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#24211F]">
                    {p.receiptNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#24211F]">{p.residentName}</td>
                  <td className="py-3.5 px-4 text-[#716A63]">
                    <span className="font-medium text-[#24211F]">
                      Room {p.roomNumber}-{p.bedNumber}
                    </span>
                    <span className="block text-[11px] truncate max-w-[140px]">
                      {p.propertyName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#716A63]">{p.billingMonth}</td>
                  <td className="py-3.5 px-4 font-bold text-[#24211F]">{formatINR(p.amountDue)}</td>
                  <td className="py-3.5 px-4 font-bold text-[#16845B]">
                    {formatINR(p.amountPaid)}
                  </td>
                  <td className="py-3.5 px-4 text-[#716A63]">{formatDate(p.dueDate)}</td>
                  <td className="py-3.5 px-4">
                    <span className="uppercase text-[11px] font-mono text-[#716A63] bg-[#F8F6F2] px-1.5 py-0.5 rounded border border-[#E8E1D9]">
                      {p.paymentMethod || '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(p)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#B85C38] hover:bg-[#FDF4F0] rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSubmit={handleRecordPayment}
      />

      {/* Tax Rent Receipt Modal */}
      <RentReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
      />
    </div>
  );
};
