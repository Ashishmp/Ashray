import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Users,
  FileSpreadsheet,
} from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/formatters';

export const ReportsPage: React.FC = () => {
  const { properties, selectedPropertyId } = useProperty();
  const toast = useToast();

  const [datePeriod, setDatePeriod] = useState('q3_2026');

  const pAndLData = [
    { month: 'May 2026', revenue: 275000, expenses: 142000, net: 133000, occupancy: '68%' },
    { month: 'Jun 2026', revenue: 288000, expenses: 151000, net: 137000, occupancy: '71%' },
    { month: 'Jul 2026', revenue: 294000, expenses: 148000, net: 146000, occupancy: '70%' },
    { month: 'Aug 2026', revenue: 305000, expenses: 159000, net: 146000, occupancy: '74%' },
    { month: 'Sep 2026', revenue: 298800, expenses: 154000, net: 144800, occupancy: '72%' },
    { month: 'Oct 2026', revenue: 324000, expenses: 165000, net: 159000, occupancy: '70%' },
  ];

  const handleExport = () => {
    toast.success('Report Exported', 'Financial & occupancy report downloaded as CSV.');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-[#E8E1D9] shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-[#24211F]">Operational & Financial Reports</h2>
          <p className="text-xs text-[#716A63] mt-0.5">
            Historical profitability, collection realization, and tenant turnover
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={datePeriod}
            onChange={(e) => setDatePeriod(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] outline-none cursor-pointer"
          >
            <option value="q3_2026">Financial Year 2026-27 (H1)</option>
            <option value="last_quarter">Last Quarter (Q2 2026)</option>
            <option value="last_month">Last Month (Sep 2026)</option>
          </select>

          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-1.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E8E1D9] shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#716A63]">
            Total H1 Gross Revenue
          </p>
          <h3 className="text-2xl font-bold text-[#24211F] mt-1.5">₹17,84,800</h3>
          <p className="text-xs text-[#16845B] font-medium mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +12.4% year-over-year
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8E1D9] shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#716A63]">
            Total Operating Costs
          </p>
          <h3 className="text-2xl font-bold text-[#716A63] mt-1.5">₹9,19,000</h3>
          <p className="text-xs text-[#716A63] mt-2">51.4% cost-to-income ratio</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8E1D9] shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#716A63]">
            Net Operating Income (NOI)
          </p>
          <h3 className="text-2xl font-bold text-[#16845B] mt-1.5">₹8,65,800</h3>
          <p className="text-xs text-[#16845B] font-medium mt-2">Net Margin: 48.6%</p>
        </div>
      </div>

      {/* Monthly P&L Ledger */}
      <div className="bg-white rounded-xl border border-[#E8E1D9] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E8E1D9] bg-[#FFFEFC] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#24211F]">Monthly Financial Performance Ledger</h3>
          <span className="text-[11px] text-[#716A63]">All amounts in INR (₹)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFFEFC] border-b border-[#E8E1D9] text-[#716A63] font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4">Operating Expenses</th>
                <th className="py-3 px-4">Net Income</th>
                <th className="py-3 px-4">Profit Margin</th>
                <th className="py-3 px-4">Avg Occupancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D9]">
              {pAndLData.map((row) => {
                const margin = Math.round((row.net / row.revenue) * 100);
                return (
                  <tr key={row.month} className="hover:bg-[#FDF4F0]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#24211F]">{row.month}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#16845B]">
                      {formatINR(row.revenue)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#D64545]">
                      {formatINR(row.expenses)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#24211F]">{formatINR(row.net)}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                        {margin}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#716A63]">{row.occupancy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
