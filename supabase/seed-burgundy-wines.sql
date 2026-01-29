-- Burgundy Test Wine Data
-- Run this AFTER seed-burgundy-schema.sql and the commune migration
-- Replace 'YOUR_USER_ID_HERE' with your actual user_id

DO $$
DECLARE
  test_user_id UUID := 'YOUR_USER_ID_HERE'; -- Replace this!
BEGIN

-- Optional: Clear existing wines for this user
-- DELETE FROM wines WHERE user_id = test_user_id;

-- =============================================
-- RED WINES - CÔTE DE NUITS - GRAND CRUS
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  -- Domaine de la Romanée-Conti
  (test_user_id, 'Romanée-Conti', 'Domaine de la Romanée-Conti', 2019, 'Burgundy', 'Côte de Nuits', 'Vosne-Romanée', 'Pinot Noir', 'Romanée-Conti AOC', 'Romanée-Conti', 'Grand Cru', 'Red', 1, false, true),
  (test_user_id, 'La Tâche', 'Domaine de la Romanée-Conti', 2019, 'Burgundy', 'Côte de Nuits', 'Vosne-Romanée', 'Pinot Noir', 'La Tâche AOC', 'La Tâche', 'Grand Cru', 'Red', 1, false, true),
  (test_user_id, 'Richebourg', 'Domaine de la Romanée-Conti', 2018, 'Burgundy', 'Côte de Nuits', 'Vosne-Romanée', 'Pinot Noir', 'Richebourg AOC', 'Richebourg', 'Grand Cru', 'Red', 2, false, true),
  (test_user_id, 'Romanée-Saint-Vivant', 'Domaine de la Romanée-Conti', 2019, 'Burgundy', 'Côte de Nuits', 'Vosne-Romanée', 'Pinot Noir', 'Romanée-Saint-Vivant AOC', 'Romanée-Saint-Vivant', 'Grand Cru', 'Red', 1, false, true),
  (test_user_id, 'Grands Échézeaux', 'Domaine de la Romanée-Conti', 2018, 'Burgundy', 'Côte de Nuits', 'Flagey-Echézeaux', 'Pinot Noir', 'Grands Échézeaux AOC', 'Grands Échézeaux', 'Grand Cru', 'Red', 2, false, true),
  (test_user_id, 'Échézeaux', 'Domaine de la Romanée-Conti', 2019, 'Burgundy', 'Côte de Nuits', 'Flagey-Echézeaux', 'Pinot Noir', 'Échézeaux AOC', 'Échézeaux', 'Grand Cru', 'Red', 2, false, true),

  -- Domaine Leroy
  (test_user_id, 'Richebourg', 'Domaine Leroy', 2017, 'Burgundy', 'Côte de Nuits', 'Vosne-Romanée', 'Pinot Noir', 'Richebourg AOC', 'Richebourg', 'Grand Cru', 'Red', 1, false, true),
  (test_user_id, 'Romanée-Saint-Vivant', 'Domaine Leroy', 2018, 'Burgundy', 'Côte de Nuits', 'Vosne-Romanée', 'Pinot Noir', 'Romanée-Saint-Vivant AOC', 'Romanée-Saint-Vivant', 'Grand Cru', 'Red', 1, false, true),
  (test_user_id, 'Clos de Vougeot', 'Domaine Leroy', 2019, 'Burgundy', 'Côte de Nuits', 'Vougeot', 'Pinot Noir', 'Clos de Vougeot AOC', 'Clos de Vougeot', 'Grand Cru', 'Red', 1, false, true),
  (test_user_id, 'Musigny', 'Domaine Leroy', 2017, 'Burgundy', 'Côte de Nuits', 'Chambolle-Musigny', 'Pinot Noir', 'Musigny AOC', 'Musigny', 'Grand Cru', 'Red', 1, false, true),

  -- Gevrey-Chambertin Grand Crus
  (test_user_id, 'Chambertin', 'Domaine Armand Rousseau', 2019, 'Burgundy', 'Côte de Nuits', 'Gevrey-Chambertin', 'Pinot Noir', 'Chambertin AOC', 'Chambertin', 'Grand Cru', 'Red', 2, false, true),
  (test_user_id, 'Chambertin-Clos de Bèze', 'Domaine Armand Rousseau', 2018, 'Burgundy', 'Côte de Nuits', 'Gevrey-Chambertin', 'Pinot Noir', 'Chambertin-Clos de Bèze AOC', 'Chambertin-Clos de Bèze', 'Grand Cru', 'Red', 2, false, true),
  (test_user_id, 'Charmes-Chambertin', 'Domaine Dugat-Py', 2020, 'Burgundy', 'Côte de Nuits', 'Gevrey-Chambertin', 'Pinot Noir', 'Charmes-Chambertin AOC', NULL, 'Grand Cru', 'Red', 3, false, true),
  (test_user_id, 'Mazis-Chambertin', 'Domaine Faiveley', 2019, 'Burgundy', 'Côte de Nuits', 'Gevrey-Chambertin', 'Pinot Noir', 'Mazis-Chambertin AOC', NULL, 'Grand Cru', 'Red', 2, false, true),

  -- Morey-Saint-Denis Grand Crus
  (test_user_id, 'Clos de la Roche', 'Domaine Dujac', 2019, 'Burgundy', 'Côte de Nuits', 'Morey-Saint-Denis', 'Pinot Noir', 'Clos de la Roche AOC', 'Clos de la Roche', 'Grand Cru', 'Red', 2, false, true),
  (test_user_id, 'Clos Saint-Denis', 'Domaine Dujac', 2018, 'Burgundy', 'Côte de Nuits', 'Morey-Saint-Denis', 'Pinot Noir', 'Clos Saint-Denis AOC', 'Clos Saint-Denis', 'Grand Cru', 'Red', 2, false, true),
  (test_user_id, 'Clos de Tart', 'Domaine du Clos de Tart', 2019, 'Burgundy', 'Côte de Nuits', 'Morey-Saint-Denis', 'Pinot Noir', 'Clos de Tart AOC', 'Clos de Tart', 'Grand Cru', 'Red', 1, false, true),
  (test_user_id, 'Clos des Lambrays', 'Domaine des Lambrays', 2020, 'Burgundy', 'Côte de Nuits', 'Morey-Saint-Denis', 'Pinot Noir', 'Clos des Lambrays AOC', 'Clos des Lambrays', 'Grand Cru', 'Red', 2, false, true),

  -- Chambolle-Musigny Grand Crus
  (test_user_id, 'Musigny', 'Domaine Comte Georges de Vogüé', 2019, 'Burgundy', 'Côte de Nuits', 'Chambolle-Musigny', 'Pinot Noir', 'Musigny AOC', 'Musigny', 'Grand Cru', 'Red', 1, false, true),
  (test_user_id, 'Bonnes-Mares', 'Domaine Georges Roumier', 2018, 'Burgundy', 'Côte de Nuits', 'Chambolle-Musigny', 'Pinot Noir', 'Bonnes-Mares AOC', 'Bonnes-Mares', 'Grand Cru', 'Red', 1, false, true),
  (test_user_id, 'Bonnes-Mares', 'Domaine Comte Georges de Vogüé', 2019, 'Burgundy', 'Côte de Nuits', 'Chambolle-Musigny', 'Pinot Noir', 'Bonnes-Mares AOC', 'Bonnes-Mares', 'Grand Cru', 'Red', 2, false, true),

  -- Vougeot Grand Cru
  (test_user_id, 'Clos de Vougeot', 'Domaine Méo-Camuzet', 2019, 'Burgundy', 'Côte de Nuits', 'Vougeot', 'Pinot Noir', 'Clos de Vougeot AOC', 'Clos de Vougeot', 'Grand Cru', 'Red', 3, false, true),
  (test_user_id, 'Clos de Vougeot', 'Domaine Jean Grivot', 2020, 'Burgundy', 'Côte de Nuits', 'Vougeot', 'Pinot Noir', 'Clos de Vougeot AOC', 'Clos de Vougeot', 'Grand Cru', 'Red', 2, false, true);

