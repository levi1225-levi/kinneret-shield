#include "network_handler.h"
#include <HTTPClient.h>

NetworkHandler::NetworkHandler()
    : initialized(false),
      serverConnected(false),
      wifiManager(nullptr),
      configServer(nullptr),
      lastConnectionAttempt(0),
      lastHeartbeatTime(0),
      connectionRetries(0),
      wifiSetupMode(false),
      configServerRunning(false),
      eventCallback(nullptr) {
    memset(lastError, 0, 64);
    memset(deviceId, 0, MAX_DEVICE_ID_LENGTH);
    memset(apiKey, 0, MAX_API_KEY_LENGTH);
    memset(roomName, 0, MAX_ROOM_NAME_LENGTH);
    memset(supabaseUrl, 0, 256);
    memset(supabaseFunctionsUrl, 0, 256);
}

NetworkHandler::~NetworkHandler() {
    stopConfigServer();
    if (wifiManager) delete wifiManager;
    if (configServer) delete configServer;
}

void NetworkHandler::init() {
    Serial.println("[NetworkHandler] Initializing Supabase Edge Functions client...");

    // Get device configuration (will be overridden by SD card config)
    strncpy(deviceId, DEVICE_ID, MAX_DEVICE_ID_LENGTH - 1);
    strncpy(supabaseUrl, SUPABASE_URL, 255);
    strncpy(supabaseFunctionsUrl, SUPABASE_FUNCTIONS_URL, 255);

    // WiFi setup
    wifiManager = new WiFiManager();
    wifiManager->setConnectTimeout(WIFI_CONNECT_TIMEOUT_MS / 1000);
    wifiManager->setConfigPortalTimeout(600);

    initialized = true;
    Serial.println("[NetworkHandler] Initialization complete");
}

void NetworkHandler::update() {
    if (!initialized || !isWiFiConnected()) return;

    // HTTP-based polling doesn't require continuous update loop
    // Heartbeat is sent on demand or by timer in main application
}

