import React, { useState, useEffect } from 'react';
import {
  Building2,
  BedDouble,
  CreditCard,
  AlertCircle,
  Plus,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  Calendar,
  Sparkles,
  ChevronRight,
  UserPlus,
  Crown,
  UserCheck,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProperty } from '../../context/PropertyContext';
import { api } from '../../services/api';
import { KpiMetrics, NotificationItem, ActivityLog, Property } from '../../types';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RevenueExpenseChart } from './charts/RevenueExpenseChart';
import { OccupancyDonutChart } from './charts/OccupancyDonutChart';
import { PaymentCollectionBar } from './charts/PaymentCollectionBar';
import { formatINR } from '../../utils/formatters';
import { NavRoute } from '../../components/layout/Sidebar';

interface DashboardOverviewProps {
  onNavigate: (route: NavRoute, entityId?: string) => void;
  onQuickAction: (action: 'add_resident' | 'record_payment' | 'add_expense' | 'add_room' | 'add_property') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onQuickAction,
}) => {
  const { currentUser, isOwner } = useAuth();
  const { selectedPropertyId, properties, setSelectedPropertyId } = useProperty();

  const [metrics, setMetrics] = useState<KpiMetrics | null>(null);
  const [needsAttention, setNeedsAttention] = useState<NotificationItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [financials, setFinancials] = useState<{ month: string; revenue: number; expenses: number }[]>([]);
  const [occupancyBreakdown, setOccupancyBreakdown] = useState<
    { propertyName: string; occupied: number; total: number; percentage: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const summary = await api.getDashboardSummary(selectedPropertyId);
        setMetrics(summary.metrics);
        setNeedsAttention(summary.needsAttention);
        setRecentActivity(summary.recentActivity);
        setFinancials(summary.monthlyFinancials);
        setOccupancyBreakdown(summary.occupancyBreakdown);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [selectedPropertyId]);

  const firstName = currentUser?.name.split(' ')[0] || 'Admin';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Platform Owner Master Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8E1D9] shadow-xs relative overflow-hidden">
        {/* Subtle decorative accent */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#FDF4F0] to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B85C38] text-white shadow-2xs">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>Platform Owner Portal</span>
              </span>
              <span className="text-xs font-semibold text-[#716A63] bg-[#F8F6F2] px-2.5 py-0.5 rounded-full border border-[#E8E1D9]">
                {currentUser?.businessName || 'Nivaas Living Spaces LLP'}
              </span>
              <span className="text-[11px] text-[#16845B] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> All 3 Properties Live
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#24211F] tracking-tight">
              Good morning, {currentUser?.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#716A63] mt-1 max-w-2xl leading-relaxed">
              Consolidated enterprise dashboard across your Bangalore PG operations. Track revenue realization, bed occupancy, manager activities, and expense ratios from one centralized platform.
            </p>
          </div>

          {/* Owner Quick Controls */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => onQuickAction('add_property')}
              className="px-3.5 py-2 bg-white hover:bg-stone-50 text-[#24211F] text-xs font-semibold rounded-lg border border-[#E8E1D9] shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Building2 className="w-4 h-4 text-[#B85C38]" />
              <span>+ Add Property</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('staff')}
              className="px-3.5 py-2 bg-white hover:bg-stone-50 text-[#24211F] text-xs font-semibold rounded-lg border border-[#E8E1D9] shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-[#2786B8]" />
              <span>Manage Staff</span>
            </button>
            <button
              type="button"
              onClick={() => onQuickAction('add_resident')}
              className="px-3.5 py-2 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Onboard Resident</span>
            </button>
          </div>
        </div>
      </div>

      {/* Platform Owner KPI Command Center (4 Key Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Properties */}
        <KpiCard
          title="Total Properties"
          value={metrics?.totalProperties || 3}
          subtitle="3 Branches across Bangalore Tech Hubs"
          icon={<Building2 className="w-5 h-5" />}
          highlight="terracotta"
          onClick={() => onNavigate('properties')}
        />

        {/* 2. Occupied Beds */}
        <KpiCard
          title="Consolidated Occupancy"
          value={`${metrics?.occupiedBeds || 42} / ${metrics?.totalBeds || 60}`}
          icon={<BedDouble className="w-5 h-5" />}
          progress={{
            percentage: metrics?.occupancyRate || 70,
            colorClass: 'bg-[#B85C38]',
          }}
          subtitle={`${metrics?.vacantBeds || 14} vacant beds ready to allocate`}
          onClick={() => onNavigate('rooms')}
        />

        {/* 3. Monthly Revenue */}
        <KpiCard
          title="Gross Monthly Rent Roll"
          value={formatINR(metrics?.monthlyRevenue || 324000)}
          subtitle="October 2026 collections"
          icon={<CreditCard className="w-5 h-5" />}
          trend={{
            value: `+${metrics?.revenueGrowthPct || 8.4}% vs Sep`,
            isPositive: true,
          }}
          highlight="success"
          onClick={() => onNavigate('payments')}
        />

        {/* 4. Pending Payments */}
        <KpiCard
          title="Outstanding Balances"
          value={formatINR(metrics?.pendingRentAmount || 48000)}
          subtitle={`${metrics?.pendingResidentsCount || 6} residents pending payment`}
          icon={<AlertCircle className="w-5 h-5 text-[#D99118]" />}
          highlight="warning"
          onClick={() => onNavigate('payments')}
        />
      </div>

      {/* Owner Fast Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FFFEFC] p-3.5 rounded-xl border border-[#E8E1D9] text-xs shadow-2xs">
        <div className="p-2 border-r border-[#E8E1D9] last:border-r-0">
          <p className="text-[#716A63] text-[11px]">Net Operating Income (NOI)</p>
          <p className="text-base font-bold text-[#16845B] mt-0.5">
            ₹1,59,000 <span className="text-[11px] font-normal text-[#16845B]">(49.1% Margin)</span>
          </p>
        </div>
        <div className="p-2 border-r border-[#E8E1D9] last:border-r-0">
          <p className="text-[#716A63] text-[11px]">Security Deposit Reserves</p>
          <p className="text-base font-bold text-[#24211F] mt-0.5">
            ₹4,80,000 <span className="text-[11px] font-normal text-[#716A63]">(Escrow)</span>
          </p>
        </div>
        <div className="p-2 border-r border-[#E8E1D9] last:border-r-0">
          <p className="text-[#716A63] text-[11px]">Overdue Defaulters</p>
          <p className="text-base font-bold text-[#D64545] mt-0.5">
            {formatINR(metrics?.overdueRentAmount || 16000)} <span className="text-[11px] font-normal text-[#D64545]">(2 Residents)</span>
          </p>
        </div>
        <div className="p-2">
          <p className="text-[#716A63] text-[11px]">Active Property Managers</p>
          <p className="text-base font-bold text-[#2786B8] mt-0.5">
            2 Managers <span className="text-[11px] font-normal text-[#716A63]">(3 Properties)</span>
          </p>
        </div>
      </div>

      {/* Platform Owner Property Comparison Matrix */}
      <div className="bg-white rounded-xl border border-[#E8E1D9] shadow-sm overflow-hidden">
        <div className="p-4.5 border-b border-[#E8E1D9] bg-[#FFFEFC] flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#24211F] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#B85C38]" />
              <span>Multi-Property Portfolio Matrix (Owner View)</span>
            </h3>
            <p className="text-xs text-[#716A63] mt-0.5">
              Live comparison of occupancy, collection realization, and assigned managers
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('properties')}
            className="text-xs font-semibold text-[#B85C38] hover:text-[#984629] flex items-center gap-1"
          >
            <span>View All Property Cards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFFEFC] border-b border-[#E8E1D9] text-[#716A63] font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Property Branch</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Beds (Occupied / Total)</th>
                <th className="py-3 px-4">Occupancy %</th>
                <th className="py-3 px-4">Monthly Revenue</th>
                <th className="py-3 px-4">Property Manager</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D9]">
              {properties.map((p) => {
                const pct = p.totalBeds > 0 ? Math.round((p.occupiedBeds / p.totalBeds) * 100) : 0;
                return (
                  <tr key={p.id} className="hover:bg-[#FDF4F0]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#24211F]">{p.name}</p>
                      <p className="text-[11px] text-[#716A63]">{p.address}, {p.city}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.type} />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#24211F]">
                      {p.occupiedBeds} / {p.totalBeds} Beds
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-[#F0ECE6] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#B85C38] h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-bold text-[#24211F]">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#16845B]">
                      {formatINR(p.monthlyRevenue)}
                    </td>
                    <td className="py-3.5 px-4 text-[#716A63] font-medium">
                      {p.managerName}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPropertyId(p.id);
                          onNavigate('rooms');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-[#B85C38] hover:bg-[#FDF4F0] rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <span>Manage Rooms</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Expenses (Spans 2 columns) */}
        <div className="lg:col-span-2">
          <RevenueExpenseChart data={financials} />
        </div>

        {/* Occupancy Donut Gauge (Spans 1 column) */}
        <div className="lg:col-span-1">
          <OccupancyDonutChart
            occupied={metrics?.occupiedBeds || 42}
            total={metrics?.totalBeds || 60}
            propertyBreakdown={occupancyBreakdown}
          />
        </div>
      </div>

      {/* Payment Collection Full Width Bar */}
      <div>
        <PaymentCollectionBar
          collected={metrics?.monthlyRevenue || 324000}
          pending={metrics?.pendingRentAmount || 48000}
          overdue={metrics?.overdueRentAmount || 16000}
        />
      </div>

      {/* Operations Split: Needs Attention Panel & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Attention Panel */}
        <div className="bg-white rounded-xl border border-[#E8E1D9] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E1D9]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#B85C38]" />
              <h3 className="text-base font-semibold text-[#24211F]">Needs Attention</h3>
            </div>
            <span className="text-xs bg-[#FEF8EC] text-[#D99118] font-bold px-2 py-0.5 rounded-full border border-[#F7E4BE]">
              {needsAttention.length} Pending Actions
            </span>
          </div>

          <div className="space-y-3">
            {needsAttention.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC] hover:border-[#B85C38]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#24211F]">{item.title}</span>
                      <StatusBadge status={item.type === 'rent_overdue' ? 'overdue' : 'pending'} />
                    </div>
                    <p className="text-xs text-[#716A63] mt-1 leading-relaxed">{item.message}</p>
                  </div>
                  {item.linkRoute && (
                    <button
                      type="button"
                      onClick={() => onNavigate(item.linkRoute as NavRoute)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#B85C38] hover:bg-[#FDF4F0] rounded-lg transition-colors shrink-0"
                    >
                      Resolve →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl border border-[#E8E1D9] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E1D9]">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#716A63]" />
              <h3 className="text-base font-semibold text-[#24211F]">Manager & Operational Activity</h3>
            </div>
            <span className="text-[11px] text-[#9E968E]">Demonstration Sample Feed</span>
          </div>

          <div className="space-y-3.5">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#B85C38] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#24211F] truncate">{log.action}</span>
                    <span className="text-[11px] text-[#9E968E] shrink-0">{log.timestamp}</span>
                  </div>
                  <p className="text-[#716A63] mt-0.5">{log.description}</p>
                  <p className="text-[10px] text-[#9E968E] mt-0.5">
                    Logged by <span className="font-semibold text-[#24211F]">{log.performedBy}</span> • {log.propertyName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
