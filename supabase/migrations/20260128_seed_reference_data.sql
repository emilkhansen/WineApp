-- Seed reference data from TypeScript constants
-- This migration populates the reference tables with initial data

-- Insert Colors (from WINE_COLORS)
INSERT INTO colors (name, sort_order) VALUES
  ('Red', 1),
  ('White', 2),
  ('Rosé', 3),
  ('Orange', 4),
  ('Sparkling', 5),
  ('Dessert', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert Grape Varieties (from GRAPE_VARIETIES)
-- Red grapes
INSERT INTO grape_varieties (name, color) VALUES
  ('Cabernet Sauvignon', 'red'),
  ('Merlot', 'red'),
  ('Pinot Noir', 'red'),
  ('Syrah/Shiraz', 'red'),
  ('Grenache', 'red'),
  ('Tempranillo', 'red'),
  ('Sangiovese', 'red'),
  ('Nebbiolo', 'red'),
  ('Malbec', 'red'),
  ('Zinfandel', 'red'),
  ('Cabernet Franc', 'red'),
  ('Mourvèdre', 'red'),
  ('Petit Verdot', 'red'),
  ('Carménère', 'red'),
  ('Gamay', 'red'),
  ('Barbera', 'red'),
  ('Primitivo', 'red'),
  ('Touriga Nacional', 'red'),
  ('Pinotage', 'red')
ON CONFLICT (name) DO NOTHING;

-- White grapes
INSERT INTO grape_varieties (name, color) VALUES
  ('Chardonnay', 'white'),
  ('Sauvignon Blanc', 'white'),
  ('Riesling', 'white'),
  ('Pinot Grigio/Pinot Gris', 'white'),
  ('Gewürztraminer', 'white'),
  ('Viognier', 'white'),
  ('Chenin Blanc', 'white'),
  ('Sémillon', 'white'),
  ('Muscadet', 'white'),
  ('Albariño', 'white'),
  ('Grüner Veltliner', 'white'),
  ('Torrontés', 'white'),
  ('Verdejo', 'white'),
  ('Vermentino', 'white'),
  ('Marsanne', 'white'),
  ('Roussanne', 'white'),
  ('Trebbiano', 'white'),
  ('Fiano', 'white'),
  ('Garganega', 'white')
ON CONFLICT (name) DO NOTHING;

-- Rosé grapes
INSERT INTO grape_varieties (name, color) VALUES
  ('Grenache Rosé', 'rosé'),
  ('Syrah Rosé', 'rosé'),
  ('Pinot Noir Rosé', 'rosé'),
  ('Provence Rosé Blend', 'rosé')
ON CONFLICT (name) DO NOTHING;

-- Sparkling grapes
INSERT INTO grape_varieties (name, color) VALUES
  ('Champagne Blend', 'sparkling'),
  ('Prosecco (Glera)', 'sparkling'),
  ('Cava Blend', 'sparkling'),
  ('Crémant', 'sparkling')
ON CONFLICT (name) DO NOTHING;

-- Generic varieties
INSERT INTO grape_varieties (name, color) VALUES
  ('Blend', NULL),
  ('Other', NULL)
ON CONFLICT (name) DO NOTHING;

-- Insert Regions (from WINE_REGIONS_MAP)
-- French regions
INSERT INTO regions (name, country) VALUES
  ('Bordeaux', 'France'),
  ('Burgundy', 'France'),
  ('Champagne', 'France'),
  ('Loire Valley', 'France'),
  ('Rhône Valley', 'France'),
  ('Alsace', 'France'),
  ('Provence', 'France'),
  ('Languedoc-Roussillon', 'France'),
  ('Beaujolais', 'France'),
  ('Jura', 'France'),
  ('Savoie', 'France'),
  ('Sud-Ouest', 'France')
ON CONFLICT (name) DO NOTHING;

-- Italian regions
INSERT INTO regions (name, country) VALUES
  ('Tuscany', 'Italy'),
  ('Piedmont', 'Italy'),
  ('Veneto', 'Italy')
ON CONFLICT (name) DO NOTHING;

-- Spanish regions
INSERT INTO regions (name, country) VALUES
  ('Rioja', 'Spain'),
  ('Ribera del Duero', 'Spain'),
  ('Priorat', 'Spain')
ON CONFLICT (name) DO NOTHING;

-- USA regions
INSERT INTO regions (name, country) VALUES
  ('Napa Valley', 'USA'),
  ('Sonoma', 'USA'),
  ('Oregon', 'USA')
ON CONFLICT (name) DO NOTHING;

-- German regions
INSERT INTO regions (name, country) VALUES
  ('Mosel', 'Germany'),
  ('Rheingau', 'Germany'),
  ('Pfalz', 'Germany')
ON CONFLICT (name) DO NOTHING;

-- Other
INSERT INTO regions (name, country) VALUES
  ('Other', NULL)
ON CONFLICT (name) DO NOTHING;

-- Insert Subregions (from WINE_REGIONS_MAP)
-- Bordeaux subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Left Bank'),
  ('Right Bank'),
  ('Médoc'),
  ('Haut-Médoc'),
  ('Saint-Estèphe'),
  ('Pauillac'),
  ('Saint-Julien'),
  ('Margaux'),
  ('Pessac-Léognan'),
  ('Graves'),
  ('Sauternes'),
  ('Barsac'),
  ('Saint-Émilion'),
  ('Pomerol'),
  ('Fronsac')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Bordeaux'
ON CONFLICT (name, region_id) DO NOTHING;

-- Burgundy subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Côte de Nuits'),
  ('Côte de Beaune'),
  ('Chablis'),
  ('Côte Chalonnaise'),
  ('Mâconnais')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Burgundy'
ON CONFLICT (name, region_id) DO NOTHING;

-- Loire Valley subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Sancerre'),
  ('Pouilly-Fumé'),
  ('Vouvray'),
  ('Chinon'),
  ('Muscadet'),
  ('Anjou'),
  ('Savennières')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Loire Valley'
ON CONFLICT (name, region_id) DO NOTHING;

-- Rhône Valley subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Northern Rhône'),
  ('Southern Rhône'),
  ('Côte-Rôtie'),
  ('Hermitage'),
  ('Crozes-Hermitage'),
  ('Saint-Joseph'),
  ('Cornas'),
  ('Châteauneuf-du-Pape'),
  ('Gigondas'),
  ('Vacqueyras'),
  ('Côtes du Rhône')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Rhône Valley'
ON CONFLICT (name, region_id) DO NOTHING;

-- Provence subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Bandol'),
  ('Cassis'),
  ('Côtes de Provence')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Provence'
ON CONFLICT (name, region_id) DO NOTHING;

-- Languedoc-Roussillon subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Languedoc'),
  ('Roussillon'),
  ('Corbières'),
  ('Minervois'),
  ('Fitou')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Languedoc-Roussillon'
ON CONFLICT (name, region_id) DO NOTHING;

-- Beaujolais subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Beaujolais Crus'),
  ('Morgon'),
  ('Fleurie'),
  ('Moulin-à-Vent')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Beaujolais'
ON CONFLICT (name, region_id) DO NOTHING;

-- Jura subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Arbois'),
  ('Château-Chalon')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Jura'
ON CONFLICT (name, region_id) DO NOTHING;

-- Sud-Ouest subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Cahors'),
  ('Madiran'),
  ('Bergerac'),
  ('Jurançon'),
  ('Gaillac')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Sud-Ouest'
ON CONFLICT (name, region_id) DO NOTHING;

-- Tuscany subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Chianti'),
  ('Chianti Classico'),
  ('Brunello di Montalcino'),
  ('Vino Nobile di Montepulciano'),
  ('Bolgheri')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Tuscany'
ON CONFLICT (name, region_id) DO NOTHING;

-- Piedmont subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Barolo'),
  ('Barbaresco'),
  ('Langhe'),
  ('Roero')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Piedmont'
ON CONFLICT (name, region_id) DO NOTHING;

-- Veneto subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Valpolicella'),
  ('Amarone'),
  ('Soave'),
  ('Prosecco')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Veneto'
ON CONFLICT (name, region_id) DO NOTHING;

-- Rioja subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Rioja Alta'),
  ('Rioja Alavesa'),
  ('Rioja Oriental')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Rioja'
ON CONFLICT (name, region_id) DO NOTHING;

-- Napa Valley subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Oakville'),
  ('Rutherford'),
  ('Stags Leap'),
  ('Howell Mountain'),
  ('Calistoga')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Napa Valley'
ON CONFLICT (name, region_id) DO NOTHING;

-- Sonoma subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Russian River Valley'),
  ('Sonoma Coast'),
  ('Alexander Valley'),
  ('Dry Creek Valley')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Sonoma'
ON CONFLICT (name, region_id) DO NOTHING;

-- Oregon subregions
INSERT INTO subregions (name, region_id)
SELECT s.name, r.id
FROM (VALUES
  ('Willamette Valley'),
  ('Dundee Hills')
) AS s(name)
CROSS JOIN regions r
WHERE r.name = 'Oregon'
ON CONFLICT (name, region_id) DO NOTHING;

-- Insert Cru Classifications (from WINE_CRUS)
INSERT INTO cru_classifications (name, region_id) VALUES
  -- Burgundy hierarchy
  ('Grand Cru', (SELECT id FROM regions WHERE name = 'Burgundy')),
  ('Premier Cru', (SELECT id FROM regions WHERE name = 'Burgundy')),
  ('Village', (SELECT id FROM regions WHERE name = 'Burgundy')),
  ('Bourgogne', (SELECT id FROM regions WHERE name = 'Burgundy')),

  -- Bordeaux classifications
  ('Premier Grand Cru Classé A', (SELECT id FROM regions WHERE name = 'Bordeaux')),
  ('Premier Grand Cru Classé B', (SELECT id FROM regions WHERE name = 'Bordeaux')),
  ('Grand Cru Classé', (SELECT id FROM regions WHERE name = 'Bordeaux')),
  ('Cru Classé', (SELECT id FROM regions WHERE name = 'Bordeaux')),

  -- Médoc 1855 Classification
  ('Premier Cru (1855)', (SELECT id FROM regions WHERE name = 'Bordeaux')),
  ('Deuxième Cru (1855)', (SELECT id FROM regions WHERE name = 'Bordeaux')),
  ('Troisième Cru (1855)', (SELECT id FROM regions WHERE name = 'Bordeaux')),
  ('Quatrième Cru (1855)', (SELECT id FROM regions WHERE name = 'Bordeaux')),
  ('Cinquième Cru (1855)', (SELECT id FROM regions WHERE name = 'Bordeaux')),

  -- Other Bordeaux
  ('Cru Bourgeois Exceptionnel', (SELECT id FROM regions WHERE name = 'Bordeaux')),
  ('Cru Bourgeois Supérieur', (SELECT id FROM regions WHERE name = 'Bordeaux')),
  ('Cru Bourgeois', (SELECT id FROM regions WHERE name = 'Bordeaux')),
  ('Cru Artisan', (SELECT id FROM regions WHERE name = 'Bordeaux')),

  -- Alsace
  ('Alsace Grand Cru', (SELECT id FROM regions WHERE name = 'Alsace')),

  -- Beaujolais
  ('Cru du Beaujolais', (SELECT id FROM regions WHERE name = 'Beaujolais')),

  -- Champagne
  ('Grand Cru (Champagne)', (SELECT id FROM regions WHERE name = 'Champagne')),
  ('Premier Cru (Champagne)', (SELECT id FROM regions WHERE name = 'Champagne')),

  -- French wine quality tiers (generic)
  ('IGP', NULL),
  ('Vin de France', NULL),

  -- Generic
  ('Other', NULL)
ON CONFLICT (name) DO NOTHING;
