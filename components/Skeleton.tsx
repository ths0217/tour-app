import React from 'react';

// Skeleton component with shimmer animation
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-stone/10 via-stone/20 to-stone/10 bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-mag',
    card: 'rounded-mag',
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
    />
  );
}

// Card skeleton for itinerary items
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-mag p-4 shadow-mag space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4 h-4" />
          <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
      <Skeleton variant="rectangular" className="w-full h-32" />
    </div>
  );
}

// Magazine card skeleton
export function MagazineCardSkeleton({ aspectRatio = 'medium' }: { aspectRatio?: 'tall' | 'medium' | 'short' }) {
  const heights = {
    tall: 'aspect-[3/4]',
    medium: 'aspect-[4/3]',
    short: 'aspect-[16/9]',
  };

  return (
    <div className={`bg-white rounded-mag overflow-hidden shadow-mag ${heights[aspectRatio]}`}>
      <Skeleton variant="rectangular" className="w-full h-full" />
    </div>
  );
}

// List item skeleton
export function ListItemSkeleton() {
  return (
    <div className="bg-white rounded-mag p-3 shadow-mag flex items-center gap-3 mb-2">
      <Skeleton variant="rectangular" className="w-6 h-10" />
      <Skeleton variant="text" className="w-12 h-4" />
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="flex-1 space-y-1.5">
        <Skeleton variant="text" className="w-3/4 h-4" />
        <Skeleton variant="text" className="w-1/2 h-3" />
      </div>
      <Skeleton variant="circular" className="w-8 h-8" />
    </div>
  );
}

// Home page skeleton
export function HomePageSkeleton() {
  return (
    <div className="min-h-full pb-safe px-4 space-y-6 pt-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-20 h-3" />
          <Skeleton variant="text" className="w-32 h-8" />
        </div>
        <Skeleton variant="circular" className="w-14 h-14" />
      </div>

      {/* Budget card */}
      <Skeleton variant="card" className="w-full h-28" />

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton variant="rectangular" className="w-14 h-14" />
            <Skeleton variant="text" className="w-10 h-3" />
          </div>
        ))}
      </div>

      {/* Next event */}
      <Skeleton variant="card" className="w-full h-24" />

      {/* Companions */}
      <div className="flex gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton variant="circular" className="w-16 h-16" />
            <Skeleton variant="text" className="w-12 h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Wallet page skeleton
export function WalletPageSkeleton() {
  return (
    <div className="min-h-full pb-safe px-4 space-y-4 pt-4">
      {/* Tab bar */}
      <Skeleton variant="rectangular" className="w-full h-10" />
      
      {/* Flight pass */}
      <Skeleton variant="card" className="w-full h-48" />
      
      {/* Hotel pass */}
      <Skeleton variant="card" className="w-full h-32" />
      
      {/* Budget */}
      <Skeleton variant="card" className="w-full h-24" />
    </div>
  );
}

export default Skeleton;
