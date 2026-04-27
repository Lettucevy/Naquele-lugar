USE master;
GO

-- Criação do Banco de Dados
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'NaqueleLugarDB')
BEGIN
    CREATE DATABASE NaqueleLugarDB;
END
GO

USE NaqueleLugarDB;
GO

-- Tabela de Categorias
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Categorias]') AND type in (N'U'))
BEGIN
    CREATE TABLE Categorias (
        ID INT PRIMARY KEY IDENTITY(1,1),
        Nome NVARCHAR(100) NOT NULL,
        Ativa BIT DEFAULT 1
    );
END
GO

-- Tabela de Produtos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Produtos]') AND type in (N'U'))
BEGIN
    CREATE TABLE Produtos (
        ID INT PRIMARY KEY IDENTITY(1,1),
        CategoriaID INT FOREIGN KEY REFERENCES Categorias(ID),
        Nome NVARCHAR(200) NOT NULL,
        Descricao NVARCHAR(MAX),
        Preco DECIMAL(10, 2) NOT NULL,
        ImagemURL NVARCHAR(500),
        Disponivel BIT DEFAULT 1
    );
END
GO

-- Tabela de Pedidos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Pedidos]') AND type in (N'U'))
BEGIN
    CREATE TABLE Pedidos (
        ID INT PRIMARY KEY IDENTITY(1,1),
        DataPedido DATETIME DEFAULT GETDATE(),
        NomeCliente NVARCHAR(200),
        TelefoneCliente NVARCHAR(20),
        Total DECIMAL(10, 2) NOT NULL,
        Status NVARCHAR(50) DEFAULT 'Pendente'
    );
END
GO

-- Itens do Pedido
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ItensPedido]') AND type in (N'U'))
BEGIN
    CREATE TABLE ItensPedido (
        ID INT PRIMARY KEY IDENTITY(1,1),
        PedidoID INT FOREIGN KEY REFERENCES Pedidos(ID),
        ProdutoID INT FOREIGN KEY REFERENCES Produtos(ID),
        Quantidade INT NOT NULL,
        PrecoUnitario DECIMAL(10, 2) NOT NULL
    );
END
GO

-- Inserir Categorias Iniciais
IF NOT EXISTS (SELECT 1 FROM Categorias)
BEGIN
    INSERT INTO Categorias (Nome) VALUES 
    ('Bebidas'), 
    ('Sushi'), 
    ('Pratos da Casa'), 
    ('Oniguiri'), 
    ('Entradas'), 
    ('Sobremesas Orientais'), 
    ('Para Todos'), 
    ('Yakitori'), 
    ('Sanduíches Japoneses');
END
GO

-- Inserir alguns produtos de exemplo (IDs baseados na inserção acima)
-- Bebidas (1), Sushi (2), Yakitori (8)
IF NOT EXISTS (SELECT 1 FROM Produtos)
BEGIN
    DECLARE @CatBebidas INT = (SELECT ID FROM Categorias WHERE Nome = 'Bebidas');
    DECLARE @CatSushi INT = (SELECT ID FROM Categorias WHERE Nome = 'Sushi');
    DECLARE @CatYakitori INT = (SELECT ID FROM Categorias WHERE Nome = 'Yakitori');

    INSERT INTO Produtos (CategoriaID, Nome, Descricao, Preco, ImagemURL) VALUES
    (@CatBebidas, 'Suco Coreano de Morango', 'Suco refrescante com pedaços de fruta.', 12.00, '/img/strawberry-juice.jpg'),
    (@CatBebidas, 'Cerveja Asahi', 'Cerveja japonesa premium 350ml.', 18.00, '/img/asahi.jpg'),
    (@CatSushi, 'Combinado Premium', '12 peças de sushis variados do chef.', 55.00, '/img/sushi-combo.jpg'),
    (@CatYakitori, 'Yakitori de Frango', 'Espetinho de frango grelhado com molho tare (2 unid).', 15.00, '/img/yakitori.jpg');
END
GO

-- =============================================
-- TABELAS DE ACESSO
-- =============================================

-- Tabela de Logins Administrativos (Admin e Cozinha)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Logins]') AND type in (N'U'))
BEGIN
    CREATE TABLE Logins (
        ID INT PRIMARY KEY IDENTITY(1,1),
        Usuario NVARCHAR(50) UNIQUE NOT NULL,
        Senha NVARCHAR(100) NOT NULL,
        Role NVARCHAR(50) NOT NULL -- 'Admin' ou 'Cozinha'
    );
END
GO

-- Inserir Logins Iniciais
IF NOT EXISTS (SELECT 1 FROM Logins)
BEGIN
    INSERT INTO Logins (Usuario, Senha, Role) VALUES 
    ('naqueleadmin', '123456', 'Admin'),
    ('naquelecozinha', '123456', 'Cozinha');
END
GO
