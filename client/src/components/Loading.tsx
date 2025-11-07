interface LoadingProps {
  message?: string;
}

function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">{message}</div>
      </div>
    </div>
  );
}

export default Loading;
