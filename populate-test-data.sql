-- Wine Test Data for PDF Export Testing
-- Replace 'YOUR_USER_ID_HERE' with your actual user_id from auth.users
-- You can find your user_id by running: SELECT id FROM auth.users WHERE email = 'your@email.com';

-- Set your user_id here:
DO $$
DECLARE
  test_user_id UUID := 'YOUR_USER_ID_HERE'; -- Replace this!
BEGIN

-- Clear existing test wines (optional - comment out if you want to keep existing wines)
-- DELETE FROM wines WHERE user_id = test_user_id;

-- =============================================
-- RED WINES - Bordeaux
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Château Margaux', 'Château Margaux', 2015, 'Bordeaux', 'Margaux', 'Cabernet Sauvignon', 'Margaux AOC', NULL, 'Premier Grand Cru Classé', 'Red', 2, false, true),
  (test_user_id, 'Château Lafite Rothschild', 'Domaines Barons de Rothschild', 2016, 'Bordeaux', 'Pauillac', 'Cabernet Sauvignon', 'Pauillac AOC', NULL, 'Premier Grand Cru Classé', 'Red', 1, false, true),
  (test_user_id, 'Château Latour', 'Château Latour', 2010, 'Bordeaux', 'Pauillac', 'Cabernet Sauvignon', 'Pauillac AOC', NULL, 'Premier Grand Cru Classé', 'Red', 3, false, true),
  (test_user_id, 'Château Mouton Rothschild', 'Baron Philippe de Rothschild', 2018, 'Bordeaux', 'Pauillac', 'Cabernet Sauvignon', 'Pauillac AOC', NULL, 'Premier Grand Cru Classé', 'Red', 2, false, true),
  (test_user_id, 'Château Haut-Brion', 'Domaine Clarence Dillon', 2017, 'Bordeaux', 'Pessac-Léognan', 'Merlot', 'Pessac-Léognan AOC', NULL, 'Premier Grand Cru Classé', 'Red', 1, false, true),
  (test_user_id, 'Château Pétrus', 'Établissements Jean-Pierre Moueix', 2015, 'Bordeaux', 'Pomerol', 'Merlot', 'Pomerol AOC', NULL, NULL, 'Red', 1, false, true),
  (test_user_id, 'Château Cheval Blanc', 'Château Cheval Blanc', 2016, 'Bordeaux', 'Saint-Émilion', 'Merlot', 'Saint-Émilion Grand Cru AOC', NULL, 'Premier Grand Cru Classé A', 'Red', 2, false, true),
  (test_user_id, 'Château Palmer', 'Château Palmer', 2019, 'Bordeaux', 'Margaux', 'Cabernet Sauvignon', 'Margaux AOC', NULL, 'Troisième Grand Cru Classé', 'Red', 4, false, true),
  (test_user_id, 'Château Léoville Las Cases', 'Château Léoville Las Cases', 2018, 'Bordeaux', 'Saint-Julien', 'Cabernet Sauvignon', 'Saint-Julien AOC', NULL, 'Deuxième Grand Cru Classé', 'Red', 3, false, true),
  (test_user_id, 'Château Ducru-Beaucaillou', 'Château Ducru-Beaucaillou', 2017, 'Bordeaux', 'Saint-Julien', 'Cabernet Sauvignon', 'Saint-Julien AOC', NULL, 'Deuxième Grand Cru Classé', 'Red', 2, false, true);

