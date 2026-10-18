import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Crown,
  BedDouble,
  UserCheck,
} from 'lucide-react';
import { PGOwnerAccount, SubscriptionPlan, SubscriptionStatus } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/formatters';

interface PGOwnersPageProps {
  onOpenOnboardModal: () => void;
}

export const PGOwnersPage: React.FC<PGOwnersPageProps> = ({ onOpenOnboardModal }) => {
  const [owners, setOwners] = useState<PGOwnerAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriptionStatus>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<PGOwnerAccount | null>(null);

  const toast = useToast();

  const loadOwners = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPGOwners();
      setOwners(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  const handleToggleStatus = async (pg: PGOwnerAccount) => {
    const nextStatus = pg.subscriptionStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updatePGOwnerStatus(pg.id, nextStatus);
      toast.success(
        'Subscription Updated',
        `${pg.businessName} status is now ${nextStatus.toUpperCase()}`
      );
      loadOwners();
      if (selectedOwner?.id === pg.id) {
        setSelectedOwner({ ...selectedOwner, subscriptionStatus: nextStatus });
      }
    } catch {
      toast.error('Update Failed', 'Could not update subscription');
    }
  };

  const filteredOwners = owners.filter((o) => {
    const matchesSearch =
      o.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm) ||
      o.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.subscriptionStatus === statusFilter;
    const matchesCity = cityFilter === 'all' || o.city.toLowerCase() === cityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCity;
  });

  const cities = Array.from(new Set(owners.map((o) => o.city)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#24211F] tracking-tight">
              PG Owners Directory
            </h1>
            <span className="text-xs bg-[#FDF4F0] text-[#B85C38] font-bold px-2 py-0.5 rounded-full border border-[#F6E2DA]">
              {owners.length} Onboarded
            </span>
          </div>
          <p className="text-xs text-[#716A63] mt-1">
            Platform Owner Authority: Onboard new PG businesses, manage enterprise tiers, and toggle account access.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenOnboardModal}
          className="px-4 py-2.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all shrink-0 hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New PG Owner</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E1D9] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#716A63] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by PG brand, owner name, phone, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E8E1D9] rounded-xl bg-[#FFFEFC] text-[#24211F] outline-none focus:border-[#B85C38]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-[#E8E1D9] rounded-xl bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="trial">Trial Only</option>
            <option value="suspended">Suspended Only</option>
          </select>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 border border-[#E8E1D9] rounded-xl bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
          >
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PG Owners Directory Table */}
      <div className="bg-white rounded-2xl border border-[#E8E1D9] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-[#B85C38] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#716A63]">Loading directory...</p>
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-10 h-10 text-[#9E968E] mx-auto mb-2 opacity-50" />
            <h3 className="font-bold text-sm text-[#24211F]">No PG Owners found</h3>
            <p className="text-xs text-[#716A63] mt-1 max-w-sm mx-auto">
              No PG businesses match your search or filter criteria. Try clearing your filters or onboard a new PG Owner.
            </p>
            <button
              type="button"
              onClick={onOpenOnboardModal}
              className="mt-4 px-4 py-2 bg-[#B85C38] text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Onboard PG Owner</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F6F2] text-[#716A63] font-semibold border-b border-[#E8E1D9]">
                <tr>
                  <th className="px-5 py-3">PG Business / Owner</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">SaaS Tier</th>
                  <th className="px-4 py-3">Properties & Beds</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Onboarded</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9]">
                {filteredOwners.map((pg) => {
                  const isSuspended = pg.subscriptionStatus === 'suspended';
                  const isTrial = pg.subscriptionStatus === 'trial';
                  return (
                    <tr
                      key={pg.id}
                      className="hover:bg-[#FDF4F0]/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedOwner(pg)}
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#24211F] text-sm">{pg.businessName}</div>
                        <div className="text-xs text-[#716A63] flex items-center gap-1.5 mt-0.5">
                          <Crown className="w-3 h-3 text-[#B85C38]" />
                          <span>Owner: {pg.ownerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs font-medium text-[#24211F] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#716A63]" />
                          <span>{pg.phone}</span>
                        </div>
                        <div className="text-[11px] text-[#716A63] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-[#716A63]" />
                          <span className="truncate max-w-[140px]">{pg.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 font-medium text-[#24211F]">
                          <MapPin className="w-3.5 h-3.5 text-[#B85C38] shrink-0" />
                          <span>{pg.city}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className={`inline-flex flex-col px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            pg.plan === 'enterprise'
                              ? 'bg-purple-100 text-purple-800'
                              : pg.plan === 'growth'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          <span>{pg.plan}</span>
                          <span className="font-extrabold normal-case text-xs">
                            {formatINR(pg.monthlyFee)}/mo
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-[#24211F]">
                          {pg.propertiesCount} of {pg.maxProperties} Properties
                        </div>
                        <div className="text-[11px] text-[#716A63] flex items-center gap-1 mt-0.5">
                          <BedDouble className="w-3 h-3 text-[#716A63]" />
                          <span>{pg.totalBedsCount} Beds hosted</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
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
                      <td className="px-4 py-4 text-[#716A63] font-mono text-[11px]">
                        {pg.onboardedDate}
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOwner(pg)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#716A63] hover:text-[#24211F] bg-[#F8F6F2] hover:bg-[#E8E1D9] rounded-lg transition-colors"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(pg)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                              isSuspended
                                ? 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                : 'border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100'
                            }`}
                          >
                            {isSuspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Owner Details Drawer / Modal */}
      {selectedOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24211F]/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E8E1D9] overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FDF4F0] text-[#B85C38] px-2 py-0.5 rounded border border-[#F6E2DA]">
                  PG Business Profile
                </span>
                <h3 className="text-lg font-bold text-[#24211F] mt-1">
                  {selectedOwner.businessName}
                </h3>
                <p className="text-xs text-[#716A63]">
                  Managed by {selectedOwner.ownerName} · {selectedOwner.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOwner(null)}
                className="p-1.5 text-[#716A63] hover:text-[#24211F] rounded-lg hover:bg-[#F8F6F2]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#F8F6F2] rounded-xl border border-[#E8E1D9] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#716A63]">Contact Mobile:</span>
                <span className="font-semibold text-[#24211F]">{selectedOwner.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#716A63]">Official Email:</span>
                <span className="font-semibold text-[#24211F]">{selectedOwner.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#716A63]">SaaS Subscription:</span>
                <span className="font-bold text-[#B85C38] uppercase">
                  {selectedOwner.plan} ({formatINR(selectedOwner.monthlyFee)}/mo)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#716A63]">Property Quota:</span>
                <span className="font-semibold text-[#24211F]">
                  {selectedOwner.propertiesCount} / {selectedOwner.maxProperties} Max Properties
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#716A63]">Total Beds Hosted:</span>
                <span className="font-semibold text-[#24211F]">
                  {selectedOwner.totalBedsCount} Beds
                </span>
              </div>
              {selectedOwner.gstin && (
                <div className="flex justify-between">
                  <span className="text-[#716A63]">GSTIN:</span>
                  <span className="font-mono text-[#24211F]">{selectedOwner.gstin}</span>
                </div>
              )}
              {selectedOwner.panNumber && (
                <div className="flex justify-between">
                  <span className="text-[#716A63]">PAN Number:</span>
                  <span className="font-mono text-[#24211F]">{selectedOwner.panNumber}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <p className="font-semibold">Delegated Operations:</p>
              <p className="text-[11px] mt-0.5">
                {selectedOwner.ownerName} has full authority over their PG properties to add staff, manage rooms, beds, and onboard tenants independently.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleToggleStatus(selectedOwner)}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors ${
                  selectedOwner.subscriptionStatus === 'suspended'
                    ? 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    : 'border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100'
                }`}
              >
                {selectedOwner.subscriptionStatus === 'suspended'
                  ? 'Reactivate Subscription'
                  : 'Suspend PG Access'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedOwner(null)}
                className="px-4 py-2 text-xs font-semibold text-[#716A63] hover:text-[#24211F] border border-[#E8E1D9] rounded-lg hover:bg-[#F8F6F2]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
