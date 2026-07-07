"use client";

const MOCK_ORDERS = [
  {
    id: "1",
    driver: "Окожо",
    sap: "202699",
    car: "Toyota Prius 30 (8888 УБА)",
    part: "Урд амортизатор",
    desc: "Баруун урд талын амортизатор бүрэн ажиллагаагүй болсон, тос гоожсон байна.",
    date: "Саяхан",
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center justify-between p-6 bg-white border border-gray-200/60 rounded-2xl shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 .bg-gradient-to-tr from-amber-500 to-amber-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              ADM
            </div>
            <div>
              <h2 className="font-semibold text-xl tracking-tight text-gray-900">
                Удирдлагын хэсэг
              </h2>
              <p className="text-xs font-medium text-gray-400 mt-0.5">
                Ерөнхий Админ • Систем Хянагч
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="border-b border-gray-200 pb-3 flex justify-between items-end">
            <div>
              <h3 className="text-lg font-semibold text-gray-950 tracking-tight">
                Ирсэн сэлбэгийн захиалгууд
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Жолооч нараас бодит цаг хугацаанд ирүүлсэн техникийн хүсэлтүүд.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-mono">
              Нийт: {MOCK_ORDERS.length}
            </span>
          </div>

          <div className="space-y-4">
            {MOCK_ORDERS.map((order) => (
              <div
                key={order.id}
                className="p-6 bg-white border border-gray-200/60 rounded-2xl shadow-sm space-y-5 hover:border-slate-300 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                        Шинэ хүсэлт
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg text-gray-900 mt-1">
                      {order.part}
                    </h4>
                    <p className="text-sm font-medium text-slate-500">
                      {order.car}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-slate-50 px-2.5 py-1 rounded-md">
                    {order.date}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Тайлбар
                  </span>
                  {order.desc}
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="text-gray-400 font-medium">
                    Илгээсэн:{" "}
                    <span className="text-gray-800 font-semibold">
                      {order.driver}
                    </span>{" "}
                    (SAP ID: {order.sap})
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition">
                      Цуцлах
                    </button>
                    <button className="flex-1 sm:flex-none px-5 py-2 bg-slate-950 text-white rounded-xl font-semibold hover:bg-slate-800 shadow-md shadow-slate-950/10 transition">
                      Захиалгыг батлах
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
