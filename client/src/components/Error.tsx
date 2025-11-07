interface ErrorProps {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

function Error({
  message = "Error loading data",
  onRetry,
  retryLabel = "Try Again",
}: ErrorProps) {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-red-500 text-lg font-medium mb-4">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Error;
