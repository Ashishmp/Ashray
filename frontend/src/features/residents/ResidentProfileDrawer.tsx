import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  BedDouble,
  CreditCard,
  FileText,
  History,
  ShieldCheck,
  Calendar,
  LogOut,
  Download,
  AlertCircle,
  Briefcase,
  Car,
} from 'lucide-react';
import { Resident, Payment } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatINR, formatDate } from '../../utils/formatters';

interface ResidentProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resident: Resident | null;
  onCheckoutClick: (resident: Resident) => void;
  onViewReceipt: (payment: Payment) => void;
}

export const ResidentProfileDrawer: React.FC<ResidentProfileDrawerProps> = ({
  isOpen,
  onClose,
  resident,
  onCheckoutClick,
  onViewReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'room' | 'payments' | 'documents' | 'history'>(
    'overview'
  );
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (resident && isOpen) {
      api.getPayments().then((all) => {
        const resPayments = all.filter((p) => p.residentId === resident.id);
        setPayments(resPayments);
      });
      setActiveTab('overview');
    }
  }, [resident, isOpen]);

  if (!isOpen || !resident) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-[#24211F]/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white border-l border-[#E8E1D9] shadow-2xl flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="p-6 border-b border-[#E8E1D9] bg-[#FFFEFC]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#FDF4F0] border border-[#F6E2DA] flex items-center justify-center text-[#B85C38] font-bold text-lg shrink-0">
                  {resident.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#24211F]">{resident.name}</h2>
                    <StatusBadge status={resident.residencyStatus} />
                  </div>
                  <p className="text-xs text-[#716A63] mt-0.5">
                    Room {resident.roomNumber} - Bed {resident.bedNumber} • {resident.propertyName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {resident.residencyStatus !== 'checked_out' && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onCheckoutClick(resident);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-[#D64545] hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Initiate Move-Out</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[#716A63] hover:text-[#24211F] p-1.5 rounded-lg hover:bg-[#F8F6F2] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 5-Tab Navigation Required by Section 10 */}
            <div className="flex items-center gap-6 mt-6 border-b border-[#E8E1D9] text-xs font-medium">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'room', label: 'Room Allocation', icon: BedDouble },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'history', label: 'Activity History', icon: History },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
                      isActive
                        ? 'border-[#B85C38] text-[#B85C38] font-bold'
                        : 'border-transparent text-[#716A63] hover:text-[#24211F]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Financial quick badge */}
                <div className="p-4 rounded-xl bg-[#F8F6F2] border border-[#E8E1D9] grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[11px] text-[#716A63]">Monthly Rent</p>
                    <p className="text-base font-bold text-[#24211F] mt-0.5">
                      {formatINR(resident.monthlyRent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#716A63]">Security Deposit</p>
                    <p className="text-base font-bold text-[#16845B] mt-0.5">
                      {formatINR(resident.securityDeposit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#716A63]">Payment Status</p>
                    <div className="mt-1">
                      <StatusBadge status={resident.paymentStatus} />
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E968E] mb-3">
                    Contact & Personal Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC]">
                    <div>
                      <p className="text-[11px] text-[#716A63] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#B85C38]" /> Mobile Phone
                      </p>
                      <p className="font-semibold text-[#24211F] mt-1">{resident.phone}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#716A63] flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#B85C38]" /> Email
                      </p>
                      <p className="font-semibold text-[#24211F] mt-1">{resident.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#716A63] flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[#B85C38]" /> College / Workplace
                      </p>
                      <p className="font-semibold text-[#24211F] mt-1">
                        {resident.collegeOrCompany || 'Self Employed'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#716A63] flex items-center gap-1">
                        <Car className="w-3 h-3 text-[#B85C38]" /> Vehicle Registration
                      </p>
                      <p className="font-semibold text-[#24211F] mt-1">
                        {resident.vehicleNumber || 'No registered vehicle'}
                      </p>
                    </div>
                    <div className="sm:col-span-2 pt-2 border-t border-stone-100">
                      <p className="text-[11px] text-[#716A63] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#B85C38]" /> Permanent Hometown Address
                      </p>
                      <p className="font-medium text-[#24211F] mt-1">
                        {resident.permanentAddress}, {resident.city}, {resident.state}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E968E] mb-3">
                    Emergency Contact (Next of Kin)
                  </h4>
                  <div className="p-4 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#24211F]">
                        {resident.emergencyContact.name} ({resident.emergencyContact.relation})
                      </p>
                      <p className="text-[#716A63] mt-0.5">{resident.emergencyContact.phone}</p>
                    </div>
                    <span className="px-2 py-1 bg-stone-100 text-[#716A63] rounded text-[11px] font-medium">
                      Verified Guardian
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ROOM ALLOCATION */}
            {activeTab === 'room' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#24211F]">Current Bed Assignment</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px]">
                      Active Bed Space
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-[#F8F6F2] rounded-lg border border-[#E8E1D9]">
                      <p className="text-[11px] text-[#716A63]">Property</p>
                      <p className="font-bold text-[#24211F] mt-0.5">{resident.propertyName}</p>
                    </div>
                    <div className="p-3 bg-[#F8F6F2] rounded-lg border border-[#E8E1D9]">
                      <p className="text-[11px] text-[#716A63]">Room & Bed</p>
                      <p className="font-bold text-[#24211F] mt-0.5">
                        Room {resident.roomNumber} — Bed {resident.bedNumber}
                      </p>
                    </div>
                    <div className="p-3 bg-[#F8F6F2] rounded-lg border border-[#E8E1D9]">
                      <p className="text-[11px] text-[#716A63]">Move-In Date</p>
                      <p className="font-bold text-[#24211F] mt-0.5">
                        {formatDate(resident.moveInDate)}
                      </p>
                    </div>
                    <div className="p-3 bg-[#F8F6F2] rounded-lg border border-[#E8E1D9]">
                      <p className="text-[11px] text-[#716A63]">Rent Billing Cycle</p>
                      <p className="font-bold text-[#24211F] mt-0.5">
                        {resident.rentCycleDay}th of every month
                      </p>
                    </div>
                  </div>
                </div>

                {resident.noticeDate && (
                  <div className="p-3.5 bg-[#FEF8EC] border border-[#F7E4BE] text-[#D99118] rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Notice Period Active</p>
                      <p className="text-[11px] mt-0.5">
                        Resident submitted 30-day notice on {formatDate(resident.noticeDate)}. Expected
                        checkout date: {formatDate(resident.moveOutDate)}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PAYMENTS LEDGER */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#24211F]">Rent & Transaction Ledger</span>
                  <span className="text-[#716A63]">{payments.length} Records</span>
                </div>

                {payments.length === 0 ? (
                  <p className="text-center py-8 text-[#716A63]">No payment records found.</p>
                ) : (
                  <div className="divide-y divide-[#E8E1D9] border border-[#E8E1D9] rounded-xl overflow-hidden bg-white">
                    {payments.map((p) => (
                      <div key={p.id} className="p-3.5 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#24211F]">{p.billingMonth}</span>
                            <StatusBadge status={p.status} />
                          </div>
                          <p className="text-[11px] text-[#716A63] mt-0.5">
                            Receipt: {p.receiptNumber} • Due: {formatDate(p.dueDate)}
                            {p.transactionRef && ` • Ref: ${p.transactionRef}`}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="font-bold text-[#24211F]">{formatINR(p.amountDue)}</p>
                            <p className="text-[11px] text-[#16845B]">
                              Paid: {formatINR(p.amountPaid)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onViewReceipt(p)}
                            className="p-1.5 text-[#B85C38] hover:bg-[#FDF4F0] rounded-md transition-colors"
                            title="View Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: DOCUMENTS */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#16845B]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#24211F]">Aadhaar Govt ID Card</p>
                      <p className="text-[11px] text-[#716A63]">
                        Number: {resident.aadhaarNumber} • Verified
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded">
                    Verified
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#24211F]">Signed PG Tenancy Agreement</p>
                      <p className="text-[11px] text-[#716A63]">11-Month Digital Agreement (PDF)</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('Simulated document download.')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#B85C38] border border-[#F6E2DA] bg-[#FDF4F0] rounded-md"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: ACTIVITY HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                <div className="border-l-2 border-[#B85C38] pl-3.5 space-y-4">
                  <div>
                    <span className="text-[11px] text-[#9E968E]">October 2, 2026</span>
                    <p className="font-semibold text-[#24211F]">Rent Payment Recorded</p>
                    <p className="text-[11px] text-[#716A63]">
                      ₹11,000 paid via UPI. Receipt generated.
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#9E968E]">January 15, 2026</span>
                    <p className="font-semibold text-[#24211F]">Resident Checked In</p>
                    <p className="text-[11px] text-[#716A63]">
                      Onboarded by Vikram Gowda. Assigned Bed {resident.bedNumber}. Security deposit
                      of {formatINR(resident.securityDeposit)} received.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
