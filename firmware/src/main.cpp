#include <Arduino.h>
#include "config.h"
#include "state_machine.h"
#include "nfc_handler.h"
#include "display_handler.h"
#include "led_handler.h"
#include "audio_handler.h"
#include "network_handler.h"
#include "storage_handler.h"
#include "ota_handler.h"

// ============================================================================
// GLOBAL OBJECTS
// ============================================================================

StateMachine* stateMachine = nullptr;
OTAHandler* otaHandler = nullptr;

unsigned long lastLoopTime = 0;
unsigned long loopCount = 0;

// ============================================================================
// CALLBACK FUNCTIONS
// ============================================================================

void onNFCCardDetected(uint8_t* uid, uint8_t uidLength) {
    if (stateMachine) {
        stateMachine->onCardDetected(uid, uidLength);
    }
}

void onNFCCardReadError() {
    if (stateMachine) {
        stateMachine->onCardReadError();
    }
}

void onNetworkEvent(const char* event, const char* data) {
    Serial.printf("[Main] Network event: %s, data: %s\n", event, data);

    if (strcmp(event, "WIFI_CONNECTED") == 0) {
        if (stateMachine) {
            stateMachine->onNetworkConnected();
        }
    } else if (strcmp(event, "WIFI_DISCONNECTED") == 0) {
        if (stateMachine) {
            stateMachine->onNetworkDisconnected();
        }
    } else if (strcmp(event, "SERVER_CONNECTED") == 0) {
        if (stateMachine) {
            stateMachine->onServerConnected();
        }
    } else if (strcmp(event, "SERVER_COMMAND") == 0) {
        if (stateMachine) {
            // Parse command and delegate to state machine
            if (strcmp(data, "lockdown") == 0) {
                stateMachine->onEmergencyMode(EMERGENCY_LOCKDOWN);
            } else if (strcmp(data, "evacuation") == 0) {
                stateMachine->onEmergencyMode(EMERGENCY_EVACUATION);
            }
        }
    } else if (strcmp(event, "ATTENDANCE_RESULT") == 0) {
        if (stateMachine) {
            bool success = strcmp(data, "success") == 0;
            stateMachine->onAttendanceProcessed(success, "Student Name", "checked in");
        }
    } else if (strcmp(event, "WRISTBAND_PROGRAMMED") == 0) {
        if (stateMachine) {
            // Parse JSON response to get success status and UID
            // Expected format: {"success": true, "card_uid": "AABBCCDD", "message": "..."}
            DynamicJsonDocument doc(256);
            DeserializationError error = deserializeJson(doc, data);

            if (!error && doc.containsKey("success")) {
                bool success = doc["success"];
                const char* cardUid = doc.containsKey("card_uid") ? doc["card_uid"].as<const char*>() : "";
                const char* message = doc.containsKey("message") ? doc["message"].as<const char*>() : "";
                stateMachine->onWristbandProgrammed(success, cardUid, message);
            } else {
                // Default to failure if we can't parse
                stateMachine->onWristbandProgrammed(false, "", "Parse error");
            }
        }
    }
}

void onOTAProgress(int percent) {
    Serial.printf("[OTA] Progress: %d%%\n", percent);
    if (stateMachine) {
        stateMachine->onFirmwareUpdateProgress(percent);
    }
}

void onOTAComplete(bool success) {
    Serial.printf("[OTA] Complete: %s\n", success ? "success" : "failed");
    if (stateMachine) {
        stateMachine->onFirmwareUpdateComplete(success);
    }
}

// ============================================================================
// CORE SETUP
// ============================================================================

void setup() {
    // Initialize serial for debugging
    Serial.begin(115200);
    delay(2000);  // Give serial monitor time to connect

    Serial.println("\n\n");
    Serial.println("================================================");
    Serial.println("  KINNERET SHIELD - NFC Check-in Device");
    Serial.printf("  Firmware Version: %s\n", FIRMWARE_VERSION);
    Serial.printf("  Build Date: %s\n", FIRMWARE_BUILD_DATE);
    Serial.printf("  Free heap: %u bytes\n", ESP.getFreeHeap());
    Serial.println("================================================\n");

    // Create and initialize state machine
    stateMachine = new StateMachine();
    if (!stateMachine) {
        Serial.println("[Main] FATAL: Could not allocate state machine!");
        ESP.restart();
    }

    // Register NFC callbacks
    NFCHandler* nfc = nullptr;
    stateMachine->init();
    nfc = stateMachine->getNFCHandler();
    if (nfc) {
        nfc->onCardDetected(onNFCCardDetected);
        nfc->onCardReadError(onNFCCardReadError);
    }

    // Register network callbacks
    NetworkHandler* net = stateMachine->getNetworkHandler();
    if (net) {
        net->onNetworkEvent(onNetworkEvent);
    }

    // Initialize OTA handler
    otaHandler = new OTAHandler();
    if (otaHandler) {
        otaHandler->init();
        otaHandler->setProgressCallback(onOTAProgress);
        otaHandler->setCompleteCallback(onOTAComplete);
    }

    // Set system time (will sync from network later)
    // For now, use a default
    time_t now = 1640000000; // Nov 2021
    timeval tv = { .tv_sec = now };
    settimeofday(&tv, nullptr);

    Serial.println("[Main] Setup complete, entering main loop\n");
}

