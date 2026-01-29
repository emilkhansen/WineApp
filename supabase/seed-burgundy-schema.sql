-- Burgundy Wine Schema
-- This script removes existing reference data and populates with comprehensive Burgundy data
-- Run this in Supabase SQL Editor

-- =============================================
-- CLEAR EXISTING DATA
-- =============================================
TRUNCATE TABLE vineyards CASCADE;
TRUNCATE TABLE appellations CASCADE;
TRUNCATE TABLE communes CASCADE;
TRUNCATE TABLE cru_classifications CASCADE;
TRUNCATE TABLE subregions CASCADE;
TRUNCATE TABLE regions CASCADE;
TRUNCATE TABLE grape_varieties CASCADE;
TRUNCATE TABLE colors CASCADE;
TRUNCATE TABLE producers CASCADE;

-- =============================================
-- COLORS
-- =============================================
INSERT INTO colors (name, sort_order) VALUES
  ('Red', 1),
  ('White', 2),
  ('Rosé', 3),
  ('Sparkling', 4);

-- =============================================
-- GRAPE VARIETIES
-- =============================================
INSERT INTO grape_varieties (name, color) VALUES
  ('Pinot Noir', 'Red'),
  ('Chardonnay', 'White'),
  ('Aligoté', 'White'),
  ('Gamay', 'Red'),
  ('Pinot Blanc', 'White'),
  ('Pinot Gris', 'White'),
  ('Sauvignon Blanc', 'White'),
  ('César', 'Red'),
  ('Melon de Bourgogne', 'White');

-- =============================================
-- REGIONS
-- =============================================
INSERT INTO regions (name, country) VALUES
  ('Burgundy', 'France');

-- =============================================
-- SUBREGIONS
-- =============================================
DO $$
DECLARE
  burgundy_id UUID;
BEGIN
  SELECT id INTO burgundy_id FROM regions WHERE name = 'Burgundy';

  INSERT INTO subregions (name, region_id) VALUES
    ('Chablis', burgundy_id),
    ('Côte de Nuits', burgundy_id),
    ('Côte de Beaune', burgundy_id),
    ('Côte Chalonnaise', burgundy_id),
    ('Mâconnais', burgundy_id),
    ('Hautes Côtes de Nuits', burgundy_id),
    ('Hautes Côtes de Beaune', burgundy_id);
END $$;

-- =============================================
-- CRU CLASSIFICATIONS
-- =============================================
DO $$
DECLARE
  burgundy_id UUID;
BEGIN
  SELECT id INTO burgundy_id FROM regions WHERE name = 'Burgundy';

  INSERT INTO cru_classifications (name, region_id) VALUES
    ('Grand Cru', burgundy_id),
    ('Premier Cru', burgundy_id),
    ('Village', burgundy_id),
    ('Régional', burgundy_id);
END $$;

-- =============================================
-- COMMUNES
-- =============================================
DO $$
DECLARE
  chablis_id UUID;
  cote_nuits_id UUID;
  cote_beaune_id UUID;
  cote_chalonnaise_id UUID;
  maconnais_id UUID;
