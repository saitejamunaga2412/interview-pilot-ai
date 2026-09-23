import {
  FaEye,
  FaDownload,
  FaTrash,
  FaCalendarAlt,
  FaUserTie,
  FaStar,
  FaSpinner,
} from "react-icons/fa";

function HistoryCard({
  interview,
  isDeleting,
  isDownloading,
  onView,
  onDownload,
  onDelete,
}) {
  const score = Number(interview?.overallScore ?? 0);
  const isBusy = isDeleting || isDownloading;

  const scoreColor =
    score >= 80
      ? "text-green-600"
      : score >= 60
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div
      className={`bg-white rounded-xl shadow border p-5 transition ${
        isBusy ? "opacity-70" : "hover:shadow-lg"
      }`}
    >
      <div className="flex flex-col lg:flex-row justify-between gap-5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {interview?.role || "Interview"}
          </h3>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FaUserTie />
            <span>{interview?.level || "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FaCalendarAlt />
            <span>
              {interview?.createdAt
                ? new Date(interview.createdAt).toLocaleString()
                : "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaStar className={scoreColor} />
            <span className={`font-semibold ${scoreColor}`}>
              {score}%
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {interview?.status === "In Progress" ? (
            <button
              onClick={() => onView?.(interview, true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <FaEye />
              Continue
            </button>
          ) : (
            <button
              onClick={() => onView?.(interview, false)}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <FaEye />
              View
            </button>
          )}
          <button
            disabled={isDownloading}
            onClick={() => onDownload?.(interview._id)}
            className={`px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 ${
              isDownloading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
            {isDownloading ? "Downloading..." : "Report"}
          </button>
          <button
            disabled={isDeleting}
            onClick={() => onDelete?.(interview._id)}
            className={`px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2 ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HistoryCard;