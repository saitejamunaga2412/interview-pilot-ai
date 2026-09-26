import api from "./api";

/**
 * Fetch paginated notifications with optional type and unread filters
 */
export async function fetchNotifications(params = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    return { notifications: [], total: 0, unreadCount: 0, totalPages: 1 };
  }
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  if (params.type && params.type !== "ALL") query.append("type", params.type);
  if (params.unreadOnly) query.append("unreadOnly", "true");

  const queryString = query.toString();
  const url = `/notifications${queryString ? `?${queryString}` : ""}`;
  const response = await api.get(url);
  const resData = response?.data;

  let rawList = [];
  if (Array.isArray(resData?.notifications)) {
    rawList = resData.notifications;
  } else if (Array.isArray(resData?.data)) {
    rawList = resData.data;
  } else if (Array.isArray(resData?.data?.notifications)) {
    rawList = resData.data.notifications;
  }

  const total = typeof resData?.total === "number"
    ? resData.total
    : (typeof resData?.data?.total === "number" ? resData.data.total : rawList.length);

  const unreadCount = typeof resData?.unreadCount === "number"
    ? resData.unreadCount
    : (typeof resData?.data?.unreadCount === "number"
        ? resData.data.unreadCount
        : rawList.filter((n) => !n.read).length);

  const totalPages = typeof resData?.totalPages === "number"
    ? resData.totalPages
    : (typeof resData?.data?.totalPages === "number"
        ? resData.data.totalPages
        : Math.max(1, Math.ceil(total / (params.limit || 25))));

  return {
    notifications: rawList,
    total,
    unreadCount,
    totalPages
  };
}

/**
 * Fetch unread count for the notification bell
 */
export async function fetchUnreadCount() {
  const token = localStorage.getItem("token");
  if (!token) {
    return 0;
  }
  const response = await api.get("/notifications/unread-count");
  return response?.data?.data?.count ?? response?.data?.count ?? 0;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id) {
  const response = await api.patch(`/notifications/${id}/read`);
  return response?.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  const response = await api.patch("/notifications/read-all");
  return response?.data;
}

/**
 * Delete a notification
 */
export async function deleteNotification(id) {
  const response = await api.delete(`/notifications/${id}`);
  return response?.data;
}

/**
 * Trigger a genuine test notification for testing
 */
export async function triggerTestNotification(payload = {}) {
  const response = await api.post("/notifications/trigger-test", payload);
  return response?.data;
}

/**
 * Fetch returning student summary & "while you were away"
 */
export async function fetchReturnSummary() {
  const response = await api.get("/dashboard/return-summary");
  return response?.data?.data;
}

