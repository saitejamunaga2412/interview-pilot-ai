import { useCallback, useState } from "react";

function useToast(duration = 3000) {
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({
      isVisible: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        isVisible: false,
      }));
    }, duration);
  }, [duration]);

  const hideToast = useCallback(() => {
    setToast((prev) => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
}

export default useToast;