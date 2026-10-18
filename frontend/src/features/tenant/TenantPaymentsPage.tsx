import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Receipt,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  FileText,
} from 'lucide-react';
import { Resident, Payment } from '../../types';
import { api } from '../../services/api';
import { TenantPayRentModal } from './TenantPayRentModal';
import { RentReceiptModal } from '../payments/RentReceiptModal';
import { formatINR, formatDate } from '../../utils/formatters';

interface TenantPaymentsPageProps {
  residentId?: string;
  onOpenReceipt?: (payment: Payment) => void;
}

export const TenantPaymentsPage: React.FC<TenantPaymentsPageProps> = ({
  residentId = 'res_2', // Default to Rohan Desai
  onOpenReceipt,
}) => {
  const [resident, setResident] = useState<Resident | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resData, paymentList] = await Promise.all([
        api.getResidentById(residentId),
        api.getResidentPayments(residentId),
      ]);
      if (resData) setResident(resData);
      setPayments(paymentList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [residentId]);

  if (isLoading || !resident) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#B85C38] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#716A63] font-medium">Loading payment ledger...</p>
        </div>
      </div>
    );
  }

  const isRentPaid = resident.paymentStatus === 'paid';
  const totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  const handleOpenReceiptInternal = (payment: Payment) => {
    if (onOpenReceipt) {
      onOpenReceipt(payment);
    } else {
      setActiveReceipt(payment);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#24211F] tracking-tight">
            Rent & Payment History
          </h1>
          <p className="text-xs text-[#716A63] mt-1">
            View transaction history, download GST-ready rent receipts for HRA tax exemption, and pay monthly dues online
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPayModalOpen(true)}
          className="px-5 py-2.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all shrink-0 hover:scale-102"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay Rent Online</span>
        </button>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Due */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#716A63]">Current Rent Status</p>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isRentPaid
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {isRentPaid ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#24211F]">
              {isRentPaid ? '₹0' : formatINR(resident.monthlyRent)}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                isRentPaid
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isRentPaid ? 'PAID IN FULL' : 'PAYMENT DUE'}
            </span>
          </div>
          <p className="text-[11px] text-[#716A63] mt-2">
            {isRentPaid
              ? 'No outstanding dues for October 2026'
              : 'Due for current billing month'}
          </p>
        </div>

        {/* Card 2: Security Deposit Held */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#716A63]">Security Deposit Held</p>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2786B8] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#24211F]">
              {formatINR(resident.securityDeposit)}
            </span>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
              REFUNDABLE
            </span>
          </div>
          <p className="text-[11px] text-[#716A63] mt-2">
            Refunded upon checkout after notice clearance
          </p>
        </div>

        {/* Card 3: Next Due Date */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#716A63]">Next Billing Due</p>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#B85C38] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-[#24211F]">01 Nov 2026</span>
            <span className="text-[10px] font-semibold text-[#716A63]">Monthly cycle</span>
          </div>
          <p className="text-[11px] text-[#716A63] mt-2">
            Rent due by the 5th of every month
          </p>
        </div>

        {/* Card 4: Total Paid to Date */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#716A63]">Total Paid to Date</p>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#24211F]">
              {formatINR(totalPaid)}
            </span>
          </div>
          <p className="text-[11px] text-[#716A63] mt-2">
            Across {payments.length} transactions recorded on Nivaas
          </p>
        </div>
      </div>

      {/* Payment History Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#E8E1D9] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E1D9] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#24211F]">Payment Ledger & Receipts</h3>
            <p className="text-xs text-[#716A63]">
              Download official receipts signed with landlord PAN for company HRA tax deduction
            </p>
          </div>
          <span className="text-xs bg-[#F8F6F2] font-semibold text-[#716A63] px-2.5 py-1 rounded-lg border border-[#E8E1D9]">
            {payments.length} Records
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-[#9E968E] mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-sm text-[#24211F]">No payments recorded yet</h4>
            <p className="text-xs text-[#716A63] mt-1">
              Click &quot;Pay Rent Online&quot; above to make your first monthly rent payment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F6F2] text-[#716A63] font-semibold border-b border-[#E8E1D9]">
                <tr>
                  <th className="px-5 py-3">Receipt / Ref #</th>
                  <th className="px-4 py-3">Billing Month</th>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Amount Paid</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Official Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FDF4F0]/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold font-mono text-[#24211F]">{p.receiptNumber}</div>
                      <div className="text-[10px] text-[#716A63] font-mono mt-0.5">
                        Ref: {p.transactionRef || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-[#24211F]">{p.billingMonth}</span>
                    </td>
                    <td className="px-4 py-4 text-[#716A63] font-medium">
                      {p.paidDate ? formatDate(p.paidDate) : formatDate(p.dueDate)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-extrabold text-[#24211F]">
                        {formatINR(p.amountPaid)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F8F6F2] text-[#716A63] border border-[#E8E1D9]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>SUCCESSFUL</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenReceiptInternal(p)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#B85C38] hover:text-white bg-[#FDF4F0] hover:bg-[#B85C38] rounded-lg border border-[#F6E2DA] transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* HRA Exemption Helper Box */}
      <div className="bg-[#FFFEFC] p-5 rounded-2xl border border-[#E8E1D9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-orange-50 text-[#B85C38] shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#24211F]">
              Income Tax HRA Exemption Compliant
            </h4>
            <p className="text-[11px] text-[#716A63] mt-0.5">
              All receipts generated on Nivaas include the PG entity name, registered address, and landlord PAN number required by corporate payroll for Form 12BB tax exemption.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => payments[0] && handleOpenReceiptInternal(payments[0])}
          disabled={payments.length === 0}
          className="px-4 py-2 bg-white text-[#24211F] text-xs font-bold rounded-lg border border-[#E8E1D9] hover:bg-[#F8F6F2] transition-colors shrink-0 disabled:opacity-50"
        >
          Download Latest Receipt
        </button>
      </div>

      {/* Pay Rent Modal */}
      <TenantPayRentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        resident={resident}
        onPaymentSuccess={async (payment) => {
          await loadData();
          handleOpenReceiptInternal(payment);
        }}
      />

      {/* Standalone Receipt Modal */}
      {activeReceipt && (
        <RentReceiptModal
          isOpen={!!activeReceipt}
          onClose={() => setActiveReceipt(null)}
          payment={activeReceipt}
        />
      )}
    </div>
  );
};
