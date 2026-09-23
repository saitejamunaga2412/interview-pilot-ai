function HistoryStats({
  totalInterviews = 0,
  averageScore = 0,
  bestScore = 0,
  totalReports = 0,
}) {
  const stats = [
    {
      title: "Total Interviews",
      value: totalInterviews,
    },
    {
      title: "Average Score",
      value: `${averageScore}%`,
    },
    {
      title: "Best Score",
      value: `${bestScore}%`,
    },
    {
      title: "Reports",
      value: totalReports,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((item) => (
        <div
          key={item.title}
          className="bg-white rounded-xl shadow border p-5 text-center"
        >
          <p className="text-sm text-gray-500">
            {item.title}
          </p>

          <h3 className="text-2xl font-bold text-indigo-600 mt-2">
            {item.value}
          </h3>
        </div>
      ))}
    </div>
  );
}

export default HistoryStats;