import React, { useState, useEffect } from 'react';
import {
  Building2,
  BedDouble,
  CreditCard,
  Wifi,
  Clock,
  Utensils,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Users,
  Wrench,
  Receipt,
} from 'lucide-react';
import { Resident, Payment, ServiceRequest } from '../../types';
import { api } from '../../services/api';
import { TenantPayRentModal } from './TenantPayRentModal';
import { RentReceiptModal } from '../payments/RentReceiptModal';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

interface TenantDashboardProps {
  residentId?: string;
  onNavigateToProfile: () => void;
  onNavigateToPayments: () => void;
  onNavigateToRequests: () => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({
  residentId = 'res_2', // Default to Rohan Desai
  onNavigateToProfile,
  onNavigateToPayments,
  onNavigateToRequests,
}) => {
  const [resident, setResident] = useState<Resident | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);
  const [copiedWifi, setCopiedWifi] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resData, payList, srList] = await Promise.all([
        api.getResidentById(residentId),
        api.getResidentPayments(residentId),
        api.getServiceRequests(residentId),
      ]);
      if (resData) setResident(resData);
      setRecentPayments(payList.slice(0, 3));
      setServiceRequests(srList.slice(0, 3));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [residentId]);

  const copyWifiPassword = () => {
    navigator.clipboard.writeText('nivaas@stay2026');
    setCopiedWifi(true);
    toast.info('Copied!', 'Wi-Fi password copied to clipboard');
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  if (isLoading || !resident) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#B85C38] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#716A63] font-medium">Loading your PG portal...</p>
        </div>
      </div>
    );
  }

  const isRentPaid = resident.paymentStatus === 'paid';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#24211F] via-[#312B27] to-[#24211F] text-white p-6 rounded-2xl shadow-md border border-[#453E38] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
              alt={resident.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight">
                  Namaste, {resident.name.split(' ')[0]}!
                </h1>
                <span className="text-[10px] uppercase font-bold bg-[#B85C38] text-white px-2 py-0.5 rounded-full">
                  Tenant Portal
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Stay active at <strong>{resident.propertyName}</strong> · Room {resident.roomNumber} (Bed {resident.bedNumber})
              </p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400">
                <span>Move-in: {formatDate(resident.moveInDate)}</span>
                <span>•</span>
                <span>Security Deposit: {formatINR(resident.securityDeposit)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(true)}
              className="px-4 py-2.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-102"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isRentPaid ? 'Pay Advance Rent' : 'Pay Rent Online'}</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToProfile}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <FileCheck className="w-4 h-4" />
              <span>KYC Docs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 High-Impact Cards: Rent Status, Roommate Info, Amenities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Rent Payment Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#716A63] uppercase tracking-wider">
                Monthly Rent Status
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  isRentPaid
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isRentPaid ? 'OCTOBER PAID' : 'DUE FOR OCTOBER'}
              </span>
            </div>

            <div className="mt-2">
              <span className="text-2xl font-extrabold text-[#24211F]">
                {isRentPaid ? '₹0 Due' : formatINR(resident.monthlyRent)}
              </span>
              <p className="text-[11px] text-[#716A63] mt-1">
                {isRentPaid
                  ? 'All rent dues cleared for this month. Thank you!'
                  : 'Due on 5th of this month. Pay online via UPI/Card.'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E1D9] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(true)}
              className="text-xs font-bold text-[#B85C38] hover:text-[#984629] flex items-center gap-1"
            >
              <span>{isRentPaid ? 'Pay Next Month' : 'Pay Online Now'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onNavigateToPayments}
              className="text-xs font-semibold text-[#716A63] hover:text-[#24211F]"
            >
              Payment History
            </button>
          </div>
        </div>

        {/* Card 2: Room & Roommate Details */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#716A63] uppercase tracking-wider">
                Room & Roommate
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2786B8]">
                DOUBLE SHARING
              </span>
            </div>

            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-[#B85C38]" />
                <span className="font-bold text-sm text-[#24211F]">
                  Room {resident.roomNumber} · Bed {resident.bedNumber}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E1D9] text-xs">
                <p className="text-[10px] font-semibold text-[#716A63] uppercase">
                  Roommate in Bed B:
                </p>
                <p className="font-bold text-[#24211F] mt-0.5">Tanmay Bhatt</p>
                <p className="text-[11px] text-[#716A63]">Software Engineer at Flipkart</p>
                <p className="text-[11px] text-[#716A63] mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#B85C38]" />
                  <span>+91 99300 44556</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#E8E1D9]">
            <p className="text-[11px] text-[#716A63]">Attached Bathroom · Air Conditioned · Work Desk</p>
          </div>
        </div>

        {/* Card 3: Wi-Fi & Gate Timings */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#716A63] uppercase tracking-wider">
                Amenities & Curfew
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                HIGH SPEED
              </span>
            </div>

            <div className="mt-2 space-y-2.5 text-xs">
              {/* Wi-Fi Credentials */}
              <div className="p-2.5 rounded-xl bg-[#FDF4F0] border border-[#F6E2DA] flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#B85C38] font-bold flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5" /> High-Speed 5G Wi-Fi
                  </p>
                  <p className="font-mono text-xs font-bold text-[#24211F] mt-0.5">
                    SSID: Nivaas_Koramangala_5G
                  </p>
                  <p className="text-[10px] font-mono text-[#716A63]">Key: nivaas@stay2026</p>
                </div>
                <button
                  type="button"
                  onClick={copyWifiPassword}
                  className="p-1.5 rounded-lg bg-white border border-[#E8E1D9] text-[#716A63] hover:text-[#B85C38]"
                  title="Copy Wi-Fi Password"
                >
                  {copiedWifi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Gate Curfew */}
              <div className="flex items-center justify-between text-[11px] text-[#716A63]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#B85C38]" /> Main Gate Curfew:
                </span>
                <span className="font-bold text-[#24211F]">10:30 PM (Biometric Entry)</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#E8E1D9]">
            <span className="text-[11px] text-[#716A63]">Warden Contact: +91 98860 98765</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Today's Food Mess Menu & Recent Service Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Food Mess Schedule */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#B85C38]" />
              <h3 className="font-bold text-sm text-[#24211F]">Today&apos;s Mess Food Schedule</h3>
            </div>
            <span className="text-[10px] font-semibold text-[#716A63] bg-[#F8F6F2] px-2 py-0.5 rounded border border-[#E8E1D9]">
              3 Meals Included
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F8F6F2] border border-[#E8E1D9]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#24211F]">Breakfast (7:30 AM – 9:30 AM)</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Served</span>
              </div>
              <p className="text-[11px] text-[#716A63]">
                Masala Dosa, Medu Vada, Coconut Chutney, Hot Sambar, and Filter Coffee.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8F6F2] border border-[#E8E1D9]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#24211F]">Lunch (12:30 PM – 2:30 PM)</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Served</span>
              </div>
              <p className="text-[11px] text-[#716A63]">
                Dal Tadka, Steamed Rice, Phulkas, Aloo Gobi Dry, Fresh Curd, and Papad.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#FDF4F0] border border-[#F6E2DA]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#B85C38]">Dinner (7:30 PM – 10:00 PM)</span>
                <span className="text-[10px] text-[#B85C38] font-bold">Upcoming</span>
              </div>
              <p className="text-[11px] text-[#716A63]">
                Paneer Butter Masala, Butter Naan / Tawa Roti, Jeera Rice, Dal Fry & Gulab Jamun.
              </p>
            </div>
          </div>
        </div>

        {/* Maintenance & Service Requests */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#B85C38]" />
                <h3 className="font-bold text-sm text-[#24211F]">My Maintenance Tickets</h3>
              </div>
              <button
                type="button"
                onClick={onNavigateToRequests}
                className="text-xs font-semibold text-[#B85C38] hover:text-[#984629]"
              >
                + Raise Issue
              </button>
            </div>

            {serviceRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#716A63]">
                No maintenance requests reported. Everything is in order!
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {serviceRequests.map((sr) => (
                  <div
                    key={sr.id}
                    className="p-3 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC] hover:border-[#B85C38]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#24211F]">{sr.title}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              sr.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {sr.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#716A63] mt-1">{sr.description}</p>
                      </div>
                      <span className="text-[10px] text-[#9E968E] shrink-0 font-mono">
                        {sr.createdAt.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E1D9] flex items-center justify-between text-xs">
            <span className="text-[#716A63]">Housekeeping Time: Daily 11 AM – 1 PM</span>
            <button
              type="button"
              onClick={onNavigateToRequests}
              className="text-xs font-semibold text-[#B85C38] hover:text-[#984629] flex items-center gap-1"
            >
              <span>View All Tickets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Online Rent Payment Modal */}
      <TenantPayRentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        resident={resident}
        onPaymentSuccess={async (payment) => {
          await loadData();
          setActiveReceipt(payment);
        }}
      />

      {/* Standalone Rent Receipt Modal */}
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
