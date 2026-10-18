import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  MoreVertical,
  LogOut,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Resident, Payment } from '../../types';
import { api } from '../../services/api';
import { useProperty } from '../../context/PropertyContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AddResidentModal } from './AddResidentModal';
import { ResidentProfileDrawer } from './ResidentProfileDrawer';
import { CheckoutModal } from './CheckoutModal';
import { formatINR, formatDate } from '../../utils/formatters';
import { NavRoute } from '../../components/layout/Sidebar';

interface ResidentsPageProps {
  onNavigate: (route: NavRoute, entityId?: string) => void;
  onViewReceipt: (payment: Payment) => void;
  highlightedResidentId?: string;
}

export const ResidentsPage: React.FC<ResidentsPageProps> = ({
  onNavigate,
  onViewReceipt,
  highlightedResidentId,
}) => {
  const { selectedPropertyId } = useProperty();
  const toast = useToast();

  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [checkoutResident, setCheckoutResident] = useState<Resident | null>(null);

  const fetchResidents = async () => {
    setIsLoading(true);
    try {
      const list = await api.getResidents(selectedPropertyId);
      setResidents(list);
      if (highlightedResidentId) {
        const found = list.find((r) => r.id === highlightedResidentId);
        if (found) setSelectedResident(found);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, [selectedPropertyId, highlightedResidentId]);

  const handleAddResident = async (data: Omit<Resident, 'id'>) => {
    await api.createResident(data);
    toast.success('Resident Onboarded', `${data.name} has been added and bed allocated.`);
    await fetchResidents();
  };

  const handleConfirmCheckout = async (settleData: any) => {
    if (!checkoutResident) return;
    await api.checkoutResident(checkoutResident.id, settleData);
    toast.info('Resident Checked Out', `${checkoutResident.name} move-out finalized and bed freed.`);
    await fetchResidents();
    setCheckoutResident(null);
  };

  const filteredResidents = residents.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.propertyName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.residencyStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || r.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-[#E8E1D9] shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#716A63] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by resident name, phone, room..."
              className="pl-8 pr-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] placeholder-[#9E968E] outline-none w-60"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] outline-none cursor-pointer"
          >
            <option value="all">All Tenancies</option>
            <option value="active">Active Residents</option>
            <option value="notice_period">On Notice Period</option>
            <option value="checked_out">Checked Out</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] outline-none cursor-pointer"
          >
            <option value="all">All Rent Statuses</option>
            <option value="paid">Rent Paid</option>
            <option value="pending">Rent Pending</option>
            <option value="overdue">Rent Overdue</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resident</span>
        </button>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-xl border border-[#E8E1D9] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFFEFC] border-b border-[#E8E1D9] text-[#716A63] font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Property & Room</th>
                <th className="py-3 px-4">Move-In Date</th>
                <th className="py-3 px-4">Monthly Rent</th>
                <th className="py-3 px-4">Rent Status</th>
                <th className="py-3 px-4">KYC Status</th>
                <th className="py-3 px-4">Tenancy</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D9]">
              {filteredResidents.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedResident(r)}
                  className="hover:bg-[#FDF4F0]/40 cursor-pointer transition-colors"
                >
                  {/* Resident Name & Contact */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#FDF4F0] border border-[#F6E2DA] flex items-center justify-center text-[#B85C38] font-bold text-xs shrink-0">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#24211F]">{r.name}</p>
                        <p className="text-[11px] text-[#716A63]">{r.phone}</p>
                      </div>
                    </div>
                  </td>

                  {/* Property & Room */}
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-[#24211F]">
                      Room {r.roomNumber} - Bed {r.bedNumber}
                    </p>
                    <p className="text-[11px] text-[#716A63] truncate max-w-[150px]">
                      {r.propertyName}
                    </p>
                  </td>

                  {/* Move In Date */}
                  <td className="py-3.5 px-4 text-[#716A63]">{formatDate(r.moveInDate)}</td>

                  {/* Monthly Rent */}
                  <td className="py-3.5 px-4 font-bold text-[#24211F]">
                    {formatINR(r.monthlyRent)}
                  </td>

                  {/* Rent Payment Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={r.paymentStatus} />
                  </td>

                  {/* KYC Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        r.kycStatus === 'verified' ? 'text-[#16845B]' : 'text-[#D99118]'
                      }`}
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      {r.kycStatus === 'verified' ? 'Aadhaar Verified' : 'KYC Pending'}
                    </span>
                  </td>

                  {/* Tenancy Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={r.residencyStatus} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedResident(r)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#B85C38] hover:bg-[#FDF4F0] rounded-lg transition-colors"
                      >
                        Profile →
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resident Modal */}
      <AddResidentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddResident}
      />

      {/* 5-Tab Resident Profile Drawer */}
      <ResidentProfileDrawer
        isOpen={!!selectedResident}
        onClose={() => setSelectedResident(null)}
        resident={selectedResident}
        onCheckoutClick={(res) => setCheckoutResident(res)}
        onViewReceipt={onViewReceipt}
      />

      {/* Move-out Checkout Settlement Modal */}
      <CheckoutModal
        isOpen={!!checkoutResident}
        onClose={() => setCheckoutResident(null)}
        resident={checkoutResident}
        onConfirmCheckout={handleConfirmCheckout}
      />
    </div>
  );
};
