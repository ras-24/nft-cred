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
        {/* Add a meta tag to prevent caching of CSS/stylesheets for debugging */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Enhanced theme initialization script */}
        <script dangerouslySetInnerHTML={{ 
          __html: `
            (function() {
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
                  
                  // Force immediate light mode styling
                  document.documentElement.style.colorScheme = 'light';
                  
                  // Create a style element to force light mode
                  const style = document.createElement('style');
                  style.textContent = 'html:not(.dark) button.p-2.rounded-full { background-color: #f1f5f9 !important; color: #4b5563 !important; border-color: #e5e7eb !important; }';
                  document.head.appendChild(style);
                }
                
                console.log('Initial theme applied:', theme || 'light');
              } catch (e) {
                console.error('Error in theme script:', e);
                document.documentElement.classList.remove('dark');
              }
            })();
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
