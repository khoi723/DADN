DROP DATABASE IF EXISTS SmartGardenDB;
CREATE DATABASE SmartGardenDB;
USE SmartGardenDB;

-- 1. Users
CREATE TABLE Users (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'vi'
);

-- 2. Devices
CREATE TABLE Devices (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    moisture_threshold FLOAT,
    is_auto_mode BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES Users(ID) ON DELETE CASCADE
);

-- 3. Sensor_logs
CREATE TABLE Sensor_logs (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    soil_moisture FLOAT NOT NULL,
    temperature FLOAT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES Devices(ID) ON DELETE CASCADE
);

-- 4. Alert
CREATE TABLE Alert (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    alert_type VARCHAR(50),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES Devices(ID) ON DELETE CASCADE
);

-- 5. Pump_actions
CREATE TABLE Pump_actions (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    pump_status VARCHAR(20), 
    trigger_type VARCHAR(50), 
    start_at DATETIME,
    end_at DATETIME,
    FOREIGN KEY (device_id) REFERENCES Devices(ID) ON DELETE CASCADE
);

-- Demo data (History: Irrigation + Alert)
INSERT INTO Users (username, password, email) VALUES
    ('demo', 'demo', 'demo@example.com');

INSERT INTO Devices (user_id, device_name, moisture_threshold, is_auto_mode) VALUES
    (1, 'Garden 1', 40, TRUE),
    (1, 'Garden 2', 35, TRUE),
    (1, 'Garden 3', 30, TRUE);

INSERT INTO Pump_actions (device_id, pump_status, trigger_type, start_at, end_at) VALUES
    (1, 'on', 'auto', '2026-03-21 08:00:00', '2026-03-21 08:20:00'),
    (2, 'on', 'manual', '2026-03-14 07:30:00', '2026-03-14 08:20:00'),
    (1, 'on', 'auto', '2026-03-07 09:10:00', '2026-03-07 09:45:00'),
    (3, 'on', 'auto', '2026-02-28 17:00:00', '2026-02-28 17:45:00'),
    (2, 'on', 'auto', '2026-02-21 06:45:00', '2026-02-21 07:00:00'),
    (1, 'on', 'manual', '2026-02-14 18:10:00', '2026-02-14 18:40:00');

INSERT INTO Alert (device_id, alert_type, message, is_read, created_at) VALUES
    (1, 'moisture', 'Moisture is too high', FALSE, '2026-03-21 08:15:00'),
    (2, 'water', 'Low water level', FALSE, '2026-03-20 14:30:00'),
    (1, 'temp', 'Temperature exceeds threshold', FALSE, '2026-03-19 10:05:00'),
    (3, 'sensor', 'Sensor disconnected', FALSE, '2026-03-18 16:40:00'),
    (2, 'pump', 'Pump action timeout', FALSE, '2026-03-17 07:50:00'),
    (1, 'moisture', 'Soil moisture too low', FALSE, '2026-03-16 19:20:00');