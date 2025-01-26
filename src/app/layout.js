import localFont from "next/font/local";
import {
    ClerkProvider,
} from '@clerk/nextjs'
import "./globals.css";

export default function RootLayout({ children }) {
  return (
      <ClerkProvider>
        <html lang="en">
          <body>
            {children}
          </body>
        </html>
      </ClerkProvider>
  );
}
