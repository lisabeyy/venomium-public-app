"use client";
import Layout from "@/pages/Layout";

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
        {children}
      </body>
    </html>
  );
}
