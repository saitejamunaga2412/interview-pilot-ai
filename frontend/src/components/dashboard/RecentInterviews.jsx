import { Link } from "react-router-dom";

function RecentInterviews({ interviews = [] }) {
  if (!interviews.length) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Recent Interviews</h2>
        <p className="text-gray-500">No interviews found.</p>

        <Link
          to="/interview"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Start Interview
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Recent Interviews</h2>

        <Link
          to="/history"
          className="text-blue-600 hover:underline text-sm"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {(interviews ?? []).slice(0, 5).map((item, index) => (
          <div
            key={item?._id || index}
            className="flex justify-between items-center border rounded-lg p-4"
          >
            <div>
              <h3 className="font-semibold">
                {item?.role || "Interview"}
              </h3>

              <p className="text-sm text-gray-500">
                {item?.level || "N/A"}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">
                {item?.score ?? 0}%
              </p>

              <p className="text-xs text-gray-500">
                {item?.createdAt
                  ? new Date(item.createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentInterviews;