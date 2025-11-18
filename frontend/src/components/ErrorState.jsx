export default function ErrorState({ type }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-32 h-32 mb-4 text-6xl flex items-center justify-center bg-red-100 text-red-600 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-16 h-16"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm">
        We couldn't load your {type}. Please try again later or contact support
        if the issue persists.
      </p>
    </div>
  );
}
