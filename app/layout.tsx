import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import { ThemedToaster } from "@/components/site/themed-toaster";
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
  title: {
    default: "PizzaHub — Pizza Ordering & Delivery",
    template: "%s | PizzaHub",
  },
  description: "Hot & fresh artisan pizza delivered to your door.",
};

const themeScript = `try{if(localStorage.getItem('ph-theme')==='light'){document.documentElement.classList.remove('dark')}}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${heading.variable} ${body.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        {children}
        <ThemedToaster />
      </body>
    </html>
  );
}
