import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mama Health — Gentle care for every stage of motherhood",
  description:
    "Mama Health is a gentle maternal health companion guiding you through pregnancy, birth and early motherhood with care that grows with you.",
  applicationName: "Mama Health",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
