import React, { useState } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Building,
  QrCode,
  ArrowRight,
  Receipt,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { Resident, Payment, PaymentMethod } from '../../types';
import { api } from '../../services/api';
import { formatINR } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

interface TenantPayRentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: Resident;
  onPaymentSuccess: (payment: Payment) => void;
}

export const TenantPayRentModal: React.FC<TenantPayRentModalProps> = ({
  isOpen,
  onClose,
  resident,
  onPaymentSuccess,
}) => {
  const [billingMonth, setBillingMonth] = useState('October 2026');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'custom_upi'>('gpay');
  const [customUpiId, setCustomUpiId] = useState('rohan@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('482');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  const toast = useToast();

  if (!isOpen) return null;

  // Bill Breakdown
  const baseRent = resident.monthlyRent || 11000;
  const utilityBill = 450; // Electricity & water
  const wifiAndMaintenance = 0; // Included in rent
  const totalPayable = baseRent + utilityBill + wifiAndMaintenance;

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate real-time payment gateway processing (1.2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const txRef =
        selectedMethod === 'upi'
          ? `UPI/NIV/${Math.floor(10000000 + Math.random() * 90000000)}`
          : `CARD/NIV/${Math.floor(10000000 + Math.random() * 90000000)}`;

      const newPay = await api.payRentOnline({
        residentId: resident.id,
        amount: totalPayable,
        paymentMethod: selectedMethod,
        billingMonth,
        transactionRef: txRef,
        notes: `Online rent payment for ${billingMonth} via ${selectedMethod.toUpperCase()}`,
      });

      setCompletedPayment(newPay);
      setIsSuccess(true);
      toast.success(
        'Rent Payment Successful!',
        `₹${totalPayable.toLocaleString('en-IN')} paid for ${billingMonth}. Receipt generated.`
      );
    } catch (err: any) {
      toast.error('Payment Error', err.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    if (completedPayment) {
      onPaymentSuccess(completedPayment);
    }
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24211F]/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E8E1D9] overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#B85C38] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Pay Rent Online</h3>
              <p className="text-xs text-white/80">
                {resident.propertyName} · Room {resident.roomNumber} ({resident.bedNumber})
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isSuccess && completedPayment ? (
          /* Payment Success Screen */
          <div className="p-8 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                Transaction Successful
              </span>
              <h2 className="text-2xl font-black text-[#24211F] mt-2">
                {formatINR(totalPayable)}
              </h2>
              <p className="text-xs text-[#716A63] mt-1">
                Rent for <strong>{billingMonth}</strong> has been credited to {resident.propertyName}.
              </p>
            </div>

            <div className="bg-[#F8F6F2] p-4 rounded-xl border border-[#E8E1D9] text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-[#716A63]">Receipt Number:</span>
                <span className="font-mono font-bold text-[#24211F]">
                  {completedPayment.receiptNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#716A63]">Transaction Ref:</span>
                <span className="font-mono text-[#24211F]">
                  {completedPayment.transactionRef || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#716A63]">Payment Mode:</span>
                <span className="font-semibold text-[#24211F] uppercase">
                  {completedPayment.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#716A63]">Tenant Name:</span>
                <span className="font-semibold text-[#24211F]">{resident.name}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleFinish}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <Receipt className="w-4 h-4" />
                <span>View & Download Official Receipt</span>
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handlePaySubmit} className="p-6 space-y-5 text-xs">
            {/* Bill Summary Banner */}
            <div className="p-4 bg-[#FDF4F0] border border-[#F6E2DA] rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#B85C38] uppercase tracking-wider">
                  Select Billing Cycle
                </p>
                <select
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  className="mt-1 bg-white border border-[#E8E1D9] rounded-lg px-2.5 py-1 text-xs font-bold text-[#24211F] outline-none"
                >
                  <option value="October 2026">October 2026 (Current Due)</option>
                  <option value="November 2026">November 2026 (Advance)</option>
                  <option value="December 2026">December 2026</option>
                </select>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#716A63]">Total Payable</span>
                <p className="text-xl font-extrabold text-[#B85C38]">{formatINR(totalPayable)}</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-3 bg-[#F8F6F2] rounded-xl border border-[#E8E1D9] space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#716A63]">
                <span>Base Bed Rent:</span>
                <span className="font-semibold text-[#24211F]">{formatINR(baseRent)}</span>
              </div>
              <div className="flex justify-between text-[#716A63]">
                <span>Electricity & Water (Sub-meter share):</span>
                <span className="font-semibold text-[#24211F]">{formatINR(utilityBill)}</span>
              </div>
              <div className="flex justify-between text-[#716A63]">
                <span>Wi-Fi, Housekeeping & Maintenance:</span>
                <span className="font-semibold text-emerald-600">FREE / INCLUDED</span>
              </div>
              <div className="pt-2 border-t border-[#E8E1D9] flex justify-between font-bold text-xs text-[#24211F]">
                <span>Net Total:</span>
                <span className="text-[#B85C38]">{formatINR(totalPayable)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block font-bold text-[#24211F] mb-2 uppercase text-[10px] tracking-wider">
                Select Indian Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {/* Mode 1: UPI */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'upi'
                      ? 'border-[#B85C38] bg-[#FDF4F0] ring-2 ring-[#B85C38]/20 text-[#B85C38] font-bold'
                      : 'border-[#E8E1D9] bg-white text-[#716A63] hover:border-[#B85C38]/40'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-[#B85C38]" />
                  <span>UPI / QR</span>
                </button>

                {/* Mode 2: Card */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('cheque')} // using mapped card flow
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'cheque'
                      ? 'border-[#B85C38] bg-[#FDF4F0] ring-2 ring-[#B85C38]/20 text-[#B85C38] font-bold'
                      : 'border-[#E8E1D9] bg-white text-[#716A63] hover:border-[#B85C38]/40'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-[#2786B8]" />
                  <span>Debit / Credit</span>
                </button>

                {/* Mode 3: NetBanking */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('bank_transfer')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'bank_transfer'
                      ? 'border-[#B85C38] bg-[#FDF4F0] ring-2 ring-[#B85C38]/20 text-[#B85C38] font-bold'
                      : 'border-[#E8E1D9] bg-white text-[#716A63] hover:border-[#B85C38]/40'
                  }`}
                >
                  <Building className="w-5 h-5 mx-auto mb-1 text-emerald-700" />
                  <span>Net Banking</span>
                </button>
              </div>
            </div>

            {/* Mode Specific Inputs */}
            {selectedMethod === 'upi' && (
              <div className="p-4 bg-white rounded-xl border border-[#E8E1D9] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#24211F]">Choose UPI Provider:</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    0% Transaction Fee
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <button
                    type="button"
                    onClick={() => setUpiApp('gpay')}
                    className={`p-2 rounded-lg border font-semibold ${
                      upiApp === 'gpay'
                        ? 'border-[#B85C38] bg-[#FDF4F0] text-[#B85C38]'
                        : 'border-[#E8E1D9] bg-white text-[#716A63]'
                    }`}
                  >
                    Google Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiApp('phonepe')}
                    className={`p-2 rounded-lg border font-semibold ${
                      upiApp === 'phonepe'
                        ? 'border-[#B85C38] bg-[#FDF4F0] text-[#B85C38]'
                        : 'border-[#E8E1D9] bg-white text-[#716A63]'
                    }`}
                  >
                    PhonePe
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiApp('paytm')}
                    className={`p-2 rounded-lg border font-semibold ${
                      upiApp === 'paytm'
                        ? 'border-[#B85C38] bg-[#FDF4F0] text-[#B85C38]'
                        : 'border-[#E8E1D9] bg-white text-[#716A63]'
                    }`}
                  >
                    Paytm UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiApp('custom_upi')}
                    className={`p-2 rounded-lg border font-semibold ${
                      upiApp === 'custom_upi'
                        ? 'border-[#B85C38] bg-[#FDF4F0] text-[#B85C38]'
                        : 'border-[#E8E1D9] bg-white text-[#716A63]'
                    }`}
                  >
                    UPI ID
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-[#24211F] mb-1">
                    Virtual Payment Address (VPA) / UPI ID
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={customUpiId}
                      onChange={(e) => setCustomUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi"
                      className="w-full px-3 py-2 border border-[#E8E1D9] rounded-l-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-[#E8E1D9] bg-[#F8F6F2] text-emerald-700 text-xs font-bold">
                      Verified ✓
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'cheque' && (
              <div className="p-4 bg-white rounded-xl border border-[#E8E1D9] space-y-3">
                <div>
                  <label className="block font-semibold text-[#24211F] mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#24211F] mb-1">Valid Thru</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#24211F] mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'bank_transfer' && (
              <div className="p-4 bg-white rounded-xl border border-[#E8E1D9] space-y-3">
                <label className="block font-semibold text-[#24211F]">Choose Your Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
                <p className="text-[11px] text-[#716A63]">
                  You will be securely redirected to {selectedBank}&apos;s net banking login portal.
                </p>
              </div>
            )}

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-[11px] text-[#716A63]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                256-bit Bank Grade Encryption · Instant Official GST-compliant Rent Receipt
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#E8E1D9] flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-[#716A63] hover:text-[#24211F] border border-[#E8E1D9] rounded-lg hover:bg-[#F8F6F2] transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-2.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Pay {formatINR(totalPayable)} Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
