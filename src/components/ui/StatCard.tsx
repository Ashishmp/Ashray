import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { TrendDirection } from '../../types/common';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    direction: TrendDirection;
    value: string;
    caption?: string;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconBgColor = 'var(--primary-50)',
  iconColor = 'var(--primary-600)',
  trend,
  onClick
}) => {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        <div
          className="stat-card-icon-box"
          style={{ backgroundColor: iconBgColor, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      {trend && (
        <div className="stat-card-bottom">
          <span
            className={`trend-badge ${
              trend.direction === 'up'
                ? 'trend-positive'
                : trend.direction === 'down'
                ? 'trend-negative'
                : 'trend-neutral'
            }`}
          >
            {trend.direction === 'up' && <ArrowUpRight size={13} />}
            {trend.direction === 'down' && <ArrowDownRight size={13} />}
            {trend.direction === 'neutral' && <Minus size={13} />}
            {trend.value}
          </span>
          {trend.caption && <span className="trend-caption">{trend.caption}</span>}
        </div>
      )}
    </div>
  );
};
