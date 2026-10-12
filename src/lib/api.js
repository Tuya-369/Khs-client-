import { normalizeMerchItem } from "@/lib/merch";

const backendApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";
const API_BASE_URL = typeof window === "undefined" ? backendApiUrl : "/backend";
import { clearSession } from "@/lib/session";

export class ApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ApiError";
    this.status = details.status;
    this.code = details.code;
    this.errors = details.errors || [];
    this.payload = details.payload;
  }
}

const toQueryString = (query = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
};

const apiRequest = async (path, options = {}) => {
  const {
    method = "GET",
    body,
    token,
    headers = {},
    isFormData = false,
  } = options;

  const requestHeaders = { ...headers };

  if (!isFormData && body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      credentials: "include",
    });
  } catch (error) {
    throw new ApiError(
      `Backend сервертэй холбогдож чадсангүй (${API_BASE_URL}). Серверээ асаагаад дахин оролдоно уу.`,
      {
        code: "NETWORK_ERROR",
        payload: error,
      },
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();
  let payload = rawText;

  if (
    contentType.includes("application/json") ||
    rawText.trim().startsWith("{")
  ) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = rawText;
    }
  }

  if (!response.ok) {
    const readableText =
      typeof payload === "string"
        ? payload.match(/<pre>(.*?)<\/pre>/is)?.[1]?.trim() || payload.trim()
        : "";

    let message =
      typeof payload === "object" && payload?.message
        ? payload.message
        : readableText
          ? readableText
          : "Сервертэй холбогдоход алдаа гарлаа.";

    if (
      typeof message === "string" &&
      message.includes("Хүчингүй эсвэл хугацаа нь дууссан токен")
    ) {
      message = "Нэвтрэх хугацаа дууссан. Дахин нэвтэрнэ үү.";
    }

    if (response.status === 401 && typeof window !== "undefined") {
      clearSession();
      const isLoginPage = window.location.pathname === "/auth";
      if (!isLoginPage) {
        window.location.assign("/auth");
      }
    }

    throw new ApiError(message, {
      status: response.status,
      code: typeof payload === "object" ? payload?.code : undefined,
      errors: typeof payload === "object" ? payload?.errors : [],
      payload,
    });
  }

  return payload;
};

