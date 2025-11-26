-- Script SQL pour ajouter Grand Service et les produits de frites FRAÎCHES
-- Prix: 9,5€ le sac de 10 kg = 0,95€/kg

-- 1. Créer le fournisseur Grand Service
INSERT INTO suppliers (name)
VALUES ('Grand Service')
RETURNING id;

-- 2. Créer le produit principal "Frites fraîches"
INSERT INTO products (name, reference, unit_id)
VALUES (
  'Frites fraîches',
  'FRITES-GS-001',
  (SELECT id FROM units WHERE abbreviation = 'kg')
)
RETURNING id;

-- 3. Lier le produit au fournisseur
-- Prix: 9,5€ pour 10 kg = 0,95€/kg
INSERT INTO supplier_products (supplier_id, product_id, unit_price, vat_rate)
VALUES (
  (SELECT id FROM suppliers WHERE name = 'Grand Service'),
  (SELECT id FROM products WHERE reference = 'FRITES-GS-001'),
  0.95,  -- Prix: 0,95€/kg (9,5€ le sac de 10kg)
  6      -- TVA 6%
);

-- 4. Créer les portions pré-définies (pour frites FRAÎCHES)

-- Grande portion (300g) - Coût: 0,285€
INSERT INTO products (name, reference, unit_id)
VALUES (
  'Frites fraîches - Grande portion (300g)',
  'FRITES-GS-GRANDE',
  (SELECT id FROM units WHERE abbreviation = 'kg')
);

INSERT INTO supplier_products (supplier_id, product_id, unit_price, vat_rate)
VALUES (
  (SELECT id FROM suppliers WHERE name = 'Grand Service'),
  (SELECT id FROM products WHERE reference = 'FRITES-GS-GRANDE'),
  0.285,  -- 300g × 0,95€/kg = 0,285€
  6       -- TVA 6%
);

-- Accompagnement (150g) - Coût: 0,1425€
INSERT INTO products (name, reference, unit_id)
VALUES (
  'Frites fraîches - Accompagnement (150g)',
  'FRITES-GS-ACCOMP',
  (SELECT id FROM units WHERE abbreviation = 'kg')
);

INSERT INTO supplier_products (supplier_id, product_id, unit_price, vat_rate)
VALUES (
  (SELECT id FROM suppliers WHERE name = 'Grand Service'),
  (SELECT id FROM products WHERE reference = 'FRITES-GS-ACCOMP'),
  0.1425, -- 150g × 0,95€/kg = 0,1425€
  6       -- TVA 6%
);

-- Enfant (100g) - Coût: 0,095€
INSERT INTO products (name, reference, unit_id)
VALUES (
  'Frites fraîches - Enfant (100g)',
  'FRITES-GS-ENFANT',
  (SELECT id FROM units WHERE abbreviation = 'kg')
);

INSERT INTO supplier_products (supplier_id, product_id, unit_price, vat_rate)
VALUES (
  (SELECT id FROM suppliers WHERE name = 'Grand Service'),
  (SELECT id FROM products WHERE reference = 'FRITES-GS-ENFANT'),
  0.095,  -- 100g × 0,95€/kg = 0,095€
  6       -- TVA 6%
);

-- Vérification
SELECT 
  s.name as fournisseur,
  p.name as produit,
  sp.unit_price as cout_revient_euro,
  sp.vat_rate as tva_pourcent,
  u.abbreviation as unite
FROM supplier_products sp
JOIN suppliers s ON s.id = sp.supplier_id
JOIN products p ON p.id = sp.product_id
JOIN units u ON u.id = p.unit_id
WHERE s.name = 'Grand Service'
ORDER BY p.name;
