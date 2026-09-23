import { FaSearch } from "react-icons/fa";

function HistoryFilters({
  search = "",
  onSearchChange,
  role = "",
  onRoleChange,
  status = "",
  onStatusChange,
}) {
  return (
    <div className="bg-white rounded-xl shadow border p-5 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search interviews..."
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Role Filter */}
        <select
          value={role}
          onChange={(e) => onRoleChange?.(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="Java Developer">Java Developer</option>
          <option value="Python Developer">Python Developer</option>
          <option value="MERN Stack Developer">MERN Stack Developer</option>
          <option value="Data Science">Data Science</option>
          <option value="DevOps">DevOps</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onStatusChange?.(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
        </select>
      </div>
    </div>
  );
}

export default HistoryFilters;