import React from 'react';

interface OccupancyDonutChartProps {
  occupied: number;
  total: number;
  propertyBreakdown: {
    propertyName: string;
    occupied: number;
    total: number;
    percentage: number;
  }[];
}

export const OccupancyDonutChart: React.FC<OccupancyDonutChartProps> = ({
  occupied,
  total,
  propertyBreakdown,
}) => {
  const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const vacant = Math.max(0, total - occupied);

  // SVG Circular calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-[#E8E1D9] p-5 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-base font-semibold text-[#24211F]">Occupancy Overview</h3>
        <p className="text-xs text-[#716A63] mt-0.5">Real-time bed utilization across properties</p>
      </div>

      {/* Donut Gauge and Stats */}
      <div className="my-5 flex items-center justify-around gap-4">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="stroke-[#F0ECE6]"
              strokeWidth="16"
              fill="transparent"
            />
            {/* Filled circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="stroke-[#B85C38] transition-all duration-700 ease-out"
              strokeWidth="16"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-[#24211F]">{percentage}%</span>
            <span className="text-[10px] uppercase font-semibold text-[#716A63]">Occupied</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#B85C38]" />
            <div>
              <p className="text-xs text-[#716A63]">Occupied Beds</p>
              <p className="text-sm font-bold text-[#24211F]">{occupied} Beds</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F0ECE6] border border-[#E8E1D9]" />
            <div>
              <p className="text-xs text-[#716A63]">Available / Vacant</p>
              <p className="text-sm font-bold text-[#24211F]">{vacant} Beds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Property-wise breakdown progress bars */}
      <div className="space-y-2.5 pt-3 border-t border-[#E8E1D9]">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E968E]">
          Occupancy by Location
        </p>
        {propertyBreakdown.map((item) => (
          <div key={item.propertyName} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#24211F] font-medium truncate max-w-[170px]">
                {item.propertyName.replace('Nivaas ', '')}
              </span>
              <span className="text-[#716A63] font-semibold text-[11px]">
                {item.occupied}/{item.total} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-[#F0ECE6] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#B85C38] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
