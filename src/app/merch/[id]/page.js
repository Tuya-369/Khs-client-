import Link from "next/link";
import { notFound } from "next/navigation";
import MerchAbout from "@/Component/LandingToken/Merch/MerchAbout";
import { getMerchById } from "@/Component/LandingToken/Merch/merchItems";

export default async function MerchDetailPage({ params }) {
  const resolvedParams = await params;
  const item = getMerchById(resolvedParams?.id);

  if (!item) {
    notFound();
  }

  return (
    <main className="w-full px-4 py-10 sm:px-8 md:px-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-neutral-500 transition-colors hover:text-amber-600"
        >
          &larr; Буцах
        </Link>
      </div>
      <MerchAbout item={item} />
    </main>
  );
}
