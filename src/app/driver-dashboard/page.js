"use client";
import { useState } from "react";

const CAR_DATA = [
  {
    id: "car1",
    name: "Toyota Prius 30",
    plate: "8888 УБА",
    parts: ["Урд амортизатор", "Тормосны наклад", "Свеч"],
  },
  {
    id: "car2",
    name: "Hyundai Porter",
    plate: "1111 УББ",
    parts: ["Рессор", "Диск муфта", "Агаарын шүүлтүүр"],
  },
];

export default function DriverDashboard() {
  const [activeCarId, setActiveCarId] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex items-center justify-between p-6 bg-white border border-gray-200/60 rounded-2xl shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 .bg-gradient-to-tr from-slate-700 to-slate-900 text-white rounded-full flex items-center justify-center font-semibold text-lg shadow-inner">
              ОК
            </div>
            <div>
              <h2 className="font-semibold text-xl tracking-tight text-gray-900">
                Лхамаа • Жолооч
              </h2>
              <p className="text-xs font-medium text-gray-400 mt-0.5">
                Жолооч • SAP: 202699
              </p>
            </div>
          </div>
          <button className="text-xs font-semibold px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
            Профайл засах
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <h3 className="text-lg font-semibold text-gray-950 tracking-tight">
              Тээврийн хэрэгсэл болон сэлбэг
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Хуваарилагдсан машинаа сонгож, эвдрэлтэй сэлбэгийг тэмдэглэнэ үү.
            </p>
          </div>

          <div className="space-y-3">
            {CAR_DATA.map((car) => (
              <div
                key={car.id}
                className="bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() =>
                    setActiveCarId(activeCarId === car.id ? null : car.id)
                  }
                  className="w-full text-left p-5 font-medium flex justify-between items-center hover:bg-gray-50/50 transition"
                >
                  <div>
                    <span className="text-gray-900 font-semibold">
                      {car.name}
                    </span>
                    <span className="ml-3 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono">
                      {car.plate}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs transition-transform duration-200">
                    {activeCarId === car.id ? "▲" : "▼"}
                  </span>
                </button>

                {activeCarId === car.id && (
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/50 border-t border-gray-100">
                    {car.parts.map((part) => (
                      <button
                        key={part}
                        onClick={() => setSelectedPart(part)}
                        className={`p-4 text-sm text-left rounded-xl border transition-all font-medium ${
                          selectedPart === part
                            ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/10"
                            : "border-gray-200 bg-white text-gray-700 hover:border-slate-400"
                        }`}
                      >
                        {part}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedPart && (
          <div className="p-6 bg-white border border-slate-900/10 rounded-2xl shadow-xl shadow-slate-200/50 space-y-5 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-lg text-gray-900">
                📌 Захиалгын мэдээлэл:{" "}
                <span className="text-slate-600 font-bold">{selectedPart}</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Эвдэрсэн хэсгийн зураг
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-slate-400 transition cursor-pointer bg-slate-50/30">
                  <span className="text-xs text-gray-400 font-medium">
                    Зураг чирэх эсвэл хуулах
                  </span>
                  <input type="file" className="hidden" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Эвдрэлийн тайлбар
                </label>
                <textarea
                  placeholder="Эвдрэл гарсан шалтгаан, нөхцөл байдлыг тодорхой бичнэ үү..."
                  className="w-full p-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-slate-900 bg-slate-50/30 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedPart(null)}
                className="px-5 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
              >
                Цуцлах
              </button>
              <button
                onClick={() => {
                  alert("Захиалга илгээгдлээ.");
                  setSelectedPart(null);
                }}
                className="px-5 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-md shadow-slate-900/10 transition"
              >
                Хүсэлт илгээх
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
