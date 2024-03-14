"use client";
import Layout from "@/components/Layout";

import "./globals.css";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
       <Layout></Layout>
      </body>
    </html>
  );
}
