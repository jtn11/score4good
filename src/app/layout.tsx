import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Score4Good – Track Performance. Win Rewards. Support Charity.",
  description: "Track your performance, win rewards, and support a charity of your choice with Score4Good.",
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-on-surface)", fontFamily: "var(--font-sans)" }}>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                borderRadius: "12px",
                border: "1px solid var(--color-outline-variant)",
                boxShadow: "0 20px 40px rgba(46,59,91,0.08)",
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
