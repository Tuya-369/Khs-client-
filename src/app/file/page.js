"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";

const CATEGORIES = ["Бүгд", "Тайлан", "Журам", "Хуудас"];

const DOCUMENTS = [
  {
    id: 0,
    title: "Ажилтны дотоод журам",
    category: "Журам",
    fileUrl: "/file/Juram.pdf",
  },
  {
    id: 1,
    title: "Чөлөө олгох",
    category: "Хуудас",
    fileUrl: "/file/choloo.pdf",
  },
  {
    id: 2,
    title: "Ээлжийн амралт",
    category: "Хуудас",
    fileUrl: "/eeljiin amralt.pdf",
  },
  {
    id: 3,
    title: "Ажил хүлээлцэх",
    category: "Хуудас",
    fileUrl: "/ajil huleeltseh.pdf",
  },
  {
    id: 4,
    title: "Эд хөрөнгийн хохирол",
    category: "Хуудас",
    fileUrl: "/ed horongiin hohirol.pdf",
  },
  {
    id: 5,
    title: "Сахилгын шийтгэл",
    category: "Хуудас",
    fileUrl: "/sahilgiin shiitgel.pdf",
  },
  {
    id: 6,
    title: "Шилжин ажиллах",
    category: "Хуудас",
    fileUrl: "/shiljin ajillah.pdf",
  },
  {
    id: 7,
    title: "Шинэ ажилтны үнэлгээ - 30 хоног",
    category: "Хуудас",
    fileUrl: "/shine ajiltan unelgee 30.pdf",
  },
  {
    id: 8,
    title: "Шинэ ажилтны үнэлгээ - 60 хоног",
    category: "Хуудас",
    fileUrl: "/shine ajiltanii unelgee 60.pdf",
  },
  {
    id: 9,
    title: "Шинэ ажилтны үнэлгээ - 90 хоног",
    category: "Хуудас",
    fileUrl: "/shine ajiltan unelgee 90.pdf",
  },
  {
    id: 10,
    title: "Тойрох хуудас",
    category: "Хуудас",
    fileUrl: "/toiroh huudas.pdf",
  },
];

export default function FilePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("Бүгд");

  const filteredDocs =
    selectedCategory === "Бүгд"
      ? DOCUMENTS
      : DOCUMENTS.filter((doc) => doc.category === selectedCategory);

  return (
    <div className="w-full min-flex-1  py-20 px-6 flex flex-col items-center justify-start">
      <div className="max-w-5xl w-full flex flex-col gap-6">
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={14} />
          Буцах
        </button>

        <div className="flex flex-wrap gap-3 justify-start">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                selectedCategory === cat
                  ? "bg-gray-600 text-white border-gray-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-gray-400 font-semibold mb-4 text-sm">2026</div>

          <div className="flex flex-col divide-y divide-gray-100">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
              >
                <p className="text-gray-700 text-sm font-medium flex-1">
                  {doc.title}
                </p>

                <div className="flex items-center gap-4 shrink-0">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Унших
                  </a>
                </div>
              </div>
            ))}

            {filteredDocs.length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm">
                Баримт бичиг олдсонгүй.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
