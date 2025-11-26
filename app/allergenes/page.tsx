'use client'

import { useState, useEffect } from 'react'

// Types
interface Product {
    name: string
    allergens: Allergen[]
    traces?: Allergen[]
    ingredients?: string
    supplier?: string
    category?: string
}

interface Allergen {
    name: string
    emoji: string
}

// Données allergènes
const ALLERGENS = {
    gluten: { name: 'Gluten', emoji: '🌾' },
    crustaces: { name: 'Crustacés', emoji: '🦐' },
    oeufs: { name: 'Œufs', emoji: '🥚' },
    poissons: { name: 'Poissons', emoji: '🐟' },
    arachides: { name: 'Arachides', emoji: '🥜' },
    soja: { name: 'Soja', emoji: '🫘' },
    lait: { name: 'Lait', emoji: '🥛' },
    fruitsACoque: { name: 'Fruits à coque', emoji: '🌰' },
    celeri: { name: 'Céleri', emoji: '🥬' },
    moutarde: { name: 'Moutarde', emoji: '🟡' },
    sesame: { name: 'Sésame', emoji: '🔸' },
    sulfites: { name: 'Sulfites', emoji: '🧪' },
    lupin: { name: 'Lupin', emoji: '🌸' },
    mollusques: { name: 'Mollusques', emoji: '🦪' },
}

