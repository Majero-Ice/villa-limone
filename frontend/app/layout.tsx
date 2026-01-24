import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ChatWidget } from "@/widgets/chat-widget";
import { ToastContainer } from "@/shared/ui";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Villa Limone | Boutique Hotel on the Ligurian Coast",
  description: "Experience authentic Italian hospitality at Villa Limone, a boutique hotel on the stunning Ligurian coast. Explore our elegant rooms, amenities, and discover the beauty of Cinque Terre, Portofino, and the Italian Riviera.",
  keywords: ["boutique hotel", "Ligurian coast", "Italian hotel", "Cinque Terre", "Portofino", "Liguria", "hotel booking", "Italian Riviera"],
  authors: [{ name: "Villa Limone" }],
  openGraph: {
    title: "Villa Limone | Boutique Hotel on the Ligurian Coast",
    description: "Experience authentic Italian hospitality at Villa Limone, a boutique hotel on the stunning Ligurian coast.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Villa Limone | Boutique Hotel on the Ligurian Coast",
    description: "Experience authentic Italian hospitality at Villa Limone, a boutique hotel on the stunning Ligurian coast.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        {children}
        <ChatWidget />
        <ToastContainer />
      </body>
    </html>
  );
}
