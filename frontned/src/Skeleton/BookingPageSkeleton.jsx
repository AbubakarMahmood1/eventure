import React from "react";

const BookingPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Event Hero Section Skeleton */}
      <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-300 animate-pulse">
        <div className="container mx-auto h-full flex flex-col justify-center px-4">
          <div className="h-8 md:h-12 bg-gray-400 rounded w-3/4 mb-4"></div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
              <div className="h-4 bg-gray-400 rounded w-24"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
              <div className="h-4 bg-gray-400 rounded w-32"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
              <div className="h-4 bg-gray-400 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Event Details Skeleton */}
          <div className="md:w-2/3">
            {/* About Section Skeleton */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>

            {/* Event Details Section Skeleton */}
            <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date Detail */}
                <div className="flex">
                  <div className="bg-gray-100 w-12 h-12 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>

                {/* Location Detail */}
                <div className="flex">
                  <div className="bg-gray-100 w-12 h-12 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form Skeleton */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 animate-pulse">
              {/* Title */}
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>

              {/* Ticket Price Section */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-l-md"></div>
                    <div className="w-12 h-8 bg-gray-200"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-r-md"></div>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 mb-6">
                {/* Name Field */}
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-12 bg-gray-100 rounded border"></div>
                </div>

                {/* Email Field */}
                <div>
                  <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                  <div className="h-12 bg-gray-100 rounded border"></div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>

              {/* Return Link */}
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPageSkeleton;