// Données statiques complètes avec tous les allergènes
const DEFAULT_MENU: Record<string, Product[]> = {
    'Philly Cheese Steaks': [
        {
            name: 'Pain Philly Cheese Steak',
            allergens: [ALLERGENS.gluten, ALLERGENS.lait, ALLERGENS.soja],
            traces: [ALLERGENS.oeufs, ALLERGENS.sesame],
            ingredients: 'Pain spécial, steak de bœuf émincé, fromage cheddar fondu, oignons caramélisés.'
        },
        {
            name: 'Mitraillette Philly',
            allergens: [ALLERGENS.gluten, ALLERGENS.lait, ALLERGENS.soja, ALLERGENS.oeufs, ALLERGENS.moutarde],
            traces: [ALLERGENS.sesame],
            ingredients: 'Baguette, steak de bœuf émincé, fromage cheddar, oignons, frites, sauce au choix.'
        },
    ],
    'Smash Burgers': [
        {
            name: 'MDjambo Burger',
            allergens: [ALLERGENS.gluten, ALLERGENS.lait, ALLERGENS.oeufs, ALLERGENS.moutarde],
            traces: [ALLERGENS.soja, ALLERGENS.sesame],
            ingredients: 'Bun potato, double steak smashé bœuf, cheddar, sauce MDjambo, oignons crispy, pickles.'
        },
        {
            name: 'SmokySmash',
            allergens: [ALLERGENS.gluten, ALLERGENS.lait, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.sulfites],
            traces: [ALLERGENS.soja],
            ingredients: 'Bun potato, double steak smashé bœuf, cheddar, bacon fumé, sauce BBQ fumée, oignons rôtis.'
        },
        {
            name: 'Smash US Classic',
            allergens: [ALLERGENS.gluten, ALLERGENS.lait, ALLERGENS.oeufs, ALLERGENS.moutarde],
            traces: [ALLERGENS.soja],
            ingredients: 'Bun potato, double steak smashé bœuf, cheddar américain, ketchup, pickles, oignons frais.'
        },
        {
            name: 'Philly Smash',
            allergens: [ALLERGENS.gluten, ALLERGENS.lait, ALLERGENS.soja, ALLERGENS.oeufs],
            traces: [ALLERGENS.sesame],
            ingredients: 'Bun potato, double steak smashé, fromage fondu type Philly, oignons caramélisés, poivrons.'
        },
        {
            name: 'SmashTruffe',
            allergens: [ALLERGENS.gluten, ALLERGENS.lait, ALLERGENS.oeufs, ALLERGENS.moutarde],
            traces: [ALLERGENS.soja],
            ingredients: 'Bun potato, double steak smashé bœuf, cheddar, sauce à la truffe, roquette.'
        },
        {
            name: 'Burger Simple',
            allergens: [ALLERGENS.gluten, ALLERGENS.lait],
            traces: [ALLERGENS.soja, ALLERGENS.sesame],
            ingredients: 'Bun sésame, steak smashé bœuf, cheddar, salade, tomate.'
        },
    ],
    'Mitraillettes': [
        {
            name: 'Mitraillette Hamburger',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja],
            traces: [ALLERGENS.lait],
            ingredients: 'Baguette, hamburger Snaky, frites, sauce au choix.'
        },
        {
            name: 'Mitraillette Boulettes',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja],
            traces: [ALLERGENS.lait],
            ingredients: 'Baguette, boulettes Super Snaky, frites, sauce au choix.'
        },
        {
            name: 'Mitraillette Fricandelle',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja, ALLERGENS.celeri],
            traces: [ALLERGENS.lait],
            ingredients: 'Baguette, fricandelle Snaky, frites, sauce au choix.'
        },
        {
            name: 'Mitraillette Poulet',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja],
            traces: [ALLERGENS.lait],
            ingredients: 'Baguette, burger poulet Krumpy, frites, sauce au choix.'
        },
    ],
    'Frites': [
        {
            name: 'Frites Maison',
            allergens: [],
            ingredients: 'Pommes de terre Bintje, graisse de bœuf Baeten 100% belge. Double cuisson traditionnelle.'
        },
    ],
    'Snacks & Fritures': [
        {
            name: 'Hamburger Snaky',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.lait],
            supplier: 'De Boeck Foods'
        },
        {
            name: 'Boulette Super Snaky',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.lait, ALLERGENS.oeufs],
            supplier: 'De Boeck Foods'
        },
        {
            name: 'Fricandelle Snaky',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja, ALLERGENS.celeri],
            traces: [ALLERGENS.lait],
            supplier: 'De Boeck Foods'
        },
        {
            name: 'Cervelas Maxi Snaky',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja, ALLERGENS.moutarde],
            traces: [ALLERGENS.lait],
            supplier: 'De Boeck Foods'
        },
        {
            name: 'Mexicain Snaky',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja, ALLERGENS.celeri],
            traces: [ALLERGENS.lait],
            supplier: 'De Boeck Foods'
        },
        {
            name: 'Nuggets Poulet',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.lait, ALLERGENS.oeufs],
            supplier: 'De Boeck Foods (Nuggizz Mad Roosters)'
        },
        {
            name: 'Croquette Fromage',
            allergens: [ALLERGENS.gluten, ALLERGENS.lait, ALLERGENS.oeufs],
            traces: [ALLERGENS.soja],
            supplier: 'De Boeck Foods (Cheese Crack BK)'
        },
        {
            name: 'Groovy Tenders',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.lait, ALLERGENS.oeufs],
            supplier: 'De Boeck Foods (Mahida)'
        },
    ],
    'Sauces': [
        {
            name: 'Mayonnaise',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
        {
            name: 'Ketchup',
            allergens: [],
            supplier: "Lowy's (Sauce Tomato Ketchup LW)"
        },
        {
            name: 'Sauce Andalouse',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
        {
            name: 'Sauce Samurai',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
        {
            name: 'Sauce Algérienne',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
            supplier: 'Manna'
        },
        {
            name: 'Sauce Tartare',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
            traces: [ALLERGENS.poissons],
        },
        {
            name: 'Sauce BBQ',
            allergens: [ALLERGENS.sulfites],
            traces: [ALLERGENS.moutarde],
        },
        {
            name: 'Sauce Américaine',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
        {
            name: 'Sauce Ketjep / Curry Ketchup',
            allergens: [ALLERGENS.celeri],
            supplier: 'De Boeck Foods (Sauce 16/20 Ketjep)'
        },
    ],
    'Boissons': [
        {
            name: 'Toutes nos boissons',
            allergens: [],
            ingredients: 'Coca-Cola, Fanta, Sprite, Ice Tea, Eau, Cuvée des Trolls, etc.'
        },
    ],
}

// Composant carte produit
function ProductCard({ product }: { product: Product }) {
    const [isOpen, setIsOpen] = useState(false)
    const hasNoAllergens = product.allergens.length === 0 && (!product.traces || product.traces.length === 0)

    return (
        <div
            className={`bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isOpen ? 'ring-2 ring-red-500' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="bg-black text-white px-5 py-4 flex justify-between items-center">
                <span className="font-bebas text-xl tracking-wide">{product.name}</span>
                <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </div>

            {isOpen && (
                <div className="p-5 animate-fadeIn">
                    {hasNoAllergens ? (
                        <p className="text-green-600 font-semibold flex items-center gap-2">
                            ✅ Sans allergènes majeurs
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {product.allergens.map((allergen, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                                    <span>{allergen.emoji}</span> {allergen.name}
                                </span>
                            ))}
                            {product.traces?.map((trace, idx) => (
                                <span key={`trace-${idx}`} className="inline-flex items-center gap-1 bg-yellow-400 text-black px-3 py-1.5 rounded-full text-sm font-medium">
                                    <span>{trace.emoji}</span> {trace.name} (traces)
                                </span>
                            ))}
                        </div>
                    )}

                    {(product.ingredients || product.supplier) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                            {product.ingredients && (
                                <p><strong className="text-black">Composition :</strong> {product.ingredients}</p>
                            )}
                            {product.supplier && (
                                <p className="mt-1"><strong className="text-black">Fournisseur :</strong> {product.supplier}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function AllergenesPage() {
    const [menu] = useState<Record<string, Product[]>>(DEFAULT_MENU)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Désactiver l'appel API pour garder uniquement les données statiques vérifiées
        // L'API sera réactivée quand les allergènes seront gérés en DB
        setLoading(false)

        /* Code API désactivé temporairement
        const fetchAllergens = async () => {
            try {
                const response = await fetch('/api/allergens')
                if (!response.ok) throw new Error('Failed to fetch')

                const result = await response.json()
                if (result.success && result.data) {
                    const mergedMenu = { ...DEFAULT_MENU }
                    Object.entries(result.data).forEach(([category, products]) => {
                        if (!mergedMenu[category]) {
                            mergedMenu[category] = products as Product[]
                        }
                    })
                    setMenu(mergedMenu)
                }
            } catch (error) {
                console.error('Error loading allergens:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchAllergens()
        */
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gray-100">
            {/* Hero */}
            <section className="bg-gradient-to-br from-red-600 to-red-700 py-12 px-4 text-center text-white">
                <h1 className="font-bebas text-4xl md:text-5xl tracking-widest mb-2">🍔 INFORMATIONS ALLERGÈNES</h1>
                <p className="text-lg opacity-90 max-w-xl mx-auto">
                    Cliquez sur un produit pour voir les allergènes qu&apos;il contient. Conforme au Règlement UE 1169/2011.
                </p>
            </section>

            {/* Légende */}
            <section className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h2 className="font-bebas text-2xl mb-4">🏷️ Les 14 Allergènes Réglementaires</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        {Object.values(ALLERGENS).map((allergen, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm">
                                <span className="text-xl">{allergen.emoji}</span>
                                <span>{allergen.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Menu */}
            <section className="max-w-6xl mx-auto px-4 pb-12">
                {Object.entries(menu).map(([category, products]) => (
                    <div key={category} className="mb-8">
                        <h2 className="font-bebas text-3xl mb-4 pl-4 border-l-4 border-red-600 tracking-wide">
                            {category.toUpperCase()}
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.map((product, idx) => (
                                <ProductCard key={idx} product={product} />
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* Avertissement */}
            <section className="max-w-6xl mx-auto px-4 pb-8">
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-2xl p-6">
                    <h3 className="font-bebas text-xl text-yellow-800 mb-3 flex items-center gap-2">
                        ⚠️ AVERTISSEMENT - CONTAMINATION CROISÉE
                    </h3>
                    <p className="text-yellow-800 leading-relaxed">
                        <strong>Tous nos produits sont préparés dans une cuisine où sont manipulés les 14 allergènes réglementaires.</strong>
                        <br /><br />
                        Malgré nos précautions, des traces d&apos;allergènes peuvent être présentes dans tous nos produits suite à la manipulation et à la cuisson partagée (friteuses communes, plancha, ustensiles).
                        <br /><br />
                        <strong>En cas d&apos;allergie sévère, veuillez nous informer avant de commander.</strong> Nous ferons notre maximum pour adapter la préparation, mais nous ne pouvons garantir l&apos;absence totale de traces.
                    </p>
                </div>
            </section>

            {/* Footer info */}
            <section className="bg-black text-white py-8 px-4 text-center">
                <p className="opacity-70 text-sm mb-1">
                    <strong>MDjambo</strong> - Rue de Ghlin 2, 7050 Jurbise
                </p>
                <p className="opacity-70 text-sm mb-1">
                    📞 0497 75 35 54 | <a href="https://order.mdjambo.be" className="text-red-500 hover:underline">Commander en ligne</a>
                </p>
                <p className="opacity-50 text-xs mt-3">
                    Document mis à jour : Novembre 2025 | Conforme au Règlement UE 1169/2011
                </p>
            </section>
        </main>
    )
}
