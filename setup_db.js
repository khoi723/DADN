const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    try {
        const sqlFilePath = path.join(__dirname, 'database','SmartGarden_db.sql');
        const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Connecting to MySQL Server...');
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',          
            password: 'password',  
            multipleStatements: true 
        });

        await connection.query(sqlScript);

        console.log('SQL script executed successfully.');
        await connection.end();

    } catch (error) {
        console.error('Error executing SQL:', error);
    }
}

initializeDatabase();