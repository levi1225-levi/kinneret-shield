#include "state_machine.h"
#include "nfc_handler.h"
#include "display_handler.h"
#include "led_handler.h"
#include "audio_handler.h"
#include "network_handler.h"
#include "storage_handler.h"

StateMachine::StateMachine()
    : currentState(STATE_BOOT),
      previousState(STATE_BOOT),
      stateEnterTime(0),
      lastHeartbeat(0),
      lastNFCScan(0),
      lastDisplayUpdate(0),
      retryCount(0),
      lastCardUIDLength(0),
      lastCardDetectionTime(0),
      nfcHandler(nullptr),
      displayHandler(nullptr),
      ledHandler(nullptr),
      audioHandler(nullptr),
      networkHandler(nullptr),
      storageHandler(nullptr),
      emergencyMode(EMERGENCY_NONE),
      audioVolume(200),
      isConnectedToServer(false),
      isConnectedToWiFi(false),
      firmwareUpdateProgress(0),
      firmwareUpdateInProgress(false) {
    memset(deviceId, 0, MAX_DEVICE_ID_LENGTH);
    memset(roomName, 0, MAX_ROOM_NAME_LENGTH);
    memset(lastCardUID, 0, 10);
    memset(lastStudentName, 0, 64);
    memset(lastStudentStatus, 0, 32);
    memset(pendingFirmwareUrl, 0, 256);
    memset(pendingFirmwareVersion, 0, 32);
}

StateMachine::~StateMachine() {
    if (nfcHandler) delete nfcHandler;
    if (displayHandler) delete displayHandler;
    if (ledHandler) delete ledHandler;
    if (audioHandler) delete audioHandler;
    if (networkHandler) delete networkHandler;
    if (storageHandler) delete storageHandler;
}

void StateMachine::init() {
    Serial.println("[StateMachine] Initializing...");

    // Initialize subsystems in dependency order
    storageHandler = new StorageHandler();
    storageHandler->init();

    // Load configuration from storage
    storageHandler->loadDeviceConfig(deviceId, roomName);

    displayHandler = new DisplayHandler();
    displayHandler->init();
    displayHandler->showBootScreen(FIRMWARE_VERSION);

    ledHandler = new LEDHandler();
    ledHandler->init();
    ledHandler->bootAnimation();

    audioHandler = new AudioHandler();
    audioHandler->init();
    audioHandler->playBootChime();

    nfcHandler = new NFCHandler();
    nfcHandler->init();

    networkHandler = new NetworkHandler();
    networkHandler->init();

    stateEnterTime = millis();
    lastHeartbeat = millis();
    lastNFCScan = millis();

    Serial.println("[StateMachine] Initialization complete");
    Serial.printf("[StateMachine] Device ID: %s, Room: %s\n", deviceId, roomName);
}

void StateMachine::update() {
    unsigned long now = millis();

    // Update subsystems
    if (nfcHandler) nfcHandler->update();
    if (displayHandler) displayHandler->update();
    if (ledHandler) ledHandler->update();
    if (audioHandler) audioHandler->update();
    if (networkHandler) networkHandler->update();

    // Execute state-specific logic
    onStateLoop(currentState);

    // Periodic heartbeat
    if (now - lastHeartbeat > HEARTBEAT_INTERVAL_MS && isConnectedToWiFi) {
        if (networkHandler) {
            networkHandler->sendHeartbeat(deviceId, FIRMWARE_VERSION);
        }
        lastHeartbeat = now;
    }
}

void StateMachine::transitionToState(DeviceState newState) {
    if (newState == currentState) return;

    onStateExit(currentState);
    previousState = currentState;
    currentState = newState;
    stateEnterTime = millis();
    retryCount = 0;

    Serial.printf("[StateMachine] Transition: %d -> %d\n", previousState, newState);

    onStateEnter(newState);
}

