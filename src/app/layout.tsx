import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContractorOS Admin",
  description: "Admin dashboard for contractor time tracking and approvals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