-- =============================================
-- RED WINES - CÔTE DE NUITS - PREMIER CRUS
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  -- Gevrey-Chambertin Premier Crus
  (test_user_id, 'Gevrey-Chambertin Clos Saint-Jacques', 'Domaine Armand Rousseau', 2020, 'Burgundy', 'Côte de Nuits', 'Gevrey-Chambertin', 'Pinot Noir', 'Gevrey-Chambertin AOC', 'Clos Saint-Jacques', 'Premier Cru', 'Red', 2, false, true),
  (test_user_id, 'Gevrey-Chambertin Les Cazetiers', 'Domaine Bruno Clair', 2019, 'Burgundy', 'Côte de Nuits', 'Gevrey-Chambertin', 'Pinot Noir', 'Gevrey-Chambertin AOC', 'Les Cazetiers', 'Premier Cru', 'Red', 4, false, true),
  (test_user_id, 'Gevrey-Chambertin Lavaux Saint-Jacques', 'Domaine Denis Mortet', 2020, 'Burgundy', 'Côte de Nuits', 'Gevrey-Chambertin', 'Pinot Noir', 'Gevrey-Chambertin AOC', 'Lavaux Saint-Jacques', 'Premier Cru', 'Red', 3, false, true),

  -- Chambolle-Musigny Premier Crus
  (test_user_id, 'Chambolle-Musigny Les Amoureuses', 'Domaine Georges Roumier', 2019, 'Burgundy', 'Côte de Nuits', 'Chambolle-Musigny', 'Pinot Noir', 'Chambolle-Musigny AOC', 'Les Amoureuses', 'Premier Cru', 'Red', 1, false, true),
  (test_user_id, 'Chambolle-Musigny Les Amoureuses', 'Domaine Comte Georges de Vogüé', 2020, 'Burgundy', 'Côte de Nuits', 'Chambolle-Musigny', 'Pinot Noir', 'Chambolle-Musigny AOC', 'Les Amoureuses', 'Premier Cru', 'Red', 2, false, true),
  (test_user_id, 'Chambolle-Musigny Les Cras', 'Domaine Georges Roumier', 2020, 'Burgundy', 'Côte de Nuits', 'Chambolle-Musigny', 'Pinot Noir', 'Chambolle-Musigny AOC', 'Les Cras', 'Premier Cru', 'Red', 2, false, true),

  -- Vosne-Romanée Premier Crus
  (test_user_id, 'Vosne-Romanée Cros Parantoux', 'Domaine Emmanuel Rouget', 2019, 'Burgundy', 'Côte de Nuits', 'Vosne-Romanée', 'Pinot Noir', 'Vosne-Romanée AOC', 'Cros Parantoux', 'Premier Cru', 'Red', 1, false, true),
  (test_user_id, 'Vosne-Romanée Les Suchots', 'Domaine de la Romanée-Conti', 2018, 'Burgundy', 'Côte de Nuits', 'Vosne-Romanée', 'Pinot Noir', 'Vosne-Romanée AOC', 'Les Suchots', 'Premier Cru', 'Red', 2, false, true),
  (test_user_id, 'Vosne-Romanée Aux Malconsorts', 'Domaine Sylvain Cathiard', 2020, 'Burgundy', 'Côte de Nuits', 'Vosne-Romanée', 'Pinot Noir', 'Vosne-Romanée AOC', 'Aux Malconsorts', 'Premier Cru', 'Red', 2, false, true),
  (test_user_id, 'Vosne-Romanée Les Beaux Monts', 'Domaine Leroy', 2019, 'Burgundy', 'Côte de Nuits', 'Vosne-Romanée', 'Pinot Noir', 'Vosne-Romanée AOC', 'Les Beaux Monts', 'Premier Cru', 'Red', 1, false, true),

  -- Nuits-Saint-Georges Premier Crus
  (test_user_id, 'Nuits-Saint-Georges Les Vaucrains', 'Domaine Henri Gouges', 2019, 'Burgundy', 'Côte de Nuits', 'Nuits-Saint-Georges', 'Pinot Noir', 'Nuits-Saint-Georges AOC', 'Les Vaucrains', 'Premier Cru', 'Red', 3, false, true),
  (test_user_id, 'Nuits-Saint-Georges Les Saint-Georges', 'Domaine Henri Gouges', 2020, 'Burgundy', 'Côte de Nuits', 'Nuits-Saint-Georges', 'Pinot Noir', 'Nuits-Saint-Georges AOC', 'Les Saint-Georges', 'Premier Cru', 'Red', 3, false, true),
  (test_user_id, 'Nuits-Saint-Georges Les Cailles', 'Domaine Robert Chevillon', 2019, 'Burgundy', 'Côte de Nuits', 'Nuits-Saint-Georges', 'Pinot Noir', 'Nuits-Saint-Georges AOC', 'Les Cailles', 'Premier Cru', 'Red', 4, false, true),
  (test_user_id, 'Nuits-Saint-Georges Clos de la Maréchale', 'Domaine Faiveley', 2020, 'Burgundy', 'Côte de Nuits', 'Nuits-Saint-Georges', 'Pinot Noir', 'Nuits-Saint-Georges AOC', 'Clos de la Maréchale', 'Premier Cru', 'Red', 6, false, true);

