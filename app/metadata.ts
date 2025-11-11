import { Metadata } from 'next'

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
