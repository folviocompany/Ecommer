-- =============================================================
-- DropStore — Seed SQL
-- Rodar APÓS o schema.sql no Neon SQL Editor
-- =============================================================

-- 1. Categorias
INSERT INTO categories (name, slug, active) VALUES
  ('Camisetas',  'camisetas',  true),
  ('Moletons',   'moletons',   true),
  ('Bonés',      'bones',      true),
  ('Acessórios', 'acessorios', true);

-- 2. Produtos
INSERT INTO products (category_id, name, slug, description, price, images, featured, active) VALUES

  -- Camisetas
  (1, 'Camiseta Urban Flow',
   'camiseta-urban-flow',
   'Camiseta oversized com estampa gráfica exclusiva. Tecido 100% algodão penteado, caimento relaxado e gola reforçada. A peça essencial para qualquer look streetwear.',
   89.90,
   ARRAY[
     'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
     'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80'
   ],
   true, true),

  (1, 'Camiseta Acid Wash',
   'camiseta-acid-wash',
   'Tingimento acid wash artesanal — cada peça é única. Corte regular com mangas curtas e estampa minimalista na manga. Algodão 100%.',
   99.90,
   ARRAY[
     'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
     'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'
   ],
   true, true),

  (1, 'Camiseta Drop Logo',
   'camiseta-drop-logo',
   'O clássico da DropStore. Logo bordado no peito, tecido premium anti-pilling, costuras duplas reforçadas. Atemporal.',
   79.90,
   ARRAY[
     'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
     'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&q=80'
   ],
   false, true),

  (1, 'Camiseta Patchwork',
   'camiseta-patchwork',
   'Construída com recortes de diferentes tecidos e texturas. Peça de edição limitada com numeração individual costurada na etiqueta interna.',
   129.90,
   ARRAY[
     'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80'
   ],
   true, true),

  -- Moletons
  (2, 'Moletom Street Classic',
   'moletom-street-classic',
   'Moletom com capuz e bolso canguru. Forro interno felpudo, cordão de algodão e punhos em ribana. O favorito das madrugadas frias.',
   189.90,
   ARRAY[
     'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
     'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&q=80'
   ],
   true, true),

  (2, 'Moletom Oversized Drop',
   'moletom-oversized-drop',
   'Corte extra largo com ombros caídos. Sem capuz, gola canoa. Streetwear minimalista no seu melhor. Algodão fleece 320g.',
   219.90,
   ARRAY[
     'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'
   ],
   false, true),

  -- Bonés
  (3, 'Boné Dad Hat Clássico',
   'bone-dad-hat-classico',
   'Estrutura não rígida, aba curva e fivela metálica ajustável. Bordado DropStore em relevo na frente. One size fits all.',
   69.90,
   ARRAY[
     'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
     'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80'
   ],
   true, true),

  -- Acessórios
  (4, 'Meia Drop Crew',
   'meia-drop-crew',
   'Meia cano médio com estampa geométrica exclusiva. Pack com 2 pares. Composição: 80% algodão, 15% poliamida, 5% elastano.',
   49.90,
   ARRAY[
     'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80'
   ],
   false, true);

-- 3. Variações

-- Camiseta Urban Flow (id=1) — tamanhos P/M/G/GG × cores Preto/Branco/Cinza
INSERT INTO variations (product_id, size, color, color_hex, stock, price_modifier, active) VALUES
  (1, 'P',  'Preto',  '#1A1A1A', 8,  0, true),
  (1, 'M',  'Preto',  '#1A1A1A', 12, 0, true),
  (1, 'G',  'Preto',  '#1A1A1A', 10, 0, true),
  (1, 'GG', 'Preto',  '#1A1A1A', 5,  0, true),
  (1, 'P',  'Branco', '#F5F5F5', 6,  0, true),
  (1, 'M',  'Branco', '#F5F5F5', 9,  0, true),
  (1, 'G',  'Branco', '#F5F5F5', 7,  0, true),
  (1, 'GG', 'Branco', '#F5F5F5', 3,  0, true),
  (1, 'P',  'Cinza',  '#808080', 5,  0, true),
  (1, 'M',  'Cinza',  '#808080', 8,  0, true),
  (1, 'G',  'Cinza',  '#808080', 0,  0, true),  -- esgotado
  (1, 'GG', 'Cinza',  '#808080', 2,  0, true);

