import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-[#E8E1D9] p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-stone-200/70 rounded w-1/4" />
      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="h-4 bg-stone-200/60 rounded w-12" />
            <div className="h-4 bg-stone-200/60 rounded flex-1" />
            <div className="h-4 bg-stone-200/60 rounded w-28" />
            <div className="h-4 bg-stone-200/60 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
};