-- =============================================
-- RED WINES - CÔTE DE NUITS - VILLAGE
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Gevrey-Chambertin', 'Domaine Fourrier', 2021, 'Burgundy', 'Côte de Nuits', 'Gevrey-Chambertin', 'Pinot Noir', 'Gevrey-Chambertin AOC', NULL, 'Village', 'Red', 6, false, true),
  (test_user_id, 'Chambolle-Musigny', 'Domaine Georges Roumier', 2021, 'Burgundy', 'Côte de Nuits', 'Chambolle-Musigny', 'Pinot Noir', 'Chambolle-Musigny AOC', NULL, 'Village', 'Red', 4, false, true),
  (test_user_id, 'Vosne-Romanée', 'Domaine Sylvain Cathiard', 2021, 'Burgundy', 'Côte de Nuits', 'Vosne-Romanée', 'Pinot Noir', 'Vosne-Romanée AOC', NULL, 'Village', 'Red', 4, false, true),
  (test_user_id, 'Nuits-Saint-Georges', 'Domaine de la Vougeraie', 2021, 'Burgundy', 'Côte de Nuits', 'Nuits-Saint-Georges', 'Pinot Noir', 'Nuits-Saint-Georges AOC', NULL, 'Village', 'Red', 6, false, true),
  (test_user_id, 'Morey-Saint-Denis', 'Domaine Dujac', 2021, 'Burgundy', 'Côte de Nuits', 'Morey-Saint-Denis', 'Pinot Noir', 'Morey-Saint-Denis AOC', NULL, 'Village', 'Red', 4, false, true),
  (test_user_id, 'Fixin', 'Domaine Bruno Clair', 2020, 'Burgundy', 'Côte de Nuits', 'Fixin', 'Pinot Noir', 'Fixin AOC', NULL, 'Village', 'Red', 6, false, true),
  (test_user_id, 'Marsannay Rouge', 'Domaine Bruno Clair', 2021, 'Burgundy', 'Côte de Nuits', 'Marsannay-la-Côte', 'Pinot Noir', 'Marsannay AOC', NULL, 'Village', 'Red', 8, false, true);