-- =============================================
-- RED WINES - Burgundy
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Romanée-Conti', 'Domaine de la Romanée-Conti', 2018, 'Burgundy', 'Côte de Nuits', 'Pinot Noir', 'Romanée-Conti Grand Cru AOC', 'Romanée-Conti', 'Grand Cru', 'Red', 1, false, true),
  (test_user_id, 'La Tâche', 'Domaine de la Romanée-Conti', 2017, 'Burgundy', 'Côte de Nuits', 'Pinot Noir', 'La Tâche Grand Cru AOC', 'La Tâche', 'Grand Cru', 'Red', 1, false, true),
  (test_user_id, 'Richebourg', 'Domaine de la Romanée-Conti', 2019, 'Burgundy', 'Côte de Nuits', 'Pinot Noir', 'Richebourg Grand Cru AOC', 'Richebourg', 'Grand Cru', 'Red', 2, false, true),
  (test_user_id, 'Chambertin', 'Domaine Armand Rousseau', 2018, 'Burgundy', 'Côte de Nuits', 'Pinot Noir', 'Chambertin Grand Cru AOC', 'Chambertin', 'Grand Cru', 'Red', 2, false, true),
  (test_user_id, 'Clos de Vougeot', 'Domaine Méo-Camuzet', 2019, 'Burgundy', 'Côte de Nuits', 'Pinot Noir', 'Clos de Vougeot Grand Cru AOC', 'Clos de Vougeot', 'Grand Cru', 'Red', 3, false, true),
  (test_user_id, 'Gevrey-Chambertin Les Cazetiers', 'Domaine Bruno Clair', 2020, 'Burgundy', 'Côte de Nuits', 'Pinot Noir', 'Gevrey-Chambertin Premier Cru AOC', 'Les Cazetiers', 'Premier Cru', 'Red', 4, false, true),
  (test_user_id, 'Nuits-Saint-Georges Les Vaucrains', 'Domaine Henri Gouges', 2019, 'Burgundy', 'Côte de Nuits', 'Pinot Noir', 'Nuits-Saint-Georges Premier Cru AOC', 'Les Vaucrains', 'Premier Cru', 'Red', 3, false, true),
  (test_user_id, 'Volnay Clos des Ducs', 'Domaine Marquis d''Angerville', 2020, 'Burgundy', 'Côte de Beaune', 'Pinot Noir', 'Volnay Premier Cru AOC', 'Clos des Ducs', 'Premier Cru', 'Red', 4, false, true),
  (test_user_id, 'Pommard Les Rugiens', 'Domaine de Courcel', 2018, 'Burgundy', 'Côte de Beaune', 'Pinot Noir', 'Pommard Premier Cru AOC', 'Les Rugiens', 'Premier Cru', 'Red', 2, false, true);

-- =============================================
-- RED WINES - Rhône Valley
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Hermitage La Chapelle', 'Paul Jaboulet Aîné', 2017, 'Rhône Valley', 'Northern Rhône', 'Syrah', 'Hermitage AOC', 'La Chapelle', NULL, 'Red', 3, false, true),
  (test_user_id, 'Côte-Rôtie La Landonne', 'E. Guigal', 2016, 'Rhône Valley', 'Northern Rhône', 'Syrah', 'Côte-Rôtie AOC', 'La Landonne', NULL, 'Red', 2, false, true),
  (test_user_id, 'Côte-Rôtie La Mouline', 'E. Guigal', 2017, 'Rhône Valley', 'Northern Rhône', 'Syrah', 'Côte-Rôtie AOC', 'La Mouline', NULL, 'Red', 2, false, true),
  (test_user_id, 'Châteauneuf-du-Pape', 'Château de Beaucastel', 2019, 'Rhône Valley', 'Southern Rhône', 'Grenache', 'Châteauneuf-du-Pape AOC', NULL, NULL, 'Red', 6, false, true),
  (test_user_id, 'Châteauneuf-du-Pape Réserve des Célestins', 'Domaine Henri Bonneau', 2015, 'Rhône Valley', 'Southern Rhône', 'Grenache', 'Châteauneuf-du-Pape AOC', NULL, NULL, 'Red', 1, false, true),
  (test_user_id, 'Gigondas', 'Domaine Santa Duc', 2020, 'Rhône Valley', 'Southern Rhône', 'Grenache', 'Gigondas AOC', NULL, NULL, 'Red', 5, false, true);

-- =============================================
-- RED WINES - Loire Valley
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Chinon Les Picasses', 'Domaine Olga Raffault', 2020, 'Loire Valley', 'Touraine', 'Cabernet Franc', 'Chinon AOC', 'Les Picasses', NULL, 'Red', 6, false, true),
  (test_user_id, 'Bourgueil La Coudraye', 'Domaine Yannick Amirault', 2021, 'Loire Valley', 'Touraine', 'Cabernet Franc', 'Bourgueil AOC', 'La Coudraye', NULL, 'Red', 4, false, true),
  (test_user_id, 'Saumur-Champigny Le Bourg', 'Clos Rougeard', 2018, 'Loire Valley', 'Anjou-Saumur', 'Cabernet Franc', 'Saumur-Champigny AOC', 'Le Bourg', NULL, 'Red', 2, false, true);

