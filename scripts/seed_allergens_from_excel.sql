-- Seed allergens for products based on Excel analysis
-- This script assumes products exist in the 'products' table with the same names as in the Excel file

DO $$
DECLARE
  v_gluten UUID;
  v_crustaces UUID;
  v_oeufs UUID;
  v_poissons UUID;
  v_arachides UUID;
  v_soja UUID;
  v_lait UUID;
  v_fruits_a_coque UUID;
  v_celeri UUID;
  v_moutarde UUID;
  v_sesame UUID;
  v_sulfites UUID;
  v_lupin UUID;
  v_mollusques UUID;
BEGIN
  -- Get Allergen IDs
  SELECT id INTO v_gluten FROM allergens WHERE name = 'gluten';
  SELECT id INTO v_crustaces FROM allergens WHERE name = 'crustaces';
  SELECT id INTO v_oeufs FROM allergens WHERE name = 'oeufs';
  SELECT id INTO v_poissons FROM allergens WHERE name = 'poissons';
  SELECT id INTO v_arachides FROM allergens WHERE name = 'arachides';
  SELECT id INTO v_soja FROM allergens WHERE name = 'soja';
  SELECT id INTO v_lait FROM allergens WHERE name = 'lait';
  SELECT id INTO v_fruits_a_coque FROM allergens WHERE name = 'fruits_a_coque';
  SELECT id INTO v_celeri FROM allergens WHERE name = 'celeri';
  SELECT id INTO v_moutarde FROM allergens WHERE name = 'moutarde';
  SELECT id INTO v_sesame FROM allergens WHERE name = 'sesame';
  SELECT id INTO v_sulfites FROM allergens WHERE name = 'sulfites';
  SELECT id INTO v_lupin FROM allergens WHERE name = 'lupin';
  SELECT id INTO v_mollusques FROM allergens WHERE name = 'mollusques';

  -- Helper function to insert product allergen
  -- We use a temporary table or just direct inserts with subqueries for products

  -- Bains / Burgers / Mitraillettes (Gluten, Soja, etc)
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT p.id, v_gluten, false FROM products p WHERE p.name ILIKE '%pain%' OR p.name ILIKE '%burger%' OR p.name ILIKE '%mitraillette%' OR p.name ILIKE '%pitta%' OR p.name ILIKE '%fricadelle%' OR p.name ILIKE '%nuggets%' OR p.name ILIKE '%cheese crack%' OR p.name ILIKE '%boulette%' OR p.name ILIKE '%mexicanos%' OR p.name ILIKE '%cervelas%' OR p.name ILIKE '%grizzly%' OR p.name ILIKE '%viandelle%'
  ON CONFLICT DO NOTHING;

  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT p.id, v_soja, false FROM products p WHERE p.name ILIKE '%burger%' OR p.name ILIKE '%fricadelle%' OR p.name ILIKE '%boulette%' OR p.name ILIKE '%mexicanos%' OR p.name ILIKE '%cervelas%' OR p.name ILIKE '%grizzly%' OR p.name ILIKE '%nuggets%' OR p.name ILIKE '%viandelle%' OR p.name ILIKE '%mitraillette%'
  ON CONFLICT DO NOTHING;

  -- Sauces (Oeufs, Moutarde)
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT p.id, v_oeufs, false FROM products p WHERE p.name ILIKE '%mayonnaise%' OR p.name ILIKE '%andalouse%' OR p.name ILIKE '%samurai%' OR p.name ILIKE '%americaine%' OR p.name ILIKE '%tartare%' OR p.name ILIKE '%hamburger%' OR p.name ILIKE '%algerienne%' OR p.name ILIKE '%mitraillette%'
  ON CONFLICT DO NOTHING;

  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT p.id, v_moutarde, false FROM products p WHERE p.name ILIKE '%mayonnaise%' OR p.name ILIKE '%andalouse%' OR p.name ILIKE '%samurai%' OR p.name ILIKE '%americaine%' OR p.name ILIKE '%tartare%' OR p.name ILIKE '%algerienne%' OR p.name ILIKE '%mitraillette%' OR p.name ILIKE '%cervelas%'
  ON CONFLICT DO NOTHING;

  -- Fromage / Lait
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT p.id, v_lait, false FROM products p WHERE p.name ILIKE '%cheese%' OR p.name ILIKE '%cheddar%' OR p.name ILIKE '%fromage%' OR p.name ILIKE '%feta%' OR p.name ILIKE '%provolone%' OR p.name ILIKE '%philly%'
  ON CONFLICT DO NOTHING;

  -- Céleri
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT p.id, v_celeri, false FROM products p WHERE p.name ILIKE '%fricadelle%' OR p.name ILIKE '%mexicanos%' OR p.name ILIKE '%16-20%' OR p.name ILIKE '%ketjep%'
  ON CONFLICT DO NOTHING;

  -- Sulfites
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT p.id, v_sulfites, false FROM products p WHERE p.name ILIKE '%barbecue%' OR p.name ILIKE '%bbq%' OR p.name ILIKE '%smoky%'
  ON CONFLICT DO NOTHING;

  -- Traces Sésame (Pains)
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT p.id, v_sesame, true FROM products p WHERE p.name ILIKE '%burger%' OR p.name ILIKE '%pain%'
  ON CONFLICT DO NOTHING;

  -- Traces Lait (Viandes friture)
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT p.id, v_lait, true FROM products p 
  WHERE (p.name ILIKE '%brochette%' OR p.name ILIKE '%fricadelle%' OR p.name ILIKE '%viandelle%' OR p.name ILIKE '%mexicanos%' OR p.name ILIKE '%nuggets%' OR p.name ILIKE '%poulycroc%')
  AND NOT EXISTS (SELECT 1 FROM product_allergens pa WHERE pa.product_id = p.id AND pa.allergen_id = v_lait AND pa.is_trace = false)
  ON CONFLICT DO NOTHING;

END $$;
