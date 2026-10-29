import type { Metadata } from "next";

import { beVietnamPro } from "@/theme";

import "./globals.css";

export const metadata: Metadata = {
  title: "Nutrition Coach",
  description: "Daily calorie and macro targets for fat loss.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={beVietnamPro.variable}>
      <body>{children}</body>
    </html>
  );
}
