import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Crônicas do Japão - RPG de Texto',
  description: 'Um RPG de texto ambientado no período Sengoku do Japão',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-japan-black text-japan-cream min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
