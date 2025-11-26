-- Script FINAL pour les produits restants
-- Gère les produits sans allergènes et les cas spécifiques

DO $$
DECLARE
  v_gluten UUID;
  v_oeufs UUID;
  v_lait UUID;
  v_moutarde UUID;
  v_sesame UUID;
  v_celeri UUID;
  v_soja UUID;
BEGIN
  SELECT id INTO v_gluten FROM allergens WHERE name = 'gluten';
  SELECT id INTO v_oeufs FROM allergens WHERE name = 'oeufs';
  SELECT id INTO v_lait FROM allergens WHERE name = 'lait';
  SELECT id INTO v_moutarde FROM allergens WHERE name = 'moutarde';
  SELECT id INTO v_sesame FROM allergens WHERE name = 'sesame';
  SELECT id INTO v_celeri FROM allergens WHERE name = 'celeri';
  SELECT id INTO v_soja FROM allergens WHERE name = 'soja';

  -- ==========================================
  -- 1. SMASH BURGERS MANQUANTS
  -- ==========================================
  
  -- L'Angus : Pain (Gluten, Sésame), Fromage (Lait)
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products WHERE name ILIKE '%angus%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_lait, false FROM products WHERE name ILIKE '%angus%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_sesame, true FROM products WHERE name ILIKE '%angus%'
  ON CONFLICT DO NOTHING;

  -- SmashTruffe : Pain (Gluten), Fromage (Lait), Sauce (Oeufs, Moutarde)
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products WHERE name ILIKE '%smashtruffe%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_lait, false FROM products WHERE name ILIKE '%smashtruffe%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_oeufs, false FROM products WHERE name ILIKE '%smashtruffe%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_moutarde, false FROM products WHERE name ILIKE '%smashtruffe%'
  ON CONFLICT DO NOTHING;

  -- Smash US Classic
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products WHERE name ILIKE '%smash us classic%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_lait, false FROM products WHERE name ILIKE '%smash us classic%'
  ON CONFLICT DO NOTHING;

  -- Box Enfant (Supposons Gluten/Soja/Lait par sécurité car souvent nuggets/burger)
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products WHERE name ILIKE '%box enfant%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_soja, false FROM products WHERE name ILIKE '%box enfant%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_lait, false FROM products WHERE name ILIKE '%box enfant%'
  ON CONFLICT DO NOTHING;

  -- Ketchup (Céleri parfois)
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_celeri, true FROM products WHERE name ILIKE '%ketchup%'
  ON CONFLICT DO NOTHING;

  -- ==========================================
  -- 2. PRODUITS SANS ALLERGÈNES (Softs, Légumes, Frites)
  -- ==========================================
  -- Note: Dans notre système, si pas d'entrée dans product_allergens, c'est "Sans allergènes".
  -- Donc on ne fait RIEN pour eux, ce qui est correct.
  -- La page affichera "✅ Sans allergènes majeurs".

  -- Liste confirmée SANS allergènes :
  -- Chaudfontaine, Coca, Fanta, Fuze tea, Oasis, Sprite, Tropico
  -- Frites, Bacon, Carotte, Cornichon, Oignons, Salade, Tomates

END $$;