void StateMachine::onStateEnter(DeviceState state) {
    switch (state) {
    case STATE_BOOT:
        if (displayHandler) displayHandler->showBootScreen(FIRMWARE_VERSION);
        if (ledHandler) ledHandler->bootAnimation();
        if (audioHandler) audioHandler->playBootChime();
        break;

    case STATE_WIFI_CONNECTING:
        Serial.println("[StateMachine] Entering WIFI_CONNECTING");
        if (displayHandler) displayHandler->showWiFiSetupScreen(WIFI_MANAGER_AP_NAME);
        if (ledHandler) ledHandler->setPattern(LED_PATTERN_PULSE, LED_COLOR_ORANGE);
        retryCount = 0;
        break;

    case STATE_SERVER_CONNECTING:
        Serial.println("[StateMachine] Entering SERVER_CONNECTING");
        if (displayHandler) displayHandler->showStatusScreen("Connecting...", "to server");
        if (ledHandler) ledHandler->setPattern(LED_PATTERN_PULSE, LED_COLOR_YELLOW);
        retryCount = 0;
        break;

    case STATE_IDLE:
        Serial.println("[StateMachine] Entering IDLE");
        if (displayHandler) displayHandler->showIdleScreen(roomName);
        if (ledHandler) ledHandler->setPattern(LED_PATTERN_BREATHING, LED_COLOR_BLUE);
        break;

    case STATE_CARD_DETECTED:
        Serial.println("[StateMachine] Entering CARD_DETECTED");
        if (ledHandler) ledHandler->setPattern(LED_PATTERN_FLASH, LED_COLOR_WHITE);
        if (audioHandler) audioHandler->playCardBeep();
        break;

    case STATE_PROCESSING:
        Serial.println("[StateMachine] Entering PROCESSING");
        if (displayHandler) displayHandler->showProcessingScreen();
        if (ledHandler) ledHandler->setPattern(LED_PATTERN_SPIN, LED_COLOR_YELLOW);
        break;

    case STATE_SUCCESS:
        Serial.println("[StateMachine] Entering SUCCESS");
        if (displayHandler) displayHandler->showSuccessScreen(lastStudentName, lastStudentStatus);
        if (ledHandler) ledHandler->setPattern(LED_PATTERN_SWEEP, LED_COLOR_GREEN);
        if (audioHandler) audioHandler->playSuccessTone();
        break;

    case STATE_FAILURE:
        Serial.println("[StateMachine] Entering FAILURE");
        if (displayHandler) displayHandler->showErrorScreen("Check-in failed");
        if (ledHandler) ledHandler->setPattern(LED_PATTERN_FLASH, LED_COLOR_RED);
        if (audioHandler) audioHandler->playFailureTone();
        break;

    case STATE_ERROR:
        Serial.println("[StateMachine] Entering ERROR");
        if (displayHandler) displayHandler->showErrorScreen("System Error");
        if (ledHandler) ledHandler->setPattern(LED_PATTERN_FLASH, LED_COLOR_RED);
        break;

    case STATE_EMERGENCY:
        Serial.println("[StateMachine] Entering EMERGENCY");
        if (displayHandler) {
            if (emergencyMode == EMERGENCY_LOCKDOWN) {
                displayHandler->showEmergencyScreen("LOCKDOWN");
            } else if (emergencyMode == EMERGENCY_EVACUATION) {
                displayHandler->showEmergencyScreen("EVACUATION");
            }
        }
        if (ledHandler) ledHandler->setPattern(LED_PATTERN_ALTERNATING, LED_COLOR_RED);
        if (audioHandler) audioHandler->playEmergencyAlarm();
        break;

    case STATE_FIRMWARE_UPDATE:
        Serial.println("[StateMachine] Entering FIRMWARE_UPDATE");
        if (displayHandler) displayHandler->showFirmwareUpdateScreen(0);
        if (ledHandler) ledHandler->setPattern(LED_PATTERN_PULSE, LED_COLOR_CYAN);
        break;

    case STATE_OFFLINE:
        Serial.println("[StateMachine] Entering OFFLINE");
        if (displayHandler) displayHandler->showOfflineScreen();
        if (ledHandler) ledHandler->setPattern(LED_PATTERN_PULSE, LED_COLOR_ORANGE);
        break;
    }
}

void StateMachine::onStateExit(DeviceState state) {
    // State-specific cleanup
    switch (state) {
    case STATE_BOOT:
        break;
    case STATE_EMERGENCY:
        if (audioHandler) audioHandler->stopAllAudio();
        break;
    default:
        break;
    }
}

