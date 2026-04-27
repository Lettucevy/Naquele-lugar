const express = require('express');
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 8001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Middleware de Log de Requisições
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.post('/api/admin/upload', upload.single('imagem'), (req, res) => {
    if (!req.file) return res.status(400).send('Nenhum arquivo enviado.');
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});


const dbConfig = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=NaqueleLugarDB;Trusted_Connection=yes;',
    options: {
        enableArithAbort: true,
        connectTimeout: 5000
    }
};


let poolPromise = sql.connect(dbConfig)
    .then(pool => {
        console.log('✅ CONEXÃO COM SQL SERVER ESTABELECIDA');
        return pool;
    })
    .catch(err => {
        console.error('❌ ERRO AO CONECTAR AO SQL SERVER:', err.message);
        return null;
    });

// ROTA DE LOGIN 
app.post('/api/login', async (req, res) => {
    const { usuario, senha } = req.body;
    console.log(`Tentativa de login: ${usuario}`);
    try {
        let pool = await poolPromise;
        let result = await pool.request()
            .input('u', sql.NVarChar, usuario)
            .input('s', sql.NVarChar, senha)
            .query('SELECT Usuario, Role FROM Logins WHERE Usuario = @u AND Senha = @s');

        if (result.recordset.length > 0) {
            console.log(`Login bem-sucedido: ${usuario} (${result.recordset[0].Role})`);
            res.json({ success: true, user: result.recordset[0] });
        } else {
            console.warn(`Login falhou: ${usuario} - Credenciais inválidas`);
            res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
        }
    } catch (err) {
        console.error('ERRO NO BANCO DE DADOS (Login):', err.message);
        res.status(500).json({ success: false, message: 'Erro interno no banco de dados', details: err.message });
    }
});

// RASTREAMENTO DE PEDIDOS
app.get('/api/tracking/:id', async (req, res) => {
    try {
        let pool = await poolPromise;
        let result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT p.*, 
                (SELECT ip.Quantidade, pr.Nome, ip.PrecoUnitario 
                 FROM ItensPedido ip 
                 JOIN Produtos pr ON ip.ProdutoID = pr.ID 
                 WHERE ip.PedidoID = p.ID 
                 FOR JSON PATH) as Itens
                FROM Pedidos p 
                WHERE p.ID = @id
            `);

        if (result.recordset.length > 0) {
            const order = {
                ...result.recordset[0],
                Itens: JSON.parse(result.recordset[0].Itens || '[]')
            };
            res.json(order);
        } else {
            res.status(404).json({ message: 'Pedido não encontrado' });
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/tracking/phone/:phone', async (req, res) => {
    try {
        let pool = await poolPromise;
        let result = await pool.request()
            .input('phone', sql.NVarChar, req.params.phone)
            .query('SELECT * FROM Pedidos WHERE TelefoneCliente = @phone ORDER BY DataPedido DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Rotas da API
app.get('/api/menu', async (req, res) => {
    try {
        let pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT p.*, c.Nome as Categoria 
            FROM Produtos p 
            JOIN Categorias c ON p.CategoriaID = c.ID 
            WHERE p.Disponivel = 1 AND c.Ativa = 1
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Erro ao buscar menu:', err);
        res.status(500).send(err.message);
    }
});

app.post('/api/pedidos', async (req, res) => {
    const { cliente, telefone, itens, total } = req.body;
    try {
        let pool = await poolPromise;

        // Criar Pedido
        let pedidoResult = await pool.request()
            .input('nome', sql.NVarChar, cliente)
            .input('telefone', sql.NVarChar, telefone)
            .input('total', sql.Decimal(10, 2), total)
            .query('INSERT INTO Pedidos (NomeCliente, TelefoneCliente, Total) OUTPUT INSERTED.ID VALUES (@nome, @telefone, @total)');

        const pedidoId = pedidoResult.recordset[0].ID;

        // Criar Itens do Pedido
        for (let item of itens) {
            await pool.request()
                .input('pedidoId', sql.Int, pedidoId)
                .input('produtoId', sql.Int, item.id)
                .input('quantidade', sql.Int, item.quantidade)
                .input('preco', sql.Decimal(10, 2), item.preco)
                .query('INSERT INTO ItensPedido (PedidoID, ProdutoID, Quantidade, PrecoUnitario) VALUES (@pedidoId, @produtoId, @quantidade, @preco)');
        }

        res.status(201).json({ success: true, pedidoId });
    } catch (err) {
        console.error('Erro ao criar pedido:', err);
        res.status(500).send(err.message);
    }
});

// Endpoints de Administração
app.get('/api/admin/pedidos', async (req, res) => {
    try {
        let pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT p.ID, p.DataPedido, p.NomeCliente, p.TelefoneCliente, p.Total, p.Status,
            (SELECT ip.Quantidade, pr.Nome, ip.PrecoUnitario 
             FROM ItensPedido ip 
             JOIN Produtos pr ON ip.ProdutoID = pr.ID 
             WHERE ip.PedidoID = p.ID 
             FOR JSON PATH) as Itens
            FROM Pedidos p
            ORDER BY p.DataPedido DESC
        `);

        // Parse JSON string from SQL
        const records = result.recordset.map(r => ({
            ...r,
            Itens: JSON.parse(r.Itens || '[]')
        }));

        res.json(records);
    } catch (err) {
        console.error('Erro ao buscar pedidos admin:', err);
        res.status(500).send(err.message);
    }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        let pool = await poolPromise;
        const stats = {};

        // Total Vendas
        const totalResult = await pool.request().query('SELECT SUM(Total) as TotalVendas FROM Pedidos');
        stats.totalVendas = totalResult.recordset[0].TotalVendas || 0;

        // Total Pedidos
        const countResult = await pool.request().query('SELECT COUNT(*) as QtdPedidos FROM Pedidos');
        stats.qtdPedidos = countResult.recordset[0].QtdPedidos;

        // Top Itens
        const topResult = await pool.request().query(`
            SELECT TOP 5 pr.Nome, SUM(ip.Quantidade) as Qtd
            FROM ItensPedido ip
            JOIN Produtos pr ON ip.ProdutoID = pr.ID
            GROUP BY pr.Nome
            ORDER BY Qtd DESC
        `);
        stats.topItens = topResult.recordset;

        res.json(stats);
    } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        res.status(500).send(err.message);
    }
});