BEGIN
  SELECT id INTO chablis_id FROM subregions WHERE name = 'Chablis';
  SELECT id INTO cote_nuits_id FROM subregions WHERE name = 'Côte de Nuits';
  SELECT id INTO cote_beaune_id FROM subregions WHERE name = 'Côte de Beaune';
  SELECT id INTO cote_chalonnaise_id FROM subregions WHERE name = 'Côte Chalonnaise';
  SELECT id INTO maconnais_id FROM subregions WHERE name = 'Mâconnais';

  -- Chablis communes
  INSERT INTO communes (name, subregion_id) VALUES
    ('Chablis', chablis_id),
    ('Fyé', chablis_id),
    ('Maligny', chablis_id),
    ('La Chapelle-Vaupelteigne', chablis_id),
    ('Poinchy', chablis_id),
    ('Milly', chablis_id),
    ('Courgis', chablis_id),
    ('Préhy', chablis_id),
    ('Chichée', chablis_id),
    ('Fleys', chablis_id),
    ('Béru', chablis_id),
    ('Viviers', chablis_id),
    ('Lignorelles', chablis_id),
    ('Ligny-le-Châtel', chablis_id),
    ('Beine', chablis_id);

  -- Côte de Nuits communes (north to south)
  INSERT INTO communes (name, subregion_id) VALUES
    ('Marsannay-la-Côte', cote_nuits_id),
    ('Couchey', cote_nuits_id),
    ('Fixin', cote_nuits_id),
    ('Brochon', cote_nuits_id),
    ('Gevrey-Chambertin', cote_nuits_id),
    ('Morey-Saint-Denis', cote_nuits_id),
    ('Chambolle-Musigny', cote_nuits_id),
    ('Vougeot', cote_nuits_id),
    ('Flagey-Echézeaux', cote_nuits_id),
    ('Vosne-Romanée', cote_nuits_id),
    ('Nuits-Saint-Georges', cote_nuits_id),
    ('Premeaux-Prissey', cote_nuits_id),
    ('Comblanchien', cote_nuits_id),
    ('Corgoloin', cote_nuits_id);

  -- Côte de Beaune communes (north to south)
  INSERT INTO communes (name, subregion_id) VALUES
    ('Ladoix-Serrigny', cote_beaune_id),
    ('Aloxe-Corton', cote_beaune_id),
    ('Pernand-Vergelesses', cote_beaune_id),
    ('Chorey-lès-Beaune', cote_beaune_id),
    ('Savigny-lès-Beaune', cote_beaune_id),
    ('Beaune', cote_beaune_id),
    ('Pommard', cote_beaune_id),
    ('Volnay', cote_beaune_id),
    ('Monthélie', cote_beaune_id),
    ('Auxey-Duresses', cote_beaune_id),
    ('Saint-Romain', cote_beaune_id),
    ('Meursault', cote_beaune_id),
    ('Blagny', cote_beaune_id),
    ('Puligny-Montrachet', cote_beaune_id),
    ('Chassagne-Montrachet', cote_beaune_id),
    ('Saint-Aubin', cote_beaune_id),
    ('Santenay', cote_beaune_id),
    ('Dezize-lès-Maranges', cote_beaune_id),
    ('Sampigny-lès-Maranges', cote_beaune_id),
    ('Cheilly-lès-Maranges', cote_beaune_id);

  -- Côte Chalonnaise communes
  INSERT INTO communes (name, subregion_id) VALUES
    ('Bouzeron', cote_chalonnaise_id),
    ('Rully', cote_chalonnaise_id),
    ('Mercurey', cote_chalonnaise_id),
    ('Givry', cote_chalonnaise_id),
    ('Montagny', cote_chalonnaise_id);

  -- Mâconnais communes
  INSERT INTO communes (name, subregion_id) VALUES
    ('Pouilly-Fuissé', maconnais_id),
    ('Pouilly-Loché', maconnais_id),
    ('Pouilly-Vinzelles', maconnais_id),
    ('Saint-Véran', maconnais_id),
    ('Viré-Clessé', maconnais_id),
    ('Mâcon', maconnais_id),
    ('Lugny', maconnais_id),
    ('Chardonnay', maconnais_id),
    ('Fuissé', maconnais_id),
    ('Solutré-Pouilly', maconnais_id),
    ('Vergisson', maconnais_id),
    ('Chaintre', maconnais_id);
END $$;

-- =============================================
-- APPELLATIONS
-- =============================================
DO $$
DECLARE
  burgundy_id UUID;
  chablis_sub_id UUID;
  cote_nuits_id UUID;
  cote_beaune_id UUID;
  cote_chalonnaise_id UUID;
  maconnais_id UUID;
