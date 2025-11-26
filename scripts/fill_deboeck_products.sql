-- Script pour les produits De Boeck Foods / Snaky
-- Basé sur les standards de l'industrie pour ces produits

DO $$
DECLARE
  v_gluten UUID;
  v_oeufs UUID;
  v_lait UUID;
  v_moutarde UUID;
  v_soja UUID;
  v_celeri UUID;
BEGIN
  SELECT id INTO v_gluten FROM allergens WHERE name = 'gluten';
  SELECT id INTO v_oeufs FROM allergens WHERE name = 'oeufs';
  SELECT id INTO v_lait FROM allergens WHERE name = 'lait';
  SELECT id INTO v_moutarde FROM allergens WHERE name = 'moutarde';
  SELECT id INTO v_soja FROM allergens WHERE name = 'soja';
  SELECT id INTO v_celeri FROM allergens WHERE name = 'celeri';

  -- 1. FRICANDELLES (Snaky, XXL, Krykandelle)
  -- Base: Gluten, Soja. Traces: Lait, Oeufs
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products WHERE name ILIKE '%fricandelle%' OR name ILIKE '%krykandelle%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_soja, false FROM products WHERE name ILIKE '%fricandelle%' OR name ILIKE '%krykandelle%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_lait, true FROM products WHERE name ILIKE '%fricandelle%' OR name ILIKE '%krykandelle%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_oeufs, true FROM products WHERE name ILIKE '%fricandelle%' OR name ILIKE '%krykandelle%'
  ON CONFLICT DO NOTHING;

  -- 2. POULET PANÉ (Groovy Tenders, Krokycroq, Kryspychix)
  -- Base: Gluten, Soja. Traces: Lait, Oeufs, Celeri, Moutarde
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products WHERE name ILIKE '%groovy%' OR name ILIKE '%krokycroq%' OR name ILIKE '%kryspychix%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_soja, false FROM products WHERE name ILIKE '%groovy%' OR name ILIKE '%krokycroq%' OR name ILIKE '%kryspychix%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_lait, true FROM products WHERE name ILIKE '%groovy%' OR name ILIKE '%krokycroq%' OR name ILIKE '%kryspychix%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_oeufs, true FROM products WHERE name ILIKE '%groovy%' OR name ILIKE '%krokycroq%' OR name ILIKE '%kryspychix%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_celeri, true FROM products WHERE name ILIKE '%groovy%' OR name ILIKE '%krokycroq%' OR name ILIKE '%kryspychix%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_moutarde, true FROM products WHERE name ILIKE '%groovy%' OR name ILIKE '%krokycroq%' OR name ILIKE '%kryspychix%'
  ON CONFLICT DO NOTHING;

  -- 3. KROKIDEL (Souvent contient du lait en plus)
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products WHERE name ILIKE '%krokidel%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_soja, false FROM products WHERE name ILIKE '%krokidel%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_lait, false FROM products WHERE name ILIKE '%krokidel%'
  ON CONFLICT DO NOTHING;

  -- 4. MEXICAIN (Épicé -> Céleri, Moutarde)
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products WHERE name ILIKE '%mexicain%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_soja, false FROM products WHERE name ILIKE '%mexicain%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_celeri, false FROM products WHERE name ILIKE '%mexicain%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_moutarde, false FROM products WHERE name ILIKE '%mexicain%'
  ON CONFLICT DO NOTHING;

END $$;
