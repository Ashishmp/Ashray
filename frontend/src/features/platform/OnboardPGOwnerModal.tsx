import React, { useState } from 'react';
import {
  X,
  Building2,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { SubscriptionPlan } from '../../types';
import { formatINR } from '../../utils/formatters';

interface OnboardPGOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    ownerName: string;
    businessName: string;
    email: string;
    phone: string;
    city: string;
    plan: SubscriptionPlan;
    maxProperties: number;
    initialBedsCount?: number;
    gstin?: string;
    panNumber?: string;
  }) => Promise<void>;
}

export const OnboardPGOwnerModal: React.FC<OnboardPGOwnerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [plan, setPlan] = useState<SubscriptionPlan>('growth');
  const [maxProperties, setMaxProperties] = useState(5);
  const [initialBedsCount, setInitialBedsCount] = useState(48);
  const [gstin, setGstin] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const planOptions: {
    id: SubscriptionPlan;
    name: string;
    fee: number;
    maxProps: number;
    defaultBeds: number;
    badge: string;
  }[] = [
    {
      id: 'starter',
      name: 'Starter Plan',
      fee: 2499,
      maxProps: 2,
      defaultBeds: 24,
      badge: 'Single & Dual PG',
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      fee: 4999,
      maxProps: 5,
      defaultBeds: 60,
      badge: 'Most Popular',
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      fee: 9999,
      maxProps: 15,
      defaultBeds: 150,
      badge: 'Large Co-Living Networks',
    },
  ];

  const handlePlanSelect = (selectedPlan: SubscriptionPlan) => {
    setPlan(selectedPlan);
    const cfg = planOptions.find((p) => p.id === selectedPlan);
    if (cfg) {
      setMaxProperties(cfg.maxProps);
      setInitialBedsCount(cfg.defaultBeds);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !businessName.trim() || !phone.trim() || !email.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ownerName: ownerName.trim(),
        businessName: businessName.trim(),
        email: email.trim(),
        phone: phone.trim().startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        city: city.trim(),
        plan,
        maxProperties: Number(maxProperties),
        initialBedsCount: Number(initialBedsCount),
        gstin: gstin.trim() || undefined,
        panNumber: panNumber.trim().toUpperCase() || undefined,
      });
      // reset form
      setOwnerName('');
      setBusinessName('');
      setEmail('');
      setPhone('');
      setGstin('');
      setPanNumber('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24211F]/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E8E1D9] overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#B85C38] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Onboard New PG Owner</h3>
              <p className="text-xs text-white/80">
                Platform Super Admin Authority: Provision new PG business accounts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice of Platform Owner Authority */}
        <div className="bg-[#FDF4F0] border-b border-[#F6E2DA] px-6 py-2.5 flex items-center gap-2 text-xs text-[#716A63]">
          <ShieldCheck className="w-4 h-4 text-[#B85C38] shrink-0" />
          <span>
            <strong>Platform Owner Rights:</strong> You are onboarding an independent PG Owner. Once onboarded, the PG Owner will independently add their own staff, configure rooms, and onboard their tenants.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Section 1: PG Owner & Business Details */}
          <div>
            <h4 className="text-[11px] font-bold text-[#24211F] uppercase tracking-wider mb-3">
              1. Owner & Business Identity
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  PG Owner Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Kumar"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none focus:border-[#B85C38] font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  PG Brand / Entity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Stay Luxury PG"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none focus:border-[#B85C38] font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Contact Mobile <span className="text-rose-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-[#E8E1D9] bg-[#F8F6F2] text-[#716A63] font-semibold text-xs">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8E1D9] rounded-r-lg bg-[#FFFEFC] text-[#24211F] outline-none focus:border-[#B85C38] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Owner Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="anand@royalstay.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none focus:border-[#B85C38] font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Operating City <span className="text-rose-500">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none focus:border-[#B85C38] font-medium"
                >
                  <option value="Bengaluru">Bengaluru (Karnataka)</option>
                  <option value="Hyderabad">Hyderabad (Telangana)</option>
                  <option value="Pune">Pune (Maharashtra)</option>
                  <option value="Chennai">Chennai (Tamil Nadu)</option>
                  <option value="Delhi NCR">Delhi NCR (Gurugram / Noida)</option>
                  <option value="Mumbai">Mumbai (Maharashtra)</option>
                  <option value="Jaipur">Jaipur (Rajasthan)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  PAN Number (Optional)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none focus:border-[#B85C38] font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Subscription Plan & Quota Selection */}
          <div className="pt-2 border-t border-[#E8E1D9]">
            <h4 className="text-[11px] font-bold text-[#24211F] uppercase tracking-wider mb-3">
              2. SaaS Subscription Tier & Capacity Quota
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {planOptions.map((opt) => {
                const isSelected = plan === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handlePlanSelect(opt.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#B85C38] bg-[#FDF4F0] ring-2 ring-[#B85C38]/20 shadow-xs'
                        : 'border-[#E8E1D9] bg-white hover:border-[#B85C38]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#24211F]">{opt.name}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#B85C38] shrink-0" />
                      )}
                    </div>
                    <p className="text-base font-extrabold text-[#B85C38]">
                      {formatINR(opt.fee)}
                      <span className="text-[10px] font-normal text-[#716A63]">/mo</span>
                    </p>
                    <div className="mt-2 text-[10px] text-[#716A63] space-y-0.5">
                      <p>• Up to {opt.maxProps} Properties</p>
                      <p>• ~{opt.defaultBeds} Beds initial quota</p>
                      <p>• Multi-Staff & Rent Receipts</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3.5 mt-3">
              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Max Properties Limit
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={maxProperties}
                  onChange={(e) => setMaxProperties(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Initial Bed Capacity Quota
                </label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={initialBedsCount}
                  onChange={(e) => setInitialBedsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E8E1D9] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-[#716A63] hover:text-[#24211F] border border-[#E8E1D9] rounded-lg hover:bg-[#F8F6F2] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Onboarding PG Owner...' : 'Complete PG Owner Onboarding'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