BEGIN
  SELECT id INTO burgundy_id FROM regions WHERE name = 'Burgundy';
  SELECT id INTO chablis_sub_id FROM subregions WHERE name = 'Chablis';
  SELECT id INTO cote_nuits_id FROM subregions WHERE name = 'Côte de Nuits';
  SELECT id INTO cote_beaune_id FROM subregions WHERE name = 'Côte de Beaune';
  SELECT id INTO cote_chalonnaise_id FROM subregions WHERE name = 'Côte Chalonnaise';
  SELECT id INTO maconnais_id FROM subregions WHERE name = 'Mâconnais';

  -- Regional appellations
  INSERT INTO appellations (name, region_id, subregion_id) VALUES
    ('Bourgogne AOC', burgundy_id, NULL),
    ('Bourgogne Aligoté AOC', burgundy_id, NULL),
    ('Bourgogne Passe-Tout-Grains AOC', burgundy_id, NULL),
    ('Crémant de Bourgogne AOC', burgundy_id, NULL),
    ('Bourgogne Côte d''Or AOC', burgundy_id, NULL);

  -- Chablis appellations
  INSERT INTO appellations (name, region_id, subregion_id) VALUES
    ('Chablis Grand Cru AOC', burgundy_id, chablis_sub_id),
    ('Chablis Premier Cru AOC', burgundy_id, chablis_sub_id),
    ('Chablis AOC', burgundy_id, chablis_sub_id),
    ('Petit Chablis AOC', burgundy_id, chablis_sub_id);

  -- Côte de Nuits appellations
  INSERT INTO appellations (name, region_id, subregion_id) VALUES
    -- Grand Crus
    ('Chambertin AOC', burgundy_id, cote_nuits_id),
    ('Chambertin-Clos de Bèze AOC', burgundy_id, cote_nuits_id),
    ('Chapelle-Chambertin AOC', burgundy_id, cote_nuits_id),
    ('Charmes-Chambertin AOC', burgundy_id, cote_nuits_id),
    ('Griotte-Chambertin AOC', burgundy_id, cote_nuits_id),
    ('Latricières-Chambertin AOC', burgundy_id, cote_nuits_id),
    ('Mazis-Chambertin AOC', burgundy_id, cote_nuits_id),
    ('Mazoyères-Chambertin AOC', burgundy_id, cote_nuits_id),
    ('Ruchottes-Chambertin AOC', burgundy_id, cote_nuits_id),
    ('Clos de la Roche AOC', burgundy_id, cote_nuits_id),
    ('Clos Saint-Denis AOC', burgundy_id, cote_nuits_id),
    ('Clos de Tart AOC', burgundy_id, cote_nuits_id),
    ('Clos des Lambrays AOC', burgundy_id, cote_nuits_id),
    ('Bonnes-Mares AOC', burgundy_id, cote_nuits_id),
    ('Musigny AOC', burgundy_id, cote_nuits_id),
    ('Clos de Vougeot AOC', burgundy_id, cote_nuits_id),
    ('Échézeaux AOC', burgundy_id, cote_nuits_id),
    ('Grands Échézeaux AOC', burgundy_id, cote_nuits_id),
    ('Romanée-Conti AOC', burgundy_id, cote_nuits_id),
    ('La Tâche AOC', burgundy_id, cote_nuits_id),
    ('Richebourg AOC', burgundy_id, cote_nuits_id),
    ('La Romanée AOC', burgundy_id, cote_nuits_id),
    ('Romanée-Saint-Vivant AOC', burgundy_id, cote_nuits_id),
    ('La Grande Rue AOC', burgundy_id, cote_nuits_id),
    -- Village appellations
    ('Marsannay AOC', burgundy_id, cote_nuits_id),
    ('Fixin AOC', burgundy_id, cote_nuits_id),
    ('Gevrey-Chambertin AOC', burgundy_id, cote_nuits_id),
    ('Morey-Saint-Denis AOC', burgundy_id, cote_nuits_id),
    ('Chambolle-Musigny AOC', burgundy_id, cote_nuits_id),
    ('Vougeot AOC', burgundy_id, cote_nuits_id),
    ('Vosne-Romanée AOC', burgundy_id, cote_nuits_id),
    ('Nuits-Saint-Georges AOC', burgundy_id, cote_nuits_id),
    ('Côte de Nuits-Villages AOC', burgundy_id, cote_nuits_id);

  -- Côte de Beaune appellations
  INSERT INTO appellations (name, region_id, subregion_id) VALUES
    -- Grand Crus
    ('Corton AOC', burgundy_id, cote_beaune_id),
    ('Corton-Charlemagne AOC', burgundy_id, cote_beaune_id),
    ('Charlemagne AOC', burgundy_id, cote_beaune_id),
    ('Montrachet AOC', burgundy_id, cote_beaune_id),
    ('Chevalier-Montrachet AOC', burgundy_id, cote_beaune_id),
    ('Bâtard-Montrachet AOC', burgundy_id, cote_beaune_id),
    ('Bienvenues-Bâtard-Montrachet AOC', burgundy_id, cote_beaune_id),
    ('Criots-Bâtard-Montrachet AOC', burgundy_id, cote_beaune_id),
    -- Village appellations
    ('Ladoix AOC', burgundy_id, cote_beaune_id),
    ('Aloxe-Corton AOC', burgundy_id, cote_beaune_id),
    ('Pernand-Vergelesses AOC', burgundy_id, cote_beaune_id),
    ('Chorey-lès-Beaune AOC', burgundy_id, cote_beaune_id),
    ('Savigny-lès-Beaune AOC', burgundy_id, cote_beaune_id),
    ('Beaune AOC', burgundy_id, cote_beaune_id),
    ('Pommard AOC', burgundy_id, cote_beaune_id),
    ('Volnay AOC', burgundy_id, cote_beaune_id),
    ('Monthélie AOC', burgundy_id, cote_beaune_id),
    ('Auxey-Duresses AOC', burgundy_id, cote_beaune_id),
    ('Saint-Romain AOC', burgundy_id, cote_beaune_id),
    ('Meursault AOC', burgundy_id, cote_beaune_id),
    ('Blagny AOC', burgundy_id, cote_beaune_id),
    ('Puligny-Montrachet AOC', burgundy_id, cote_beaune_id),
    ('Chassagne-Montrachet AOC', burgundy_id, cote_beaune_id),
    ('Saint-Aubin AOC', burgundy_id, cote_beaune_id),
    ('Santenay AOC', burgundy_id, cote_beaune_id),
    ('Maranges AOC', burgundy_id, cote_beaune_id),
    ('Côte de Beaune AOC', burgundy_id, cote_beaune_id),
    ('Côte de Beaune-Villages AOC', burgundy_id, cote_beaune_id);

  -- Côte Chalonnaise appellations
  INSERT INTO appellations (name, region_id, subregion_id) VALUES
    ('Bouzeron AOC', burgundy_id, cote_chalonnaise_id),
    ('Rully AOC', burgundy_id, cote_chalonnaise_id),
    ('Mercurey AOC', burgundy_id, cote_chalonnaise_id),
    ('Givry AOC', burgundy_id, cote_chalonnaise_id),
    ('Montagny AOC', burgundy_id, cote_chalonnaise_id),
    ('Bourgogne Côte Chalonnaise AOC', burgundy_id, cote_chalonnaise_id);

  -- Mâconnais appellations
  INSERT INTO appellations (name, region_id, subregion_id) VALUES
    ('Pouilly-Fuissé AOC', burgundy_id, maconnais_id),
    ('Pouilly-Loché AOC', burgundy_id, maconnais_id),
    ('Pouilly-Vinzelles AOC', burgundy_id, maconnais_id),
    ('Saint-Véran AOC', burgundy_id, maconnais_id),
    ('Viré-Clessé AOC', burgundy_id, maconnais_id),
    ('Mâcon AOC', burgundy_id, maconnais_id),
    ('Mâcon-Villages AOC', burgundy_id, maconnais_id);