-- =============================================
-- RED WINES - CÔTE DE BEAUNE - GRAND CRUS
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Corton Le Corton', 'Domaine Bonneau du Martray', 2019, 'Burgundy', 'Côte de Beaune', 'Aloxe-Corton', 'Pinot Noir', 'Corton AOC', 'Corton', 'Grand Cru', 'Red', 3, false, true),
  (test_user_id, 'Corton Bressandes', 'Domaine Tollot-Beaut', 2020, 'Burgundy', 'Côte de Beaune', 'Aloxe-Corton', 'Pinot Noir', 'Corton AOC', NULL, 'Grand Cru', 'Red', 4, false, true),
  (test_user_id, 'Corton Clos du Roi', 'Domaine de la Pousse d''Or', 2019, 'Burgundy', 'Côte de Beaune', 'Aloxe-Corton', 'Pinot Noir', 'Corton AOC', 'Clos du Roi', 'Grand Cru', 'Red', 2, false, true);

-- =============================================
-- RED WINES - CÔTE DE BEAUNE - PREMIER CRUS
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  -- Beaune Premier Crus
  (test_user_id, 'Beaune Grèves', 'Domaine de la Vougeraie', 2020, 'Burgundy', 'Côte de Beaune', 'Beaune', 'Pinot Noir', 'Beaune AOC', 'Les Grèves', 'Premier Cru', 'Red', 4, false, true),
  (test_user_id, 'Beaune Clos des Mouches', 'Maison Joseph Drouhin', 2019, 'Burgundy', 'Côte de Beaune', 'Beaune', 'Pinot Noir', 'Beaune AOC', 'Clos des Mouches', 'Premier Cru', 'Red', 3, false, true),

  -- Pommard Premier Crus
  (test_user_id, 'Pommard Les Rugiens', 'Domaine de Courcel', 2019, 'Burgundy', 'Côte de Beaune', 'Pommard', 'Pinot Noir', 'Pommard AOC', 'Les Rugiens', 'Premier Cru', 'Red', 3, false, true),
  (test_user_id, 'Pommard Les Épenots', 'Domaine de Montille', 2020, 'Burgundy', 'Côte de Beaune', 'Pommard', 'Pinot Noir', 'Pommard AOC', 'Les Épenots', 'Premier Cru', 'Red', 4, false, true),
  (test_user_id, 'Pommard Clos des Épenots', 'Domaine de Courcel', 2018, 'Burgundy', 'Côte de Beaune', 'Pommard', 'Pinot Noir', 'Pommard AOC', 'Clos des Épenots', 'Premier Cru', 'Red', 2, false, true),

  -- Volnay Premier Crus
  (test_user_id, 'Volnay Clos des Ducs', 'Domaine Marquis d''Angerville', 2019, 'Burgundy', 'Côte de Beaune', 'Volnay', 'Pinot Noir', 'Volnay AOC', 'Clos des Ducs', 'Premier Cru', 'Red', 2, false, true),
  (test_user_id, 'Volnay Taillepieds', 'Domaine Marquis d''Angerville', 2020, 'Burgundy', 'Côte de Beaune', 'Volnay', 'Pinot Noir', 'Volnay AOC', 'Taillepieds', 'Premier Cru', 'Red', 3, false, true),
  (test_user_id, 'Volnay Caillerets', 'Domaine de Montille', 2019, 'Burgundy', 'Côte de Beaune', 'Volnay', 'Pinot Noir', 'Volnay AOC', 'Les Caillerets', 'Premier Cru', 'Red', 3, false, true),
  (test_user_id, 'Volnay Champans', 'Domaine Michel Lafarge', 2020, 'Burgundy', 'Côte de Beaune', 'Volnay', 'Pinot Noir', 'Volnay AOC', 'Les Champans', 'Premier Cru', 'Red', 4, false, true);

