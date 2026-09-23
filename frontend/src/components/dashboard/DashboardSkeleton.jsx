function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome Card */}
      <div className="bg-gray-200 rounded-xl h-44"></div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded-xl h-28"
          />
        ))}
      </div>

      {/* Quick Start */}
      <div className="bg-gray-200 rounded-xl h-48"></div>

      {/* Recent Interviews */}
      <div className="bg-gray-200 rounded-xl h-72"></div>

      {/* Profile Summary */}
      <div className="bg-gray-200 rounded-xl h-48"></div>

      {/* Recommendation */}
      <div className="bg-gray-200 rounded-xl h-48"></div>
    </div>
  );
}

export default DashboardSkeleton;