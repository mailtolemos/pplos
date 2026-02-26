import './globals.css'
import { LangProvider } from '@/components/lang-provider'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata = {
  title: 'People.OS — Modern HR Platform',
  description: 'Multi-tenant HRIS for modern teams',
  icons: { icon: '/logo.png' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <ThemeProvider>
          <LangProvider>{children}</LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
