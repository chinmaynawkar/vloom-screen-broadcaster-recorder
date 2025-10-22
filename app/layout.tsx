import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";
import { satoshi } from "../fonts/font";
import { LoadingProvider } from "@/lib/contexts/LoadingContext";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import ClientLayout from "@/components/ClientLayout";

const geistKarla = Karla({
  variable: "--font-geist-karla",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vloom",
  description: "A Screen Recording Sharing App",
  icons: {
    icon: "/assets/icons/logo.svg",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistKarla.variable} ${satoshi.variable} font-karla antialiased`}
      >
        <LoadingProvider>
          <ClientLayout>{children}</ClientLayout>
          <GlobalLoadingOverlay />
        </LoadingProvider>
      </body>
    </html>
  );
}