-- =============================================
-- WHITE WINES - Burgundy
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Montrachet', 'Domaine de la Romanée-Conti', 2019, 'Burgundy', 'Côte de Beaune', 'Chardonnay', 'Montrachet Grand Cru AOC', 'Montrachet', 'Grand Cru', 'White', 1, false, true),
  (test_user_id, 'Bâtard-Montrachet', 'Domaine Leflaive', 2020, 'Burgundy', 'Côte de Beaune', 'Chardonnay', 'Bâtard-Montrachet Grand Cru AOC', 'Bâtard-Montrachet', 'Grand Cru', 'White', 2, false, true),
  (test_user_id, 'Chevalier-Montrachet', 'Domaine Leflaive', 2019, 'Burgundy', 'Côte de Beaune', 'Chardonnay', 'Chevalier-Montrachet Grand Cru AOC', 'Chevalier-Montrachet', 'Grand Cru', 'White', 2, false, true),
  (test_user_id, 'Corton-Charlemagne', 'Domaine Bonneau du Martray', 2020, 'Burgundy', 'Côte de Beaune', 'Chardonnay', 'Corton-Charlemagne Grand Cru AOC', 'Corton-Charlemagne', 'Grand Cru', 'White', 3, false, true),
  (test_user_id, 'Meursault Les Perrières', 'Domaine des Comtes Lafon', 2020, 'Burgundy', 'Côte de Beaune', 'Chardonnay', 'Meursault Premier Cru AOC', 'Les Perrières', 'Premier Cru', 'White', 4, false, true),
  (test_user_id, 'Puligny-Montrachet Les Pucelles', 'Domaine Leflaive', 2021, 'Burgundy', 'Côte de Beaune', 'Chardonnay', 'Puligny-Montrachet Premier Cru AOC', 'Les Pucelles', 'Premier Cru', 'White', 3, false, true),
  (test_user_id, 'Chablis Grand Cru Les Clos', 'Domaine William Fèvre', 2021, 'Burgundy', 'Chablis', 'Chardonnay', 'Chablis Grand Cru AOC', 'Les Clos', 'Grand Cru', 'White', 4, false, true),
  (test_user_id, 'Chablis Grand Cru Vaudésir', 'Domaine Raveneau', 2020, 'Burgundy', 'Chablis', 'Chardonnay', 'Chablis Grand Cru AOC', 'Vaudésir', 'Grand Cru', 'White', 2, false, true);

-- =============================================
-- WHITE WINES - Loire Valley
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Sancerre Les Monts Damnés', 'Domaine François Cotat', 2022, 'Loire Valley', 'Centre-Loire', 'Sauvignon Blanc', 'Sancerre AOC', 'Les Monts Damnés', NULL, 'White', 6, false, true),
  (test_user_id, 'Pouilly-Fumé Silex', 'Domaine Didier Dagueneau', 2021, 'Loire Valley', 'Centre-Loire', 'Sauvignon Blanc', 'Pouilly-Fumé AOC', 'Silex', NULL, 'White', 3, false, true),
  (test_user_id, 'Vouvray Clos du Bourg Sec', 'Domaine Huet', 2021, 'Loire Valley', 'Touraine', 'Chenin Blanc', 'Vouvray AOC', 'Clos du Bourg', NULL, 'White', 4, false, true),
  (test_user_id, 'Savennières Coulée de Serrant', 'Nicolas Joly', 2020, 'Loire Valley', 'Anjou-Saumur', 'Chenin Blanc', 'Savennières AOC', 'Coulée de Serrant', NULL, 'White', 2, false, true),
  (test_user_id, 'Muscadet Sèvre et Maine Granite', 'Domaine de l''Écu', 2022, 'Loire Valley', 'Pays Nantais', 'Melon de Bourgogne', 'Muscadet Sèvre et Maine AOC', 'Granite', NULL, 'White', 8, false, true);

-- =============================================
-- WHITE WINES - Alsace
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Riesling Grand Cru Schlossberg', 'Domaine Weinbach', 2021, 'Alsace', NULL, 'Riesling', 'Alsace Grand Cru AOC', 'Schlossberg', 'Grand Cru', 'White', 4, false, true),
  (test_user_id, 'Riesling Grand Cru Rangen', 'Domaine Zind-Humbrecht', 2020, 'Alsace', NULL, 'Riesling', 'Alsace Grand Cru AOC', 'Rangen', 'Grand Cru', 'White', 3, false, true),
  (test_user_id, 'Gewurztraminer Grand Cru Hengst', 'Domaine Josmeyer', 2021, 'Alsace', NULL, 'Gewurztraminer', 'Alsace Grand Cru AOC', 'Hengst', 'Grand Cru', 'White', 3, false, true),
  (test_user_id, 'Pinot Gris Grand Cru Brand', 'Domaine Albert Boxler', 2020, 'Alsace', NULL, 'Pinot Gris', 'Alsace Grand Cru AOC', 'Brand', 'Grand Cru', 'White', 2, false, true);

