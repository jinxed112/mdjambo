-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create allergens table
CREATE TABLE IF NOT EXISTS allergens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE, -- Internal name (e.g., 'gluten')
  name_fr VARCHAR(100) NOT NULL,     -- Display name (e.g., 'Gluten')
  emoji VARCHAR(10),                 -- Emoji (e.g., '🌾')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create product_allergens table (Link between products and allergens)
CREATE TABLE IF NOT EXISTS product_allergens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  allergen_id UUID REFERENCES allergens(id) ON DELETE CASCADE,
  is_trace BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, allergen_id)
);

-- 3. Insert the 14 regulatory allergens
INSERT INTO allergens (name, name_fr, emoji) VALUES
('gluten', 'Gluten', '🌾'),
('crustaces', 'Crustacés', '🦐'),
('oeufs', 'Œufs', '🥚'),
('poissons', 'Poissons', '🐟'),
('arachides', 'Arachides', '🥜'),
('soja', 'Soja', '🫘'),
('lait', 'Lait', '🥛'),
('fruits_a_coque', 'Fruits à coque', '🌰'),
('celeri', 'Céleri', '🥬'),
('moutarde', 'Moutarde', '🟡'),
('sesame', 'Sésame', '🔸'),
('sulfites', 'Sulfites', '🧪'),
('lupin', 'Lupin', '🌸'),
('mollusques', 'Mollusques', '🦪')
ON CONFLICT (name) DO NOTHING;

-- 4. Function to get allergens for a menu item based on its recipe
CREATE OR REPLACE FUNCTION get_menu_item_allergens(p_menu_item_id UUID)
RETURNS TABLE (
  allergen_id UUID,
  allergen_name VARCHAR,
  allergen_emoji VARCHAR,
  is_trace BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name_fr,
    a.emoji,
    BOOL_AND(pa.is_trace) as is_trace -- true only if ALL are traces. If one is false (direct), result is false.
  FROM recipe_items ri
  JOIN product_allergens pa ON pa.product_id = ri.product_id
  JOIN allergens a ON a.id = pa.allergen_id
  WHERE ri.menu_item_id = p_menu_item_id
  GROUP BY a.id, a.name_fr, a.emoji
  ORDER BY a.name_fr;
END;
$$ LANGUAGE plpgsql;

-- 5. Helper to get allergens for a product
CREATE OR REPLACE FUNCTION get_product_allergens(p_product_id UUID)
RETURNS TABLE (
  allergen_id UUID,
  allergen_name VARCHAR,
  allergen_emoji VARCHAR,
  is_trace BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name_fr,
    a.emoji,
    pa.is_trace
  FROM product_allergens pa
  JOIN allergens a ON a.id = pa.allergen_id
  WHERE pa.product_id = p_product_id
  ORDER BY a.name_fr;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to get ALL menu items with their calculated allergens (Bulk fetch)
CREATE OR REPLACE FUNCTION get_full_menu_allergens()
RETURNS TABLE (
  menu_item_id UUID,
  menu_item_name VARCHAR,
  category VARCHAR,
  allergen_id UUID,
  allergen_name VARCHAR,
  allergen_emoji VARCHAR,
  is_trace BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    mi.id as menu_item_id,
    mi.name as menu_item_name,
    mi.category,
    a.id as allergen_id,
    a.name_fr as allergen_name,
    a.emoji as allergen_emoji,
    BOOL_AND(pa.is_trace) as is_trace
  FROM menu_items mi
  LEFT JOIN recipe_items ri ON ri.menu_item_id = mi.id
  LEFT JOIN product_allergens pa ON pa.product_id = ri.product_id
  LEFT JOIN allergens a ON a.id = pa.allergen_id
  WHERE mi.is_active = true
  GROUP BY mi.id, mi.name, mi.category, a.id, a.name_fr, a.emoji
  ORDER BY mi.category, mi.name, a.name_fr;
END;
$$ LANGUAGE plpgsql;
