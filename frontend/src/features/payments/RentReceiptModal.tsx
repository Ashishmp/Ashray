import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { Payment } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';

interface RentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export const RentReceiptModal: React.FC<RentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
}) => {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#24211F]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white w-full max-w-xl rounded-2xl border border-[#E8E1D9] shadow-2xl overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Action bar (hidden in print) */}
          <div className="px-6 py-3.5 border-b border-[#E8E1D9] bg-[#FFFEFC] flex items-center justify-between no-print">
            <span className="text-xs font-bold text-[#716A63] uppercase tracking-wider">
              PG Rent Tax Receipt
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-[#716A63] hover:text-[#24211F] p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Receipt Paper */}
          <div id="printable-receipt" className="p-8 space-y-6 text-xs text-[#24211F] bg-white">
            {/* Header / Business details */}
            <div className="flex items-start justify-between border-b border-[#E8E1D9] pb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-[#B85C38] flex items-center justify-center text-white font-bold">
                    N
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-[#24211F]">NIVAAS</h2>
                </div>
                <p className="font-semibold text-xs text-[#24211F]">Nivaas Living Spaces LLP</p>
                <p className="text-[11px] text-[#716A63] mt-0.5">
                  Plot 42, 8th Main, 4th Block, Koramangala, Bengaluru, KA 560034
                </p>
                <p className="text-[11px] text-[#716A63]">GSTIN: 29ABCDE1234F1Z5 • PAN: ABCDE1234F</p>
              </div>

              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider bg-[#EAF7F0] text-[#16845B] border border-[#C6EADB] mb-1">
                  Payment Cleared
                </span>
                <p className="font-bold text-sm text-[#24211F]">{payment.receiptNumber}</p>
                <p className="text-[11px] text-[#716A63]">Date: {formatDate(payment.paidDate || payment.dueDate)}</p>
              </div>
            </div>

            {/* Resident & Room details */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8F6F2] border border-[#E8E1D9]">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#9E968E]">Received With Thanks From:</p>
                <p className="font-bold text-sm text-[#24211F] mt-0.5">{payment.residentName}</p>
                <p className="text-[#716A63] text-[11px] mt-0.5">
                  Room: {payment.roomNumber} - Bed {payment.bedNumber}
                </p>
                <p className="text-[#716A63] text-[11px]">{payment.propertyName}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-[#9E968E]">Billing Cycle:</p>
                <p className="font-bold text-sm text-[#24211F] mt-0.5">{payment.billingMonth}</p>
                <p className="text-[#716A63] text-[11px] mt-0.5">
                  Mode: {payment.paymentMethod ? payment.paymentMethod.toUpperCase() : 'UPI'}
                </p>
                {payment.transactionRef && (
                  <p className="text-[#716A63] text-[11px] font-mono truncate">
                    Ref: {payment.transactionRef}
                  </p>
                )}
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-[#E8E1D9] rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#FFFEFC] border-b border-[#E8E1D9] text-[#716A63] font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4 text-right">Amount Due</th>
                    <th className="py-2.5 px-4 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1D9]">
                  <tr>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#24211F]">
                        Monthly PG Accommodation & Boarding Fee
                      </p>
                      <p className="text-[11px] text-[#716A63]">
                        Includes high-speed Wi-Fi, electricity allowance, and housekeeping
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right text-[#716A63]">
                      {formatINR(payment.amountDue)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#24211F]">
                      {formatINR(payment.amountPaid)}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-[#F8F6F2] font-bold border-t border-[#E8E1D9]">
                  <tr>
                    <td className="py-2.5 px-4">Total Settled Amount</td>
                    <td className="py-2.5 px-4 text-right text-[#716A63]">
                      {formatINR(payment.amountDue)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-base text-[#16845B]">
                      {formatINR(payment.amountPaid)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Note & Authorization */}
            <div className="flex items-end justify-between pt-4 border-t border-[#E8E1D9]">
              <div className="text-[11px] text-[#716A63] max-w-xs">
                <p>This is a computer-generated tax receipt issued by Nivaas Management Platform.</p>
                <p className="mt-0.5">Valid for HRA income tax exemption claim.</p>
              </div>

              <div className="text-right">
                <div className="w-28 h-9 border-b border-[#716A63] mx-auto mb-1 flex items-center justify-center text-[10px] text-stone-400 italic">
                  Rajesh Sharma
                </div>
                <p className="font-semibold text-[11px] text-[#24211F]">Authorized Signatory</p>
                <p className="text-[10px] text-[#716A63]">Nivaas Living Spaces LLP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
