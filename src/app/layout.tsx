import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "S3D | Manufactura de Precisión",
  description: "Servicio profesional de impresión 3D y prototipado industrial",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f1f5f9] text-slate-900 font-sans selection:bg-[#ff4f00] selection:text-white relative">
        <Providers>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
            {children}
          </main>
          <Footer />
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('mousemove', (e) => {
                document.documentElement.style.setProperty('--mouse-x', e.pageX + 'px');
                document.documentElement.style.setProperty('--mouse-y', e.pageY + 'px');
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
