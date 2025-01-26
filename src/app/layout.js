import localFont from "next/font/local";
import {
    ClerkProvider,
} from '@clerk/nextjs'
import "./globals.css";

export default function RootLayout({ children }) {
  return (
      <ClerkProvider
          appearance={{
              layout: {
                  unsafe_disableDevelopmentModeWarnings: true,
              },
              variables: {
                  colorPrimary: '#2850d9',
                  colorText: '#000000',
                  fontFamily: 'DM Sans, sans-serif',
              }
          }}>
        <html lang="en">
          <body>
            {children}
          </body>
        </html>
      </ClerkProvider>
  );
}
