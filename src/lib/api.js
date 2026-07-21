const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  if (!isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    let message =
      typeof payload === "object" && payload?.message
        ? payload.message
        : "Сервертэй холбогдоход алдаа гарлаа.";

    if (
      typeof message === "string" &&
      message.includes("Хүчингүй эсвэл хугацаа нь дууссан токен")
    ) {
      message = "Нэвтрэх хугацаа дууссан. Дахин нэвтэрнэ үү.";
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
  login: (body) => apiRequest("/api/auth/login", { method: "POST", body }),
  me: (token) => apiRequest("/api/auth/me", { token }),
  logout: (token) => apiRequest("/api/auth/logout", { method: "POST", token }),

  getDriverOptions: (token) => apiRequest("/api/requests/options", { token }),
  getMyRequests: (token) => apiRequest("/api/requests/my", { token }),
  createRequest: (token, data) => {
    const formData = new FormData();
    formData.append("vehicleId", data.vehicleId);
    if (data.partId) {
      formData.append("partId", data.partId);
    }
    formData.append("description", data.description);

    (data.images || []).forEach((file) => {
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
  updateRequestStatus: (token, id, status) =>
    apiRequest(`/api/requests/${id}/status`, {
      method: "PATCH",
      token,
      body: { status },
    }),
  markRequestRead: (token, id) =>
    apiRequest(`/api/requests/${id}/read`, { method: "PATCH", token }),

  getManagerOrders: (token, filter = "all") =>
    apiRequest(`/api/merch-orders${toQueryString({ filter })}`, { token }),
  confirmOrder: (token, id) =>
    apiRequest(`/api/merch-orders/${id}/confirm`, { method: "PATCH", token }),
  markOrderRead: (token, id) =>
    apiRequest(`/api/merch-orders/${id}/read`, { method: "PATCH", token }),

  getAdminSummary: (token) =>
    apiRequest("/api/dashboard/admin-summary", { token }),
  getTokenSummary: (token) =>
    apiRequest("/api/dashboard/token-summary", { token }),
};
