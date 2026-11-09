import type { Metadata, Viewport } from "next";
import { Nunito, Vazirmatn } from "next/font/google";
import { AccountProvider } from "@/lib/account";
import { ProgressProvider } from "@/lib/progress";
import "./globals.css";

const latin = Nunito({
  variable: "--font-latin",
  subsets: ["latin"],
  display: "swap",
});

const fa = Vazirmatn({
  variable: "--font-fa",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bia — learn conversational Farsi",
  description: "Bite-sized lessons for speaking everyday Persian.",
  applicationName: "Bia",
  appleWebApp: {
    capable: true,
    title: "Bia",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8f0fa" },
    { media: "(prefers-color-scheme: dark)", color: "#121c30" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${latin.variable} ${fa.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ProgressProvider>
          <AccountProvider>{children}</AccountProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
