import type React from 'react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: "Assure Sense - Australia's Best AI Scribe for Doctors",
    template: '%s | Assure Sense',
  },
  description:
    'Assure Sense AI Scribe - Leading AI medical scribe that automates clinical documentation to reduce administrative burden and enable healthcare professionals to focus more on patients than paperwork. Start using for Free.',
  keywords: ['AI Scribe', 'Medical Scribe', 'Clinical Documentation', 'Australia', 'Doctors', 'Healthcare AI', 'SOAP Notes', 'Medical Transcription', 'Digital Health'],
  authors: [{ name: 'Assure Sense' }],
  creator: 'Assure Sense',
  publisher: 'Assure Sense',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Assure Sense - Australia's Best AI Scribe for Doctors",
    description: 'Leading AI medical scribe that automates clinical documentation. Reduce administrative burden and focus on patients.',
    url: 'https://assuresense.vercel.app',
    siteName: 'Assure Sense',
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Assure Sense - Australia's Best AI Scribe for Doctors",
    description: 'Leading AI medical scribe that automates clinical documentation.',
    creator: '@astrahealth',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  generator: 'S4nfs:',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
