// MENU COMPLET GÉNÉRÉ AUTOMATIQUEMENT DEPUIS restomaxvente.xlsx
// ⚠️ Les allergènes ont été détectés automatiquement - À VÉRIFIER ET COMPLÉTER

const MENU: Record<string, Product[]> = {
    'Bières': [
        {
            name: 'Chimay dorée 33 cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Corona 33 cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Cuvée des trolls 33 cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Duvel 33 cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Jupiler 33 cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Liefmans fruitesse 25 cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Orval 33 cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
    ],
    'Boissons': [
        {
            name: 'Chaudfontaine eau plate 50 cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Chaudfontaine eau pétillante 50 cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Coca-cola 33cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Coca-cola Zero 33cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Fanta orange 33 cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Fuze tea peche  hibiscus 33 cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Oasis Fraise Frambaoise 33cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Sprite citron 33 cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Tropico 33 cl',
            allergens: [], // ⚠️ À COMPLÉTER
        },
    ],
    'Box': [
        {
            name: 'Box enfant',
            allergens: [], // ⚠️ À COMPLÉTER
        },
    ],
    'Frites': [
        {
            name: 'Grande  portion Belge Baeten',
            allergens: [], // ⚠️ À COMPLÉTER
        },
    ],
    'Hamburger': [
        {
            name: 'Chicken Burger',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Hamburger',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Hamburger de dinde',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
    ],
    'Mitrailette': [
        {
            name: 'Mitraiellette brochette Ardenaise',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Mitrailette Hamburger de dinde',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Mitrailette Poulycroc',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Mitraillette  Boulette',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja],
        },
        {
            name: 'Mitraillette  Cheese crack',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.lait, ALLERGENS.soja],
        },
        {
            name: 'Mitraillette  Mexicanos',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja, ALLERGENS.celeri],
        },
        {
            name: 'Mitraillette Brochette',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja],
        },
        {
            name: 'Mitraillette Brochette de bœuf',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja],
        },
        {
            name: 'Mitraillette Brochette de dinde',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja],
        },
        {
            name: 'Mitraillette Cervelas',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja],
        },
        {
            name: 'Mitraillette Chicken Burger',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Mitraillette Fricadelle',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja, ALLERGENS.celeri],
        },
        {
            name: 'Mitraillette Fricadelle XXL',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja, ALLERGENS.celeri],
        },
        {
            name: 'Mitraillette Grizzly',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja],
        },
        {
            name: 'Mitraillette Hamburger',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Mitraillette Philly Cheesesteak',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.lait, ALLERGENS.soja],
        },
        {
            name: 'Mitraillette viandelles',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja],
        },
    ],
    'PAINS': [
        {
            name: 'Pain Philly Cheesesteak',
            allergens: [ALLERGENS.gluten, ALLERGENS.lait],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Boulette',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Brochette',
            allergens: [ALLERGENS.gluten],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Brochette Ardenaise',
            allergens: [ALLERGENS.gluten],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Brochette de bœuf',
            allergens: [ALLERGENS.gluten],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Brochette de dinde',
            allergens: [ALLERGENS.gluten],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Cervelas cuit',
            allergens: [ALLERGENS.gluten, ALLERGENS.moutarde, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Chicken Burger',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Fricadelle',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja, ALLERGENS.celeri],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Fricadelle XXL',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja, ALLERGENS.celeri],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Frites',
            allergens: [ALLERGENS.gluten],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Grizzly',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Hamburger',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Hamburger de dinde',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Mexicanos',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja, ALLERGENS.celeri],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Poulycroc',
            allergens: [ALLERGENS.gluten],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Pain Viandelles',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
    ],
    'Pitta': [
        {
            name: 'Mitraillette pitta',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde, ALLERGENS.soja],
        },
        {
            name: 'Pain pitta',
            allergens: [ALLERGENS.gluten],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Poche pitta',
            allergens: [ALLERGENS.gluten],
        },
    ],
    'Promo': [
        {
            name: 'Promo Halloween Frite Frica Soft',
            allergens: [], // ⚠️ À COMPLÉTER
        },
    ],
    'Sauces': [
        {
            name: '1.Mayonnaise',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
        {
            name: '1.Mayonnaise + 6.Ketchup',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
        {
            name: '10.Barbecue',
            allergens: [ALLERGENS.sulfites],
        },
        {
            name: '11.Algerienne',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
        {
            name: '12.Americaine douce',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
        {
            name: '13. 16-20',
            allergens: [ALLERGENS.celeri],
        },
        {
            name: '15.Cowboy',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: '18.Bicky Triple',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: '2.Andalouse',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
        {
            name: '24.Poivre',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: '3.Pitta',
            allergens: [ALLERGENS.gluten],
        },
        {
            name: '3.Pitta + 2. Andalouse',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
        {
            name: '3.Pitta + 5.Samurai',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
        {
            name: '4.Hamburger',
            allergens: [ALLERGENS.gluten, ALLERGENS.oeufs, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: '5.Samurai',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
        {
            name: '6.Ketchup',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: '7.Brazil',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: '8.Americaine forte',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
        {
            name: '9.Tartare',
            allergens: [ALLERGENS.oeufs, ALLERGENS.moutarde],
        },
    ],
    'Smashburger': [
        {
            name: 'L'Angus',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Le Sburgerz',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Le SmashTruffe',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Mdjambo burger',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.sesame],
        },
        {
            name: 'Philly Smash',
            allergens: [ALLERGENS.lait],
        },
        {
            name: 'Smash US Classic',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'SmokySmash',
            allergens: [ALLERGENS.sulfites],
        },
    ],
    'Supplément': [
        {
            name: 'Bacon',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Carotte',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Cheddar',
            allergens: [ALLERGENS.lait],
        },
        {
            name: 'Cornichon',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'FRITE',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Feta',
            allergens: [ALLERGENS.lait],
        },
        {
            name: 'Oignons rissolé maison',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Oignons sec',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Provolone',
            allergens: [ALLERGENS.lait],
        },
        {
            name: 'Salade',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Salade + tomates + carottes + oignons sec',
            allergens: [], // ⚠️ À COMPLÉTER
        },
        {
            name: 'Tomates',
            allergens: [], // ⚠️ À COMPLÉTER
        },
    ],
    'Viande supplémentaire': [
        {
            name: 'Viande supplémentaire',
            allergens: [], // ⚠️ À COMPLÉTER
        },
    ],
    'Viandes': [
        {
            name: 'Boulette',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Brochette Ardenaise',
            allergens: [], // ⚠️ À COMPLÉTER
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Brochette de boeuf',
            allergens: [], // ⚠️ À COMPLÉTER
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Brochette de dinde',
            allergens: [], // ⚠️ À COMPLÉTER
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Brochette de pilons',
            allergens: [], // ⚠️ À COMPLÉTER
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Brochette de poisson',
            allergens: [], // ⚠️ À COMPLÉTER
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Brochette de porc',
            allergens: [], // ⚠️ À COMPLÉTER
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Cervelas cuit',
            allergens: [ALLERGENS.gluten, ALLERGENS.moutarde, ALLERGENS.soja],
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Cervelas de cheval',
            allergens: [ALLERGENS.gluten, ALLERGENS.moutarde, ALLERGENS.soja],
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Cervelas non cuit',
            allergens: [ALLERGENS.gluten, ALLERGENS.moutarde, ALLERGENS.soja],
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Cheese Crac',
            allergens: [ALLERGENS.lait],
        },
        {
            name: 'Chili cheese nuggets (5 pièces)',
            allergens: [ALLERGENS.gluten, ALLERGENS.lait, ALLERGENS.soja],
        },
        {
            name: 'Chixfingers (5 pièces)',
            allergens: [], // ⚠️ À COMPLÉTER
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Fricadelle',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja, ALLERGENS.celeri],
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Fricadelle XXL',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja, ALLERGENS.celeri],
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Grizzly',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Mexicanos',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja, ALLERGENS.celeri],
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Nuggets (5 pièces)',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Poulycroc',
            allergens: [], // ⚠️ À COMPLÉTER
            traces: [ALLERGENS.lait],
        },
        {
            name: 'Viandelle',
            allergens: [ALLERGENS.gluten, ALLERGENS.soja],
            traces: [ALLERGENS.lait],
        },
    ],
    'général': [
    ],
}
