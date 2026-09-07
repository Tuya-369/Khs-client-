"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Check, ChevronDown, Search, Send, X } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { clearSession, getAccessToken } from "@/lib/session";
import DashboardProfileCard from "@/components/common/DashboardProfileCard";

const MAX_DAMAGE_IMAGES = 2;
const MAX_DAMAGE_IMAGE_SIZE = 20 * 1024 * 1024;
const ALLOWED_DAMAGE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function DriverDashboardContent({ embedded = false }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [showVehicleList, setShowVehicleList] = useState(false);
  const [activeCarId, setActiveCarId] = useState("");
  const [selectedPartIds, setSelectedPartIds] = useState([]);
  const [openCategoryIds, setOpenCategoryIds] = useState([]);
  const [damageImages, setDamageImages] = useState([]);
  const [issueDescription, setIssueDescription] = useState("");
  const [submittedOrders, setSubmittedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeCar = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === activeCarId),
    [vehicles, activeCarId],
  );

  const filteredVehicles = useMemo(() => {
    const query = vehicleSearch.trim().toLocaleLowerCase();
    if (!query) return vehicles;

    return vehicles.filter((vehicle) => {
      const vehicleMatches = [vehicle.name, vehicle.plate].some((value) =>
        String(value || "")
          .toLocaleLowerCase()
          .includes(query),
      );
      const partMatches = vehicle.partCategories?.some((category) =>
        [
          category.name,
          ...(category.parts || []).map((part) => part.name),
        ].some((value) =>
          String(value || "")
            .toLocaleLowerCase()
            .includes(query),
        ),
      );

      return vehicleMatches || partMatches;
    });
  }, [vehicleSearch, vehicles]);

  const matchesVehicleSearch = (value) =>
    String(value || "")
      .toLocaleLowerCase()
      .includes(vehicleSearch.trim().toLocaleLowerCase());

  const matchesCarSearch = (car) =>
    [car.name, car.plate].some(matchesVehicleSearch);

  const statusLabel = (status) => {
    if (status === "APPROVED") return "Батлагдсан";
    if (status === "PENDING") return "Хүлээгдэж буй";
    if (status === "REJECTED") return "Цуцлагдсан";
    if (status === "SEARCHING") return "Сэлбэг хайж байгаа";
    if (status === "NOT_FOUND") return "Сэлбэг олоогүй";
    if (status === "COMPLETED") return "Гүйцэтгэсэн";
    return status;
  };

  const statusClass = (status) => {
    if (status === "APPROVED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (status === "PENDING") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (status === "SEARCHING") {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    if (status === "COMPLETED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadDashboardData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const [meResponse, optionsResponse, myRequestsResponse] =
        await Promise.all([
          api.me(token),
          api.getDriverOptions(token),
          api.getMyRequests(token),
        ]);

      setProfile(meResponse?.data?.user || null);
      const loadedVehicles = optionsResponse?.data || [];
      setVehicles(loadedVehicles);
      setSubmittedOrders(myRequestsResponse?.data || []);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        router.push("/auth");
        return;
      }

      setErrorMessage("Өгөгдөл татах үед алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadDashboardData();
    }, 0);

    return () => {
      window.clearTimeout(loadTimer);
    };
  }, [loadDashboardData]);

  useEffect(() => {
    return () => {
      damageImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
    };
  }, [damageImages]);

  const handleDamageImagesUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const availableSlots = MAX_DAMAGE_IMAGES - damageImages.length;
    const validationErrors = [];

    if (availableSlots <= 0) {
      setErrorMessage(
        `Нэг хүсэлтэд хамгийн ихдээ ${MAX_DAMAGE_IMAGES} зураг оруулна.`,
      );
      event.target.value = "";
      return;
    }

    const validFiles = files.filter((file) => {
      if (!ALLOWED_DAMAGE_IMAGE_TYPES.has(file.type)) {
        validationErrors.push(
          `${file.name}: зөвшөөрөгдсөн зургийн төрөл биш байна.`,
        );
        return false;
      }

      if (file.size > MAX_DAMAGE_IMAGE_SIZE) {
        validationErrors.push(`${file.name}: 20MB-аас их хэмжээтэй байна.`);
        return false;
      }

      return true;
    });

    if (validFiles.length > availableSlots) {
      validationErrors.push(
        `Нэг хүсэлтэд хамгийн ихдээ ${MAX_DAMAGE_IMAGES} зураг оруулна.`,
      );
    }

    const newImages = validFiles.slice(0, availableSlots).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));

    if (newImages.length) {
      setDamageImages((prev) => [...prev, ...newImages]);
    }
    setErrorMessage(validationErrors.join(" "));
    event.target.value = "";
  };

  const removeDamageImage = (id) => {
    setDamageImages((prev) => {
      const found = prev.find((image) => image.id === id);
      if (found) {
        URL.revokeObjectURL(found.url);
      }

      return prev.filter((image) => image.id !== id);
    });
  };

  const togglePart = (partId) => {
    setSelectedPartIds((current) =>
      current.includes(partId)
        ? current.filter((id) => id !== partId)
        : [...current, partId],
    );
  };

  const toggleCategory = (categoryId) => {
    setOpenCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };

  const submitOrder = async () => {
    if (!activeCarId) {
      setErrorMessage("Эхлээд тээврийн хэрэгслээ сонгоно уу.");
      return;
    }

    if (selectedPartIds.length === 0) {
      setErrorMessage("Дор хаяж нэг сэлбэг сонгоно уу.");
      return;
    }

    if (damageImages.length === 0) {
      setErrorMessage("Эвдэрсэн хэсгийн дор хаяж нэг зураг оруулна уу.");
      return;
    }

    if (issueDescription.trim().length < 5) {
      setErrorMessage("Тайлбар хамгийн багадаа 5 тэмдэгт байх ёстой.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await api.createRequest(token, {
        vehicleId: activeCarId,
        partIds: selectedPartIds,
        description: issueDescription.trim(),
        images: damageImages.map((image) => image.file),
      });

      const meta = response?.meta;
      const uploaded = meta?.uploadedImages ?? 0;
      const skipped =
        (meta?.failedUploads ?? 0) + (meta?.oversizedSkipped ?? 0);

      setSuccessMessage(
        `Хүсэлт илгээгдлээ. Амжилттай зураг: ${uploaded}, алгассан зураг: ${skipped}.`,
      );

      damageImages.forEach((image) => URL.revokeObjectURL(image.url));
      setDamageImages([]);
      setIssueDescription("");
      setSelectedPartIds([]);
      setOpenCategoryIds([]);
      await loadDashboardData();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        router.push("/auth");
        return;
      }

      if (error instanceof ApiError) {
        setErrorMessage(error.message || "Хүсэлт илгээх үед алдаа гарлаа.");
      } else {
        setErrorMessage("Хүсэлт илгээх үед алдаа гарлаа.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={
        embedded
          ? "text-slate-800 antialiased"
          : "min-h-screen bg-[#f8fafc] text-slate-800 antialiased p-4 sm:p-8"
      }
    >
      <div className="max-w-3xl mx-auto space-y-5">
        {!embedded && (
          <DashboardProfileCard
            badge={profile?.firstName?.charAt(0)?.toUpperCase() || "D"}
            name={profile ? `${profile.lastName} ${profile.firstName}` : "..."}
            subtitle="Механикч"
            sapId={profile?.sapId || "-"}
            totalLabel="Нийт хүсэлт"
            totalValue={submittedOrders.length}
          />
        )}

        {loading && (
          <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-500">
            Өгөгдөл ачаалж байна...
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={vehicleSearch}
                onChange={(event) => setVehicleSearch(event.target.value)}
                placeholder="Машины нэр, улсын дугаар, сэлбэгээр хайх"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowVehicleList((current) => !current)}
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              {showVehicleList ? "Жагсаалт нуух" : "Бүх машин харах"}
            </button>
          </div>

          {(showVehicleList || vehicleSearch.trim()) && (
            <div className="space-y-2.5">
              {filteredVehicles.map((car) => (
                <div
                  key={car.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCarId(activeCarId === car.id ? "" : car.id);
                      setSelectedPartIds([]);
                      setOpenCategoryIds([]);
                    }}
                    className="w-full text-left p-4 sm:p-5 font-medium flex justify-between items-center hover:bg-slate-50/50 active:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-900 font-bold text-sm sm:text-base">
                        {car.name}
                      </span>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-semibold">
                        {car.plate}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition-transform ${activeCarId === car.id ? "rotate-180" : ""}`}
                    />
                  </button>

                  {activeCarId === car.id && (
                    <div className="p-4 space-y-2 bg-slate-50/50 border-t border-slate-100">
                      {car.partCategories
                        ?.filter(
                          (category) =>
                            !vehicleSearch.trim() ||
                            matchesCarSearch(car) ||
                            matchesVehicleSearch(category.name) ||
                            category.parts?.some((part) =>
                              matchesVehicleSearch(part.name),
                            ),
                        )
                        .map((category) => {
                          const isOpen = openCategoryIds.includes(category.id);
                          const showAllCategoryParts =
                            !vehicleSearch.trim() ||
                            matchesCarSearch(car) ||
                            matchesVehicleSearch(category.name);
                          const visibleParts = showAllCategoryParts
                            ? category.parts
                            : category.parts.filter((part) =>
                                matchesVehicleSearch(part.name),
                              );

                          return (
                            <div
                              key={category.id}
                              className="rounded-lg border border-slate-200 bg-white overflow-hidden"
                            >
                              <button
                                type="button"
                                onClick={() => toggleCategory(category.id)}
                                className="w-full flex items-center justify-between gap-3 px-3.5 py-3 text-left text-xs font-bold text-slate-800 hover:bg-slate-50"
                              >
                                <span>{category.name}</span>
                                <ChevronDown
                                  size={16}
                                  className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                              </button>
                              {isOpen && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-100 p-3">
                                  {visibleParts.map((part) => {
                                    const isSelected = selectedPartIds.includes(
                                      part.id,
                                    );
                                    return (
                                      <label
                                        key={part.id}
                                        className={`flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-xs font-medium cursor-pointer transition ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:border-slate-400"}`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => togglePart(part.id)}
                                          className="sr-only"
                                        />
                                        <span
                                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isSelected ? "border-white bg-white text-slate-900" : "border-slate-300"}`}
                                        >
                                          {isSelected && (
                                            <Check size={12} strokeWidth={3} />
                                          )}
                                        </span>
                                        {part.name}
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ))}

              {!loading && vehicles.length === 0 && (
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-500">
                  Танд оноогдсон тээврийн хэрэгсэл алга.
                </div>
              )}

              {!loading &&
                vehicles.length > 0 &&
                filteredVehicles.length === 0 && (
                  <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-500">
                    Тохирох тээврийн хэрэгсэл эсвэл сэлбэг олдсонгүй.
                  </div>
                )}
            </div>
          )}
        </div>

        {activeCar && (
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-md space-y-4 animate-in fade-in duration-200">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900">
                Сонгосон:{" "}
                <span className="text-amber-600">{activeCar.name}</span>
              </h4>
            </div>

            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Эвдэрсэн хэсгийн зураг
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-slate-400 bg-slate-50/50 relative active:bg-slate-100 transition-colors">
                  <label className="block cursor-pointer w-full h-full py-2">
                    <span className="text-xs font-semibold text-slate-700 block">
                      <Camera size={15} className="inline mr-1" /> Зураг нэмэх
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      JPG, PNG, WEBP, HEIC эсвэл HEIF (нэг бүр 20MB, ихдээ 5)
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                      multiple
                      onChange={handleDamageImagesUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {damageImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium text-slate-500">
                      Сонгосон зураг ({damageImages.length})
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {damageImages.map((image) => (
                        <div
                          key={image.id}
                          className="relative rounded-lg overflow-hidden border border-slate-200 bg-white aspect-square"
                        >
                          <Image
                            src={image.url}
                            alt={image.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeDamageImage(image.id)}
                            className="absolute top-1 right-1 w-5 h-5 text-xs font-bold rounded-full bg-black/70 text-white flex items-center justify-center active:bg-black"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Эвдрэлийн тайлбар
                </label>
                <textarea
                  placeholder="Эвдрэл гарсан шалтгааныг энд тодорхой бичнэ үү..."
                  value={issueDescription}
                  onChange={(event) => setIssueDescription(event.target.value)}
                  className="w-full p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 bg-slate-50/30 resize-none font-normal"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedPartIds([]);
                  setOpenCategoryIds([]);
                  setDamageImages([]);
                  setIssueDescription("");
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition"
              >
                Цуцлах
              </button>
              <button
                type="button"
                onClick={submitOrder}
                disabled={submitting}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-[0.99] transition shadow-sm"
              >
                {submitting ? (
                  "Илгээж байна..."
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Send size={14} /> Хүсэлт илгээх
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-base font-bold text-slate-900">
              Өгсөн захиалгууд
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Таны илгээсэн хүсэлтүүд болон тэдгээрийн шийдвэрлэлтийн төлөв.
            </p>
          </div>

          {submittedOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Одоогоор илгээсэн захиалга байхгүй байна.
            </p>
          ) : (
            <div className="space-y-2.5">
              {submittedOrders.map((order) => {
                return (
                  <div
                    key={order.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          {order.vehicle?.name || "-"}{" "}
                          <span className="text-slate-300 font-normal mx-1">
                            |
                          </span>{" "}
                          {order.requestParts
                            ?.map((item) => item.part?.name)
                            .filter(Boolean)
                            .join(", ") ||
                            order.part?.name ||
                            "Ерөнхий хүсэлт"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border shrink-0 ${statusClass(order.status)}`}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed font-normal">
                      {order.description}
                    </p>

                    {order.status === "APPROVED" && (
                      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs font-medium text-emerald-800">
                        Таны захиалгыг админ амжилттай баталлаа. Тантай эргэж
                        холбогдох болно.
                      </p>
                    )}

                    {order.images?.length > 0 && (
                      <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        📎 Хавсаргасан зураг:{" "}
                        <span className="text-slate-700 font-semibold">
                          {order.images?.length}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DriverDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return null;
}
