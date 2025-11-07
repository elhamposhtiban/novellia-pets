interface ErrorProps {
  message?: string;
}

function Error({ message = "Error loading data" }: ErrorProps) {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12 text-red-500">{message}</div>
      </div>
    </div>
  );
}

export default Error;