-- =============================================
-- RED WINES - CÔTE DE BEAUNE - VILLAGE
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Pommard', 'Domaine de Courcel', 2021, 'Burgundy', 'Côte de Beaune', 'Pommard', 'Pinot Noir', 'Pommard AOC', NULL, 'Village', 'Red', 6, false, true),
  (test_user_id, 'Volnay', 'Domaine Michel Lafarge', 2021, 'Burgundy', 'Côte de Beaune', 'Volnay', 'Pinot Noir', 'Volnay AOC', NULL, 'Village', 'Red', 6, false, true),
  (test_user_id, 'Savigny-lès-Beaune', 'Domaine Simon Bize', 2021, 'Burgundy', 'Côte de Beaune', 'Savigny-lès-Beaune', 'Pinot Noir', 'Savigny-lès-Beaune AOC', NULL, 'Village', 'Red', 8, false, true),
  (test_user_id, 'Santenay', 'Domaine Hubert Lamy', 2021, 'Burgundy', 'Côte de Beaune', 'Santenay', 'Pinot Noir', 'Santenay AOC', NULL, 'Village', 'Red', 8, false, true);

-- =============================================
-- WHITE WINES - CÔTE DE BEAUNE - GRAND CRUS
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  -- Montrachet
  (test_user_id, 'Montrachet', 'Domaine de la Romanée-Conti', 2019, 'Burgundy', 'Côte de Beaune', 'Puligny-Montrachet', 'Chardonnay', 'Montrachet AOC', 'Montrachet', 'Grand Cru', 'White', 1, false, true),
  (test_user_id, 'Montrachet', 'Domaine Leflaive', 2020, 'Burgundy', 'Côte de Beaune', 'Puligny-Montrachet', 'Chardonnay', 'Montrachet AOC', 'Montrachet', 'Grand Cru', 'White', 1, false, true),
  (test_user_id, 'Montrachet', 'Domaine Ramonet', 2019, 'Burgundy', 'Côte de Beaune', 'Chassagne-Montrachet', 'Chardonnay', 'Montrachet AOC', 'Montrachet', 'Grand Cru', 'White', 1, false, true),

  -- Chevalier-Montrachet
  (test_user_id, 'Chevalier-Montrachet', 'Domaine Leflaive', 2020, 'Burgundy', 'Côte de Beaune', 'Puligny-Montrachet', 'Chardonnay', 'Chevalier-Montrachet AOC', 'Chevalier-Montrachet', 'Grand Cru', 'White', 2, false, true),
  (test_user_id, 'Chevalier-Montrachet', 'Domaine d''Auvenay', 2019, 'Burgundy', 'Côte de Beaune', 'Puligny-Montrachet', 'Chardonnay', 'Chevalier-Montrachet AOC', 'Chevalier-Montrachet', 'Grand Cru', 'White', 1, false, true),

  -- Bâtard-Montrachet
  (test_user_id, 'Bâtard-Montrachet', 'Domaine Leflaive', 2019, 'Burgundy', 'Côte de Beaune', 'Puligny-Montrachet', 'Chardonnay', 'Bâtard-Montrachet AOC', 'Bâtard-Montrachet', 'Grand Cru', 'White', 2, false, true),
  (test_user_id, 'Bâtard-Montrachet', 'Domaine Ramonet', 2020, 'Burgundy', 'Côte de Beaune', 'Chassagne-Montrachet', 'Chardonnay', 'Bâtard-Montrachet AOC', 'Bâtard-Montrachet', 'Grand Cru', 'White', 2, false, true),

  -- Bienvenues-Bâtard-Montrachet
  (test_user_id, 'Bienvenues-Bâtard-Montrachet', 'Domaine Leflaive', 2020, 'Burgundy', 'Côte de Beaune', 'Puligny-Montrachet', 'Chardonnay', 'Bienvenues-Bâtard-Montrachet AOC', 'Bienvenues-Bâtard-Montrachet', 'Grand Cru', 'White', 2, false, true),

  -- Criots-Bâtard-Montrachet
  (test_user_id, 'Criots-Bâtard-Montrachet', 'Domaine Fontaine-Gagnard', 2019, 'Burgundy', 'Côte de Beaune', 'Chassagne-Montrachet', 'Chardonnay', 'Criots-Bâtard-Montrachet AOC', 'Criots-Bâtard-Montrachet', 'Grand Cru', 'White', 2, false, true),

  -- Corton-Charlemagne
  (test_user_id, 'Corton-Charlemagne', 'Domaine Bonneau du Martray', 2019, 'Burgundy', 'Côte de Beaune', 'Pernand-Vergelesses', 'Chardonnay', 'Corton-Charlemagne AOC', 'Corton-Charlemagne', 'Grand Cru', 'White', 3, false, true),
  (test_user_id, 'Corton-Charlemagne', 'Domaine Coche-Dury', 2018, 'Burgundy', 'Côte de Beaune', 'Aloxe-Corton', 'Chardonnay', 'Corton-Charlemagne AOC', 'Corton-Charlemagne', 'Grand Cru', 'White', 1, false, true);

