USE NaqueleLugarDB;
GO

-- Limpar itens de pedidos que referenciam produtos (evitar erro de FK)
DELETE FROM ItensPedido;
GO

-- Limpar produtos existentes
DELETE FROM Produtos;
DBCC CHECKIDENT ('Produtos', RESEED, 0);
GO

-- Reinserir todos os produtos com imagens
DECLARE @CatBebidas INT      = (SELECT ID FROM Categorias WHERE Nome = 'Bebidas');
DECLARE @CatSushi INT        = (SELECT ID FROM Categorias WHERE Nome = 'Sushi');
DECLARE @CatPratos INT       = (SELECT ID FROM Categorias WHERE Nome = 'Pratos da Casa');
DECLARE @CatOniguiri INT     = (SELECT ID FROM Categorias WHERE Nome = 'Oniguiri');
DECLARE @CatEntradas INT     = (SELECT ID FROM Categorias WHERE Nome = 'Entradas');
DECLARE @CatSobremesas INT   = (SELECT ID FROM Categorias WHERE Nome = 'Sobremesas Orientais');
DECLARE @CatParaTodos INT    = (SELECT ID FROM Categorias WHERE Nome = 'Para Todos');
DECLARE @CatYakitori INT     = (SELECT ID FROM Categorias WHERE Nome = 'Yakitori');
DECLARE @CatSanduiches INT   = (SELECT ID FROM Categorias WHERE Nome = 'Sanduíches Japoneses');

INSERT INTO Produtos (CategoriaID, Nome, Descricao, Preco, ImagemURL) VALUES

