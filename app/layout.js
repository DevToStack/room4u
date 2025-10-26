
import "./globals.css";
import PageWrapper from "@/components/pageWrapper";
import LazyToaster from "@/components/LazyToaster";

export const metadata = {
  title: "Rooms4u",
  description: "Book your apartment easily and quickly",
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: "Book Premium Furnished Apartments | YourBrand",
    description: "Modern, affordable apartments with all essential amenities. Book now for business or leisure stays.",
    url: "https://yourdomain.com",
    type: "website",
    images: [
      { url: "https://yourdomain.com/preview.jpg", width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Premium Furnished Apartments | YourBrand",
    description: "Modern apartments with kitchen, Wi-Fi, parking, and AC. Reserve your perfect stay now!",
    images: ["https://yourdomain.com/preview.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased overflow-x-hidden`}
      >
        {children}
        {/* Lazy loaded Toaster for better performance */}
        <LazyToaster />
      </body>
    </html>
  );
}
