import './globals.css'
import { LangProvider } from '@/components/lang-provider'

export const metadata = {
  title: 'pplos.io:// — Modern HR Platform',
  description: 'Multi-tenant HRIS for modern teams',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  )
}
