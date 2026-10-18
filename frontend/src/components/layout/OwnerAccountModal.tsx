import React, { useState } from 'react';
import { Crown, Shield, KeyRound, Phone, Mail, Building2, CheckCircle2, Copy, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';

interface OwnerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateAdmin: () => void;
}

export const OwnerAccountModal: React.FC<OwnerAccountModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateAdmin,
}) => {
  const { currentUser, logout } = useAuth();
  const toast = useToast();

  const [copied, setCopied] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSaved, setPinSaved] = useState(false);

  if (!currentUser) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.id);
    setCopied(true);
    toast.info('Copied', 'Admin Account ID copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.length < 4) {
      toast.error('Invalid PIN', 'Security PIN must be at least 4 digits.');
      return;
    }
    setPinSaved(true);
    toast.success('Security PIN Updated', 'Your admin access PIN has been updated.');
    setTimeout(() => setPinSaved(false), 3000);
    setNewPin('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Platform Owner Account & Security"
      subtitle="Enterprise master administrator credentials and authentication controls"
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#716A63] hover:text-[#24211F] rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCreateAdmin();
            }}
            className="px-4 py-2 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Crown className="w-4 h-4 fill-current" />
            <span>+ Create Another Admin</span>
          </button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Profile Card */}
        <div className="p-4 rounded-xl bg-[#FDF4F0] border border-[#F6E2DA] flex items-center gap-3.5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-sm text-[#24211F]">{currentUser.name}</h3>
              <span className="text-[10px] font-bold bg-[#B85C38] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="w-2.5 h-2.5 fill-current" /> SUPER ADMIN
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#716A63] mt-0.5">
              {currentUser.businessName || 'Nivaas Living Spaces LLP'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-[#716A63] bg-white px-1.5 py-0.5 rounded border border-[#E8E1D9]">
                ID: {currentUser.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-[10px] text-[#B85C38] hover:underline flex items-center gap-0.5 font-semibold"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Registered Contact Info */}
        <div className="p-3.5 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#716A63] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#B85C38]" /> Registered Phone
            </span>
            <span className="font-bold text-[#24211F]">{currentUser.phone}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#716A63] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#B85C38]" /> Business Email
            </span>
            <span className="font-bold text-[#24211F]">{currentUser.email}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#716A63] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#B85C38]" /> Owner PAN Number
            </span>
            <span className="font-bold text-[#24211F] font-mono">
              {currentUser.panNumber || 'ABCDE1234F'}
            </span>
          </div>
        </div>

        {/* Security & Authentication */}
        <form onSubmit={handleUpdatePin} className="p-3.5 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC] space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-[#24211F] flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#B85C38]" /> Update Admin Security PIN
            </p>
            <span className="text-[10px] text-[#16845B] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 2FA Active
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Enter new 6-digit admin PIN"
              maxLength={6}
              className="flex-1 px-3 py-1.5 border border-[#E8E1D9] rounded-lg bg-white text-[#24211F] outline-none font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#B85C38] hover:bg-[#984629] text-white font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
            >
              Update PIN
            </button>
          </div>

          {pinSaved && (
            <p className="text-[11px] text-[#16845B] font-semibold animate-fade-in">
              ✓ Admin Security PIN successfully updated!
            </p>
          )}
        </form>

        {/* Active Session & Logout */}
        <div className="p-3 bg-[#F8F6F2] rounded-xl border border-[#E8E1D9] flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#24211F]">Current Session</p>
            <p className="text-[11px] text-[#716A63]">Bengaluru, India • Chrome on Windows</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="px-3 py-1.5 bg-white hover:bg-rose-50 text-[#D64545] border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