-- =============================================
-- WHITE WINES - CÔTE DE BEAUNE - PREMIER CRUS
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  -- Meursault Premier Crus
  (test_user_id, 'Meursault Perrières', 'Domaine Coche-Dury', 2019, 'Burgundy', 'Côte de Beaune', 'Meursault', 'Chardonnay', 'Meursault AOC', 'Les Perrières', 'Premier Cru', 'White', 1, false, true),
  (test_user_id, 'Meursault Perrières', 'Domaine des Comtes Lafon', 2020, 'Burgundy', 'Côte de Beaune', 'Meursault', 'Chardonnay', 'Meursault AOC', 'Les Perrières', 'Premier Cru', 'White', 2, false, true),
  (test_user_id, 'Meursault Charmes', 'Domaine des Comtes Lafon', 2020, 'Burgundy', 'Côte de Beaune', 'Meursault', 'Chardonnay', 'Meursault AOC', 'Les Charmes', 'Premier Cru', 'White', 3, false, true),
  (test_user_id, 'Meursault Genevrières', 'Domaine Roulot', 2019, 'Burgundy', 'Côte de Beaune', 'Meursault', 'Chardonnay', 'Meursault AOC', 'Les Genevrières', 'Premier Cru', 'White', 2, false, true),
  (test_user_id, 'Meursault Gouttes d''Or', 'Domaine des Comtes Lafon', 2019, 'Burgundy', 'Côte de Beaune', 'Meursault', 'Chardonnay', 'Meursault AOC', 'Les Gouttes d''Or', 'Premier Cru', 'White', 3, false, true),

  -- Puligny-Montrachet Premier Crus
  (test_user_id, 'Puligny-Montrachet Les Pucelles', 'Domaine Leflaive', 2020, 'Burgundy', 'Côte de Beaune', 'Puligny-Montrachet', 'Chardonnay', 'Puligny-Montrachet AOC', 'Les Pucelles', 'Premier Cru', 'White', 2, false, true),
  (test_user_id, 'Puligny-Montrachet Les Combettes', 'Domaine Leflaive', 2019, 'Burgundy', 'Côte de Beaune', 'Puligny-Montrachet', 'Chardonnay', 'Puligny-Montrachet AOC', 'Les Combettes', 'Premier Cru', 'White', 3, false, true),
  (test_user_id, 'Puligny-Montrachet Les Folatières', 'Domaine Leflaive', 2020, 'Burgundy', 'Côte de Beaune', 'Puligny-Montrachet', 'Chardonnay', 'Puligny-Montrachet AOC', 'Les Folatières', 'Premier Cru', 'White', 2, false, true),
  (test_user_id, 'Puligny-Montrachet Clavoillon', 'Domaine Leflaive', 2021, 'Burgundy', 'Côte de Beaune', 'Puligny-Montrachet', 'Chardonnay', 'Puligny-Montrachet AOC', 'Clavoillon', 'Premier Cru', 'White', 4, false, true),

  -- Chassagne-Montrachet Premier Crus
  (test_user_id, 'Chassagne-Montrachet Les Ruchottes', 'Domaine Ramonet', 2019, 'Burgundy', 'Côte de Beaune', 'Chassagne-Montrachet', 'Chardonnay', 'Chassagne-Montrachet AOC', 'Les Ruchottes', 'Premier Cru', 'White', 3, false, true),
  (test_user_id, 'Chassagne-Montrachet Morgeot', 'Domaine Ramonet', 2020, 'Burgundy', 'Côte de Beaune', 'Chassagne-Montrachet', 'Chardonnay', 'Chassagne-Montrachet AOC', 'Morgeot', 'Premier Cru', 'White', 4, false, true),
  (test_user_id, 'Chassagne-Montrachet Les Caillerets', 'Domaine Marc Colin', 2019, 'Burgundy', 'Côte de Beaune', 'Chassagne-Montrachet', 'Chardonnay', 'Chassagne-Montrachet AOC', 'Les Caillerets', 'Premier Cru', 'White', 4, false, true);