// ============================================================================
// MAIN LOOP
// ============================================================================

void loop() {
    unsigned long loopStartTime = millis();

    // Update state machine and all subsystems
    if (stateMachine) {
        stateMachine->update();
    }

    // Monitor loop timing
    unsigned long loopDuration = millis() - loopStartTime;
    if (loopDuration > 100) {
        Serial.printf("[Main] WARN: Loop took %lu ms (iteration %lu)\n", loopDuration, loopCount);
    }

    // Yield to system tasks
    vTaskDelay(pdMS_TO_TICKS(STATE_LOOP_INTERVAL_MS));

    loopCount++;
}

// ============================================================================
// EMERGENCY HANDLERS
// ============================================================================

void handleCrash() {
    Serial.println("\n\n[Main] FATAL ERROR - SYSTEM CRASH");
    Serial.printf("[Main] Free heap: %u bytes\n", ESP.getFreeHeap());
    Serial.printf("[Main] Stack overflow at PC: 0x%08x\n", (uint32_t)__builtin_return_address(0));

    // Try to log to SD card if available
    if (stateMachine) {
        StorageHandler* storage = stateMachine->getStorageHandler();
        if (storage) {
            // Log error
        }
    }

    // Restart after 10 seconds
    delay(10000);
    ESP.restart();
}

// ============================================================================
// DEBUG FUNCTIONS (for testing)
// ============================================================================

#ifdef DEBUG_MODE

void testNFCReader() {
    Serial.println("[Debug] Testing NFC reader...");
    NFCHandler* nfc = stateMachine->getNFCHandler();
    if (!nfc) return;

    uint8_t uid[10];
    uint8_t uidLength = 0;

    for (int i = 0; i < 10; i++) {
        if (nfc->scanForCard(uid, &uidLength)) {
            Serial.println("[Debug] Card detected!");
            Serial.print("[Debug] UID: ");
            for (uint8_t j = 0; j < uidLength; j++) {
                Serial.printf("%02X ", uid[j]);
            }
            Serial.println();
            break;
        }
        delay(100);
    }
}

void testLEDs() {
    Serial.println("[Debug] Testing LED patterns...");
    LEDHandler* led = stateMachine->getLEDHandler();
    if (!led) return;

    led->setPattern(LED_PATTERN_BREATHING, LED_COLOR_BLUE);
    delay(3000);

    led->setPattern(LED_PATTERN_PULSE, LED_COLOR_YELLOW);
    delay(3000);

    led->setPattern(LED_PATTERN_FLASH, LED_COLOR_RED);
    delay(3000);

    led->setPattern(LED_PATTERN_BREATHING, LED_COLOR_BLUE);
}

void testAudio() {
    Serial.println("[Debug] Testing audio...");
    AudioHandler* audio = stateMachine->getAudioHandler();
    if (!audio) return;

    audio->playBootChime();
    delay(500);

    audio->playCardBeep();
    delay(500);

    audio->playSuccessTone();
}

void testDisplay() {
    Serial.println("[Debug] Testing display...");
    DisplayHandler* display = stateMachine->getDisplayHandler();
    if (!display) return;

    display->showIdleScreen("Test Room");
    delay(3000);

    display->showSuccessScreen("John Smith", "check-in");
    delay(3000);

    display->showIdleScreen("Test Room");
}

#endif // DEBUG_MODE

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

void printSystemStatus() {
    Serial.println("\n========== SYSTEM STATUS ==========");
    Serial.printf("Uptime: %lu ms\n", millis());
    Serial.printf("Loop iterations: %lu\n", loopCount);
    Serial.printf("Free heap: %u bytes\n", ESP.getFreeHeap());
    Serial.printf("Total heap: %u bytes\n", ESP.getHeapSize());

    if (stateMachine) {
        Serial.printf("Current state: %d\n", stateMachine->getCurrentState());

        NetworkHandler* net = stateMachine->getNetworkHandler();
        if (net) {
            Serial.printf("WiFi connected: %s\n", net->isWiFiConnected() ? "yes" : "no");
            if (net->isWiFiConnected()) {
                Serial.printf("  SSID: %s\n", net->getWiFiSSIDStr());
                Serial.printf("  RSSI: %d dBm\n", net->getWiFiSignal());
            }
            Serial.printf("Server connected: %s\n", net->isServerConnected() ? "yes" : "no");
        }

        StorageHandler* storage = stateMachine->getStorageHandler();
        if (storage) {
            Serial.printf("SD card present: %s\n", storage->isSDCardPresent() ? "yes" : "no");
            Serial.printf("Sync queue size: %d\n", storage->getQueueSize());
        }
    }

    Serial.println("===================================\n");
}

// Graceful shutdown
void shutdown() {
    Serial.println("[Main] Shutting down gracefully...");

    if (stateMachine) {
        LEDHandler* led = stateMachine->getLEDHandler();
        if (led) {
            led->stopAll();
        }

        AudioHandler* audio = stateMachine->getAudioHandler();
        if (audio) {
            audio->stopAllAudio();
        }

        delete stateMachine;
        stateMachine = nullptr;
    }

    if (otaHandler) {
        delete otaHandler;
        otaHandler = nullptr;
    }

    Serial.println("[Main] Shutdown complete");
}
