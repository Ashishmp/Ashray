import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  BedDouble,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Crown,
} from 'lucide-react';
import { PGOwnerAccount } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/formatters';

interface PlatformOverviewProps {
  onNavigateToPGOwners: () => void;
  onOpenOnboardModal: () => void;
}

export const PlatformOverview: React.FC<PlatformOverviewProps> = ({
  onNavigateToPGOwners,
  onOpenOnboardModal,
}) => {
  const [summary, setSummary] = useState<{
    totalPGOwners: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    suspendedSubscriptions: number;
    totalManagedBeds: number;
    totalProperties: number;
    monthlyRecurringRevenue: number;
    avgRevenuePerPG: number;
    recentOnboardings: PGOwnerAccount[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPlatformSummary();
      setSummary(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (pg: PGOwnerAccount) => {
    const nextStatus = pg.subscriptionStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updatePGOwnerStatus(pg.id, nextStatus);
      toast.success(
        'Subscription Updated',
        `${pg.businessName} is now ${nextStatus.toUpperCase()}`
      );
      loadData();
    } catch {
      toast.error('Update Failed', 'Could not modify subscription status');
    }
  };

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#B85C38] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#716A63] font-medium">Loading Platform SaaS Insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Platform Authority & Scope Notice Banner */}
      <div className="bg-gradient-to-r from-[#24211F] via-[#312B27] to-[#24211F] text-white p-5 rounded-2xl shadow-md border border-[#453E38] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 max-w-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#B85C38] flex items-center justify-center shrink-0 shadow-xs">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight">Platform Owner Console</span>
                <span className="text-[10px] uppercase font-bold bg-[#B85C38]/30 text-amber-300 border border-[#B85C38] px-2 py-0.5 rounded-full">
                  Limited Rights: Onboarding Only
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                As the <strong>Platform Owner</strong>, your operational authority is strictly focused on onboarding and managing independent PG Owners across India. Individual PG tenant records, rooms, beds, and PG branch staff are added and governed directly by each PG Owner.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenOnboardModal}
              className="px-4 py-2.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New PG Owner</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToPGOwners}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <span>View All Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* High-Impact Platform KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total PG Owners */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#716A63]">Total PG Businesses</p>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#B85C38] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#24211F]">{summary.totalPGOwners}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {summary.activeSubscriptions} Active
            </span>
          </div>
          <p className="text-[11px] text-[#716A63] mt-2">
            {summary.trialSubscriptions} on 14-day trial · Across {summary.totalProperties} properties
          </p>
        </div>

        {/* Card 2: Total Managed Beds */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#716A63]">Total Beds Hosted</p>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2786B8] flex items-center justify-center">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#24211F]">{summary.totalManagedBeds}</span>
            <span className="text-xs font-medium text-[#716A63]">bed capacity</span>
          </div>
          <p className="text-[11px] text-[#716A63] mt-2">
            Aggregate student & professional capacity across all PGs
          </p>
        </div>

        {/* Card 3: Platform SaaS MRR */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#716A63]">Monthly SaaS Revenue</p>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#24211F]">
              {formatINR(summary.monthlyRecurringRevenue)}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              MRR
            </span>
          </div>
          <p className="text-[11px] text-[#716A63] mt-2">
            Recurring subscription revenue from active PG owners
          </p>
        </div>

        {/* Card 4: Avg Fee Per PG */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#716A63]">Average ARPU / PG</p>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#24211F]">
              {formatINR(summary.avgRevenuePerPG)}
            </span>
            <span className="text-[10px] text-[#716A63]">/month</span>
          </div>
          <p className="text-[11px] text-[#716A63] mt-2">
            Healthy SaaS unit economics across Growth & Starter tiers
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Onboardings Table & SaaS Plan Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent PG Onboardings (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E1D9] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8E1D9] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#24211F]">Recent PG Owner Onboardings</h3>
              <p className="text-xs text-[#716A63]">
                PG businesses on-boarded to the Nivaas SaaS platform
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToPGOwners}
              className="text-xs font-semibold text-[#B85C38] hover:text-[#984629] flex items-center gap-1"
            >
              <span>View All ({summary.totalPGOwners})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F6F2] text-[#716A63] font-semibold border-b border-[#E8E1D9]">
                <tr>
                  <th className="px-5 py-3">PG Business / Owner</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">SaaS Tier</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9]">
                {summary.recentOnboardings.map((pg) => {
                  const isSuspended = pg.subscriptionStatus === 'suspended';
                  const isTrial = pg.subscriptionStatus === 'trial';
                  return (
                    <tr key={pg.id} className="hover:bg-[#FDF4F0]/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-[#24211F]">{pg.businessName}</div>
                        <div className="text-[11px] text-[#716A63] mt-0.5">
                          Owner: {pg.ownerName} · {pg.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-[#24211F]">{pg.city}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            pg.plan === 'enterprise'
                              ? 'bg-purple-100 text-purple-800'
                              : pg.plan === 'growth'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {pg.plan} ({formatINR(pg.monthlyFee)})
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-[#24211F]">
                          {pg.propertiesCount} Props · {pg.totalBedsCount} Beds
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isSuspended
                              ? 'bg-rose-100 text-rose-800'
                              : isTrial
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSuspended
                                ? 'bg-rose-600'
                                : isTrial
                                ? 'bg-amber-600'
                                : 'bg-emerald-600'
                            }`}
                          />
                          {pg.subscriptionStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(pg)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                            isSuspended
                              ? 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              : 'border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100'
                          }`}
                        >
                          {isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Platform Tier Breakdown & System Health */}
        <div className="space-y-6">
          {/* SaaS Tier Plan Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
            <h3 className="font-bold text-sm text-[#24211F] mb-1">SaaS Plan Distribution</h3>
            <p className="text-xs text-[#716A63] mb-4">
              Subscription tiers adopted by onboarded PG owners
            </p>

            <div className="space-y-3 text-xs">
              {/* Starter */}
              <div className="p-3 rounded-xl bg-[#F8F6F2] border border-[#E8E1D9]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#24211F]">Starter Tier</span>
                  <span className="font-bold text-[#B85C38]">₹2,499/mo</span>
                </div>
                <div className="text-[11px] text-[#716A63] flex items-center justify-between">
                  <span>Up to 2 PGs · 30 Beds</span>
                  <span className="font-semibold text-[#24211F]">2 Owners</span>
                </div>
              </div>

              {/* Growth */}
              <div className="p-3 rounded-xl bg-[#FDF4F0] border border-[#F6E2DA]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#B85C38]">Growth Tier</span>
                  <span className="font-bold text-[#B85C38]">₹4,999/mo</span>
                </div>
                <div className="text-[11px] text-[#716A63] flex items-center justify-between">
                  <span>Up to 5 PGs · 80 Beds</span>
                  <span className="font-semibold text-[#B85C38]">2 Owners (Popular)</span>
                </div>
              </div>

              {/* Enterprise */}
              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-purple-900">Enterprise Tier</span>
                  <span className="font-bold text-purple-900">₹9,999/mo</span>
                </div>
                <div className="text-[11px] text-purple-700 flex items-center justify-between">
                  <span>15+ PGs · 200+ Beds</span>
                  <span className="font-semibold text-purple-900">1 Owner</span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Security & Role Policy */}
          <div className="bg-[#FFFEFC] p-5 rounded-2xl border border-[#E8E1D9] shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-[#B85C38]">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-xs">Role-Based Access Policy</h4>
            </div>
            <p className="text-[11px] text-[#716A63] leading-relaxed mb-3">
              <strong>Super Admin Isolation:</strong> Platform Owners cannot add tenants, rooms, or PG branch managers into specific PGs. That privilege is delegated to the PG Owner upon onboarding.
            </p>
            <div className="p-2.5 rounded-lg bg-[#F8F6F2] border border-[#E8E1D9] text-[11px] space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Platform Owner: Boards PG Owners</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PG Owner: Adds Staff & Manages Tenants</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
