import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Applies the persisted color theme / font size to <html> before first paint,
// the same no-flash trick next-themes uses for the light/dark class.
const NO_FLASH_APPEARANCE_SCRIPT = `
(function () {
  try {
    var colorTheme = localStorage.getItem("ui_color_theme");
    var fontSize = localStorage.getItem("ui_font_size");
    if (colorTheme) document.documentElement.setAttribute("data-color-theme", colorTheme);
    if (fontSize) document.documentElement.setAttribute("data-font-size", fontSize);
  } catch (e) {}
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MFAH ERP",
  description: "MFAH Globalog transportation ERP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_APPEARANCE_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
