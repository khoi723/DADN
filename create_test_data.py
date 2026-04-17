#!/usr/bin/env python3
"""
Create test data for Smart Garden Database
Continuously generates sensor data every 10 seconds
"""

import mysql.connector
from datetime import datetime, timedelta
import time
import random

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '22102005bobo',
    'database': 'SmartGardenDB'
}

def initialize_database():
    """Create initial user and device"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Create user
        cursor.execute("""
            INSERT IGNORE INTO Users (ID, username, password, email, theme, language) 
            VALUES (1, 'admin', 'password123', 'admin@smartgarden.com', 'light', 'vi')
        """)
        
        # Create device
        cursor.execute("""
            INSERT IGNORE INTO Devices (ID, user_id, device_name, moisture_threshold, is_auto_mode)
            VALUES (1, 1, 'Garden Sensor 1', 60.0, 1)
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return False

def create_test_data():
    """Create initial 8 sensor logs"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Create initial sensor logs (8 records for last 7 hours)
        # Format: (device_id, soil_moisture, temperature, humidity)
        sensor_data = [
            (1, 81, 20, 55),   # 7 hours ago
            (1, 75, 22, 58),   # 6 hours ago
            (1, 70, 25, 62),   # 5 hours ago
            (1, 68, 30, 65),   # 4 hours ago
            (1, 72, 36, 58),   # 3 hours ago
            (1, 76, 32, 60),   # 2 hours ago
            (1, 79, 28, 62),   # 1 hour ago
            (1, 82, 27, 64),   # now
        ]
        
        for i, (device_id, moisture, temp, humidity) in enumerate(sensor_data):
            hours_ago = 7 - i
            recorded_at = datetime.now() - timedelta(hours=hours_ago)
            # Try to insert with humidity column, fallback if it doesn't exist
            try:
                cursor.execute("""
                    INSERT INTO Sensor_logs (device_id, soil_moisture, temperature, humidity, recorded_at)
                    VALUES (%s, %s, %s, %s, %s)
                """, (device_id, moisture, temp, humidity, recorded_at))
            except:
                # Fallback for old schema without humidity column
                cursor.execute("""
                    INSERT INTO Sensor_logs (device_id, soil_moisture, temperature, recorded_at)
                    VALUES (%s, %s, %s, %s)
                """, (device_id, moisture, temp, recorded_at))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ Initial test data created")
        return True
    except Exception as e:
        print(f"❌ Error creating initial data: {e}")
        return False

def generate_continuous_data():
    """Generate new sensor data every 3 seconds"""
    # Base values
    base_moisture = 75
    base_temp = 28
    base_humidity = 60
    
    print("\n📊 Starting continuous data generation (every 3 seconds)...")
    print("   Press Ctrl+C to stop\n")
    
    counter = 0
    while True:
        conn = None
        cursor = None
        try:
            conn = mysql.connector.connect(**DB_CONFIG)
            cursor = conn.cursor()
            
            # Generate slightly random data around base values
            moisture = base_moisture + random.uniform(-10, 10)
            temperature = base_temp + random.uniform(-5, 5)
            humidity = base_humidity + random.uniform(-10, 10)
            
            # Insert new sensor log with humidity
            cursor.execute("""
                INSERT INTO Sensor_logs (device_id, soil_moisture, temperature, humidity, recorded_at)
                VALUES (%s, %s, %s, %s, NOW())
            """, (1, round(moisture, 2), round(temperature, 2), round(humidity, 2)))
            
            conn.commit()
            
            counter += 1
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] ✅ Data #{counter} inserted - Humidity: {humidity:.1f}%, Temp: {temperature:.1f}°C, Moisture: {moisture:.1f}%")
            
            # Wait 3 seconds
            time.sleep(3)
            
        except mysql.connector.Error as e:
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] ❌ Database error ({e.errno}): {e.msg}")
            print(f"    Connection will retry in 5 seconds...")
            time.sleep(5)
        except Exception as e:
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] ❌ Unexpected error: {e}")
            time.sleep(5)
        finally:
            if cursor:
                cursor.close()
            if conn and conn.is_connected():
                conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Smart Garden Test Data Generator")
    print("=" * 60 + "\n")
    
    # Initialize database
    if not initialize_database():
        exit(1)
    
    # Create initial data
    if not create_test_data():
        exit(1)
    
    # Show initial stats
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM Users")
        print(f"  Users: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM Devices")
        print(f"  Devices: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM Sensor_logs")
        print(f"  Sensor Logs: {cursor.fetchone()[0]}")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error checking stats: {e}")
    
    # Start continuous data generation
    try:
        generate_continuous_data()
    except KeyboardInterrupt:
        print("\n\n⏹️  Data generation stopped by user")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
