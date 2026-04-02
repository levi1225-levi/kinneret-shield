#include "network_handler.h"
#include <HTTPClient.h>

NetworkHandler::NetworkHandler()
    : initialized(false),
      serverConnected(false),
      wifiManager(nullptr),
      configServer(nullptr),
      wsClient(nullptr),
      lastConnectionAttempt(0),
      wsLastPingTime(0),
      connectionRetries(0),
      wifiSetupMode(false),
      configServerRunning(false),
      eventCallback(nullptr) {
    memset(lastError, 0, 64);
    memset(deviceId, 0, MAX_DEVICE_ID_LENGTH);
    memset(apiKey, 0, MAX_API_KEY_LENGTH);
    memset(roomName, 0, MAX_ROOM_NAME_LENGTH);
}

NetworkHandler::~NetworkHandler() {
    stopConfigServer();
    if (wifiManager) delete wifiManager;
    if (wsClient) delete wsClient;
    if (configServer) delete configServer;
}

void NetworkHandler::init() {
    Serial.println("[NetworkHandler] Initializing...");

    // Get device configuration
    strncpy(deviceId, DEVICE_ID, MAX_DEVICE_ID_LENGTH - 1);

    // WiFi setup
    wifiManager = new WiFiManager();
    wifiManager->setConnectTimeout(WIFI_CONNECT_TIMEOUT_MS / 1000);
    wifiManager->setConfigPortalTimeout(600);

    // WebSocket client setup
    wsClient = new WebSocketsClient();
    wsClient->onEvent([this](WStype_t type, uint8_t* payload, size_t length) {
        handleWebSocketEvent(type, payload, length);
    });

    initialized = true;
    Serial.println("[NetworkHandler] Initialization complete");
}

void NetworkHandler::update() {
    if (!initialized) return;

    unsigned long now = millis();

    // Keep WebSocket alive
    if (wsClient && serverConnected) {
        wsClient->loop();

        // Periodic ping
        if (now - wsLastPingTime > 30000) {
            wsClient->sendPing();
            wsLastPingTime = now;
        }
    }
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

    Serial.println("[NetworkHandler] Sending card tap to server");

    // Build JSON payload
    StaticJsonDocument<256> doc;
    doc["device_id"] = deviceId;
    doc["timestamp"] = millis() / 1000;

    // Convert UID to hex string
    char uidStr[32];
    for (uint8_t i = 0; i < uidLength; i++) {
        snprintf(uidStr + (i * 2), 3, "%02X", uid[i]);
    }
    doc["card_uid"] = uidStr;

    // Serialize to string
    String jsonStr;
    serializeJson(doc, jsonStr);

    return sendHttpPost(API_ENDPOINT_TAP, jsonStr.c_str());
}

bool NetworkHandler::sendHeartbeat(const char* deviceId, const char* firmwareVersion) {
    if (!isWiFiConnected()) {
        return false;
    }

    // Build JSON payload
    StaticJsonDocument<256> doc;
    doc["device_id"] = deviceId;
    doc["firmware_version"] = firmwareVersion;
    doc["free_heap"] = ESP.getFreeHeap();
    doc["wifi_rssi"] = getWiFiSignal();
    doc["uptime"] = millis() / 1000;

    // Serialize to string
    String jsonStr;
    serializeJson(doc, jsonStr);

    return sendHttpPost(API_ENDPOINT_HEARTBEAT, jsonStr.c_str());
}

bool NetworkHandler::sendHttpPost(const char* endpoint, const char* jsonPayload) {
    HTTPClient http;

    // Build full URL
    String url = String(SERVER_API_BASE_URL) + endpoint;

    Serial.printf("[NetworkHandler] POST to %s\n", url.c_str());
    Serial.printf("[NetworkHandler] Payload: %s\n", jsonPayload);

    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader(API_KEY_HEADER, apiKey);
    http.setTimeout(HTTP_TIMEOUT_MS);

    int httpCode = http.POST(jsonPayload);

    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
        Serial.printf("[NetworkHandler] POST success: %d\n", httpCode);
        String response = http.getString();

        // Parse response for attendance result
        DynamicJsonDocument responseDoc(512);
        DeserializationError error = deserializeJson(responseDoc, response);
        if (!error && responseDoc.containsKey("status")) {
            if (eventCallback) {
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
    // Load API key from storage
    // This is typically loaded from config.json on SD card
    strncpy(apiKey, "DEFAULT_API_KEY", MAX_API_KEY_LENGTH - 1);
}

bool NetworkHandler::connectToServer() {
    if (!isWiFiConnected()) {
        return false;
    }

    Serial.println("[NetworkHandler] Connecting to server...");

    // Convert SERVER_API_BASE_URL to hostname for WebSocket
    String wsUrl = String(SERVER_API_BASE_URL);
    wsUrl.replace("http://", "");
    wsUrl.replace("https://", "");

    // TODO: Implement WebSocket connection with proper URL parsing
    // For now, return success (HTTP-only mode)
    serverConnected = true;
    wsLastPingTime = millis();

    if (eventCallback) {
        eventCallback("SERVER_CONNECTED", "");
    }

    return true;
}

void NetworkHandler::subscribeToCommands() {
    // Subscribe to command WebSocket channel
    if (wsClient && serverConnected) {
        String msg = "{\"type\": \"subscribe\", \"channel\": \"commands\"}";
        wsClient->sendTXT(msg);
    }
}

void NetworkHandler::unsubscribeFromCommands() {
    if (wsClient && serverConnected) {
        String msg = "{\"type\": \"unsubscribe\", \"channel\": \"commands\"}";
        wsClient->sendTXT(msg);
    }
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

void NetworkHandler::handleWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
    case WStype_CONNECTED:
        Serial.println("[NetworkHandler] WebSocket connected");
        subscribeToCommands();
        break;

    case WStype_TEXT:
        Serial.printf("[NetworkHandler] WebSocket text: %s\n", (char*)payload);
        {
            char jsonStr[length + 1];
            memcpy(jsonStr, payload, length);
            jsonStr[length] = '\0';
            processServerCommand(jsonStr);
        }
        break;

    case WStype_DISCONNECTED:
        Serial.println("[NetworkHandler] WebSocket disconnected");
        serverConnected = false;
        break;

    default:
        break;
    }
}

void NetworkHandler::processServerCommand(const char* jsonStr) {
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, jsonStr);

    if (error) {
        Serial.printf("[NetworkHandler] JSON parse error: %s\n", error.c_str());
        return;
    }

    if (doc.containsKey("command")) {
        const char* command = doc["command"];
        const char* param = doc.containsKey("param") ? doc["param"] : "";

        if (eventCallback) {
            eventCallback("SERVER_COMMAND", command);
        }
    }
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
