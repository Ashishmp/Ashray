import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Shield,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Building,
  KeyRound,
  Crown,
  Lock,
} from 'lucide-react';
import { StaffMember, StaffRole, User } from '../../types';
import { api } from '../../services/api';
import { useProperty } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { CreateAdminModal } from './CreateAdminModal';
import { formatINR, formatDate } from '../../utils/formatters';

export const StaffPage: React.FC = () => {
  const { properties } = useProperty();
  const { isOwner } = useAuth();
  const toast = useToast();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    name: '',
    role: 'manager' as StaffRole,
    phone: '',
    email: '',
    assignedPropertyIds: [properties[0]?.id || 'prop_1'],
    salaryMonthly: 35000,
    permissions: {
      canCollectRent: true,
      canAddResidents: true,
      canViewFinancials: true,
      canManageRooms: true,
    },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [staffList, userList] = await Promise.all([api.getStaff(), api.getUsers()]);
      setStaff(staffList);
      setOwners(userList.filter((u) => u.role === 'owner'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (member: StaffMember) => {
    const nextStatus = member.status === 'active' ? 'inactive' : 'active';
    await api.updateStaffStatus(member.id, nextStatus);
    toast.info('Staff Status Updated', `${member.name} is now ${nextStatus}.`);
    await fetchData();
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.phone.trim()) return;

    await api.inviteStaff({
      name: inviteForm.name.trim(),
      role: inviteForm.role,
      phone: inviteForm.phone.trim(),
      email: inviteForm.email.trim(),
      assignedPropertyIds: inviteForm.assignedPropertyIds,
      salaryMonthly: Number(inviteForm.salaryMonthly),
      permissions: inviteForm.permissions,
    });
    toast.success('Invitation Sent', `${inviteForm.name} invited as ${inviteForm.role}.`);
    setIsInviteOpen(false);
    await fetchData();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* SECTION 1: PG Business Leadership & Owners */}
      <div className="bg-white rounded-2xl border border-[#E8E1D9] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E1D9] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FDF4F0] text-[#B85C38]">
                <Crown className="w-5 h-5 fill-current" />
              </span>
              <h2 className="text-base font-bold text-[#24211F]">
                PG Business Leadership & Owners
              </h2>
            </div>
            <p className="text-xs text-[#716A63] mt-1">
              Authorized to recruit staff, assign branch managers, configure room inventory, and onboard tenants for this PG
            </p>
          </div>

          {isOwner && (
            <button
              type="button"
              onClick={() => setIsCreateAdminOpen(true)}
              className="px-3.5 py-2 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Crown className="w-4 h-4 fill-current" />
              <span>+ Add PG Partner / Admin</span>
            </button>
          )}
        </div>

        {/* Platform Owners Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {owners.map((owner) => (
            <div
              key={owner.id}
              className="p-4 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC] hover:border-[#B85C38]/40 transition-colors shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={owner.avatar}
                    alt={owner.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#E8E1D9]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#24211F] text-sm">{owner.name}</h3>
                      <span className="text-[10px] font-bold bg-[#B85C38] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5 fill-current" /> OWNER
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#716A63] mt-0.5">
                      {owner.businessName || 'Nivaas Living Spaces LLP'}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#716A63] bg-[#F8F6F2] px-2 py-0.5 rounded border border-[#E8E1D9]">
                  {owner.id.split('_')[0] || 'ADMIN'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100 text-xs text-[#716A63]">
                <p className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-[#B85C38] shrink-0" />
                  <span>{owner.phone}</span>
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#B85C38] shrink-0" />
                  <span>{owner.email}</span>
                </p>
              </div>

              <div className="mt-3 p-2.5 bg-[#F8F6F2] rounded-lg border border-[#E8E1D9] flex items-center justify-between text-[11px]">
                <span className="text-[#716A63]">Authority Scope:</span>
                <span className="font-bold text-[#16845B]">Unrestricted (All 3 Branches)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Delegated Property Managers & Operations Staff */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-[#E8E1D9] shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-[#24211F]">
              Property Managers & Operations Staff
            </h2>
            <p className="text-xs text-[#716A63] mt-0.5">
              Delegated branch managers, wardens, cooks, housekeeping, and security
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-stone-50 text-[#24211F] text-xs font-semibold rounded-lg border border-[#E8E1D9] shadow-2xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#B85C38]" />
            <span>Invite Manager / Staff</span>
          </button>
        </div>

        {/* Staff Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => {
            const assignedProps = properties.filter((p) =>
              member.assignedPropertyIds.includes(p.id)
            );

            return (
              <div
                key={member.id}
                className="bg-white rounded-xl border border-[#E8E1D9] p-5 shadow-sm flex flex-col justify-between hover:border-[#B85C38]/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-[#E8E1D9] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#FDF4F0] border border-[#F6E2DA] flex items-center justify-center text-[#B85C38] font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#24211F] text-sm">{member.name}</h3>
                        <p className="text-[11px] font-semibold text-[#B85C38] capitalize">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        member.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {member.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mt-3.5 text-xs">
                    <p className="text-[#716A63] flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#B85C38]" />
                      <span>{member.phone}</span>
                    </p>
                    <p className="text-[#716A63] flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#B85C38]" />
                      <span>{member.email}</span>
                    </p>
                    <p className="text-[#716A63] flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-[#B85C38]" />
                      <span className="truncate">
                        {assignedProps.map((p) => p.name.replace('Nivaas ', '')).join(', ') ||
                          'All Properties'}
                      </span>
                    </p>
                  </div>

                  {/* Permissions matrix */}
                  <div className="mt-4 p-3 bg-[#F8F6F2] rounded-lg border border-[#E8E1D9]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E968E] mb-2 flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-[#B85C38]" /> RBAC Permissions
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <span
                        className={`flex items-center gap-1 ${
                          member.permissions.canCollectRent ? 'text-emerald-700' : 'text-stone-400'
                        }`}
                      >
                        {member.permissions.canCollectRent ? '✓' : '✗'} Collect Rent
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          member.permissions.canAddResidents ? 'text-emerald-700' : 'text-stone-400'
                        }`}
                      >
                        {member.permissions.canAddResidents ? '✓' : '✗'} Add Residents
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          member.permissions.canManageRooms ? 'text-emerald-700' : 'text-stone-400'
                        }`}
                      >
                        {member.permissions.canManageRooms ? '✓' : '✗'} Manage Rooms
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          member.permissions.canViewFinancials
                            ? 'text-emerald-700'
                            : 'text-stone-400'
                        }`}
                      >
                        {member.permissions.canViewFinancials ? '✓' : '✗'} Financials
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-5 pt-3 border-t border-[#E8E1D9] flex items-center justify-between text-xs">
                  <span className="text-[#716A63] font-medium">
                    Salary: {formatINR(member.salaryMonthly)}/mo
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(member)}
                    className={`text-[11px] font-semibold ${
                      member.status === 'active'
                        ? 'text-[#D64545] hover:underline'
                        : 'text-[#16845B] hover:underline'
                    }`}
                  >
                    {member.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Manager / Staff Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Manager / Operations Staff"
        subtitle="Provision access credentials and define property authorization scope"
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#716A63] hover:text-[#24211F] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInviteSubmit}
              className="px-4 py-2 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Send Invite
            </button>
          </>
        }
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Full Name</label>
            <input
              type="text"
              value={inviteForm.name}
              onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#24211F] mb-1">Role</label>
              <select
                value={inviteForm.role}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, role: e.target.value as StaffRole })
                }
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
              >
                <option value="manager">Property Manager</option>
                <option value="warden">Hostel Warden</option>
                <option value="cook">Master Cook</option>
                <option value="security">Security Guard</option>
                <option value="housekeeping">Housekeeper</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#24211F] mb-1">Monthly Salary (₹)</label>
              <input
                type="number"
                value={inviteForm.salaryMonthly}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, salaryMonthly: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#24211F] mb-1">Phone Number</label>
              <input
                type="text"
                value={inviteForm.phone}
                onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                placeholder="+91..."
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#24211F] mb-1">Email Address</label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="staff@nivaas.in"
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Create Platform Owner / Admin Account Modal */}
      <CreateAdminModal
        isOpen={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};