export const api = {
  register: (body) =>
    apiRequest("/api/auth/register", { method: "POST", body }),
  requestRegistrationOtp: (body) =>
    apiRequest("/api/auth/register/request-otp", { method: "POST", body }),
  verifyRegistrationOtp: (body) =>
    apiRequest("/api/auth/register/verify-otp", { method: "POST", body }),
  login: (body) => apiRequest("/api/auth/login", { method: "POST", body }),
  verifyOtp: (body) =>
    apiRequest("/api/auth/verify-otp", { method: "POST", body }),
  forgotPassword: (body) =>
    apiRequest("/api/auth/forgot-password", { method: "POST", body }),
  verifyForgotOtp: (body) =>
    apiRequest("/api/auth/verify-forgot-otp", { method: "POST", body }),
  resetPassword: (body) =>
    apiRequest("/api/auth/reset-password", { method: "POST", body }),
  getMerchItems: async (query) => {
    const payload = await apiRequest(`/api/merch${toQueryString(query)}`);
    const normalizedData = Array.isArray(payload?.data)
      ? payload.data.map((item) => normalizeMerchItem(item)).filter(Boolean)
      : [];

    return {
      ...payload,
      data: normalizedData,
    };
  },
  getMerchById: async (id) => {
    const payload = await apiRequest(`/api/merch/${id}`);
    return {
      ...payload,
      data: normalizeMerchItem(payload?.data, 0),
    };
  },
  getMerchPartners: () => apiRequest("/api/merch-partners"),
  updateMerchPartner: (token, id, formData) =>
    apiRequest(`/api/admin/merch-partners/${id}`, {
      method: "PATCH",
      token,
      body: formData,
      isFormData: true,
    }),
  createMerchOrder: (token, body) =>
    apiRequest("/api/merch-orders", { method: "POST", token, body }),
  me: (token) => apiRequest("/api/auth/me", { token }),
  logout: (token) => apiRequest("/api/auth/logout", { method: "POST", token }),
  updateProfile: async (token, body) => {
    const formData = new FormData();
    Object.entries(body || {}).forEach(([key, value]) => {
      if (key === "profileImage" && value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return apiRequest("/api/auth/me", {
      method: "PATCH",
      token,
      body: formData,
      isFormData: true,
    });
  },

  getDriverOptions: (token) => apiRequest("/api/requests/options", { token }),
  getMyRequests: (token) => apiRequest("/api/requests/my", { token }),
  createRequest: (token, data) => {
    const formData = new FormData();
    formData.append("vehicleId", data.vehicleId);
    formData.append("partIds", JSON.stringify(data.partIds));
    formData.append("description", data.description);

    (data.images || []).slice(0, 2).forEach((file) => {
      formData.append("images", file);
    });

    return apiRequest("/api/requests", {
      method: "POST",
      token,
      body: formData,
      isFormData: true,
    });
  },

  getAdminRequests: (token, query) =>
    apiRequest(`/api/requests${toQueryString(query)}`, { token }),
  getAdminRequestById: (token, id) =>
    apiRequest(`/api/requests/${id}`, { token }),
  updateRequestStatus: (token, id, status) =>
    apiRequest(`/api/requests/${id}/status`, {
      method: "PATCH",
      token,
      body: { status },
    }),
  claimOrder: (token, id, assignedUserId) =>
    apiRequest(`/api/requests/${id}/claim`, {
      method: "PATCH",
      token,
      body: { assignedUserId, status: "SEARCHING" },
    }),
  markRequestRead: (token, id) =>
    apiRequest(`/api/requests/${id}/read`, { method: "PATCH", token }),

  getManagerOrders: async (token, filter = "all") => {
    const payload = await apiRequest(
      `/api/merch-orders${toQueryString({ filter })}`,
      {
        token,
      },
    );

    const normalizedOrders = Array.isArray(payload?.data)
      ? payload.data.map((order) => ({
          ...order,
          merchItem: normalizeMerchItem(order?.merchItem),
        }))
      : [];

    return {
      ...payload,
      data: normalizedOrders,
    };
  },
  getAdminPanelOrders: async (token) => {
    const payload = await apiRequest("/api/dashboard/admin-panel/orders", {
      token,
    });
    const normalizeOrders = (orders) =>
      Array.isArray(orders)
        ? orders.map((order) => ({
            ...order,
            merchItem: normalizeMerchItem(order?.merchItem),
          }))
        : [];

    return {
      ...payload,
      data: {
        ...payload?.data,
        pendingOrders: normalizeOrders(payload?.data?.pendingOrders),
        reviewedOrders: normalizeOrders(payload?.data?.reviewedOrders),
      },
    };
  },
  getMyMerchOrders: async (token) => {
    const payload = await apiRequest("/api/merch-orders/my", { token });
    const normalizedOrders = Array.isArray(payload?.data)
      ? payload.data.map((order) => ({
          ...order,
          merchItem: normalizeMerchItem(order?.merchItem),
        }))
      : [];

    return {
      ...payload,
      data: normalizedOrders,
    };
  },
  confirmOrder: (token, id) =>
    apiRequest(`/api/merch-orders/${id}/confirm`, { method: "PATCH", token }),
  rejectOrder: (token, id) =>
    apiRequest(`/api/merch-orders/${id}/reject`, { method: "PATCH", token }),
  claimMerchOrder: (token, id, assignedUserId) =>
    apiRequest(`/api/merch-orders/${id}/claim`, {
      method: "PATCH",
      token,
      body: { assignedUserId, status: "SEARCHING" },
    }),
  updateMerchOrderStatus: (token, id, status) =>
    apiRequest(`/api/merch-orders/${id}/status`, {
      method: "PATCH",
      token,
      body: { status },
    }),
  markOrderRead: (token, id) =>
    apiRequest(`/api/merch-orders/${id}/read`, { method: "PATCH", token }),

  getCalendarNotes: (token) => apiRequest("/api/calendar/notes", { token }),
  createCalendarNote: (token, body) =>
    apiRequest("/api/calendar/notes", { method: "POST", token, body }),
  updateCalendarNote: (token, id, done) =>
    apiRequest(`/api/calendar/notes/${id}`, {
      method: "PATCH",
      token,
      body: { done },
    }),
  deleteCalendarNote: (token, id) =>
    apiRequest(`/api/calendar/notes/${id}`, { method: "DELETE", token }),

  createFeedback: (token, body) =>
    apiRequest("/api/feedback", { method: "POST", token, body }),
  getHrFeedback: (token) => apiRequest("/api/feedback", { token }),
  updateFeedbackStatus: (token, id, status) =>
    apiRequest(`/api/feedback/${id}/status`, {
      method: "PATCH",
      token,
      body: { status },
    }),

  getNotifications: (token, limit = 30) =>
    apiRequest(`/api/notifications${toQueryString({ limit })}`, { token }),
  markNotificationRead: (token, id) =>
    apiRequest(`/api/notifications/${id}/read`, { method: "PATCH", token }),
  markAllNotificationsRead: (token) =>
    apiRequest("/api/notifications/read-all", { method: "PATCH", token }),

  getAdminSummary: (token) =>
    apiRequest("/api/dashboard/admin-summary", { token }),
  getTokenSummary: (token) =>
    apiRequest("/api/dashboard/token-summary", { token }),
};
