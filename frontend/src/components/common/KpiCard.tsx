import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  progress?: {
    percentage: number;
    colorClass?: string;
  };
  highlight?: 'terracotta' | 'success' | 'warning' | 'error' | 'default';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  progress,
  highlight = 'default',
  onClick,
}) => {
  const highlightStyles = {
    terracotta: 'border-l-4 border-l-[#B85C38]',
    success: 'border-l-4 border-l-[#16845B]',
    warning: 'border-l-4 border-l-[#D99118]',
    error: 'border-l-4 border-l-[#D64545]',
    default: 'hover:border-[#B85C38]/40',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[#E8E1D9] p-5 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${highlightStyles[highlight]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[#716A63]">{title}</p>
          <h3 className="text-2xl font-semibold text-[#24211F] mt-1.5 tracking-tight">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#F8F6F2] border border-[#E8E1D9] flex items-center justify-center text-[#B85C38] shrink-0">
          {icon}
        </div>
      </div>

      {progress && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-[#716A63] mb-1">
            <span>Occupancy Rate</span>
            <span className="font-semibold text-[#24211F]">{progress.percentage}%</span>
          </div>
          <div className="w-full bg-[#F0ECE6] rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                progress.colorClass || 'bg-[#B85C38]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
            />
          </div>
        </div>
      )}

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-[#716A63]">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-medium ml-auto shrink-0 ${
                trend.isPositive ? 'text-[#16845B]' : 'text-[#D64545]'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