-- =============================================
-- WHITE WINES - Rhône Valley
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Condrieu La Doriane', 'E. Guigal', 2021, 'Rhône Valley', 'Northern Rhône', 'Viognier', 'Condrieu AOC', 'La Doriane', NULL, 'White', 3, false, true),
  (test_user_id, 'Hermitage Blanc', 'Domaine Jean-Louis Chave', 2019, 'Rhône Valley', 'Northern Rhône', 'Marsanne', 'Hermitage AOC', NULL, NULL, 'White', 2, false, true),
  (test_user_id, 'Châteauneuf-du-Pape Blanc Roussanne Vieilles Vignes', 'Château de Beaucastel', 2021, 'Rhône Valley', 'Southern Rhône', 'Roussanne', 'Châteauneuf-du-Pape AOC', NULL, NULL, 'White', 3, false, true);

-- =============================================
-- ROSÉ WINES
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Bandol Rosé', 'Domaine Tempier', 2023, 'Provence', 'Bandol', 'Mourvèdre', 'Bandol AOC', NULL, NULL, 'Rosé', 6, false, true),
  (test_user_id, 'Côtes de Provence Rosé', 'Château d''Esclans Whispering Angel', 2023, 'Provence', NULL, 'Grenache', 'Côtes de Provence AOC', NULL, NULL, 'Rosé', 12, false, true),
  (test_user_id, 'Tavel', 'Domaine de la Mordorée', 2023, 'Rhône Valley', 'Southern Rhône', 'Grenache', 'Tavel AOC', NULL, NULL, 'Rosé', 6, false, true),
  (test_user_id, 'Marsannay Rosé', 'Domaine Bruno Clair', 2022, 'Burgundy', 'Côte de Nuits', 'Pinot Noir', 'Marsannay AOC', NULL, NULL, 'Rosé', 4, false, true),
  (test_user_id, 'Rosé de Loire', 'Domaine des Baumard', 2023, 'Loire Valley', 'Anjou-Saumur', 'Cabernet Franc', 'Rosé de Loire AOC', NULL, NULL, 'Rosé', 8, false, true);

-- =============================================
-- SPARKLING WINES - Champagne
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Dom Pérignon', 'Moët & Chandon', 2013, 'Champagne', NULL, 'Chardonnay', 'Champagne AOC', NULL, NULL, 'Sparkling', 3, false, true),
  (test_user_id, 'Cristal', 'Louis Roederer', 2015, 'Champagne', NULL, 'Chardonnay', 'Champagne AOC', NULL, NULL, 'Sparkling', 2, false, true),
  (test_user_id, 'Krug Grande Cuvée', 'Krug', NULL, 'Champagne', NULL, 'Pinot Noir', 'Champagne AOC', NULL, NULL, 'Sparkling', 4, false, true),
  (test_user_id, 'Salon Le Mesnil', 'Salon', 2012, 'Champagne', 'Côte des Blancs', 'Chardonnay', 'Champagne AOC', 'Le Mesnil-sur-Oger', 'Grand Cru', 'Sparkling', 1, false, true),
  (test_user_id, 'Bollinger R.D.', 'Bollinger', 2008, 'Champagne', NULL, 'Pinot Noir', 'Champagne AOC', NULL, NULL, 'Sparkling', 2, false, true),
  (test_user_id, 'Comtes de Champagne Blanc de Blancs', 'Taittinger', 2012, 'Champagne', NULL, 'Chardonnay', 'Champagne AOC', NULL, NULL, 'Sparkling', 3, false, true),
  (test_user_id, 'La Grande Dame', 'Veuve Clicquot', 2015, 'Champagne', NULL, 'Pinot Noir', 'Champagne AOC', NULL, NULL, 'Sparkling', 2, false, true),
  (test_user_id, 'Clos du Mesnil', 'Krug', 2006, 'Champagne', 'Côte des Blancs', 'Chardonnay', 'Champagne AOC', 'Clos du Mesnil', NULL, 'Sparkling', 1, false, true);