END $$;

-- =============================================
-- VINEYARDS / LIEUX-DITS (Famous ones)
-- =============================================
DO $$
DECLARE
  burgundy_id UUID;
  chablis_appellation_id UUID;
  gevrey_appellation_id UUID;
  morey_appellation_id UUID;
  chambolle_appellation_id UUID;
  vougeot_appellation_id UUID;
  vosne_appellation_id UUID;
  nsg_appellation_id UUID;
  beaune_appellation_id UUID;
  pommard_appellation_id UUID;
  volnay_appellation_id UUID;
  meursault_appellation_id UUID;
  puligny_appellation_id UUID;
  chassagne_appellation_id UUID;
BEGIN
  SELECT id INTO burgundy_id FROM regions WHERE name = 'Burgundy';

  -- Get appellation IDs
  SELECT id INTO chablis_appellation_id FROM appellations WHERE name = 'Chablis Premier Cru AOC';
  SELECT id INTO gevrey_appellation_id FROM appellations WHERE name = 'Gevrey-Chambertin AOC';
  SELECT id INTO morey_appellation_id FROM appellations WHERE name = 'Morey-Saint-Denis AOC';
  SELECT id INTO chambolle_appellation_id FROM appellations WHERE name = 'Chambolle-Musigny AOC';
  SELECT id INTO vougeot_appellation_id FROM appellations WHERE name = 'Vougeot AOC';
  SELECT id INTO vosne_appellation_id FROM appellations WHERE name = 'Vosne-Romanée AOC';
  SELECT id INTO nsg_appellation_id FROM appellations WHERE name = 'Nuits-Saint-Georges AOC';
  SELECT id INTO beaune_appellation_id FROM appellations WHERE name = 'Beaune AOC';
  SELECT id INTO pommard_appellation_id FROM appellations WHERE name = 'Pommard AOC';
  SELECT id INTO volnay_appellation_id FROM appellations WHERE name = 'Volnay AOC';
  SELECT id INTO meursault_appellation_id FROM appellations WHERE name = 'Meursault AOC';
  SELECT id INTO puligny_appellation_id FROM appellations WHERE name = 'Puligny-Montrachet AOC';
  SELECT id INTO chassagne_appellation_id FROM appellations WHERE name = 'Chassagne-Montrachet AOC';

  -- Chablis Premier Cru vineyards
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Montée de Tonnerre', burgundy_id, chablis_appellation_id),
    ('Mont de Milieu', burgundy_id, chablis_appellation_id),
    ('Fourchaume', burgundy_id, chablis_appellation_id),
    ('Vaillons', burgundy_id, chablis_appellation_id),
    ('Montmains', burgundy_id, chablis_appellation_id),
    ('Côte de Léchet', burgundy_id, chablis_appellation_id),
    ('Beauroy', burgundy_id, chablis_appellation_id),
    ('Vau de Vey', burgundy_id, chablis_appellation_id),
    ('Vaucoupin', burgundy_id, chablis_appellation_id),
    ('Vosgros', burgundy_id, chablis_appellation_id);

  -- Chablis Grand Cru vineyards (these are their own appellations but also lieux-dits)
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Les Clos', burgundy_id, NULL),
    ('Blanchot', burgundy_id, NULL),
    ('Bougros', burgundy_id, NULL),
    ('Grenouilles', burgundy_id, NULL),
    ('Les Preuses', burgundy_id, NULL),
    ('Valmur', burgundy_id, NULL),
    ('Vaudésir', burgundy_id, NULL);

  -- Gevrey-Chambertin Premier Cru vineyards
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Clos Saint-Jacques', burgundy_id, gevrey_appellation_id),
    ('Les Cazetiers', burgundy_id, gevrey_appellation_id),
    ('Lavaux Saint-Jacques', burgundy_id, gevrey_appellation_id),
    ('Estournelles Saint-Jacques', burgundy_id, gevrey_appellation_id),
    ('Combe aux Moines', burgundy_id, gevrey_appellation_id),
    ('Petite Chapelle', burgundy_id, gevrey_appellation_id),
    ('Les Corbeaux', burgundy_id, gevrey_appellation_id),
    ('Bel Air', burgundy_id, gevrey_appellation_id),
    ('Champeaux', burgundy_id, gevrey_appellation_id),
    ('Au Closeau', burgundy_id, gevrey_appellation_id);

  -- Morey-Saint-Denis Premier Cru vineyards
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Les Ruchots', burgundy_id, morey_appellation_id),
    ('Les Sorbés', burgundy_id, morey_appellation_id),
    ('Clos Sorbé', burgundy_id, morey_appellation_id),
    ('Les Millandes', burgundy_id, morey_appellation_id),
    ('Le Village', burgundy_id, morey_appellation_id),
    ('Les Faconnières', burgundy_id, morey_appellation_id),
    ('Les Chaffots', burgundy_id, morey_appellation_id),
    ('Les Blanchards', burgundy_id, morey_appellation_id),
    ('Monts Luisants', burgundy_id, morey_appellation_id),
    ('La Riotte', burgundy_id, morey_appellation_id);

  -- Chambolle-Musigny Premier Cru vineyards
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Les Amoureuses', burgundy_id, chambolle_appellation_id),
    ('Les Charmes', burgundy_id, chambolle_appellation_id),
    ('Les Cras', burgundy_id, chambolle_appellation_id),
    ('Les Fuées', burgundy_id, chambolle_appellation_id),
    ('Les Hauts Doix', burgundy_id, chambolle_appellation_id),
    ('Les Sentiers', burgundy_id, chambolle_appellation_id),
    ('Les Baudes', burgundy_id, chambolle_appellation_id),
    ('Aux Beaux Bruns', burgundy_id, chambolle_appellation_id),
    ('Les Plantes', burgundy_id, chambolle_appellation_id),
    ('Les Groseilles', burgundy_id, chambolle_appellation_id);

  -- Vosne-Romanée Premier Cru vineyards
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Les Suchots', burgundy_id, vosne_appellation_id),
    ('Les Beaux Monts', burgundy_id, vosne_appellation_id),
    ('Aux Brûlées', burgundy_id, vosne_appellation_id),
    ('Les Petits Monts', burgundy_id, vosne_appellation_id),
    ('Cros Parantoux', burgundy_id, vosne_appellation_id),
    ('Aux Malconsorts', burgundy_id, vosne_appellation_id),
    ('Les Chaumes', burgundy_id, vosne_appellation_id),
    ('Les Gaudichots', burgundy_id, vosne_appellation_id),
    ('Les Reignots', burgundy_id, vosne_appellation_id),
    ('Au-dessus des Malconsorts', burgundy_id, vosne_appellation_id);

  -- Nuits-Saint-Georges Premier Cru vineyards
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Les Vaucrains', burgundy_id, nsg_appellation_id),
    ('Les Saint-Georges', burgundy_id, nsg_appellation_id),
    ('Les Cailles', burgundy_id, nsg_appellation_id),
    ('Les Porrets-Saint-Georges', burgundy_id, nsg_appellation_id),
    ('Les Pruliers', burgundy_id, nsg_appellation_id),
    ('Aux Boudots', burgundy_id, nsg_appellation_id),
    ('Aux Murgers', burgundy_id, nsg_appellation_id),
    ('Les Damodes', burgundy_id, nsg_appellation_id),
    ('Les Chaignots', burgundy_id, nsg_appellation_id),
    ('Clos de la Maréchale', burgundy_id, nsg_appellation_id),
    ('Clos des Porrets Saint-Georges', burgundy_id, nsg_appellation_id),
    ('Clos Arlot', burgundy_id, nsg_appellation_id);

  -- Beaune Premier Cru vineyards
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Les Grèves', burgundy_id, beaune_appellation_id),
    ('Les Teurons', burgundy_id, beaune_appellation_id),
    ('Clos des Mouches', burgundy_id, beaune_appellation_id),
    ('Les Marconnets', burgundy_id, beaune_appellation_id),
    ('Les Bressandes', burgundy_id, beaune_appellation_id),
    ('Les Cras', burgundy_id, beaune_appellation_id),
    ('Clos du Roi', burgundy_id, beaune_appellation_id),
    ('Les Fèves', burgundy_id, beaune_appellation_id),
    ('Les Cent Vignes', burgundy_id, beaune_appellation_id),
    ('Aux Coucherias', burgundy_id, beaune_appellation_id);

  -- Pommard Premier Cru vineyards
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Les Rugiens', burgundy_id, pommard_appellation_id),
    ('Les Épenots', burgundy_id, pommard_appellation_id),
    ('Clos des Épenots', burgundy_id, pommard_appellation_id),
    ('Les Pézerolles', burgundy_id, pommard_appellation_id),
    ('Les Grands Épenots', burgundy_id, pommard_appellation_id),
    ('Les Petits Épenots', burgundy_id, pommard_appellation_id),
    ('Les Arvelets', burgundy_id, pommard_appellation_id),
    ('Les Charmots', burgundy_id, pommard_appellation_id),
    ('Les Jarolières', burgundy_id, pommard_appellation_id),
    ('Clos de la Commaraine', burgundy_id, pommard_appellation_id);

  -- Volnay Premier Cru vineyards
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Clos des Ducs', burgundy_id, volnay_appellation_id),
    ('Les Caillerets', burgundy_id, volnay_appellation_id),
    ('Taillepieds', burgundy_id, volnay_appellation_id),
    ('Les Champans', burgundy_id, volnay_appellation_id),
    ('Clos des Chênes', burgundy_id, volnay_appellation_id),
    ('Les Santenots', burgundy_id, volnay_appellation_id),
    ('Les Mitans', burgundy_id, volnay_appellation_id),
    ('Les Angles', burgundy_id, volnay_appellation_id),
    ('Les Brouillards', burgundy_id, volnay_appellation_id),
    ('Frémiets', burgundy_id, volnay_appellation_id);

  -- Meursault Premier Cru vineyards
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Les Perrières', burgundy_id, meursault_appellation_id),
    ('Les Charmes', burgundy_id, meursault_appellation_id),
    ('Les Genevrières', burgundy_id, meursault_appellation_id),
    ('Le Porusot', burgundy_id, meursault_appellation_id),
    ('Les Gouttes d''Or', burgundy_id, meursault_appellation_id),
    ('Les Bouchères', burgundy_id, meursault_appellation_id),
    ('Les Cras', burgundy_id, meursault_appellation_id),
    ('Sous le Dos d''Âne', burgundy_id, meursault_appellation_id),
    ('La Pièce sous le Bois', burgundy_id, meursault_appellation_id),
    ('Les Santenots du Milieu', burgundy_id, meursault_appellation_id);

  -- Puligny-Montrachet Premier Cru vineyards
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Les Pucelles', burgundy_id, puligny_appellation_id),
    ('Les Combettes', burgundy_id, puligny_appellation_id),
    ('Les Folatières', burgundy_id, puligny_appellation_id),
    ('Clavoillon', burgundy_id, puligny_appellation_id),
    ('Le Cailleret', burgundy_id, puligny_appellation_id),
    ('Les Demoiselles', burgundy_id, puligny_appellation_id),
    ('Les Perrières', burgundy_id, puligny_appellation_id),
    ('Champ Canet', burgundy_id, puligny_appellation_id),
    ('Les Referts', burgundy_id, puligny_appellation_id),
    ('Sous le Puits', burgundy_id, puligny_appellation_id);

  -- Chassagne-Montrachet Premier Cru vineyards
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Les Ruchottes', burgundy_id, chassagne_appellation_id),
    ('Les Caillerets', burgundy_id, chassagne_appellation_id),
    ('Les Chenevottes', burgundy_id, chassagne_appellation_id),
    ('Les Vergers', burgundy_id, chassagne_appellation_id),
    ('Morgeot', burgundy_id, chassagne_appellation_id),
    ('La Maltroie', burgundy_id, chassagne_appellation_id),
    ('Les Grandes Ruchottes', burgundy_id, chassagne_appellation_id),
    ('En Cailleret', burgundy_id, chassagne_appellation_id),
    ('Les Embrazées', burgundy_id, chassagne_appellation_id),
    ('La Boudriotte', burgundy_id, chassagne_appellation_id);

  -- Grand Cru vineyards (stand-alone entries)
  INSERT INTO vineyards (name, region_id, appellation_id) VALUES
    ('Romanée-Conti', burgundy_id, NULL),
    ('La Tâche', burgundy_id, NULL),
    ('Richebourg', burgundy_id, NULL),
    ('La Romanée', burgundy_id, NULL),
    ('Romanée-Saint-Vivant', burgundy_id, NULL),
    ('La Grande Rue', burgundy_id, NULL),
    ('Chambertin', burgundy_id, NULL),
    ('Chambertin-Clos de Bèze', burgundy_id, NULL),
    ('Clos de Vougeot', burgundy_id, NULL),
    ('Musigny', burgundy_id, NULL),
    ('Bonnes-Mares', burgundy_id, NULL),
    ('Clos de la Roche', burgundy_id, NULL),
    ('Clos Saint-Denis', burgundy_id, NULL),
    ('Clos de Tart', burgundy_id, NULL),
    ('Clos des Lambrays', burgundy_id, NULL),
    ('Échézeaux', burgundy_id, NULL),
    ('Grands Échézeaux', burgundy_id, NULL),
    ('Corton', burgundy_id, NULL),
    ('Corton-Charlemagne', burgundy_id, NULL),
    ('Montrachet', burgundy_id, NULL),
    ('Chevalier-Montrachet', burgundy_id, NULL),
    ('Bâtard-Montrachet', burgundy_id, NULL),
    ('Bienvenues-Bâtard-Montrachet', burgundy_id, NULL),
    ('Criots-Bâtard-Montrachet', burgundy_id, NULL);
