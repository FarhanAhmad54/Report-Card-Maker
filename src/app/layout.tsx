import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Report Card Maker — Teacher Dashboard",
  description: "Generate and print student report cards quickly. Built for teachers.",
  verification: {
    google: "fUdkV2EwNG5XbCZ60L2Ocn30EBM9RikkILL5YT295AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
