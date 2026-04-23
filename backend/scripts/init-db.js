const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

async function initDb() {
    let conn;
    try {
        const sqlPath = path.join(__dirname, '..', '..', 'archive', 'non-runtime', 'database', 'SmartGarden_db.sql');
        const sqlScript = fs.readFileSync(sqlPath, 'utf8');

        conn = await mysql.createConnection({
            host: dbConfig.host,
            port: Number(dbConfig.port) || 3306,
            user: dbConfig.user,
            password: dbConfig.password,
            multipleStatements: true,
        });

        await conn.query(sqlScript);
        console.log('Database initialized from SmartGarden_db.sql');
    } catch (error) {
        console.error('Failed to initialize database:', error.message);
        process.exitCode = 1;
    } finally {
        if (conn) await conn.end();
    }
}

initDb();
