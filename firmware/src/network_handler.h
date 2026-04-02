#ifndef NETWORK_HANDLER_H
#define NETWORK_HANDLER_H

#include <Arduino.h>
#include "config.h"
#include <WiFi.h>
#include <WiFiManager.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

typedef void (*NetworkEventCallback)(const char* event, const char* data);

class NetworkHandler {
public:
    NetworkHandler();
    ~NetworkHandler();

    // Initialization
    void init();

    // Main update loop
    void update();

    // WiFi management
    void startWiFiManager();
    bool connectToWiFi(const char* ssid, const char* password);
    bool isWiFiConnected() const { return WiFi.status() == WL_CONNECTED; }
    int getWiFiSignal() const { return WiFi.RSSI(); }
    const char* getWiFiSSID() const { return WiFi.SSID().c_str(); }

    // Server communication
    bool sendCardTap(const char* deviceId, uint8_t* uid, uint8_t uidLength);
    bool sendHeartbeat(const char* deviceId, const char* firmwareVersion);
    bool connectToServer();
    bool isServerConnected() const { return serverConnected; }

    // WebSocket commands
    void subscribeToCommands();
    void unsubscribeFromCommands();

    // Configuration endpoint
    void startConfigServer(uint16_t port = 80);
    void stopConfigServer();

    // Event callbacks
    void onNetworkEvent(NetworkEventCallback callback) { eventCallback = callback; }

    // Status
    bool isReady() const { return initialized; }
    const char* getLastError() const { return lastError; }

private:
    // WiFi event handlers
    void handleWiFiConnected();
    void handleWiFiDisconnected();

    // WebSocket handlers
    void handleWebSocketEvent(WStype_t type, uint8_t* payload, size_t length);
    void processServerCommand(const char* jsonStr);

    // HTTP helpers
    bool sendHttpPost(const char* endpoint, const char* jsonPayload);
    void buildAuthHeaders();

    // Helper methods
    void parseDeviceConfig(const JsonDocument& doc);

    // Members
    bool initialized;
    bool serverConnected;
    char lastError[64];
    char deviceId[MAX_DEVICE_ID_LENGTH];
    char apiKey[MAX_API_KEY_LENGTH];
    char roomName[MAX_ROOM_NAME_LENGTH];

    // WiFi & Server
    WiFiManager* wifiManager;
    AsyncWebServer* configServer;
    WebSocketsClient* wsClient;
    unsigned long lastConnectionAttempt;
    unsigned long wsLastPingTime;
    int connectionRetries;

    // Configuration
    bool wifiSetupMode;
    bool configServerRunning;

    // Callbacks
    NetworkEventCallback eventCallback;

    // JSON buffer
    StaticJsonDocument<JSON_BUFFER_SIZE> jsonBuffer;
};

#endif // NETWORK_HANDLER_H
