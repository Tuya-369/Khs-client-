const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const parseStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((entry) => String(entry || "").trim())
            .filter(Boolean);
        }
      } catch {}
    }

    return trimmed
      .split(/[,;|]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const resolveMerchImageUrl = (rawUrl) => {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return "";
  }

  const url = rawUrl.trim();

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
};

export const normalizeMerchItem = (item) => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const id = item.id ?? item._id;
  const sizes =
    parseStringArray(item.sizes) ||
    parseStringArray(item.sizeOptions) ||
    parseStringArray(item.size);
  const colors =
    parseStringArray(item.colors) ||
    parseStringArray(item.colorOptions) ||
    parseStringArray(item.color);

  const imageCandidate =
    item.imageUrl ||
    item.image ||
    item.imagePath ||
    item.image_path ||
    item.thumbnail ||
    item.photo ||
    "";

  return {
    ...item,
    id,
    title: item.title || item.name || "",
    description: item.description || item.shortDescription || "",
    longDescription: item.longDescription || item.description || "",
    price: toNumber(item.price, 0),
    sizes,
    colors,
    imageUrl: resolveMerchImageUrl(imageCandidate),
  };
};
