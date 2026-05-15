import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ME Flow",
  description: "Sales and Inventory Management Flow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
              <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px]" />
              <div className="absolute top-[30%] left-[60%] w-[40%] h-[40%] rounded-full bg-accent/[0.05] blur-[100px]" />
          </div>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
