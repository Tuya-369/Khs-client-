"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PlayCircle, Video } from "lucide-react";

const VIDEO_DATA = [
  {
    id: "department-ogsm",
    URL: "https://res.cloudinary.com/hfroefns/video/upload/v1788143333/2._%D0%90%D0%B6%D0%B8%D0%BB%D1%82%D0%BD%D1%8B_%D1%82%D3%A9%D0%BB%D3%A9%D0%B2%D0%BB%D3%A9%D0%B3%D3%A9%D3%A9_%D0%B1%D0%BE%D0%BB%D0%BE%D0%B2%D1%81%D1%80%D1%83%D1%83%D0%BB%D0%B0%D1%85_evtvoy.mp4",
    title: "Хэлтэс, нэгжийн ажлын төлөвлөгөөг OGSM загвараар төлөвлөх",
    description:
      "Энэ видеоны тусламжтайгаар ажлын төлөвлөгөө, зорилго, арга хэмжээ, хэмжүүрийг хэрхэн зөв төлөвлөхийг үзнэ.",
  },
  {
    id: "employee-plan",
    URL: "https://res.cloudinary.com/hfroefns/video/upload/v1788143333/2._%D0%90%D0%B6%D0%B8%D0%BB%D1%82%D0%BD%D1%8B_%D1%82%D3%A9%D0%BB%D3%A9%D0%B2%D0%BB%D3%A9%D0%B3%D3%A9%D3%A9_%D0%B1%D0%BE%D0%BB%D0%BE%D0%B2%D1%81%D1%80%D1%83%D1%83%D0%BB%D0%B0%D1%85_evtvoy.mp4",
    title: "Ажилтны төлөвлөгөө боловсруулах",
    description:
      "Энэ видеоны тусламжтайгаар ажилтны ажлын төлөвлөгөөг хэрхэн боловсруулах, зорилго, арга хэмжээ, хэмжүүрийг тодорхойлохыг үзнэ.",
  },
];

const getVideoSrc = (URL) => URL;

const videos = VIDEO_DATA.map((item) => ({
  ...item,
  src: getVideoSrc(item.URL),
}));

export default function GraduationCapPage() {
  const router = useRouter();
  const [activeVideo, setActiveVideo] = useState(videos[0]);

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-slate-800 md:bg-slate-50 md:py-10">
      <div className="mx-auto max-w-6xl">
        <button></button>

        <div className="mb-6 flex flex-col gap-2 md:mb-8">
          <h1 className="text-2xl font-bold text-slate-900 md:text-4xl">
            Сургалт
          </h1>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-500 md:text-base">
            Энэхүү сургалтын видеонууд нь байгууллагын ажилтнуудын ур чадварыг
            дээшлүүлэх, ажлын үр дүнг сайжруулахад чиглэгдсэн болно.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl bg-black md:rounded-3xl">
              <video
                key={activeVideo.URL}
                src={activeVideo.src}
                controls
                className="aspect-video w-full"
                preload="metadata"
              />
            </div>

            <div className="space-y-2 py-2">
              <h2 className="text-lg font-bold text-slate-900 md:text-2xl">
                {activeVideo.title}
              </h2>
              <p className="text-xs leading-relaxed text-slate-600 md:text-base">
                {activeVideo.description}
              </p>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="border-t border-slate-100 pt-6 lg:border-t-0 lg:pt-0">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Video className="h-4 w-4 text-orange-500" />
                Видео хичээлүүд
              </div>

              <div className="divide-y divide-slate-100">
                {videos.map((video, index) => {
                  const isActive = activeVideo.id === video.id;
                  return (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => setActiveVideo(video)}
                      className="group w-full py-4 text-left transition-colors first:pt-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 text-xs font-semibold ${
                            isActive ? "text-orange-600" : "text-slate-400"
                          }`}
                        >
                          0{index + 1}
                        </span>

                        <div className="space-y-1">
                          {/* Гарчиг */}
                          <p
                            className={`text-sm font-semibold leading-snug transition-colors ${
                              isActive
                                ? "text-orange-600"
                                : "text-slate-800 group-hover:text-orange-600"
                            }`}
                          >
                            {video.title}
                          </p>

                          {/* Агуулга */}
                          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                            Агуулга: {video.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
