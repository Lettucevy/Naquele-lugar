const sql = require('mssql/msnodesqlv8');

const dbConfig = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=master;Trusted_Connection=yes;',
};

async function initialize() {
    try {
        console.log('--- INICIALIZANDO BANCO DE DADOS (V2) ---');
        console.log('Conectando ao SQL Server...');
        let pool = await sql.connect(dbConfig);

        console.log('Selecionando banco NaqueleLugarDB...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'NaqueleLugarDB')
            BEGIN
                CREATE DATABASE NaqueleLugarDB;
            END
        `);

        // Reconectar ao banco correto
        await sql.close();
        const appDbConfig = { ...dbConfig, connectionString: dbConfig.connectionString.replace('Database=master', 'Database=NaqueleLugarDB') };
        pool = await sql.connect(appDbConfig);

        console.log('Limpando tabelas de lógica (Usuarios, Problemas)...');
        await pool.request().query(`
            IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') AND type in (N'U')) DROP TABLE Usuarios;
            IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Problemas]') AND type in (N'U')) DROP TABLE Problemas;
        `);

        console.log('Verificando tabelas base...');
        // Tabela de Logins
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Logins]') AND type in (N'U'))
            BEGIN
                CREATE TABLE Logins (
                    ID INT PRIMARY KEY IDENTITY(1,1),
                    Usuario NVARCHAR(50) UNIQUE NOT NULL,
                    Senha NVARCHAR(100) NOT NULL,
                    Role NVARCHAR(50) NOT NULL
                );
                INSERT INTO Logins (Usuario, Senha, Role) VALUES 
                ('naqueleadmin', '123456', 'Admin'),
                ('naquelecozinha', '123456', 'Cozinha');
            END
        `);

        console.log('BANCO DE DADOS PRONTO PARA RASTREAMENTO!');
        console.log('---');
        console.log('Acesse: http://localhost:8001/tracking.html');
        process.exit(0);
    } catch (err) {
        console.error('ERRO NA INICIALIZAÇÃO:', err.message);
        process.exit(1);
    }
}

initialize();