import React, { useState } from 'react';
import { Crown, Shield, UserPlus, CheckCircle2, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProperty } from '../../context/PropertyContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateAdminModal: React.FC<CreateAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { registerPlatformOwner, currentUser } = useAuth();
  const { properties } = useProperty();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: currentUser?.businessName || 'Nivaas Living Spaces LLP',
    panNumber: currentUser?.panNumber || 'ABCDE1234F',
    city: 'Bengaluru',
    roleTitle: 'Co-Owner / Enterprise Administrator',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please provide administrator full name, email, and mobile number.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await registerPlatformOwner({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        businessName: formData.businessName.trim(),
        panNumber: formData.panNumber.trim(),
        city: formData.city.trim(),
      });
      toast.success(
        'Admin Account Created',
        `Platform Owner account for ${formData.name} has been provisioned with full enterprise permissions.`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create platform admin account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Platform Owner / Admin Account"
      subtitle="Provision a new enterprise administrator with full multi-property and financial authority"
      maxWidth="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#716A63] hover:text-[#24211F] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Crown className="w-4 h-4 fill-current" />
            <span>{isLoading ? 'Creating Account...' : 'Create Admin Account'}</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Banner */}
        <div className="p-3.5 bg-[#FDF4F0] border border-[#F6E2DA] rounded-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#B85C38] text-white flex items-center justify-center shrink-0">
            <Crown className="w-4 h-4 fill-current" />
          </div>
          <div>
            <p className="font-bold text-[#24211F]">Super Admin / Platform Owner Authority</p>
            <p className="text-[11px] text-[#716A63] mt-0.5 leading-relaxed">
              This account will have unmetered administrative authority over all {properties.length} properties,
              financial P&L reports, manager accounts, and tenant records.
            </p>
          </div>
        </div>

        {/* Name & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">
              Admin Full Name <span className="text-[#D64545]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ashish Sharma"
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Title / Designation</label>
            <input
              type="text"
              value={formData.roleTitle}
              onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">
              Mobile Number <span className="text-[#D64545]">*</span>
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">
              Official Email <span className="text-[#D64545]">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@nivaas.in"
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
              required
            />
          </div>
        </div>

        {/* Business details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Enterprise Business Name</label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Owner PAN / GSTIN</label>
            <input
              type="text"
              value={formData.panNumber}
              onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-mono"
            />
          </div>
        </div>

        {/* Permissions preview */}
        <div className="p-3 bg-[#F8F6F2] rounded-xl border border-[#E8E1D9] space-y-1.5">
          <p className="font-bold text-[11px] text-[#24211F] uppercase tracking-wider">
            Included Platform Owner Privileges
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#16845B]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Property Branches
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Revenue & Expense Auditing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Staff Account Administration
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Security & Billing Rules
            </span>
          </div>
        </div>

        {error && (
          <p className="p-2.5 bg-rose-50 border border-rose-200 text-[#D64545] rounded-lg text-xs">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
};
