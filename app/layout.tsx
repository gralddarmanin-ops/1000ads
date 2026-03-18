import './globals.css'
import PayPalProvider from '@/components/PayPalProvider'

export const metadata = {
  title: '1000ads — Buy & Sell Anything',
  description: 'Free classified ads website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white">
        <PayPalProvider>
          {children}
        </PayPalProvider>
      </body>
    </html>
  )
}