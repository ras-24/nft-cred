import type { Metadata } from "next";
import { GeistSans, GeistMono } from 'geist/font';
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { WalletProvider } from "./contexts/WalletContext";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: "NFTCred",
  description: "NFTCred - Turn your NFTs into borrowing power",
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Force light mode by default and prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ 
          __html: `
            try {
              // Get theme from localStorage - default to light if not found
              const theme = localStorage.getItem('theme');
              // Apply appropriate class to <html> element
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
              } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
              }
              
              // Log initial theme for debugging
              console.log('Initial theme applied:', theme || 'light');
            } catch (e) {
              console.error('Error in theme script:', e);
              // Fallback to light mode
              document.documentElement.classList.remove('dark');
            }
          `
        }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
