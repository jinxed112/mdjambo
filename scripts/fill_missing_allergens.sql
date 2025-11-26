-- Script complet pour remplir les allergènes manquants
-- Basé sur la liste exacte des produits du fichier Excel

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
  -- Récupération des IDs
  SELECT id INTO v_gluten FROM allergens WHERE name = 'gluten';
  SELECT id INTO v_oeufs FROM allergens WHERE name = 'oeufs';
  SELECT id INTO v_poissons FROM allergens WHERE name = 'poissons';
  SELECT id INTO v_soja FROM allergens WHERE name = 'soja';
  SELECT id INTO v_lait FROM allergens WHERE name = 'lait';
  SELECT id INTO v_celeri FROM allergens WHERE name = 'celeri';
  SELECT id INTO v_moutarde FROM allergens WHERE name = 'moutarde';
  SELECT id INTO v_sesame FROM allergens WHERE name = 'sesame';
  SELECT id INTO v_sulfites FROM allergens WHERE name = 'sulfites';

  -- ==========================================
  -- 1. BIÈRES (Gluten)
  -- ==========================================
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products 
  WHERE name ILIKE '%chimay%' 
     OR name ILIKE '%duvel%' 
     OR name ILIKE '%jupiler%' 
     OR name ILIKE '%leffe%' 
     OR name ILIKE '%orval%' 
     OR name ILIKE '%trolls%' 
     OR name ILIKE '%paix dieux%'
     OR name ILIKE '%corona%'
     OR name ILIKE '%liefmans%'
  ON CONFLICT DO NOTHING;

  -- ==========================================
  -- 2. SAUCES SPÉCIFIQUES
  -- ==========================================
  
  -- Brazil : Œufs, Moutarde
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_oeufs, false FROM products WHERE name ILIKE '%brazil%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_moutarde, false FROM products WHERE name ILIKE '%brazil%'
  ON CONFLICT DO NOTHING;

  -- Poivre : Lait, Moutarde, Gluten
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_lait, false FROM products WHERE name ILIKE '%poivre%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_moutarde, false FROM products WHERE name ILIKE '%poivre%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products WHERE name ILIKE '%poivre%'
  ON CONFLICT DO NOTHING;

  -- Bicky (Sauces) : Gluten, Soja, Céleri
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products WHERE name ILIKE '%bicky%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_celeri, false FROM products WHERE name ILIKE '%bicky%'
  ON CONFLICT DO NOTHING;

  -- Cowboy : Souvent Moutarde, Œufs
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_moutarde, false FROM products WHERE name ILIKE '%cowboy%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_oeufs, false FROM products WHERE name ILIKE '%cowboy%'
  ON CONFLICT DO NOTHING;

  -- ==========================================
  -- 3. SNACKS & VIANDES
  -- ==========================================

  -- Chixfingers / Nuggets : Gluten, Soja, Lait (traces)
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products WHERE name ILIKE '%chixfingers%' OR name ILIKE '%nuggets%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_soja, false FROM products WHERE name ILIKE '%chixfingers%' OR name ILIKE '%nuggets%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_lait, true FROM products WHERE name ILIKE '%chixfingers%' OR name ILIKE '%nuggets%'
  ON CONFLICT DO NOTHING;

  -- Chili Cheese Nuggets : Gluten, Lait
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_lait, false FROM products WHERE name ILIKE '%chili cheese%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products WHERE name ILIKE '%chili cheese%'
  ON CONFLICT DO NOTHING;

  -- Brochettes (Souvent marinade Soja/Moutarde/Gluten)
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_soja, false FROM products WHERE name ILIKE '%brochette%' AND NOT name ILIKE '%pain%'
  ON CONFLICT DO NOTHING;
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_gluten, false FROM products WHERE name ILIKE '%brochette%' AND NOT name ILIKE '%pain%'
  ON CONFLICT DO NOTHING;

  -- ==========================================
  -- 4. PAINS (Complément)
  -- ==========================================
  
  -- Sésame sur les pains burgers
  INSERT INTO product_allergens (product_id, allergen_id, is_trace)
  SELECT id, v_sesame, false FROM products WHERE name ILIKE '%bun%' OR name ILIKE '%burger%' AND name ILIKE '%pain%'
  ON CONFLICT DO NOTHING;

END $$;
