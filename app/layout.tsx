import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const heading = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-bricolage",
});
const body = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
});

export const metadata = {
  title: "PizzaHub — Pizza Ordering & Delivery",
  description: "Hot & fresh artisan pizza delivered to your door.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${heading.variable} ${body.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased">
        {children}
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
