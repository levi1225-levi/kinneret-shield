#include "network_handler.h"
#include <HTTPClient.h>

NetworkHandler::NetworkHandler()
    : initialized(false),
      serverConnected(false),
      wifiManager(nullptr),
      lastConnectionAttempt(0),
      lastHeartbeatTime(0),
      connectionRetries(0),
      wifiSetupMode(false),
      eventCallback(nullptr) {
    memset(lastError, 0, 64);
    memset(deviceId, 0, MAX_DEVICE_ID_LENGTH);
    memset(apiKey, 0, MAX_API_KEY_LENGTH);
    memset(roomName, 0, MAX_ROOM_NAME_LENGTH);
    memset(supabaseUrl, 0, 256);
    memset(supabaseFunctionsUrl, 0, 256);
    memset(ssidBuffer, 0, 64);
}

NetworkHandler::~NetworkHandler() {
    if (wifiManager) delete wifiManager;
}

void NetworkHandler::init() {
    Serial.println("[NetworkHandler] Initializing...");

    strncpy(deviceId, DEVICE_ID, MAX_DEVICE_ID_LENGTH - 1);
    strncpy(supabaseUrl, SUPABASE_URL, 255);
    strncpy(supabaseFunctionsUrl, SUPABASE_FUNCTIONS_URL, 255);

    wifiManager = new WiFiManager();
    wifiManager->setConnectTimeout(15);
    wifiManager->setConfigPortalTimeout(180);
    wifiManager->setDebugOutput(true);

    initialized = true;
    wifiSetupMode = false;
    Serial.println("[NetworkHandler] Initialization complete");
}

void NetworkHandler::update() {
    if (!initialized) return;

    if (isWiFiConnected() && !serverConnected) {
        handleWiFiConnected();
    }
}

const char* NetworkHandler::getWiFiSSIDStr() {
    String s = WiFi.SSID();
    strncpy(ssidBuffer, s.c_str(), 63);
    return ssidBuffer;
}

void NetworkHandler::startWiFiManager() {
    if (!wifiManager) return;
    if (wifiSetupMode) return;
    wifiSetupMode = true;

    Serial.println("[NetworkHandler] Starting WiFi Manager...");

    char apName[32];
    snprintf(apName, 31, "%s-%04X", WIFI_MANAGER_AP_NAME, (uint16_t)(ESP.getEfuseMac() & 0xFFFF));
    Serial.printf("[NetworkHandler] AP name: %s\n", apName);

    // autoConnect tries saved credentials first, then opens portal if they fail
    bool connected = wifiManager->autoConnect(apName);

    wifiSetupMode = false;

    if (connected && isWiFiConnected()) {
        Serial.println("[NetworkHandler] WiFi connected!");
        Serial.printf("[NetworkHandler] SSID: %s\n", getWiFiSSIDStr());
        Serial.printf("[NetworkHandler] IP: %s\n", WiFi.localIP().toString().c_str());
        Serial.printf("[NetworkHandler] RSSI: %d dBm\n", getWiFiSignal());
        handleWiFiConnected();
    } else {
        Serial.println("[NetworkHandler] WiFi connection failed or portal timed out");
        strncpy(lastError, "WiFi Connection Failed", 63);
    }
}

bool NetworkHandler::connectToWiFi(const char* ssid, const char* password) {
    Serial.printf("[NetworkHandler] Connecting to WiFi: %s\n", ssid);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    unsigned long timeout = millis() + WIFI_CONNECT_TIMEOUT_MS;
    while (WiFi.status() != WL_CONNECTED && millis() < timeout) {
        delay(100);
    }

    if (isWiFiConnected()) {
        handleWiFiConnected();
        return true;
    } else {
        handleWiFiDisconnected();
        return false;
    }
}

bool NetworkHandler::sendCardTap(const char* devId, uint8_t* uid, uint8_t uidLength) {
    if (!isWiFiConnected()) {
        Serial.println("[NetworkHandler] Not connected, cannot send card tap");
        return false;
    }

    Serial.println("[NetworkHandler] Sending card tap...");

    StaticJsonDocument<256> doc;
    doc["device_id"] = this->deviceId;

    char uidStr[32];
    for (uint8_t i = 0; i < uidLength; i++) {
        snprintf(uidStr + (i * 2), 3, "%02X", uid[i]);
    }
    doc["card_uid"] = uidStr;
    doc["timestamp"] = millis() / 1000;

    String jsonStr;
    serializeJson(doc, jsonStr);

    return sendHttpPost(DEVICE_TAP_ENDPOINT, jsonStr.c_str());
}

