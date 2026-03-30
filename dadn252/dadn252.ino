/* Wifi */
#include <WiFi.h>
#define AP_SSID "Bo"
#define AP_PASSWORD "22102005bobo"
/* Moisture sensor */
#define AO_PIN 34
/* DTH11 */
#define DHT_PIN 18
#include <DHT11.h> // ref: https://github.com/dhrubasaha08/DHT11
DHT11 dht11(DHT_PIN);
/* DC motor */
#define MOTOR_PIN 13
/* Google Firebase */
#include <FirebaseESP32.h> // ref: https://github.com/mobizt/Firebase-ESP8266
#define DB_URL "https://dadn252-default-rtdb.asia-southeast1.firebasedatabase.app/" // Realtime Database > Data > URL
#define DB_SECRET "M1AC8LpgX4eV3NnpM1X3eaINnDpZsO2DeeUmmdGv" // Project settings > Service accounts > Database secrets
FirebaseConfig config; FirebaseAuth auth; FirebaseData fbdo; // firebase data object
// setup to run only once
void setup() {
  Serial.begin(115200);
  initWifi();
  initMotor();
  initFirebase();
}
// loop to run repeatedly
void loop() {
  int temp = 0, humi = 0;
  readDHT11(temp, humi);
  Serial.println("Temperature: " + String(temp));
  Serial.println("Humidity: " + String(humi));
  int moist = readAO();
  Serial.println("Moisture: " + String(moist));
  setValueToFirebase(temp, humi, moist);
  int value = getValueFromFirebase();
  if (value) {
    onMotor();
  } else {
    offMotor();
  }
}
/* DHT11 */
void readDHT11(int& temp, int& humi) {
  int temperature = dht11.readTemperature(); delay(10);
  int humidity = dht11.readHumidity();
  if (temperature != DHT11::ERROR_CHECKSUM && temperature != DHT11::ERROR_TIMEOUT &&
      humidity != DHT11::ERROR_CHECKSUM && humidity != DHT11::ERROR_TIMEOUT) {
    temp = temperature;
    humi = humidity;
  }
}
/* Moisture sensor */
int readAO() {
  int aValue = analogRead(AO_PIN);
  int moist = map(aValue, 4095, 0, 0, 100);
  return moist;
}
/* WIFI */
void initWifi() {
  Serial.print("\nConnecting to "); Serial.print(AP_SSID);
  WiFi.begin(AP_SSID, AP_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.print("\nWiFi connected, IP address: "); Serial.println(WiFi.localIP());
  WiFi.setAutoReconnect(true); WiFi.persistent(true);
}
/* DC motor */
void initMotor() {
  pinMode(MOTOR_PIN, OUTPUT);
}
void onMotor() {
  digitalWrite(MOTOR_PIN, HIGH);
}
void offMotor() {
  digitalWrite(MOTOR_PIN, LOW);
}
/* FIREBASE */
void initFirebase() {
  config.database_url = DB_URL;
  config.signer.tokens.legacy_token = DB_SECRET;
  Firebase.begin(&config, &auth);
  Firebase.reconnectNetwork(true);
}
void setValueToFirebase(int temp, int humi, int moist) {
  if (Firebase.ready()) {
    Firebase.setInt(fbdo, "DHT11/temp", temp);
    Firebase.setInt(fbdo, "DHT11/humi", humi);
    Firebase.setInt(fbdo, "SOIL/moist", moist);
  }
}
int getValueFromFirebase() {
  int value = -1;
  if (Firebase.ready()) {
    if (Firebase.getInt(fbdo, "MOTOR/status")) value = fbdo.intData();
    Serial.println("value: " + String(value)); // for DEBUG
  }
  return value;
}