import { useEffect } from "react";

function Toast({
  message = "",
  type = "success",
  isVisible = false,
  onClose,
}) {
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor =
    type === "error"
      ? "bg-red-500"
      : type === "warning"
      ? "bg-yellow-500"
      : "bg-green-600";

  return (
    <div className="fixed top-5 right-5 z-50">
      <div
        className={`${bgColor} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3`}
      >
        <span>{message}</span>

        <button
          onClick={onClose}
          className="font-bold hover:opacity-80"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Toast;