void StateMachine::onStateLoop(DeviceState state) {
    unsigned long now = millis();

    switch (state) {
    case STATE_BOOT:
        performStateBootLogic();
        break;
    case STATE_WIFI_CONNECTING:
        performStateWifiConnectingLogic();
        break;
    case STATE_SERVER_CONNECTING:
        performStateServerConnectingLogic();
        break;
    case STATE_IDLE:
        performStateIdleLogic();
        break;
    case STATE_CARD_DETECTED:
        performStateCardDetectedLogic();
        break;
    case STATE_PROCESSING:
        performStateProcessingLogic();
        break;
    case STATE_SUCCESS:
        performStateSuccessLogic();
        break;
    case STATE_FAILURE:
        performStateFailureLogic();
        break;
    case STATE_ERROR:
        performStateErrorLogic();
        break;
    case STATE_EMERGENCY:
        performStateEmergencyLogic();
        break;
    case STATE_FIRMWARE_UPDATE:
        performStateFirmwareUpdateLogic();
        break;
    case STATE_OFFLINE:
        performStateOfflineLogic();
        break;
    }
}

void StateMachine::performStateBootLogic() {
    unsigned long now = millis();
    if (now - stateEnterTime > BOOT_SCREEN_DURATION_MS) {
        transitionToState(STATE_WIFI_CONNECTING);
    }
}

void StateMachine::performStateWifiConnectingLogic() {
    if (isConnectedToWiFi) {
        transitionToState(STATE_SERVER_CONNECTING);
    } else {
        // Let NetworkHandler manage WiFi connection attempts
        if (networkHandler) {
            networkHandler->startWiFiManager();
        }
    }
}

void StateMachine::performStateServerConnectingLogic() {
    if (isConnectedToServer) {
        transitionToState(STATE_IDLE);
    } else if (isConnectedToWiFi) {
        // Even without server, we can operate offline
        if (millis() - stateEnterTime > 10000) {
            transitionToState(STATE_OFFLINE);
        }
    }
}

void StateMachine::performStateIdleLogic() {
    // NFC handler will trigger card detection events
    // No need to do anything here, waiting for events
}

void StateMachine::performStateCardDetectedLogic() {
    unsigned long now = millis();
    if (now - stateEnterTime > 500) {
        transitionToState(STATE_PROCESSING);
    }
}

void StateMachine::performStateProcessingLogic() {
    // Waiting for attendance processing to complete
    // NetworkHandler will call onAttendanceProcessed()
}

void StateMachine::performStateSuccessLogic() {
    unsigned long now = millis();
    if (now - stateEnterTime > SUCCESS_SCREEN_DURATION_MS) {
        transitionToState(STATE_IDLE);
    }
}

void StateMachine::performStateFailureLogic() {
    unsigned long now = millis();
    if (now - stateEnterTime > ERROR_SCREEN_DURATION_MS) {
        transitionToState(STATE_IDLE);
    }
}

void StateMachine::performStateErrorLogic() {
    unsigned long now = millis();
    if (now - stateEnterTime > ERROR_SCREEN_DURATION_MS) {
        attemptRecovery();
    }
}

void StateMachine::performStateEmergencyLogic() {
    // Stay in emergency state until server sends all-clear
    // Continue to play alarm and display warning
}

void StateMachine::performStateFirmwareUpdateLogic() {
    // OTA handler manages the update process
    // Will trigger completion callback
}

void StateMachine::performStateOfflineLogic() {
    // Operate without server connection
    // Local logging and queueing happens here
}

void StateMachine::handleError(const char* errorMsg) {
    Serial.printf("[StateMachine] Error: %s\n", errorMsg);
    transitionToState(STATE_ERROR);
}

void StateMachine::attemptRecovery() {
    retryCount++;
    if (retryCount > MAX_RETRY_ATTEMPTS) {
        transitionToState(STATE_OFFLINE);
    } else {
        transitionToState(previousState);
    }
}

// ============================================================================
// EVENT CALLBACKS
// ============================================================================

