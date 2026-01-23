import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google"; // Adding Outfit for headers if available, or just standard Geist
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tommy PPF",
  description: "Premium Paint Protection Film Packages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-7xl min-h-screen flex flex-col relative px-4">
            {/* Background Texture or Gradient spot could go here */}
            {children}
        </div>
      </body>
    </html>
  );
}
