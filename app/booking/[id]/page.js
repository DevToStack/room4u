import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import ReviewSection from "@/components/Review";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import Script from "next/script";
import Head from "next/head";
// ⚡ Dynamic imports with proper fallbacks
const GallerySection = dynamic(() => import("@/components/galery1"), {
  loading: () => (
    <div className="h-[300px] w-full bg-neutral-800 animate-pulse rounded-lg" />
  ),
});

const HeaderSection = dynamic(() => import("./components/HeaderSection"), {
  loading: () => (
    <div className="h-[200px] w-full bg-neutral-800 animate-pulse rounded-lg" />
  ),
});

const FeaturesSection = dynamic(() => import("./components/FeaturesSection"), {
  loading: () => (
    <div className="h-[200px] w-full bg-neutral-800 animate-pulse rounded-lg" />
  ),
});

const HouseRulesSection = dynamic(() => import("./components/HouseRulesSection"), {
  loading: () => (
    <div className="h-[150px] w-full bg-neutral-800 animate-pulse rounded-lg" />
  ),
});

const ExtraInfoSection = dynamic(() => import("./components/ExtraInfoSection"), {
  loading: () => (
    <div className="h-[150px] w-full bg-neutral-800 animate-pulse rounded-lg" />
  ),
});

// ⛳ BookingForm — disable SSR (heavy JS logic)
const BookingForm = dynamic(() => import("./components/BookingForm"), {
  loading: () => (
    <div className="h-[500px] w-full bg-neutral-800 animate-pulse rounded-lg" />
  ),
});

// ✅ Generate locked dates from booked date ranges
function getLockedDates(bookings) {
  const locked = [];
  if (!bookings || !Array.isArray(bookings)) return locked;

  bookings.forEach((b) => {
    const start = new Date(b.start_date);
    const end = new Date(b.end_date);
    let current = new Date(start);

    while (current <= end) {
      const year = current.getUTCFullYear();
      const month = current.getUTCMonth();
      const day = current.getUTCDate();
      locked.push(new Date(Date.UTC(year, month, day)));
      current.setUTCDate(current.getUTCDate() + 1);
    }
  });
  return locked;
}

// // ✅ Fetch booked dates from backend
// async function getBookedDates(apartmentId) {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/booked-dates`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ apartment_id: apartmentId }),
//       next: { revalidate: 60 },
//     });

//     if (!res.ok) throw new Error("Failed to fetch booked dates");
//     return await res.json();
//   } catch (error) {
//     console.error("Error fetching booked dates:", error);
//     return { bookings: [] };
//   }
// }

// ✅ Fetch apartment details from API
async function getApartmentDetails(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/apartment/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching apartment:", error);
    return null;
  }
}

// 🏡 Main Booking Page
export default async function BookingPage({ params }) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) return notFound();

  // ⚡ Fetch in parallel for faster SSR
  const [apartment] = await Promise.all([
    getApartmentDetails(numericId),
  ]);

  if (!apartment || !apartment.id) return notFound();

  // Disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const disabledRanges = [{ from: new Date("1970-01-01"), to: today }];

  const DAILY_RATE = apartment?.price;
  const cleaningFee = 500;

  return (
    <div className="min-h-screen min-w-screen text-white bg-neutral-950">
      {/* Preload largest image to improve LCP */}
      <Head>
        {apartment?.gallery?.[0] && (
          <link
            rel="preload"
            as="image"
            href={apartment.gallery[0]}
          />
        )}
      </Head>

      <Header authButtons={true} />

      <main className="w-full min-w-screen mx-auto">
        <HeaderSection plan={apartment} />

        {/* ✅ Gallery Section */}
        <section className="w-full py-8 px-3 sm:px-6 lg:px-12 bg-neutral-900">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Gallery</h2>
            <GallerySection images={apartment.gallery} />
          </div>
        </section>

        {/* ✅ Features + Booking Form Section */}
        <section className="w-full py-10 px-3 sm:px-6 lg:px-12 bg-neutral-900">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 md:col-span-1 space-y-8">
              <FeaturesSection apartment={apartment} />
              <HouseRulesSection rules={apartment.houseRules} />
              <ExtraInfoSection
                whyBookWithUs={apartment?.whyBookWithUs}
                policy={apartment?.policy}
              />
            </div>

            <div className="lg:col-span-2">
              <BookingForm
                apartmentId={id}
                disabledRanges={disabledRanges}
                dailyRate={DAILY_RATE}
                cleaningFee={cleaningFee}
              />
            </div>
          </div>
        </section>

        {/* ✅ Reviews */}
        <section className="w-full">
          <ReviewSection id={apartment.id} />
        </section>

        <Footer />
      </main>
      
    </div>
  );
}
