import Link from "next/link";
import { notFound } from "next/navigation";
import MerchAbout from "@/components/LandingToken/Merch/MerchAbout";
import { normalizeMerchItem } from "@/lib/merch";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getMerchById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/merch/${id}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return normalizeMerchItem(payload?.data);
};

export default async function MerchDetailPage({ params }) {
  const resolvedParams = await params;
  const item = await getMerchById(resolvedParams?.id);

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
