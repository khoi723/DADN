CREATE DATABASE IF NOT EXISTS SmartGardenDB;
USE SmartGardenDB;
-- 1. Users
CREATE TABLE IF NOT EXISTS Users (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'vi'
);
-- 2. Devices
CREATE TABLE IF NOT EXISTS Devices (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    moisture_threshold FLOAT,
    is_auto_mode BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES Users(ID) ON DELETE CASCADE
);
-- 3. Sensor_logs
CREATE TABLE IF NOT EXISTS Sensor_logs (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    soil_moisture FLOAT NOT NULL,
    temperature FLOAT,
    humidity FLOAT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES Devices(ID) ON DELETE CASCADE
);
-- 4. Alert
CREATE TABLE IF NOT EXISTS Alert (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    alert_type VARCHAR(50),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES Devices(ID) ON DELETE CASCADE
);
-- 5. Pump_actions
CREATE TABLE IF NOT EXISTS Pump_actions (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    pump_status VARCHAR(20),
    trigger_type VARCHAR(50),
    start_at DATETIME,
    end_at DATETIME,
    FOREIGN KEY (device_id) REFERENCES Devices(ID) ON DELETE CASCADE
);
-- Minimal runtime seed (required so sync service can write logs without FK issues).
INSERT IGNORE INTO Users (username, password, email, theme, language)
VALUES (
        'internal_owner',
        'internal_change_me',
        'internal@smartgarden.local',
        'light',
        'en'
    );
INSERT INTO Devices (
        user_id,
        device_name,
        moisture_threshold,
        is_auto_mode
    )
SELECT u.ID,
    'Main Garden',
    40,
    TRUE
FROM Users u
WHERE u.username = 'internal_owner'
    AND NOT EXISTS (
        SELECT 1
        FROM Devices d
        WHERE d.user_id = u.ID
            AND d.device_name = 'Main Garden'
    );