import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  TrendingUp,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export const SubscriptionsPage: React.FC = () => {
  const plans = [
    {
      id: 'starter',
      name: 'Starter Tier',
      tagline: 'Ideal for independent single & dual PG operations',
      fee: 2499,
      badge: 'Starter',
      accentColor: 'border-stone-200',
      features: [
        'Up to 2 PG Properties',
        'Up to 30 Beds Hosted',
        'Tenant Onboarding & KYC Record',
        'Staff & Property Manager Access',
        'Digital Rent Receipts (PDF & WhatsApp)',
        'Basic Financial & Occupancy Reports',
      ],
      activeCount: 2,
    },
    {
      id: 'growth',
      name: 'Growth Tier',
      tagline: 'Best for expanding PG owners with multi-branch properties',
      fee: 4999,
      badge: 'Most Popular',
      popular: true,
      accentColor: 'border-[#B85C38]',
      features: [
        'Up to 5 PG Properties',
        'Up to 80 Beds Hosted',
        'Multi-Staff Management & Delegation',
        'Expense Tracking & Category Analytics',
        'Automated Rent Due Reminders via WhatsApp',
        'Consolidated Portfolio P&L Dashboard',
        'Custom Property Branding on Receipts',
      ],
      activeCount: 2,
    },
    {
      id: 'enterprise',
      name: 'Enterprise Tier',
      tagline: 'Designed for large multi-city student & co-living chains',
      fee: 9999,
      badge: 'Large Hostels',
      accentColor: 'border-purple-200',
      features: [
        'Up to 15 PG Properties',
        'Up to 200+ Beds Hosted',
        'GSTIN B2B Invoice Generation',
        'Centralized Cross-Branch Staff Matrix',
        'Dedicated Support Manager',
        'Custom Export & Audit Trails',
        'Priority Phone Support (24x7)',
      ],
      activeCount: 1,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-extrabold text-[#24211F] tracking-tight">
          SaaS Subscription Plans
        </h1>
        <p className="text-xs text-[#716A63] mt-1">
          Nivaas Platform monetization tiers for PG Owners across India
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-2xl border ${
              p.popular
                ? 'border-[#B85C38] shadow-md ring-2 ring-[#B85C38]/20 relative'
                : 'border-[#E8E1D9] shadow-xs'
            } p-6 flex flex-col justify-between`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B85C38] text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                {p.badge}
              </span>
            )}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#24211F]">{p.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F8F6F2] text-[#716A63]">
                  {p.activeCount} Active PGs
                </span>
              </div>
              <p className="text-xs text-[#716A63] mt-1">{p.tagline}</p>

              <div className="mt-4 pb-4 border-b border-[#E8E1D9]">
                <span className="text-3xl font-extrabold text-[#24211F]">{formatINR(p.fee)}</span>
                <span className="text-xs text-[#716A63] font-medium"> /month + GST</span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs text-[#24211F]">
                {p.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#B85C38] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E8E1D9]">
              <div className="p-2.5 bg-[#F8F6F2] rounded-xl text-center text-xs font-semibold text-[#716A63]">
                Managed automatically via Platform Onboarding
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gateway & Indian Compliance Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8E1D9] shadow-xs">
        <h3 className="font-bold text-sm text-[#24211F] mb-1">
          Indian Payment Gateway & Tax Compliance
        </h3>
        <p className="text-xs text-[#716A63] mb-4">
          Nivaas SaaS platform uses automated recurring billing compliant with RBI e-mandate norms.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#F8F6F2] rounded-xl border border-[#E8E1D9]">
            <p className="font-bold text-[#24211F]">Razorpay Route / Subscriptions</p>
            <p className="text-[#716A63] text-[11px] mt-1">
              Supports UPI AutoPay, RuPay, Visa, and Mastercard recurring mandates.
            </p>
          </div>
          <div className="p-4 bg-[#F8F6F2] rounded-xl border border-[#E8E1D9]">
            <p className="font-bold text-[#24211F]">18% GST Invoicing</p>
            <p className="text-[#716A63] text-[11px] mt-1">
              Automated B2B GST tax invoices dispatched monthly with input tax credit (ITC) pass-through.
            </p>
          </div>
          <div className="p-4 bg-[#F8F6F2] rounded-xl border border-[#E8E1D9]">
            <p className="font-bold text-[#24211F]">Grace Period & Dunning</p>
            <p className="text-[#716A63] text-[11px] mt-1">
              5 days grace period before auto-suspending PG dashboard access if renewal payment fails.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