END $$;

-- =============================================
-- PRODUCERS (Famous Burgundy Domaines)
-- =============================================
DO $$
DECLARE
  burgundy_id UUID;
BEGIN
  SELECT id INTO burgundy_id FROM regions WHERE name = 'Burgundy';

  INSERT INTO producers (name, region_id) VALUES
    -- Legendary estates
    ('Domaine de la Romanée-Conti', burgundy_id),
    ('Domaine Leroy', burgundy_id),
    ('Domaine d''Auvenay', burgundy_id),
    ('Domaine Armand Rousseau', burgundy_id),
    ('Domaine Georges Roumier', burgundy_id),
    ('Domaine Comte Georges de Vogüé', burgundy_id),
    ('Domaine Leflaive', burgundy_id),
    ('Domaine Coche-Dury', burgundy_id),
    ('Domaine Raveneau', burgundy_id),
    ('Domaine Dauvissat', burgundy_id),
    -- Top Côte de Nuits producers
    ('Domaine Méo-Camuzet', burgundy_id),
    ('Domaine Dujac', burgundy_id),
    ('Domaine Ponsot', burgundy_id),
    ('Domaine Denis Mortet', burgundy_id),
    ('Domaine Dugat-Py', burgundy_id),
    ('Domaine Claude Dugat', burgundy_id),
    ('Domaine Fourrier', burgundy_id),
    ('Domaine Bruno Clair', burgundy_id),
    ('Domaine Henri Gouges', burgundy_id),
    ('Domaine Robert Chevillon', burgundy_id),
    ('Domaine Jean Grivot', burgundy_id),
    ('Domaine Anne Gros', burgundy_id),
    ('Domaine Sylvain Cathiard', burgundy_id),
    ('Domaine Emmanuel Rouget', burgundy_id),
    ('Domaine Thibault Liger-Belair', burgundy_id),
    ('Domaine Georges Mugneret-Gibourg', burgundy_id),
    ('Domaine Perrot-Minot', burgundy_id),
    ('Domaine de la Vougeraie', burgundy_id),
    ('Domaine Louis Jadot', burgundy_id),
    ('Domaine Faiveley', burgundy_id),
    -- Top Côte de Beaune producers
    ('Domaine des Comtes Lafon', burgundy_id),
    ('Domaine Roulot', burgundy_id),
    ('Domaine Pierre-Yves Colin-Morey', burgundy_id),
    ('Domaine Marquis d''Angerville', burgundy_id),
    ('Domaine de Courcel', burgundy_id),
    ('Domaine de Montille', burgundy_id),
    ('Domaine Michel Lafarge', burgundy_id),
    ('Domaine Bonneau du Martray', burgundy_id),
    ('Domaine Sauzet', burgundy_id),
    ('Domaine Paul Pernot', burgundy_id),
    ('Domaine Ramonet', burgundy_id),
    ('Domaine Marc Colin', burgundy_id),
    ('Domaine Fontaine-Gagnard', burgundy_id),
    ('Domaine Jean-Marc Pillot', burgundy_id),
    ('Domaine Bernard Moreau', burgundy_id),
    ('Domaine Hubert Lamy', burgundy_id),
    ('Domaine Simon Bize', burgundy_id),
    -- Chablis producers
    ('Domaine William Fèvre', burgundy_id),
    ('Domaine François Raveneau', burgundy_id),
    ('Domaine Vincent Dauvissat', burgundy_id),
    ('Domaine Christian Moreau', burgundy_id),
    ('Domaine Long-Depaquit', burgundy_id),
    ('Domaine Billaud-Simon', burgundy_id),
    ('Domaine Louis Michel', burgundy_id),
    ('Domaine Jean-Paul & Benoît Droin', burgundy_id),
    ('Domaine Patrick Piuze', burgundy_id),
    -- Négociants
    ('Maison Louis Latour', burgundy_id),
    ('Maison Joseph Drouhin', burgundy_id),
    ('Maison Bouchard Père & Fils', burgundy_id),
    ('Maison Albert Bichot', burgundy_id),
    ('Maison Olivier Leflaive', burgundy_id);
END $$;

-- Verify counts
SELECT 'Colors' as entity, COUNT(*) as count FROM colors
UNION ALL SELECT 'Grapes', COUNT(*) FROM grape_varieties
UNION ALL SELECT 'Regions', COUNT(*) FROM regions
UNION ALL SELECT 'Subregions', COUNT(*) FROM subregions
UNION ALL SELECT 'Communes', COUNT(*) FROM communes
UNION ALL SELECT 'Appellations', COUNT(*) FROM appellations
UNION ALL SELECT 'Vineyards', COUNT(*) FROM vineyards
UNION ALL SELECT 'Crus', COUNT(*) FROM cru_classifications
UNION ALL SELECT 'Producers', COUNT(*) FROM producers
ORDER BY entity;