void StateMachine::onCardDetected(uint8_t* uid, uint8_t uidLength) {
    Serial.printf("[StateMachine] Card detected, UID length: %d\n", uidLength);

    // Debounce check
    unsigned long now = millis();
    if (now - lastCardDetectionTime < NFC_DEBOUNCE_TIME_MS) {
        if (memcmp(uid, lastCardUID, uidLength) == 0) {
            Serial.println("[StateMachine] Card debounce - ignoring duplicate");
            return;
        }
    }

    // Store card info
    memcpy(lastCardUID, uid, uidLength);
    lastCardUIDLength = uidLength;
    lastCardDetectionTime = now;

    // Log to storage and send to server
    if (storageHandler) {
        storageHandler->logAttendanceEvent(uid, uidLength);
    }

    if (networkHandler && isConnectedToServer) {
        networkHandler->sendCardTap(deviceId, uid, uidLength);
    }

    transitionToState(STATE_CARD_DETECTED);
}

void StateMachine::onCardReadError() {
    Serial.println("[StateMachine] NFC read error");
    handleError("NFC Read Error");
}

void StateMachine::onNetworkConnected() {
    Serial.println("[StateMachine] WiFi connected");
    isConnectedToWiFi = true;
    if (currentState == STATE_WIFI_CONNECTING) {
        transitionToState(STATE_SERVER_CONNECTING);
    }
}

void StateMachine::onNetworkDisconnected() {
    Serial.println("[StateMachine] WiFi disconnected");
    isConnectedToWiFi = false;
    if (currentState != STATE_OFFLINE && currentState != STATE_WIFI_CONNECTING) {
        transitionToState(STATE_OFFLINE);
    }
}

void StateMachine::onServerConnected() {
    Serial.println("[StateMachine] Server connected");
    isConnectedToServer = true;
    if (currentState == STATE_SERVER_CONNECTING || currentState == STATE_OFFLINE) {
        transitionToState(STATE_IDLE);
    }
}

void StateMachine::onServerDisconnected() {
    Serial.println("[StateMachine] Server disconnected");
    isConnectedToServer = false;
}

void StateMachine::onAttendanceProcessed(bool success, const char* studentName, const char* status) {
    strncpy(lastStudentName, studentName, 63);
    strncpy(lastStudentStatus, status, 31);

    if (success) {
        transitionToState(STATE_SUCCESS);
    } else {
        transitionToState(STATE_FAILURE);
    }
}

void StateMachine::onServerCommand(const char* command, const char* param) {
    Serial.printf("[StateMachine] Server command: %s, param: %s\n", command, param);

    if (strcmp(command, "lockdown") == 0) {
        emergencyMode = EMERGENCY_LOCKDOWN;
        transitionToState(STATE_EMERGENCY);
    } else if (strcmp(command, "evacuation") == 0) {
        emergencyMode = EMERGENCY_EVACUATION;
        transitionToState(STATE_EMERGENCY);
    } else if (strcmp(command, "all_clear") == 0) {
        emergencyMode = EMERGENCY_NONE;
        transitionToState(STATE_IDLE);
    } else if (strcmp(command, "update_config") == 0) {
        if (storageHandler) {
            storageHandler->loadDeviceConfig(deviceId, roomName);
        }
    }
}

void StateMachine::onEmergencyMode(EmergencyMode mode) {
    emergencyMode = mode;
    if (mode != EMERGENCY_NONE) {
        transitionToState(STATE_EMERGENCY);
    } else {
        transitionToState(STATE_IDLE);
    }
}

void StateMachine::onFirmwareUpdateAvailable(const char* url, const char* version) {
    strncpy(pendingFirmwareUrl, url, 255);
    strncpy(pendingFirmwareVersion, version, 31);
    transitionToState(STATE_FIRMWARE_UPDATE);
}

void StateMachine::onFirmwareUpdateProgress(int percent) {
    firmwareUpdateProgress = percent;
    if (displayHandler) {
        displayHandler->showFirmwareUpdateScreen(percent);
    }
}

void StateMachine::onFirmwareUpdateComplete(bool success) {
    if (success) {
        if (displayHandler) displayHandler->showStatusScreen("Update", "Complete!");
        delay(2000);
        ESP.restart();
    } else {
        handleError("Update Failed");
    }
}

void StateMachine::forceState(DeviceState state) {
    Serial.printf("[StateMachine] Forcing state: %d\n", state);
    transitionToState(state);
}
