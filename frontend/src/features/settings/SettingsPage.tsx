import React, { useState } from 'react';
import {
  Building2,
  CreditCard,
  MessageSquare,
  Shield,
  RotateCcw,
  Save,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const { currentUser, isOwner } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'business' | 'rules' | 'reminders' | 'security'>(
    'business'
  );

  const [businessProfile, setBusinessProfile] = useState({
    businessName: 'Nivaas Living Spaces LLP',
    brandName: 'Nivaas',
    ownerName: 'Rajesh Sharma',
    contactEmail: 'support@nivaas.in',
    contactPhone: '+91 98450 12345',
    panNumber: 'ABCDE1234F',
    gstin: '29ABCDE1234F1Z5',
    registeredAddress: 'Plot 42, 8th Main, 4th Block, Koramangala, Bengaluru, KA 560034',
  });

  const [billingRules, setBillingRules] = useState({
    dueDayOfMonth: 5,
    gracePeriodDays: 5,
    lateFeePerDay: 100,
    depositMultiplier: 2, // 2 months rent
    enableLateFee: true,
  });

  const [reminderTemplates, setReminderTemplates] = useState({
    enableAutoWhatsApp: true,
    reminderDay1: 1,
    reminderDay2: 4,
    englishTemplate:
      'Namaste {resident_name}, this is a gentle reminder that your rent for {room_number} ({property_name}) of ₹{rent_amount} is due by 5th {month}. You can pay directly via UPI: {upi_link}. Thank you! - Nivaas',
    hinglishTemplate:
      'Namaste {resident_name}, aapke kamre {room_number} ka kiraya ₹{rent_amount} tareekh 5 tak due hai. Kirpya diye gaye UPI link se bhugtan karein: {upi_link}. Dhanyawad - Nivaas Team',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings Saved', 'Your configuration changes have been updated.');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to default initial values?')) {
      api.resetAllData();
      toast.info('Data Reset', 'All properties, rooms, residents, and payments restored to demo defaults.');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E8E1D9] text-xs font-semibold bg-white px-6 pt-4 rounded-xl border">
        {[
          { id: 'business', label: 'Business Profile', icon: Building2 },
          { id: 'rules', label: 'Rent & Billing Rules', icon: CreditCard },
          { id: 'reminders', label: 'WhatsApp Reminders', icon: MessageSquare },
          { id: 'security', label: 'Security & System', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
                isActive
                  ? 'border-[#B85C38] text-[#B85C38] font-bold'
                  : 'border-transparent text-[#716A63] hover:text-[#24211F]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Business Profile */}
      {activeTab === 'business' && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-[#E8E1D9] shadow-sm space-y-5 text-xs">
          <div>
            <h3 className="text-base font-bold text-[#24211F]">Business & Legal Profile</h3>
            <p className="text-xs text-[#716A63] mt-0.5">
              These details appear on resident rent receipts and official tax invoices
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#24211F] mb-1">Legal Entity Name</label>
              <input
                type="text"
                value={businessProfile.businessName}
                onChange={(e) =>
                  setBusinessProfile({ ...businessProfile, businessName: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#24211F] mb-1">Brand Name</label>
              <input
                type="text"
                value={businessProfile.brandName}
                onChange={(e) =>
                  setBusinessProfile({ ...businessProfile, brandName: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#24211F] mb-1">GSTIN Number</label>
              <input
                type="text"
                value={businessProfile.gstin}
                onChange={(e) => setBusinessProfile({ ...businessProfile, gstin: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#24211F] mb-1">Owner PAN Number</label>
              <input
                type="text"
                value={businessProfile.panNumber}
                onChange={(e) => setBusinessProfile({ ...businessProfile, panNumber: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Registered Address</label>
            <input
              type="text"
              value={businessProfile.registeredAddress}
              onChange={(e) =>
                setBusinessProfile({ ...businessProfile, registeredAddress: e.target.value })
              }
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#B85C38] hover:bg-[#984629] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Business Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Billing Rules */}
      {activeTab === 'rules' && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-[#E8E1D9] shadow-sm space-y-5 text-xs">
          <div>
            <h3 className="text-base font-bold text-[#24211F]">Rent & Billing Automation Rules</h3>
            <p className="text-xs text-[#716A63] mt-0.5">
              Standard rules applied when generating monthly resident invoices
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#24211F] mb-1">Default Rent Due Date</label>
              <select
                value={billingRules.dueDayOfMonth}
                onChange={(e) =>
                  setBillingRules({ ...billingRules, dueDayOfMonth: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
              >
                <option value={1}>1st of each month</option>
                <option value={5}>5th of each month</option>
                <option value={10}>10th of each month</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#24211F] mb-1">Grace Period (Days)</label>
              <input
                type="number"
                value={billingRules.gracePeriodDays}
                onChange={(e) =>
                  setBillingRules({
                    ...billingRules,
                    gracePeriodDays: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#24211F] mb-1">Late Fee (₹/day)</label>
              <input
                type="number"
                value={billingRules.lateFeePerDay}
                onChange={(e) =>
                  setBillingRules({
                    ...billingRules,
                    lateFeePerDay: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#B85C38] hover:bg-[#984629] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Update Billing Rules</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Reminders */}
      {activeTab === 'reminders' && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-[#E8E1D9] shadow-sm space-y-5 text-xs">
          <div>
            <h3 className="text-base font-bold text-[#24211F]">Automated WhatsApp Reminder Templates</h3>
            <p className="text-xs text-[#716A63] mt-0.5">
              Personalized messages dispatched automatically to residents before the due date
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-[#24211F] mb-1">English Message Template</label>
              <textarea
                rows={3}
                value={reminderTemplates.englishTemplate}
                onChange={(e) =>
                  setReminderTemplates({ ...reminderTemplates, englishTemplate: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#24211F] mb-1">Hinglish Message Template</label>
              <textarea
                rows={3}
                value={reminderTemplates.hinglishTemplate}
                onChange={(e) =>
                  setReminderTemplates({ ...reminderTemplates, hinglishTemplate: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#B85C38] hover:bg-[#984629] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Reminder Templates</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Security & System */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-xl border border-[#E8E1D9] shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="text-base font-bold text-[#24211F]">System Security & Prototype Controls</h3>
            <p className="text-xs text-[#716A63] mt-0.5">
              Manage local prototype data states and backend integration endpoints
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F6F2] border border-[#E8E1D9] space-y-2">
            <p className="font-bold text-[#24211F]">Connected Go REST API Spec</p>
            <p className="text-[#716A63] text-[11px] leading-relaxed">
              API Base URL: <code className="bg-white px-1.5 py-0.5 rounded border border-[#E8E1D9]">/api/v1</code> • PostgreSQL Auth Layer: Active
            </p>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-[#D64545]">Reset Prototype Demonstration Data</p>
              <p className="text-[#716A63] text-[11px] mt-0.5">
                Restores the 3 Bangalore properties, beds, residents, and payment ledgers to initial state.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="px-3.5 py-2 bg-white hover:bg-rose-50 text-[#D64545] border border-rose-200 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
