import type { Metadata } from "next"
import AuthProvider from "@/components/AuthProvider"
import { Fraunces, DM_Sans } from "next/font/google"
import "./globals.css"

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-display",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: "CoOwn — Group Property Co-Ownership",
  description:
    "Pool funds with friends, colleagues, or strangers to buy land and property together, with full protection and financial transparency.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      className={`${fraunces.variable} ${dmSans.variable}`}
      suppressHydrationWarning  // Add this
    >
      <body suppressHydrationWarning>  {/* Add this */}
        <AuthProvider>{children}</AuthProvider>
<<<<<<< HEAD:coown/app/layout.tsx
=======
        <script src="https://newwebpay.qa.interswitchng.com/inline-checkout.js"></script>
>>>>>>> 64b08669a32b257404a70e9093f8324291ef41bd:coown/src/app/layout.tsx
      </body>
    </html>
  )
}