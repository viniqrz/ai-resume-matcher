import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Resume Matcher | AI-Powered Job Matching",
  description: "Upload your resume and get instant AI-powered matching analysis against any job description. Free, private, and actionable feedback.",
  keywords: ["resume", "job matching", "AI", "career", "job search"],
  openGraph: {
    title: "Resume Parser & Matcher",
    description: "AI-powered resume matching with actionable feedback",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
