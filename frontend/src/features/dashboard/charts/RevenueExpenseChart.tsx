import React, { useState } from 'react';
import { formatINR } from '../../../utils/formatters';

interface RevenueExpenseChartProps {
  data: { month: string; revenue: number; expenses: number }[];
}

export const RevenueExpenseChart: React.FC<RevenueExpenseChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.expenses)), 350000);

  return (
    <div className="bg-white rounded-xl border border-[#E8E1D9] p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-semibold text-[#24211F]">Revenue vs Operating Expenses</h3>
          <p className="text-xs text-[#716A63] mt-0.5">Last 6 months performance across active properties</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#B85C38]" />
            <span className="text-[#24211F] font-medium">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#716A63]" />
            <span className="text-[#24211F] font-medium">Expenses</span>
          </div>
        </div>
      </div>

      {/* Chart Visual Container */}
      <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-[#E8E1D9]">
        {data.map((item, idx) => {
          const revHeight = (item.revenue / maxVal) * 100;
          const expHeight = (item.expenses / maxVal) * 100;
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={item.month}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-16 z-20 bg-[#24211F] text-white text-[11px] rounded-lg py-1.5 px-2.5 shadow-xl whitespace-nowrap pointer-events-none animate-fade-in">
                  <p className="font-semibold text-white/90">{item.month}</p>
                  <p className="text-amber-300">Revenue: {formatINR(item.revenue)}</p>
                  <p className="text-stone-300">Expenses: {formatINR(item.expenses)}</p>
                  <p className="text-emerald-400 font-bold border-t border-stone-700 mt-1 pt-0.5">
                    Net: {formatINR(item.revenue - item.expenses)}
                  </p>
                </div>
              )}

              {/* Bars Group */}
              <div className="flex items-end gap-1.5 sm:gap-2.5 w-full max-w-[48px] justify-center h-full">
                {/* Revenue Bar */}
                <div
                  className={`w-1/2 rounded-t-md transition-all duration-300 ${
                    isHovered ? 'bg-[#984629]' : 'bg-[#B85C38]'
                  }`}
                  style={{ height: `${revHeight}%` }}
                />
                {/* Expenses Bar */}
                <div
                  className={`w-1/2 rounded-t-md transition-all duration-300 ${
                    isHovered ? 'bg-[#4A453F]' : 'bg-[#9E968E]'
                  }`}
                  style={{ height: `${expHeight}%` }}
                />
              </div>

              {/* X Axis Label */}
              <span
                className={`text-[11px] font-medium mt-2 transition-colors ${
                  isHovered ? 'text-[#B85C38] font-bold' : 'text-[#716A63]'
                }`}
              >
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#716A63] mt-3">
        <span>Average monthly margin: ~49.1%</span>
        <span>All amounts in INR (₹)</span>
      </div>
    </div>
  );
};
