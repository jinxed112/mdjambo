const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'restomaxvente.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Liste des mots-clés déjà couverts par nos scripts
const coveredPatterns = [
    // Script 1
    'pain', 'burger', 'mitraillette', 'pitta', 'fricadelle', 'nuggets', 'cheese crack',
    'boulette', 'mexicanos', 'cervelas', 'grizzly', 'viandelle',
    'mayonnaise', 'andalouse', 'samurai', 'americaine', 'tartare', 'hamburger', 'algerienne',
    'cheese', 'cheddar', 'fromage', 'feta', 'provolone', 'philly',
    '16-20', 'ketjep', 'barbecue', 'bbq', 'smoky', 'brochette', 'poulycroc',

    // Script 2 (Fill missing)
    'chimay', 'duvel', 'jupiler', 'leffe', 'orval', 'trolls', 'paix dieux', 'corona', 'liefmans',
    'brazil', 'poivre', 'bicky', 'cowboy', 'chixfingers', 'chili cheese', 'bun'
];

console.log('=== PRODUITS POTENTIELLEMENT MANQUANTS ===\n');

let currentCategory = '';
const missingProducts = [];

for (let i = 2; i < data.length; i++) {
    const row = data[i];

    if (row[0] && String(row[0]).startsWith('Total ')) {
        currentCategory = String(row[0]).replace('Total ', '').trim();
        continue;
    }

    if (row[1] && currentCategory && !String(row[1]).startsWith('Total')) {
        const article = String(row[1]).trim();
        const articleLower = article.toLowerCase();
        const quantity = row[2] || 0;

        if (quantity > 0) {
            // Vérifier si couvert
            const isCovered = coveredPatterns.some(pattern => articleLower.includes(pattern));

            if (!isCovered) {
                missingProducts.push({ category: currentCategory, name: article });
                console.log(`[${currentCategory}] ${article}`);
            }
        }
    }
}

console.log(`\nTotal produits manquants potentiels : ${missingProducts.length}`);
