import type { Metadata, Viewport } from "next";
import { Outfit, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-ethiopic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mama Health — Gentle care for every stage of motherhood",
  description:
    "Mama Health is a gentle maternal health companion guiding you through pregnancy, birth and early motherhood with care that grows with you.",
  applicationName: "Mama Health",
  icons: {
    icon: "/images/mother-and-child-gold.svg",
    apple: "/images/mother-and-child-gold.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3ecdf",
};

/**
 * Restores the saved theme and language before the first paint, so a dark-mode
 * visitor never sees a flash of the light canvas. Runs inline in `<head>`.
 */
const bootScript = `(function(){try{
var d=document.documentElement;
var t=localStorage.getItem("mama-health-theme-v1")||localStorage.getItem("aurelia-theme-v1");
if(t==="dark"){d.classList.add("dark");d.dataset.theme="dark";
var m=document.querySelector('meta[name="theme-color"]');
if(m)m.setAttribute("content","#15120e");}
else{d.dataset.theme="light";}
var l=localStorage.getItem("mama-health-language-v1")||localStorage.getItem("aurelia-language-v1");
if(l==="am"||l==="en"){d.lang=l;}
}catch(e){}})();`;

import { ToastContainer } from "../components/Toast";
import { QueryProvider } from "../providers/QueryProvider";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${notoSansEthiopic.variable}`}
    >
      <body>
        <Script
          id="mama-theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: bootScript }}
        />
        <QueryProvider>
          <ToastContainer />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
