'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ReservationModal from '@/components/ReservationModal'

export default function Home() {
  const [showReservation, setShowReservation] = useState(false)

  return (
    <>
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/images/banner.webp"
            alt="MDjambo - Philly Cheese Steak et Smash Burgers à Jurbise près de Pairi Daiza"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
            MDjambo - Friterie Jurbise
          </h1>
          <div className="space-y-2 text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 font-semibold drop-shadow-lg">
            <p>🥪 <strong>Le Seul Vrai Philly Cheese Steak de Belgique</strong></p>
            <p>🍔 <strong>Meilleurs Smash Burgers de Jurbise</strong></p>
            <p>🍟 Frites Belges Graisse Baeten Double Cuisson</p>
            <p className="text-yellow-300 font-bold">📍 À 2 minutes de Pairi Daiza</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowReservation(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition shadow-lg"
              aria-label="Réserver une table chez MDjambo"
            >
              Réserver une table
            </button>
            <a
              href="https://order.mdjambo.be/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 backdrop-blur-sm border-2 border-white hover:bg-white hover:text-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition shadow-lg"
              aria-label="Commander en ligne sur MDjambo"
            >
              Commander en ligne
            </a>
          </div>
        </div>
      </section>

      <article className="sr-only" itemScope itemType="https://schema.org/Restaurant">
        <h2>À propos de MDjambo</h2>
        <p itemProp="description">
          MDjambo est une friterie moderne située à Jurbise, à 2 minutes de Pairi Daiza.
          Nous sommes le seul restaurant en Belgique à servir un authentique Philly Cheese Steak
          préparé selon la tradition de Philadelphie. Nous sommes également spécialistes du
          smash burger, une technique américaine où la viande est écrasée sur la plancha pour
          créer une croûte caramélisée. Nos frites sont cuites deux fois dans la graisse de
          bœuf Baeten, la référence absolue en Belgique. Ouvert 7 jours sur 7.
        </p>
        <p itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
          Adresse: <span itemProp="streetAddress">Rue de Ghlin 2</span>,
          <span itemProp="postalCode">7050</span> <span itemProp="addressLocality">Jurbise</span>,
          <span itemProp="addressCountry">Belgique</span>
        </p>
        <p>Téléphone: <span itemProp="telephone">0497 75 35 54</span></p>
        <p>Prix: <span itemProp="priceRange">€€</span> (10-20€ par personne)</p>
      </article>

      <section className="py-12 sm:py-16 md:py-20 bg-gray-50" aria-labelledby="features-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 id="features-title" className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-16 text-gray-900">
            Pourquoi choisir MDjambo ?
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: "🥪",
                title: "Philly Cheese Steak Authentique",
                desc: "Le seul vrai Philly Cheese Steak de Belgique ! Préparé selon la tradition de Philadelphie avec du steak finement tranché, des oignons caramélisés et du fromage fondu."
              },
              {
                icon: "🍔",
                title: "Smash Burgers Artisanaux",
                desc: "Spécialistes du smash burger à Jurbise ! Viande smashée à la perfection sur plancha chaude pour une croûte caramélisée et un intérieur juteux."
              },
              {
                icon: "🍟",
                title: "Frites Graisse Baeten",
                desc: "Frites belges double cuisson à la graisse de bœuf Baeten 100% belge. Croustillantes à l'extérieur, moelleuses à l'intérieur."
              }
            ].map((item, i) => (
              <article key={i} className="bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition text-center">
                <div className="text-4xl sm:text-5xl mb-4" aria-hidden="true">{item.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-yellow-500 to-orange-500 text-white" aria-labelledby="frites-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 id="frites-title" className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
                🍟 Nos Frites Belges Légendaires
              </h2>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                Double Cuisson Graisse Baeten
              </h3>
              <p className="text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">
                Nous utilisons exclusivement la <strong>graisse de bœuf Baeten</strong>,
                la référence absolue de qualité en Belgique depuis 1946.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                Résultat : des frites <strong>croustillantes à l'extérieur, moelleuses à l'intérieur</strong>,
                comme dans les meilleures friteries belges traditionnelles.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-white/20">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Notre Processus en 4 Étapes</h3>
              <ol className="space-y-4">
                {[
                  { num: "1", title: "Sélection", desc: "Pommes de terre Bintje fraîches belges" },
                  { num: "2", title: "1ère Cuisson", desc: "Blanchiment à 130°C - Précuisson" },
                  { num: "3", title: "Repos", desc: "Refroidissement essentiel pour la texture" },
                  { num: "4", title: "2ème Cuisson", desc: "Finition à 180°C - Croûte dorée" }
                ].map(step => (
                  <li key={step.num} className="flex gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white text-orange-600 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base">{step.title}</h4>
                      <p className="text-xs sm:text-sm opacity-90">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white" id="menu" aria-labelledby="menu-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 id="menu-title" className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-16 text-gray-900">
            Nos Spécialités MDjambo
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {[
              {
                title: "Philly Cheese Steak",
                desc: "Le seul vrai Philly de Belgique - Steak finement tranché, oignons caramélisés, fromage fondu",
                price: "14.00€",
                img: "philly-cheese-steak-1.webp",
              },
              {
                title: "Classic Smash Burger",
                desc: "Double steak smashé 180g, cheddar, pickles, oignons - Technique américaine authentique",
                price: "12.00€",
                img: "burger-menu-1.webp",
              },
              {
                title: "Frites Baeten",
                desc: "Grand paquet double cuisson graisse bœuf Baeten - Tradition belge",
                price: "3.50€",
                img: "frites-belges-1.webp",
              }
            ].map((item, i) => (
              <article key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition" itemScope itemType="https://schema.org/MenuItem">
                <div className="relative h-48 sm:h-52">
                  <Image
                    src={`/images/${item.img}`}
                    alt={`${item.title} - ${item.desc}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900" itemProp="name">{item.title}</h3>
                  <p className="text-gray-700 mb-4 text-sm sm:text-base" itemProp="description">{item.desc}</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                    <span itemProp="price">{item.price}</span>
                  </p>
                  <meta itemProp="priceCurrency" content="EUR" />
                </div>
              </article>
            ))}
          </div>
          <div className="text-center">
            <a
              href="https://order.mdjambo.be/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition shadow-lg"
              aria-label="Voir le menu complet MDjambo"
            >
              Voir le menu complet et commander
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-gray-50" aria-labelledby="faq-title">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 id="faq-title" className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-16 text-gray-900">
            Questions Fréquentes
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Où se trouve MDjambo ?",
                a: "MDjambo est située Rue de Ghlin 2, 7050 Jurbise, à seulement 2 minutes en voiture de Pairi Daiza. Parking gratuit disponible."
              },
              {
                q: "Qu'est-ce qu'un Philly Cheese Steak ?",
                a: "Le Philly Cheese Steak est un sandwich emblématique de Philadelphie composé de fines tranches de steak grillées, d'oignons caramélisés et de fromage fondu dans un pain moelleux. MDjambo est le seul endroit en Belgique où vous pouvez déguster un authentique Philly Cheese Steak."
              },
              {
                q: "Pourquoi vos frites sont-elles spéciales ?",
                a: "Nos frites sont cuites deux fois dans la graisse de bœuf Baeten, la référence absolue en Belgique. Cette méthode traditionnelle garantit des frites croustillantes à l'extérieur et moelleuses à l'intérieur. Nous utilisons uniquement des pommes de terre Bintje fraîches."
              },
              {
                q: "Quels sont vos horaires ?",
                a: "Nous sommes ouverts 7 jours sur 7. Lundi-jeudi : 18h-21h. Vendredi-samedi : 18h-21h30. Dimanche : 18h-21h. Réservation conseillée au 0497 75 35 54."
              }
            ].map((item, i) => (
              <details key={i} className="bg-white p-6 rounded-xl shadow-sm" itemScope itemType="https://schema.org/Question">
                <summary className="font-bold text-lg text-gray-900 cursor-pointer hover:text-red-600 transition" itemProp="name">
                  {item.q}
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed" itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                  <p itemProp="text">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white" aria-labelledby="about-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 id="about-title" className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">
              Le Meilleur Restaurant près de Pairi Daiza
            </h2>
            <p className="text-base sm:text-lg text-gray-800 mb-4 leading-relaxed">
              <strong>MDjambo</strong> est une friterie moderne située à <strong>Jurbise</strong>,
              à seulement <strong>2 minutes de Pairi Daiza</strong>. Nous combinons la tradition
              américaine du Philly Cheese Steak et du smash burger avec le savoir-faire belge
              des frites double cuisson.
            </p>
            <p className="text-base sm:text-lg text-gray-800 leading-relaxed">
              Ouvert <strong>7 jours sur 7</strong>, nous sommes l'adresse incontournable pour
              les visiteurs de Pairi Daiza et les habitants de Jurbise, Mons et la région.
              Commande en ligne, livraison et réservation disponibles.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-gray-50" id="location" aria-labelledby="location-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 id="location-title" className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-16 text-gray-900">
            Nous Trouver - MDjambo Jurbise
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: "📍",
                title: "Adresse",
                content: "Rue de Ghlin 2\n7050 Jurbise\nBelgique",
                highlight: "À 2 min de Pairi Daiza",
              },
              {
                icon: "🕐",
                title: "Horaires",
                content: "Lun-Jeu: 18h-21h\nVen-Sam: 18h-21h30\nDim: 18h-21h",
                highlight: "Ouvert 7j/7",
              },
              {
                icon: "📱",
                title: "Contact",
                content: "0497 75 35 54\nRéservation & Info",
                highlight: "Réponse rapide",
              },
              {
                icon: "🚗",
                title: "Parking",
                content: "Parking gratuit\nAccès facile",
                highlight: "Proche transports",
              }
            ].map((item, i) => (
              <article key={i} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center">
                <div className="text-3xl mb-3" aria-hidden="true">{item.icon}</div>
                <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-800 text-sm whitespace-pre-line mb-3 font-medium">{item.content}</p>
                <p className="text-red-600 font-bold text-sm">{item.highlight}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ReservationModal isOpen={showReservation} onClose={() => setShowReservation(false)} />
    </>
  )
}