-- =============================================
-- WHITE WINES - CÔTE DE BEAUNE - VILLAGE
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Meursault', 'Domaine Roulot', 2021, 'Burgundy', 'Côte de Beaune', 'Meursault', 'Chardonnay', 'Meursault AOC', NULL, 'Village', 'White', 4, false, true),
  (test_user_id, 'Meursault', 'Domaine des Comtes Lafon', 2021, 'Burgundy', 'Côte de Beaune', 'Meursault', 'Chardonnay', 'Meursault AOC', NULL, 'Village', 'White', 4, false, true),
  (test_user_id, 'Puligny-Montrachet', 'Domaine Leflaive', 2021, 'Burgundy', 'Côte de Beaune', 'Puligny-Montrachet', 'Chardonnay', 'Puligny-Montrachet AOC', NULL, 'Village', 'White', 4, false, true),
  (test_user_id, 'Chassagne-Montrachet', 'Domaine Ramonet', 2021, 'Burgundy', 'Côte de Beaune', 'Chassagne-Montrachet', 'Chardonnay', 'Chassagne-Montrachet AOC', NULL, 'Village', 'White', 6, false, true),
  (test_user_id, 'Saint-Aubin', 'Domaine Hubert Lamy', 2021, 'Burgundy', 'Côte de Beaune', 'Saint-Aubin', 'Chardonnay', 'Saint-Aubin AOC', NULL, 'Village', 'White', 8, false, true);

-- =============================================
-- WHITE WINES - CHABLIS
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  -- Chablis Grand Crus
  (test_user_id, 'Chablis Grand Cru Les Clos', 'Domaine Raveneau', 2019, 'Burgundy', 'Chablis', 'Chablis', 'Chardonnay', 'Chablis Grand Cru AOC', 'Les Clos', 'Grand Cru', 'White', 2, false, true),
  (test_user_id, 'Chablis Grand Cru Les Clos', 'Domaine William Fèvre', 2020, 'Burgundy', 'Chablis', 'Chablis', 'Chardonnay', 'Chablis Grand Cru AOC', 'Les Clos', 'Grand Cru', 'White', 3, false, true),
  (test_user_id, 'Chablis Grand Cru Vaudésir', 'Domaine Raveneau', 2019, 'Burgundy', 'Chablis', 'Chablis', 'Chardonnay', 'Chablis Grand Cru AOC', 'Vaudésir', 'Grand Cru', 'White', 2, false, true),
  (test_user_id, 'Chablis Grand Cru Blanchot', 'Domaine Raveneau', 2020, 'Burgundy', 'Chablis', 'Chablis', 'Chardonnay', 'Chablis Grand Cru AOC', 'Blanchot', 'Grand Cru', 'White', 2, false, true),
  (test_user_id, 'Chablis Grand Cru Valmur', 'Domaine William Fèvre', 2019, 'Burgundy', 'Chablis', 'Chablis', 'Chardonnay', 'Chablis Grand Cru AOC', 'Valmur', 'Grand Cru', 'White', 3, false, true),
  (test_user_id, 'Chablis Grand Cru Les Preuses', 'Domaine Vincent Dauvissat', 2020, 'Burgundy', 'Chablis', 'Chablis', 'Chardonnay', 'Chablis Grand Cru AOC', 'Les Preuses', 'Grand Cru', 'White', 2, false, true),

  -- Chablis Premier Crus
  (test_user_id, 'Chablis Premier Cru Montée de Tonnerre', 'Domaine Raveneau', 2020, 'Burgundy', 'Chablis', 'Chablis', 'Chardonnay', 'Chablis Premier Cru AOC', 'Montée de Tonnerre', 'Premier Cru', 'White', 3, false, true),
  (test_user_id, 'Chablis Premier Cru Mont de Milieu', 'Domaine William Fèvre', 2021, 'Burgundy', 'Chablis', 'Chablis', 'Chardonnay', 'Chablis Premier Cru AOC', 'Mont de Milieu', 'Premier Cru', 'White', 4, false, true),
  (test_user_id, 'Chablis Premier Cru Fourchaume', 'Domaine Vincent Dauvissat', 2020, 'Burgundy', 'Chablis', 'Chablis', 'Chardonnay', 'Chablis Premier Cru AOC', 'Fourchaume', 'Premier Cru', 'White', 4, false, true),
  (test_user_id, 'Chablis Premier Cru Vaillons', 'Domaine Vincent Dauvissat', 2021, 'Burgundy', 'Chablis', 'Chablis', 'Chardonnay', 'Chablis Premier Cru AOC', 'Vaillons', 'Premier Cru', 'White', 4, false, true),

  -- Chablis Village
  (test_user_id, 'Chablis', 'Domaine Raveneau', 2021, 'Burgundy', 'Chablis', 'Chablis', 'Chardonnay', 'Chablis AOC', NULL, 'Village', 'White', 4, false, true),
  (test_user_id, 'Chablis', 'Domaine William Fèvre', 2022, 'Burgundy', 'Chablis', 'Chablis', 'Chardonnay', 'Chablis AOC', NULL, 'Village', 'White', 8, false, true),
  (test_user_id, 'Petit Chablis', 'Domaine William Fèvre', 2022, 'Burgundy', 'Chablis', 'Chablis', 'Chardonnay', 'Petit Chablis AOC', NULL, 'Régional', 'White', 12, false, true);

