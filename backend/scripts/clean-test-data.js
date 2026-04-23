const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

async function cleanTestData() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: dbConfig.host,
            port: Number(dbConfig.port) || 3306,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
        });

        await conn.beginTransaction();

        // Delete records linked to known demo/test users first.
        const demoUserWhere = `(u.username IN ('demo', 'admin')
            OR u.email IN ('demo@example.com', 'admin@smartgarden.com'))`;

        await conn.execute(
            `DELETE sl
             FROM Sensor_logs sl
             INNER JOIN Devices d ON d.ID = sl.device_id
             INNER JOIN Users u ON u.ID = d.user_id
             WHERE ${demoUserWhere}`
        );

        await conn.execute(
            `DELETE pa
             FROM Pump_actions pa
             INNER JOIN Devices d ON d.ID = pa.device_id
             INNER JOIN Users u ON u.ID = d.user_id
             WHERE ${demoUserWhere}`
        );

        await conn.execute(
            `DELETE a
             FROM Alert a
             INNER JOIN Devices d ON d.ID = a.device_id
             INNER JOIN Users u ON u.ID = d.user_id
             WHERE ${demoUserWhere}`
        );

        // Remove known seed/test devices if they still exist.
        await conn.execute(
            `DELETE d
             FROM Devices d
             INNER JOIN Users u ON u.ID = d.user_id
             WHERE ${demoUserWhere}
               AND d.device_name IN ('Garden 1', 'Garden 2', 'Garden 3')`
        );

        // Remove known seed/test accounts if they still exist.
        await conn.execute(
            `DELETE FROM Users
             WHERE (username = ? AND email = ?)
                OR (username = ? AND email = ?)`,
            ['demo', 'demo@example.com', 'admin', 'admin@smartgarden.com']
        );

        await conn.commit();

        console.log('Test data cleaned successfully.');
        console.log('- Deleted demo-related rows from Sensor_logs, Pump_actions, Alert');
        console.log('- Deleted known demo devices: Garden 1, Garden 2, Garden 3');
        console.log('- Deleted test users if found: demo, admin');
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Failed to clean test data:', error.message);
        process.exitCode = 1;
    } finally {
        if (conn) await conn.end();
    }
}

cleanTestData();
