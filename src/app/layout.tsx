"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#2d3748",
              color: "#fff",
            },
            error: {
              style: {
                background: "#9B2C2C",
                color: "white",
              },
            },
            success: {
              style: {
                background: "#2F855A",
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
