import api from "./api";

/**
 * Fetch paginated notifications with optional type and unread filters
 */
export async function fetchNotifications(params = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    return { notifications: [], total: 0, unreadCount: 0 };
  }
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  if (params.type && params.type !== "ALL") query.append("type", params.type);
  if (params.unreadOnly) query.append("unreadOnly", "true");

  const queryString = query.toString();
  const url = `/notifications${queryString ? `?${queryString}` : ""}`;
  const response = await api.get(url);
  return response?.data?.data || { notifications: [], total: 0, unreadCount: 0 };
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
  return response?.data?.data?.count || 0;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id) {
  const response = await api.patch(`/notifications/${id}/read`);
  return response?.data?.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  const response = await api.patch("/notifications/read-all");
  return response?.data?.data;
}

/**
 * Delete a notification
 */
export async function deleteNotification(id) {
  const response = await api.delete(`/notifications/${id}`);
  return response?.data?.data;
}

/**
 * Fetch returning student summary & "while you were away"
 */
export async function fetchReturnSummary() {
  const response = await api.get("/dashboard/return-summary");
  return response?.data?.data;
}
