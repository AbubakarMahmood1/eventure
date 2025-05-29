const EventCardSkeleton = ({ count = 6 }) => {
  // Create array of skeleton cards based on count prop
  const skeletonCards = Array(count)
    .fill(0)
    .map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
      >
        {/* Image Skeleton */}
        <div className="h-48 bg-gray-300"></div>

        {/* Content Skeleton */}
        <div className="p-5">
          {/* Title and Price Row */}
          <div className="flex justify-between items-start mb-2">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-12"></div>
          </div>

          {/* Date and Location Row */}
          <div className="flex items-center text-sm mb-4 gap-3">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>

          {/* Description Lines */}
          <div className="mb-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>

          {/* Buttons Row */}
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-gray-200 rounded"></div>
            <div className="flex-1 h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    ));

  return <>{skeletonCards}</>;
};
export default EventCardSkeleton;