-- ===== BEBIDAS =====
(@CatBebidas, 'Suco Coreano de Morango',   'Suco refrescante com pedaços de morango fresco e gelo.', 12.00, '/img/strawberry-juice.jpg'),
(@CatBebidas, 'Cerveja Asahi',              'Cerveja japonesa premium lata 350ml, leve e refrescante.', 18.00, '/img/asahi.jpg'),
(@CatBebidas, 'Sake Quente (Tokkuri)',      'Sake tradicional japonês servido em tokkuri de cerâmica 200ml.', 32.00, 'https://images.unsplash.com/photo-1597528662778-3780ca3e5098?w=600&auto=format&fit=crop'),
(@CatBebidas, 'Matcha Latte Gelado',        'Chá matcha premium batido com leite integral e gelo, adocicado na medida.', 16.00, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop'),
(@CatBebidas, 'Ramune Limonada',            'Refrigerante japonês clássico de limonada com a famosa bolinha de gude. 200ml.', 14.00, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&auto=format&fit=crop'),
(@CatBebidas, 'Highball Japonês',           'Whisky japonês Suntory com água com gás e gelo. O drink do izakaya.', 28.00, 'https://images.unsplash.com/photo-1570737543098-0983d88f796d?w=600&auto=format&fit=crop'),
(@CatBebidas, 'Chá Verde Gelado',           'Sencha premium servido bem gelado. Refrescante e antioxidante.', 10.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop'),
(@CatBebidas, 'Caipirinha de Sake com Kiwi', 'Caipirinha refrescante preparada com sake premium, kiwi fresco, açúcar e bastante gelo.', 22.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop'),
(@CatBebidas, 'Coquetel de Lichia Naquele Lugar', 'Coquetel autoral da casa combinando licor de lichia, sake, água tônica e um toque de limão.', 25.00, 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&auto=format&fit=crop'),
(@CatBebidas, 'Refresco de Calpis',         'Bebida japonesa tradicional à base de leite fermentado, levemente ácida e super refrescante.', 12.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop'),
(@CatBebidas, 'Coca-Cola Original Lata',    'Refrigerante original Coca-Cola lata 350ml gelado.', 6.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop'),
(@CatBebidas, 'Coca-Cola Sem Açúcar Lata',  'Refrigerante sem açúcar Coca-Cola lata 350ml gelado.', 6.00, 'https://images.unsplash.com/photo-1629203851020-90d9b3f08b49?w=600&auto=format&fit=crop'),
(@CatBebidas, 'Guaraná Antarctica Lata',    'Refrigerante Guaraná Antarctica lata 350ml gelado.', 6.00, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop'),
(@CatBebidas, 'Fanta Laranja Lata',         'Refrigerante Fanta Laranja lata 350ml gelado.', 6.00, 'https://images.unsplash.com/photo-1625772290748-390939a20015?w=600&auto=format&fit=crop'),
(@CatBebidas, 'Suco Del Valle de Uva',      'Suco de uva Del Valle lata 290ml refrescante.', 7.00, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop'),
(@CatBebidas, 'Suco Del Valle de Pêssego',   'Suco de pêssego Del Valle lata 290ml refrescante.', 7.00, 'https://images.unsplash.com/photo-1622506794592-3515c027412e?w=600&auto=format&fit=crop'),


-- ===== SUSHI =====
(@CatSushi, 'Combinado Premium',            '12 peças selecionadas pelo chef: nigiri, uramaki e temaki frescos do dia.', 55.00, '/img/sushi-combo.jpg'),
(@CatSushi, 'Niguiri de Salmão (2 un)',     'Duas peças de nigiri com salmão fresco sobre arroz temperado.', 22.00, 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&auto=format&fit=crop'),
(@CatSushi, 'Dragon Roll (8 un)',            'Uramaki coberto com fatias de abacate e camarão empanado, molho especial.', 48.00, 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&auto=format&fit=crop'),
(@CatSushi, 'Temaki de Atum',               'Cone de alga nori recheado com atum, cream cheese e pepino. Servido na hora.', 26.00, 'https://images.unsplash.com/photo-1617196034085-9d6a6a2bd9cc?w=600&auto=format&fit=crop'),
(@CatSushi, 'Sashimi de Salmão (5 un)',     'Cinco fatias generosas de salmão fresco, acompanha shoyu e wasabi.', 35.00, 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&auto=format&fit=crop'),

-- ===== PRATOS DA CASA =====
(@CatPratos, 'Ramen Tonkotsu',              'Caldo cremoso de osso suíno, chashu, ovo marinado, nori e menma. O prato favorito.', 42.00, '/img/ramen.jpg'),
(@CatPratos, 'Donburi de Frango Teriyaki',  'Tigela de arroz japonês com frango ao molho teriyaki, gergelim e cebolinha.', 38.00, 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&auto=format&fit=crop'),
(@CatPratos, 'Katsu Curry',                 'Costeleta de porco empanada com curry japonês suave sobre arroz. Clássico reconfortante.', 45.00, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop'),
(@CatPratos, 'Udon Salteado com Camarão',   'Macarrão udon grosso salteado na wok com camarão, legumes e shoyu.', 48.00, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop'),
(@CatPratos, 'Chahan (Yakimeshi)',           'Arroz frito à moda japonesa com ovos, cebolinha, cenoura e shoyu. Simples e perfeito.', 28.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop'),

-- ===== ONIGUIRI =====
(@CatOniguiri, 'Oniguiri de Salmão',        'Bolinho de arroz triangular com recheio de salmão grelhado e maionese. 1 unid.', 12.00, 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=600&auto=format&fit=crop'),
(@CatOniguiri, 'Oniguiri de Atum',          'Bolinho de arroz triangular com atum temperado e nori crocante. 1 unid.', 12.00, 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=600&auto=format&fit=crop'),
(@CatOniguiri, 'Oniguiri de Umê',           'Bolinho de arroz com ameixa japonesa em conserva (umeboshi). Tradicional. 1 unid.', 11.00, 'https://images.unsplash.com/photo-1527515673510-8aa78ce21f9b?w=600&auto=format&fit=crop'),
(@CatOniguiri, 'Combo Oniguiri (3 un)',      'Escolha 3 sabores: salmão, atum, umê, frango ou grão de bico.', 32.00, 'https://images.unsplash.com/photo-1617196034096-7a9b71e68e60?w=600&auto=format&fit=crop'),

-- ===== ENTRADAS =====
(@CatEntradas, 'Gyoza Grelhado (6 un)',      'Pastéis japoneses recheados de frango e couve, grelhados na frigideira, com molho ponzu.', 28.00, '/img/gyoza.jpg'),
(@CatEntradas, 'Karaage (Frango Frito)',     'Frango marinado em shoyu e gengibre, frito até ficar crocante. Com maionese e limão.', 32.00, 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=600&auto=format&fit=crop'),
(@CatEntradas, 'Edamame com Flor de Sal',   'Vagens de soja cozidas no vapor e temperadas com flor de sal e limão.', 14.00, 'https://images.unsplash.com/photo-1574484284002-952d92a03a05?w=600&auto=format&fit=crop'),
(@CatEntradas, 'Takoyaki (8 un)',            'Bolinhos de polvo com molho okonomiyaki, maionese japonesa e katsuobushi.', 34.00, 'https://images.unsplash.com/photo-1625943553852-781a30da7a09?w=600&auto=format&fit=crop'),
(@CatEntradas, 'Agedashi Tofu',             'Tofu frito em caldo dashi com nabo ralado, cebolinha e katsuobushi.', 26.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'),

-- ===== SOBREMESAS ORIENTAIS =====
(@CatSobremesas, 'Mochi de Sorvete (3 un)', 'Bolinhas de mochi de arroz recheadas com sorvete. Sabores: matcha, morango e manga.', 24.00, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop'),
(@CatSobremesas, 'Dorayaki',                'Panqueca japonesa recheada com pasta de feijão azuki doce. Clássico da confeitaria japonesa.', 16.00, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop'),
(@CatSobremesas, 'Kakigori de Matcha',       'Raspado japonês coberto com calda de matcha, leite condensado e anko.', 20.00, 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&auto=format&fit=crop'),

-- ===== PARA TODOS =====
(@CatParaTodos, 'Batata Frita Temperada',   'Fritas crocantes temperadas com furikake japonês e maionese spicy. Compartilhável.', 22.00, 'https://images.unsplash.com/photo-1526861702015-1d753c9dd82e?w=600&auto=format&fit=crop'),
(@CatParaTodos, 'Edamame + Gyoza (Combo)',  'A entrada perfeita: edamame com flor de sal + 4 gyozas grelhados para dividir.', 36.00, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop'),

-- ===== YAKITORI =====
(@CatYakitori, 'Yakitori de Frango',        'Espetinho de coxa de frango grelhado com molho tare artesanal. 2 unidades.', 15.00, '/img/yakitori.jpg'),
(@CatYakitori, 'Negima (Frango e Cebolinha)','Espetinho alternando pedaços de frango e cebolinha, molho tare. 2 unidades.', 16.00, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop'),
(@CatYakitori, 'Tsukune (Bolinho de Frango)','Bolinho de frango moído com gengibre e molho teriyaki. 2 unidades.', 17.00, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop'),
(@CatYakitori, 'Espetinho de Cogumelo Shitake','Cogumelos shitake grelhados com manteiga, alho e shoyu. Opção vegana. 2 unidades.', 18.00, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop'),

-- ===== SANDUÍCHES JAPONESES =====
(@CatSanduiches, 'Katsu Sando de Porco',    'Sanduíche japonês com costeleta de porco empanada, repolho e molho tonkatsu. Mitade.', 32.00, 'https://images.unsplash.com/photo-1553909489-ec840be4495a?w=600&auto=format&fit=crop'),
(@CatSanduiches, 'Tamago Sando',            'Sanduíche de ovo japonês cremoso com maionese Kewpie no pão de forma macio.', 22.00, 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&auto=format&fit=crop'),
(@CatSanduiches, 'Ebi Katsu Sando',         'Sanduíche com camarão empanado crocante, alface e molho tártaro japonês.', 38.00, 'https://images.unsplash.com/photo-1553909489-ec840be4495a?w=600&auto=format&fit=crop');
GO

PRINT 'Produtos atualizados com sucesso! Total: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' registros.';
SELECT COUNT(*) as TotalProdutos FROM Produtos;
GO