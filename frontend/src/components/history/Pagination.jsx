function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        Previous
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange?.(page)}
          className={`w-10 h-10 rounded-lg transition ${
            currentPage === page
              ? "bg-indigo-600 text-white"
              : "border hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
        className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;