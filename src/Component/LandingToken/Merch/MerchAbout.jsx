import Image from "next/image";

export default function MerchAbout({ item }) {
  if (!item) return null;

  return (
    <section className="group mx-auto mt-6 w-full max-w-3xl rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-neutral-50 p-4 sm:w-48 md:w-56 shrink-0 border border-neutral-100/50">
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={320}
            height={320}
            sizes="(max-width: 640px) 80vw, 224px"
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-neutral-500 uppercase">
              Сонгосон бүтээгдэхүүн
            </span>
            <span className="text-sm font-bold text-neutral-900 bg-neutral-50 px-2 py-0.5 rounded-md border border-neutral-100">
              {item.cost}
            </span>
          </div>

          <div>
            <h4 className="text-xl font-bold tracking-tight text-neutral-900">
              {item.title}
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
              {item.longDescription}
            </p>
          </div>

          <div className="flex gap-6 border-y border-neutral-100/80 py-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400">Хэмжээ:</span>{" "}
              <span className="font-semibold text-neutral-800">
                {item.size}
              </span>
            </div>
            <div className="w-px self-stretch bg-neutral-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400">Өнгө:</span>{" "}
              <span className="font-semibold text-neutral-800">
                {item.color}
              </span>
            </div>
          </div>

          {item.features?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Давуу тал
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-lg bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600 border border-neutral-100 font-medium"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-neutral-50/60 p-4 border border-neutral-100">
            <p className="text-xs font-bold text-neutral-800 tracking-wide">
              Хэрхэн авах вэ?
            </p>
            <ol className="mt-2.5 space-y-2 text-xs text-neutral-600">
              {item.redeemSteps?.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-2.5 leading-relaxed"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neutral-200/70 text-[10px] font-bold text-neutral-700 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
