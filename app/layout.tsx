import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ConditionalLayout from './ConditionalLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MDjambo Jurbise | Philly Cheese Steak & Smash Burgers près de Pairi Daiza',
  description: 'Le seul vrai Philly Cheese Steak de Belgique ! Spécialistes du smash burger à Jurbise. Frites belges double cuisson graisse Baeten. À 2 min de Pairi Daiza. Ouvert 7j/7.',
  keywords: 'philly cheese steak belgique, smash burger jurbise, frites belges baeten, restaurant pairi daiza, friterie jurbise, meilleur burger mons, philly cheese steak mons, mdjambo',
  openGraph: {
    title: 'MDjambo | Le Seul Vrai Philly Cheese Steak de Belgique',
    description: 'Spécialistes du smash burger à Jurbise. Frites belges graisse Baeten. À 2 min de Pairi Daiza.',
    images: ['/images/banner.webp'],
    type: 'website',
    url: 'https://mdjambo.be',
    locale: 'fr_BE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MDjambo | Philly Cheese Steak & Smash Burgers',
    description: 'Le seul vrai Philly de Belgique. À 2 min de Pairi Daiza.',
    images: ['/images/banner.webp'],
  },
  other: {
    'geo.region': 'BE-WHT',
    'geo.placename': 'Jurbise',
    'geo.position': '50.5235;3.9145',
    'ICBM': '50.5235, 3.9145',
  },
  alternates: {
    canonical: 'https://mdjambo.be',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        {/* Structured Data - Restaurant */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "name": "MDjambo",
              "description": "Le seul vrai Philly Cheese Steak de Belgique. Spécialistes du smash burger à Jurbise. Frites belges double cuisson à la graisse Baeten. À 2 minutes de Pairi Daiza.",
              "image": "https://mdjambo.be/images/banner.webp",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Rue de Ghlin 2",
                "addressLocality": "Jurbise",
                "postalCode": "7050",
                "addressCountry": "BE"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 50.5235,
                "longitude": 3.9145
              },
              "telephone": "+32497753554",
              "priceRange": "€€",
              "servesCuisine": ["American", "Belgian", "Fast Food"],
              "acceptsReservations": true,
              "menu": "https://order.mdjambo.be",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
                  "opens": "18:00",
                  "closes": "21:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Friday", "Saturday"],
                  "opens": "18:00",
                  "closes": "21:30"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Sunday",
                  "opens": "18:00",
                  "closes": "21:00"
                }
              ]
            })
          }}
        />
        
        {/* Structured Data - FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Où se trouve MDjambo ?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "MDjambo est située Rue de Ghlin 2, 7050 Jurbise, à seulement 2 minutes en voiture de Pairi Daiza. Parking gratuit disponible."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Qu'est-ce qu'un Philly Cheese Steak ?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Le Philly Cheese Steak est un sandwich emblématique de Philadelphie composé de fines tranches de steak grillées, d'oignons caramélisés et de fromage fondu dans un pain moelleux. MDjambo est le seul endroit en Belgique où vous pouvez déguster un authentique Philly Cheese Steak préparé selon la tradition américaine."
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}