import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import ReviewSection from "@/components/Review";
import Footer from "@/app/components/Footer";

// ✅ Dynamic imports for performance
const GallerySection = dynamic(() => import("@/components/galery1"));
const HeaderSection = dynamic(() => import("./components/HeaderSection"));
const FeaturesSection = dynamic(() => import("./components/FeaturesSection"));
const HouseRulesSection = dynamic(() => import("./components/HouseRulesSection"));
const ExtraInfoSection = dynamic(() => import("./components/ExtraInfoSection"));
const BookingForm = dynamic(() => import("./components/BookingForm"));

// ✅ Utility: Generate locked dates from booked date ranges
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

// ✅ Fetch booked dates from backend
async function getBookedDates(apartmentId) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/booked-dates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apartment_id: apartmentId }),
      next: { revalidate: 60 }, // cache for 1 minute
    });

    if (!res.ok) throw new Error("Failed to fetch booked dates");
    return await res.json();
  } catch (error) {
    console.error("Error fetching booked dates:", error);
    return { bookings: [] };
  }
}

// ✅ Fetch apartment details from API
async function getApartmentDetails(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/apartment/${id}`, {
      next: { revalidate: 60 }, // ISR caching
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching apartment:", error);
    return null;
  }
}

export default async function BookingPage({ params }) {
  const { id } = await params;

  // 🔹 Fetch apartment data
  const apartment = await getApartmentDetails(id);
  if (!apartment || !apartment.id) return notFound();

  // 🔹 Fetch booked dates
  const bookedData = await getBookedDates(id);
  const lockedDates = getLockedDates(bookedData.bookings || []);

  // 🔹 Disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const disabledRanges = [{ from: new Date("1970-01-01"), to: today }];

  // 🔹 Locked booked ranges
  const lockedRanges = lockedDates.map((d) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return { from: date, to: date };
  });

  // 🔹 Example static rate
  const DAILY_RATE = apartment?.price;
  const cleaningFee = 500;

  return (
    <div className="min-h-screen w-screen text-white">
      <Header navItems={["Overview","Gallery","Features"]} authButtons={true}/>

      <main className="w-full max-w-screen">
        <HeaderSection plan={apartment}/>

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
              <HouseRulesSection rules={apartment.houseRules}/>
              <ExtraInfoSection whyBookWithUs={apartment?.whyBookWithUs} policy={apartment?.policy}/>
            </div>

            <div className="lg:col-span-2">
              <BookingForm
                apartmentId={id}
                disabledRanges={disabledRanges}
                lockedRanges={lockedRanges}
                dailyRate={DAILY_RATE}
                cleaningFee={cleaningFee}
              />
            </div>
          </div>
        </section>
        <section className="w-full">
          <ReviewSection id={apartment.id} />
        </section>
        <Footer />
      </main>
    </div>
  );
}