-- Camiseta Acid Wash (id=2) — P/M/G × Verde/Roxo/Preto
INSERT INTO variations (product_id, size, color, color_hex, stock, price_modifier, active) VALUES
  (2, 'P', 'Verde', '#2D6A4F', 4,  0, true),
  (2, 'M', 'Verde', '#2D6A4F', 7,  0, true),
  (2, 'G', 'Verde', '#2D6A4F', 3,  0, true),
  (2, 'P', 'Roxo',  '#6B35A4', 5,  0, true),
  (2, 'M', 'Roxo',  '#6B35A4', 6,  0, true),
  (2, 'G', 'Roxo',  '#6B35A4', 0,  0, true),  -- esgotado
  (2, 'P', 'Preto', '#1A1A1A', 8,  0, true),
  (2, 'M', 'Preto', '#1A1A1A', 10, 0, true),
  (2, 'G', 'Preto', '#1A1A1A', 6,  0, true);

-- Camiseta Drop Logo (id=3) — P/M/G/GG × Preto/Branco
INSERT INTO variations (product_id, size, color, color_hex, stock, price_modifier, active) VALUES
  (3, 'P',  'Preto',  '#1A1A1A', 15, 0, true),
  (3, 'M',  'Preto',  '#1A1A1A', 20, 0, true),
  (3, 'G',  'Preto',  '#1A1A1A', 18, 0, true),
  (3, 'GG', 'Preto',  '#1A1A1A', 8,  0, true),
  (3, 'P',  'Branco', '#F5F5F5', 10, 0, true),
  (3, 'M',  'Branco', '#F5F5F5', 14, 0, true),
  (3, 'G',  'Branco', '#F5F5F5', 11, 0, true),
  (3, 'GG', 'Branco', '#F5F5F5', 4,  0, true);

-- Camiseta Patchwork (id=4) — P/M/G — edição limitada, estoque baixo
INSERT INTO variations (product_id, size, color, color_hex, stock, price_modifier, active) VALUES
  (4, 'P', 'Multicolor', '#F97316', 2, 0, true),
  (4, 'M', 'Multicolor', '#F97316', 3, 0, true),
  (4, 'G', 'Multicolor', '#F97316', 1, 0, true);

-- Moletom Street Classic (id=5) — P/M/G/GG × Preto/Cinza Chumbo
INSERT INTO variations (product_id, size, color, color_hex, stock, price_modifier, active) VALUES
  (5, 'P',  'Preto',       '#1A1A1A', 6,  0,  true),
  (5, 'M',  'Preto',       '#1A1A1A', 9,  0,  true),
  (5, 'G',  'Preto',       '#1A1A1A', 7,  0,  true),
  (5, 'GG', 'Preto',       '#1A1A1A', 3,  10, true),  -- GG custa R$10 a mais
  (5, 'P',  'Cinza Chumbo','#4A4A4A', 5,  0,  true),
  (5, 'M',  'Cinza Chumbo','#4A4A4A', 7,  0,  true),
  (5, 'G',  'Cinza Chumbo','#4A4A4A', 4,  0,  true),
  (5, 'GG', 'Cinza Chumbo','#4A4A4A', 0,  10, true);  -- esgotado

-- Moletom Oversized Drop (id=6) — P/M/G × Preto/Laranja
INSERT INTO variations (product_id, size, color, color_hex, stock, price_modifier, active) VALUES
  (6, 'P', 'Preto',   '#1A1A1A', 4, 0, true),
  (6, 'M', 'Preto',   '#1A1A1A', 6, 0, true),
  (6, 'G', 'Preto',   '#1A1A1A', 3, 0, true),
  (6, 'P', 'Laranja', '#F97316', 3, 0, true),
  (6, 'M', 'Laranja', '#F97316', 5, 0, true),
  (6, 'G', 'Laranja', '#F97316', 2, 0, true);

-- Boné Dad Hat (id=7) — sem tamanho, 3 cores
INSERT INTO variations (product_id, size, color, color_hex, stock, price_modifier, active) VALUES
  (7, NULL, 'Preto',  '#1A1A1A', 15, 0, true),
  (7, NULL, 'Bege',   '#C8A882', 10, 0, true),
  (7, NULL, 'Branco', '#F5F5F5', 8,  0, true);

-- Meia Drop Crew (id=8) — tamanho único, 2 cores
INSERT INTO variations (product_id, size, color, color_hex, stock, price_modifier, active) VALUES
  (8, 'Único', 'Preto/Laranja', '#F97316', 20, 0, true),
  (8, 'Único', 'Branco/Preto',  '#1A1A1A', 20, 0, true);

-- =============================================================
-- Verificação
-- =============================================================
SELECT
  p.name AS produto,
  COUNT(v.id) AS total_variacoes,
  SUM(v.stock) AS estoque_total
FROM products p
LEFT JOIN variations v ON v.product_id = p.id
GROUP BY p.id, p.name
ORDER BY p.id;