void NetworkHandler::startWiFiManager() {
    if (!wifiManager) return;

    Serial.println("[NetworkHandler] Starting WiFi Manager...");

    char apName[32];
    snprintf(apName, 31, "%s-%04X", WIFI_MANAGER_AP_NAME, ESP.getEfuseMac() & 0xFFFF);

    wifiManager->autoConnect(apName);

    if (isWiFiConnected()) {
        Serial.printf("[NetworkHandler] WiFi connected to %s\n", getWiFiSSID());
        handleWiFiConnected();
    } else {
        Serial.println("[NetworkHandler] WiFi connection failed");
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

bool NetworkHandler::sendCardTap(const char* deviceId, uint8_t* uid, uint8_t uidLength) {
    if (!isWiFiConnected()) {
        Serial.println("[NetworkHandler] Not connected to WiFi, cannot send card tap");
        return false;
    }

    Serial.println("[NetworkHandler] Sending card tap to Supabase Edge Function");

    // Build JSON payload for Supabase Edge Function
    StaticJsonDocument<256> doc;
    doc["device_id"] = this->deviceId;  // Use stored device ID
    doc["card_uid"] = "";  // Will fill with hex string below

    // Convert UID to hex string
    char uidStr[32];
    for (uint8_t i = 0; i < uidLength; i++) {
        snprintf(uidStr + (i * 2), 3, "%02X", uid[i]);
    }
    doc["card_uid"] = uidStr;
    doc["timestamp"] = millis() / 1000;

    // Serialize to string
    String jsonStr;
    serializeJson(doc, jsonStr);

    return sendHttpPost(DEVICE_TAP_ENDPOINT, jsonStr.c_str());
}

bool NetworkHandler::sendHeartbeat(const char* deviceId, const char* firmwareVersion) {
    if (!isWiFiConnected()) {
        return false;
    }

    unsigned long now = millis();
    lastHeartbeatTime = now;

    Serial.println("[NetworkHandler] Sending heartbeat to Supabase Edge Function");

    // Build JSON payload for Supabase Edge Function
    StaticJsonDocument<256> doc;
    doc["device_id"] = this->deviceId;  // Use stored device ID
    doc["firmware_version"] = firmwareVersion;
    doc["free_heap"] = ESP.getFreeHeap();
    doc["wifi_rssi"] = getWiFiSignal();
    doc["uptime"] = now / 1000;

    // Serialize to string
    String jsonStr;
    serializeJson(doc, jsonStr);

    return sendHttpPost(DEVICE_HEARTBEAT_ENDPOINT, jsonStr.c_str());
}

bool NetworkHandler::sendHttpPost(const char* endpoint, const char* jsonPayload) {
    HTTPClient http;

    // Build full Supabase Edge Function URL
    String url = String(supabaseFunctionsUrl) + endpoint;

    Serial.printf("[NetworkHandler] POST to %s\n", url.c_str());
    Serial.printf("[NetworkHandler] Payload: %s\n", jsonPayload);

    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader(API_KEY_HEADER, apiKey);  // "x-device-api-key" header
    http.setTimeout(HTTP_TIMEOUT_MS);

    int httpCode = http.POST(jsonPayload);

    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
        Serial.printf("[NetworkHandler] POST success: %d\n", httpCode);
        String response = http.getString();

        Serial.printf("[NetworkHandler] Response: %s\n", response.c_str());

        // Parse response for attendance result and commands
        DynamicJsonDocument responseDoc(512);
        DeserializationError error = deserializeJson(responseDoc, response);
        if (!error) {
            // Process response (may contain camper name, status, or emergency commands)
            parseResponseCommand(response.c_str());

            if (eventCallback && responseDoc.containsKey("status")) {
                const char* status = responseDoc["status"];
                eventCallback("ATTENDANCE_RESULT", status);
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

void NetworkHandler::buildAuthHeaders() {
    // API key is loaded from config.json on SD card during initialization
    // This is called to refresh headers if needed
    Serial.printf("[NetworkHandler] Using API key: %s\n", apiKey);
}

void NetworkHandler::parseResponseCommand(const char* jsonStr) {
    // Parse response for emergency commands or other server-sent directives
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, jsonStr);

    if (error) {
        Serial.printf("[NetworkHandler] Failed to parse response: %s\n", error.c_str());
        return;
    }

    // Check for emergency command
    if (doc.containsKey("emergency")) {
        const char* emergencyType = doc["emergency"];
        if (eventCallback) {
            eventCallback("EMERGENCY_COMMAND", emergencyType);
        }
    }

    // Check for firmware update command
    if (doc.containsKey("firmware_update")) {
        if (eventCallback) {
            eventCallback("FIRMWARE_UPDATE", "");
        }
    }
}

bool NetworkHandler::connectToServer() {
    if (!isWiFiConnected()) {
        return false;
    }

    Serial.println("[NetworkHandler] Server connection established (HTTP polling mode)");

    serverConnected = true;

    if (eventCallback) {
        eventCallback("SERVER_CONNECTED", "");
    }

    return true;
}


void NetworkHandler::startConfigServer(uint16_t port) {
    if (configServerRunning || !configServer) return;

    Serial.printf("[NetworkHandler] Starting config server on port %d\n", port);

    configServer = new AsyncWebServer(port);

    // Configuration endpoint
    configServer->on("/config", HTTP_GET, [this](AsyncServerRequest* request) {
        Serial.println("[NetworkHandler] Config request received");

        StaticJsonDocument<512> doc;
        doc["device_id"] = deviceId;
        doc["room_name"] = roomName;
        doc["wifi_ssid"] = WiFi.SSID();
        doc["wifi_rssi"] = WiFi.RSSI();
        doc["firmware_version"] = FIRMWARE_VERSION;

        String response;
        serializeJson(doc, response);
        request->send(200, "application/json", response);
    });

    // Configuration update endpoint
    configServer->on("/config", HTTP_POST, [this](AsyncServerRequest* request) {
        // Handle config update
        request->send(200, "application/json", "{\"status\": \"ok\"}");
    });

    configServer->begin();
    configServerRunning = true;
}

void NetworkHandler::stopConfigServer() {
    if (configServer) {
        configServer->end();
        configServerRunning = false;
    }
}

void NetworkHandler::handleWiFiConnected() {
    Serial.println("[NetworkHandler] WiFi connected");
    Serial.printf("[NetworkHandler] SSID: %s\n", getWiFiSSID());
    Serial.printf("[NetworkHandler] IP: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("[NetworkHandler] RSSI: %d\n", getWiFiSignal());

    if (eventCallback) {
        eventCallback("WIFI_CONNECTED", WiFi.SSID().c_str());
    }

    // Try to connect to server
    connectToServer();

    // Start config server
    startConfigServer(80);
}

void NetworkHandler::handleWiFiDisconnected() {
    Serial.println("[NetworkHandler] WiFi disconnected");
    serverConnected = false;

    if (eventCallback) {
        eventCallback("WIFI_DISCONNECTED", "");
    }

    stopConfigServer();
}


void NetworkHandler::parseDeviceConfig(const JsonDocument& doc) {
    if (doc.containsKey("device_id")) {
        strncpy(deviceId, doc["device_id"], MAX_DEVICE_ID_LENGTH - 1);
    }
    if (doc.containsKey("room_name")) {
        strncpy(roomName, doc["room_name"], MAX_ROOM_NAME_LENGTH - 1);
    }
    if (doc.containsKey("api_key")) {
        strncpy(apiKey, doc["api_key"], MAX_API_KEY_LENGTH - 1);
    }
}
