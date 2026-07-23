export const getProfileInitials = (user) => {
  const first = user?.firstName?.trim()?.charAt(0) || "";
  const last = user?.lastName?.trim()?.charAt(0) || "";
  return `${last}${first}`.toUpperCase() || "U";
};

export const getItemDate = (item, role) => {
  return role === "TOKEN_MANAGER" ? item?.orderedAt : item?.createdAt;
};

export const getRequesterName = (item, role) => {
  if (role === "TOKEN_MANAGER") {
    return `${item?.user?.lastName || ""} ${item?.user?.firstName || ""}`.trim();
  }
  if (role === "ADMIN") {
    return `${item?.driver?.lastName || ""} ${item?.driver?.firstName || ""}`.trim();
  }
  return "Өөрийн хүсэлт";
};

export const getRequesterSap = (item, role, currentUser) => {
  if (role === "TOKEN_MANAGER") return item?.user?.sapId || "-";
  if (role === "ADMIN") return item?.driver?.sapId || "-";
  return currentUser?.sapId || "-";
};

export const isNewItem = (item, role) => {
  if (role === "TOKEN_MANAGER") return item?.status === "NEW";
  return item?.status === "PENDING";
};

export const statusLabel = (status) => {
  if (status === "NEW") return "Шинэ";
  if (status === "CONFIRMED") return "Батлагдсан";
  if (status === "PENDING") return "Шинэ";
  if (status === "APPROVED") return "Батлагдсан";
  if (status === "REJECTED") return "Цуцлагдсан";
  return status || "-";
};

export const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
