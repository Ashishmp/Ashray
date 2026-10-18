import React from 'react';
import { formatINR } from '../../../utils/formatters';

interface PaymentCollectionBarProps {
  collected: number;
  pending: number;
  overdue: number;
}

export const PaymentCollectionBar: React.FC<PaymentCollectionBarProps> = ({
  collected,
  pending,
  overdue,
}) => {
  const total = collected + pending + overdue;
  const collectedPct = total > 0 ? (collected / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;
  const overduePct = total > 0 ? (overdue / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-[#E8E1D9] p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#24211F]">Rent Collection Status</h3>
          <p className="text-xs text-[#716A63] mt-0.5">October 2026 rent roll settlement</p>
        </div>
        <span className="text-xs font-bold text-[#16845B] bg-[#EAF7F0] border border-[#C6EADB] px-2.5 py-1 rounded-full">
          {Math.round(collectedPct)}% Realized
        </span>
      </div>

      {/* Stacked Progress Bar */}
      <div className="w-full bg-[#F0ECE6] rounded-xl h-4 overflow-hidden flex my-3">
        {collectedPct > 0 && (
          <div
            className="bg-[#16845B] h-full transition-all duration-500"
            style={{ width: `${collectedPct}%` }}
            title={`Collected: ${formatINR(collected)}`}
          />
        )}
        {pendingPct > 0 && (
          <div
            className="bg-[#D99118] h-full transition-all duration-500"
            style={{ width: `${pendingPct}%` }}
            title={`Pending: ${formatINR(pending)}`}
          />
        )}
        {overduePct > 0 && (
          <div
            className="bg-[#D64545] h-full transition-all duration-500"
            style={{ width: `${overduePct}%` }}
            title={`Overdue: ${formatINR(overdue)}`}
          />
        )}
      </div>

      {/* Clear Status Labels & Figures */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-[#EAF7F0] border border-[#C6EADB]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16845B]" />
            <span className="text-xs font-semibold text-[#16845B]">Collected / Paid</span>
          </div>
          <p className="text-base font-bold text-[#24211F]">{formatINR(collected)}</p>
          <p className="text-[11px] text-[#716A63]">{Math.round(collectedPct)}% of total dues</p>
        </div>

        <div className="p-3 rounded-lg bg-[#FEF8EC] border border-[#F7E4BE]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D99118]" />
            <span className="text-xs font-semibold text-[#D99118]">Pending Within Due</span>
          </div>
          <p className="text-base font-bold text-[#24211F]">{formatINR(pending)}</p>
          <p className="text-[11px] text-[#716A63]">{Math.round(pendingPct)}% expected shortly</p>
        </div>

        <div className="p-3 rounded-lg bg-[#FDF0F0] border border-[#F7C6C6]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D64545]" />
            <span className="text-xs font-semibold text-[#D64545]">Overdue Dues</span>
          </div>
          <p className="text-base font-bold text-[#24211F]">{formatINR(overdue)}</p>
          <p className="text-[11px] text-[#716A63]">{Math.round(overduePct)}% requires action</p>
        </div>
      </div>
    </div>
  );
};
