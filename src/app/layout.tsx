import type { Metadata } from "next";
import "@fontsource/sarabun/400.css";
import "@fontsource/sarabun/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "เว็บไซต์กองบริหารทะเบียนและวัดผล",
  description: "ศูนย์ข้อมูลคณะสงฆ์และการศึกษา",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:p-3"
        >
          ข้ามไปเนื้อหา
        </a>
        {children}
      </body>
    </html>
  );
}
