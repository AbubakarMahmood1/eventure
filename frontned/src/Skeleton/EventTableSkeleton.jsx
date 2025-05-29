import React from "react";

const EventTableSkeleton = () => {
  // Create an array of 5 skeleton rows
  const skeletonRows = Array(5)
    .fill(0)
    .map((_, index) => (
      <tr key={`skeleton-${index}`} className="border-t animate-pulse">
        <td className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </td>
        <td className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        <td className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        <td className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </td>
        <td className="px-4 py-3">
          <div className="h-6 bg-gray-200 rounded w-28"></div>
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
        </td>
      </tr>
    ));

  return <>{skeletonRows}</>;
};

export default EventTableSkeleton;
