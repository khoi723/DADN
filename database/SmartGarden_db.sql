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