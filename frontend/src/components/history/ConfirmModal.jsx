function ConfirmModal({
  isOpen,
  title = "Confirmation",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {title}
        </h2>

        <p className="mt-3 text-gray-600">
          {message}
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;