// Gestão de Pedidos
app.patch('/api/admin/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar, status)
            .query('UPDATE Pedidos SET Status = @status WHERE ID = @id');
        res.json({ success: true });
    } catch (err) {
        console.error('Erro ao atualizar status:', err);
        res.status(500).send(err.message);
    }
});

// Gestão de Categorias
app.get('/api/admin/categorias', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM Categorias'); // Retorna tudo para o Admin
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/api/admin/categorias', async (req, res) => {
    const { nome } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('nome', sql.NVarChar, nome)
            .query('INSERT INTO Categorias (Nome) VALUES (@nome)');
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.delete('/api/admin/categorias/:id', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('UPDATE Categorias SET Ativa = 0 WHERE ID = @id');
        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.patch('/api/admin/categorias/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, ativa } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        let query = 'UPDATE Categorias SET ';
        const request = pool.request();
        if (nome !== undefined) {
            request.input('nome', nome);
            query += 'Nome = @nome ';
        }
        if (ativa !== undefined) {
            if (nome !== undefined) query += ', ';
            request.input('ativa', sql.Bit, ativa);
            query += 'Ativa = @ativa ';
        }
        query += ' WHERE ID = @id';
        request.input('id', id);
        await request.query(query);
        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Gestão de Produtos
app.get('/api/admin/produtos', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT p.*, c.Nome as CategoriaNome FROM Produtos p JOIN Categorias c ON p.CategoriaID = c.ID');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/api/admin/produtos', async (req, res) => {
    const { categoriaId, nome, descricao, preco, imagemUrl } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('catId', sql.Int, categoriaId)
            .input('nome', sql.NVarChar, nome)
            .input('desc', sql.NVarChar, descricao)
            .input('preco', sql.Decimal(10, 2), preco)
            .input('img', sql.NVarChar, imagemUrl)
            .query('INSERT INTO Produtos (CategoriaID, Nome, Descricao, Preco, ImagemURL) VALUES (@catId, @nome, @desc, @preco, @img)');
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.patch('/api/admin/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        let query = 'UPDATE Produtos SET ';
        const keys = Object.keys(fields);
        const request = pool.request();

        keys.forEach((key, i) => {
            request.input(key, fields[key]);
            query += `${key} = @${key}${i < keys.length - 1 ? ', ' : ''} `;
        });

        query += ' WHERE ID = @pid';
        request.input('pid', id);

        await request.query(query);
        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