-- =============================================
-- REGIONAL WINES
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Bourgogne Rouge', 'Domaine de la Romanée-Conti', 2021, 'Burgundy', NULL, NULL, 'Pinot Noir', 'Bourgogne AOC', NULL, 'Régional', 'Red', 3, false, true),
  (test_user_id, 'Bourgogne Rouge', 'Domaine Dujac', 2021, 'Burgundy', NULL, NULL, 'Pinot Noir', 'Bourgogne AOC', NULL, 'Régional', 'Red', 6, false, true),
  (test_user_id, 'Bourgogne Blanc', 'Domaine Leflaive', 2022, 'Burgundy', NULL, NULL, 'Chardonnay', 'Bourgogne AOC', NULL, 'Régional', 'White', 6, false, true),
  (test_user_id, 'Bourgogne Aligoté', 'Domaine Ponsot', 2022, 'Burgundy', NULL, NULL, 'Aligoté', 'Bourgogne Aligoté AOC', NULL, 'Régional', 'White', 12, false, true),
  (test_user_id, 'Crémant de Bourgogne', 'Maison Louis Latour', NULL, 'Burgundy', NULL, NULL, 'Chardonnay', 'Crémant de Bourgogne AOC', NULL, 'Régional', 'Sparkling', 12, false, true);

-- =============================================
-- CÔTE CHALONNAISE
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Mercurey', 'Domaine Faiveley', 2021, 'Burgundy', 'Côte Chalonnaise', 'Mercurey', 'Pinot Noir', 'Mercurey AOC', NULL, 'Village', 'Red', 6, false, true),
  (test_user_id, 'Rully Blanc', 'Domaine de Villaine', 2021, 'Burgundy', 'Côte Chalonnaise', 'Rully', 'Chardonnay', 'Rully AOC', NULL, 'Village', 'White', 8, false, true),
  (test_user_id, 'Givry', 'Domaine Joblot', 2021, 'Burgundy', 'Côte Chalonnaise', 'Givry', 'Pinot Noir', 'Givry AOC', NULL, 'Village', 'Red', 6, false, true),
  (test_user_id, 'Bouzeron', 'Domaine de Villaine', 2022, 'Burgundy', 'Côte Chalonnaise', 'Bouzeron', 'Aligoté', 'Bouzeron AOC', NULL, 'Village', 'White', 8, false, true);

-- =============================================
-- MÂCONNAIS
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Pouilly-Fuissé', 'Domaine Leflaive', 2021, 'Burgundy', 'Mâconnais', 'Pouilly-Fuissé', 'Chardonnay', 'Pouilly-Fuissé AOC', NULL, 'Village', 'White', 6, false, true),
  (test_user_id, 'Saint-Véran', 'Domaine Leflaive', 2022, 'Burgundy', 'Mâconnais', 'Saint-Véran', 'Chardonnay', 'Saint-Véran AOC', NULL, 'Village', 'White', 8, false, true),
  (test_user_id, 'Viré-Clessé', 'Domaine de la Bongran', 2021, 'Burgundy', 'Mâconnais', 'Viré-Clessé', 'Chardonnay', 'Viré-Clessé AOC', NULL, 'Village', 'White', 8, false, true),
  (test_user_id, 'Mâcon-Villages', 'Domaine Leflaive', 2022, 'Burgundy', 'Mâconnais', 'Mâcon', 'Chardonnay', 'Mâcon-Villages AOC', NULL, 'Régional', 'White', 12, false, true);

-- =============================================
-- ROSÉ
-- =============================================
INSERT INTO wines (user_id, name, producer, vintage, region, subregion, commune, grape, appellation, vineyard, cru, color, stock, is_public, is_mine)
VALUES
  (test_user_id, 'Marsannay Rosé', 'Domaine Bruno Clair', 2022, 'Burgundy', 'Côte de Nuits', 'Marsannay-la-Côte', 'Pinot Noir', 'Marsannay AOC', NULL, 'Village', 'Rosé', 6, false, true);

END $$;

-- Verify counts by category
SELECT
  color,
  cru,
  COUNT(*) as wine_count
FROM wines
GROUP BY color, cru
ORDER BY color, cru;