-- =============================================
-- SPARKLING WINES - Crémant
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Crémant de Bourgogne Blanc de Blancs', 'Domaine Bailly-Lapierre', 2021, 'Burgundy', NULL, 'Chardonnay', 'Crémant de Bourgogne AOC', NULL, NULL, 'Sparkling', 6, false, true),
  (test_user_id, 'Crémant d''Alsace Brut', 'Domaine Albert Mann', 2022, 'Alsace', NULL, 'Pinot Blanc', 'Crémant d''Alsace AOC', NULL, NULL, 'Sparkling', 6, false, true),
  (test_user_id, 'Crémant de Loire Brut', 'Domaine Langlois-Château', 2021, 'Loire Valley', NULL, 'Chenin Blanc', 'Crémant de Loire AOC', NULL, NULL, 'Sparkling', 8, false, true);

-- =============================================
-- DESSERT WINES
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Château d''Yquem', 'Château d''Yquem', 2017, 'Bordeaux', 'Sauternes', 'Sémillon', 'Sauternes AOC', NULL, 'Premier Cru Supérieur', 'Dessert', 2, false, true),
  (test_user_id, 'Château Climens', 'Château Climens', 2018, 'Bordeaux', 'Barsac', 'Sémillon', 'Barsac AOC', NULL, 'Premier Grand Cru Classé', 'Dessert', 3, false, true),
  (test_user_id, 'Château Suduiraut', 'Château Suduiraut', 2019, 'Bordeaux', 'Sauternes', 'Sémillon', 'Sauternes AOC', NULL, 'Premier Grand Cru Classé', 'Dessert', 2, false, true),
  (test_user_id, 'Vouvray Moelleux Clos du Bourg', 'Domaine Huet', 2020, 'Loire Valley', 'Touraine', 'Chenin Blanc', 'Vouvray AOC', 'Clos du Bourg', NULL, 'Dessert', 3, false, true),
  (test_user_id, 'Coteaux du Layon Chaume', 'Domaine des Baumard', 2019, 'Loire Valley', 'Anjou-Saumur', 'Chenin Blanc', 'Coteaux du Layon AOC', 'Chaume', NULL, 'Dessert', 4, false, true),
  (test_user_id, 'Gewurztraminer Vendanges Tardives', 'Domaine Zind-Humbrecht', 2020, 'Alsace', NULL, 'Gewurztraminer', 'Alsace AOC', NULL, 'Vendanges Tardives', 'Dessert', 2, false, true),
  (test_user_id, 'Riesling Sélection de Grains Nobles', 'Domaine Weinbach', 2018, 'Alsace', NULL, 'Riesling', 'Alsace AOC', NULL, 'Sélection de Grains Nobles', 'Dessert', 1, false, true);

-- =============================================
-- ORANGE WINES
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Vin de France Orange', 'Domaine de la Garrelière', 2022, 'Loire Valley', 'Touraine', 'Chenin Blanc', NULL, NULL, NULL, 'Orange', 4, false, true),
  (test_user_id, 'Alsace Pinot Gris Macération', 'Domaine Patrick Meyer', 2021, 'Alsace', NULL, 'Pinot Gris', 'Alsace AOC', NULL, NULL, 'Orange', 3, false, true),
  (test_user_id, 'Vin de France Les Fesses', 'Domaine Matassa', 2022, 'Languedoc-Roussillon', 'Roussillon', 'Grenache Gris', NULL, NULL, NULL, 'Orange', 2, false, true);

-- =============================================
-- NON-FRENCH WINES (for variety)
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Barolo Monfortino Riserva', 'Giacomo Conterno', 2015, 'Piedmont', 'Barolo', 'Nebbiolo', 'Barolo DOCG', NULL, NULL, 'Red', 1, false, true),
  (test_user_id, 'Sassicaia', 'Tenuta San Guido', 2019, 'Tuscany', 'Bolgheri', 'Cabernet Sauvignon', 'Bolgheri Sassicaia DOC', NULL, NULL, 'Red', 2, false, true),
  (test_user_id, 'Opus One', 'Opus One Winery', 2019, 'Napa Valley', 'Oakville', 'Cabernet Sauvignon', NULL, NULL, NULL, 'Red', 2, false, true),
  (test_user_id, 'Vega Sicilia Único', 'Bodegas Vega Sicilia', 2011, 'Ribera del Duero', NULL, 'Tempranillo', 'Ribera del Duero DO', NULL, NULL, 'Red', 1, false, true);

END $$;

-- Verify the insert
-- SELECT color, COUNT(*) as count FROM wines GROUP BY color ORDER BY color;
