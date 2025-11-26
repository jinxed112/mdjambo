const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(process.cwd(), 'restomaxvente.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Fonction pour détecter les allergènes automatiquement
function detectAllergens(productName, category) {
    const name = productName.toLowerCase();
    const allergens = [];
    const traces = [];

    // Pain/Gluten
    if (name.includes('pain') || name.includes('burger') || name.includes('mitraillette') ||
        name.includes('pitta') || name.includes('fricadelle') || name.includes('nuggets') ||
        name.includes('cheese crack') || name.includes('boulette') || name.includes('mexicanos') ||
        name.includes('cervelas') || name.includes('grizzly') || name.includes('viandelle')) {
        allergens.push('gluten');
    }

    // Œufs
    if (name.includes('mayonnaise') || name.includes('andalouse') || name.includes('samurai') ||
        name.includes('americaine') || name.includes('tartare') || name.includes('hamburger') ||
        name.includes('algerienne') || name.includes('mitraillette')) {
        allergens.push('oeufs');
    }

    // Moutarde
    if (name.includes('mayonnaise') || name.includes('andalouse') || name.includes('samurai') ||
        name.includes('americaine') || name.includes('tartare') || name.includes('algerienne') ||
        name.includes('mitraillette') || name.includes('cervelas')) {
        allergens.push('moutarde');
    }

    // Lait/Fromage
    if (name.includes('cheese') || name.includes('cheddar') || name.includes('fromage') ||
        name.includes('feta') || name.includes('provolone') || name.includes('philly')) {
        allergens.push('lait');
    }

    // Soja
    if (name.includes('burger') || name.includes('fricadelle') || name.includes('boulette') ||
        name.includes('mexicanos') || name.includes('cervelas') || name.includes('grizzly') ||
        name.includes('nuggets') || name.includes('viandelle') || name.includes('mitraillette')) {
        allergens.push('soja');
    }

    // Céleri
    if (name.includes('fricadelle') || name.includes('mexicanos') || name.includes('16-20') ||
        name.includes('ketjep')) {
        allergens.push('celeri');
    }

    // Sulfites
    if (name.includes('barbecue') || name.includes('bbq') || name.includes('smoky')) {
        allergens.push('sulfites');
    }

    // Sésame (traces)
    if (name.includes('burger') || name.includes('pain')) {
        traces.push('sesame');
    }

    // Lait (traces) pour fritures
    if (category === 'Viandes' && !allergens.includes('lait')) {
        traces.push('lait');
    }

    return { allergens: [...new Set(allergens)], traces: [...new Set(traces)] };
}

// Extraire tous les produits
let currentCategory = '';
const productsByCategory = {};

for (let i = 2; i < data.length; i++) {
    const row = data[i];

    if (row[0] && String(row[0]).startsWith('Total ')) {
        currentCategory = String(row[0]).replace('Total ', '').trim();
        if (!productsByCategory[currentCategory]) {
            productsByCategory[currentCategory] = [];
        }
        continue;
    }

    if (row[1] && currentCategory && !String(row[1]).startsWith('Total')) {
        const article = String(row[1]).trim();
        const quantity = row[2] || 0;

        if (quantity > 0) {
            const detected = detectAllergens(article, currentCategory);
            productsByCategory[currentCategory].push({
                name: article,
                allergens: detected.allergens,
                traces: detected.traces
            });
        }
    }
}

// Générer le code TypeScript
let tsCode = `// MENU COMPLET GÉNÉRÉ AUTOMATIQUEMENT DEPUIS restomaxvente.xlsx\n`;
tsCode += `// ⚠️ Les allergènes ont été détectés automatiquement - À VÉRIFIER ET COMPLÉTER\n\n`;
tsCode += `const MENU: Record<string, Product[]> = {\n`;

Object.entries(productsByCategory).forEach(([category, products]) => {
    tsCode += `    '${category}': [\n`;
    products.forEach(product => {
        tsCode += `        {\n`;
        tsCode += `            name: '${product.name}',\n`;

        if (product.allergens.length > 0) {
            tsCode += `            allergens: [${product.allergens.map(a => `ALLERGENS.${a}`).join(', ')}],\n`;
        } else {
            tsCode += `            allergens: [], // ⚠️ À COMPLÉTER\n`;
        }

        if (product.traces.length > 0) {
            tsCode += `            traces: [${product.traces.map(t => `ALLERGENS.${t}`).join(', ')}],\n`;
        }

        tsCode += `        },\n`;
    });
    tsCode += `    ],\n`;
});

tsCode += `}\n`;

// Sauvegarder dans un fichier
fs.writeFileSync('generated_menu.ts', tsCode);

console.log('✅ Fichier generated_menu.ts créé avec succès!');
console.log(`📊 ${Object.keys(productsByCategory).length} catégories`);
console.log(`📦 ${Object.values(productsByCategory).flat().length} produits`);
console.log('\n⚠️  IMPORTANT: Vérifiez et complétez les allergènes dans le fichier généré');