bool NetworkHandler::sendProgramWristband(const char* devId, uint8_t* uid, uint8_t uidLength) {
    if (!isWiFiConnected()) {
        Serial.println("[NetworkHandler] Not connected, cannot program wristband");
        return false;
    }

    Serial.println("[NetworkHandler] Sending program wristband...");

    StaticJsonDocument<256> doc;
    doc["device_id"] = this->deviceId;

    char uidStr[32];
    for (uint8_t i = 0; i < uidLength; i++) {
        snprintf(uidStr + (i * 2), 3, "%02X", uid[i]);
    }
    doc["card_uid"] = uidStr;

    String jsonStr;
    serializeJson(doc, jsonStr);

    return sendHttpPost(DEVICE_PROGRAM_WRISTBAND_ENDPOINT, jsonStr.c_str());
}

bool NetworkHandler::sendHeartbeat(const char* devId, const char* firmwareVersion) {
    if (!isWiFiConnected()) return false;

    unsigned long now = millis();
    lastHeartbeatTime = now;

    Serial.println("[NetworkHandler] Sending heartbeat...");

    StaticJsonDocument<256> doc;
    doc["device_id"] = this->deviceId;
    doc["firmware_version"] = firmwareVersion;
    doc["free_heap"] = ESP.getFreeHeap();
    doc["wifi_rssi"] = getWiFiSignal();
    doc["uptime"] = now / 1000;

    String jsonStr;
    serializeJson(doc, jsonStr);

    return sendHttpPost(DEVICE_HEARTBEAT_ENDPOINT, jsonStr.c_str());
}

bool NetworkHandler::sendHttpPost(const char* endpoint, const char* jsonPayload) {
    HTTPClient http;

    String url = String(supabaseFunctionsUrl) + endpoint;

    Serial.printf("[NetworkHandler] POST %s\n", url.c_str());

    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader(API_KEY_HEADER, apiKey);
    http.setTimeout(HTTP_TIMEOUT_MS);

    int httpCode = http.POST(jsonPayload);

    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
        Serial.printf("[NetworkHandler] POST success: %d\n", httpCode);
        String response = http.getString();
        Serial.printf("[NetworkHandler] Response: %s\n", response.c_str());

        DynamicJsonDocument responseDoc(512);
        DeserializationError error = deserializeJson(responseDoc, response);
        if (!error) {
            parseResponseCommand(response.c_str());

            if (eventCallback && responseDoc.containsKey("action")) {
                const char* action = responseDoc["action"];
                const char* camperName = responseDoc["camper_name"] | "Unknown";

                if (eventCallback) {
                    eventCallback("ATTENDANCE_RESULT", response.c_str());
                }
            }
        }

        http.end();
        return true;
    } else {
        Serial.printf("[NetworkHandler] POST failed: %d\n", httpCode);
        snprintf(lastError, 63, "HTTP %d", httpCode);
        http.end();
        return false;
    }
}

void NetworkHandler::parseResponseCommand(const char* jsonStr) {
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, jsonStr);

    if (error) return;

    if (doc.containsKey("emergency")) {
        const char* emergencyType = doc["emergency"];
        if (eventCallback) {
            eventCallback("EMERGENCY_COMMAND", emergencyType);
        }
    }

    if (doc.containsKey("firmware_update")) {
        if (eventCallback) {
            eventCallback("FIRMWARE_UPDATE", "");
        }
    }
}

bool NetworkHandler::connectToServer() {
    if (!isWiFiConnected()) return false;

    Serial.println("[NetworkHandler] Server connection established (HTTP mode)");
    serverConnected = true;

    if (eventCallback) {
        eventCallback("SERVER_CONNECTED", "");
    }

    return true;
}

void NetworkHandler::handleWiFiConnected() {
    Serial.println("[NetworkHandler] WiFi connected");

    if (eventCallback) {
        eventCallback("WIFI_CONNECTED", getWiFiSSIDStr());
    }

    connectToServer();
}

void NetworkHandler::handleWiFiDisconnected() {
    Serial.println("[NetworkHandler] WiFi disconnected");
    serverConnected = false;

    if (eventCallback) {
        eventCallback("WIFI_DISCONNECTED", "");
    }
}

void NetworkHandler::parseDeviceConfig(const DeviceConfig& config) {
    if (strlen(config.device_id) > 0) {
        strncpy(deviceId, config.device_id, MAX_DEVICE_ID_LENGTH - 1);
        Serial.printf("[NetworkHandler] Device ID: %s\n", deviceId);
    }
    if (strlen(config.api_key) > 0) {
        strncpy(apiKey, config.api_key, MAX_API_KEY_LENGTH - 1);
        Serial.printf("[NetworkHandler] API key loaded (%.8s...)\n", apiKey);
    }
    if (strlen(config.location_name) > 0) {
        strncpy(roomName, config.location_name, MAX_ROOM_NAME_LENGTH - 1);
    }
    if (strlen(config.supabase_url) > 0) {
        strncpy(supabaseUrl, config.supabase_url, 255);
        snprintf(supabaseFunctionsUrl, 255, "%s/functions/v1", config.supabase_url);
        Serial.printf("[NetworkHandler] Supabase URL: %s\n", supabaseUrl);
    }
}
