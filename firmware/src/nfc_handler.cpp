#include "nfc_handler.h"
#include <SPI.h>

NFCHandler::NFCHandler()
    : nfc(nullptr),
      initialized(false),
      lastScanTime(0),
      lastCardTime(0),
      lastUIDLength(0),
      errorCount(0),
      consecutiveSuccesses(0),
      cardDetectedCallback(nullptr),
      errorCallback(nullptr) {
    memset(lastUID, 0, 10);
    memset(lastError, 0, 64);
}

NFCHandler::~NFCHandler() {
    if (nfc) delete nfc;
}

void NFCHandler::init() {
    Serial.println("[NFCHandler] Initializing PN532 via SPI...");

    // Initialize PN532 NFC reader via software SPI
    nfc = new Adafruit_PN532(PN532_SCK_PIN, PN532_MISO_PIN, PN532_MOSI_PIN, PN532_SS_PIN);

    nfc->begin();

    // Get firmware version
    uint32_t versiondata = nfc->getFirmwareVersion();
    if (!versiondata) {
        Serial.println("[NFCHandler] PN532 not found or no response!");
        strncpy(lastError, "PN532 No Response", 63);
        initialized = false;
        return;
    }

    Serial.printf("[NFCHandler] Found PN532 chip: 0x%02X firmware: %d.%d\n",
        (versiondata >> 24) & 0xFF,
        (versiondata >> 16) & 0xFF,
        (versiondata >> 8) & 0xFF);

    // Configure PN532 for passive mode A (ISO14443Type A)
    nfc->setPassiveActivationRetries(0xFF);
    nfc->SAMConfig();

    initialized = true;
    errorCount = 0;
    consecutiveSuccesses = 0;
    lastScanTime = millis();

    Serial.println("[NFCHandler] Initialization complete");
}

void NFCHandler::update() {
    if (!initialized) return;

    unsigned long now = millis();

    // Scan at configured interval
    if (now - lastScanTime < NFC_SCAN_INTERVAL_MS) {
        return;
    }

    lastScanTime = now;

    uint8_t uid[10];
    uint8_t uidLength;

    // Check for card
    bool cardPresent = nfc->readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength, 50);

    if (cardPresent) {
        // Check for debounce - same card within 3 seconds
        if (now - lastCardTime > NFC_DEBOUNCE_TIME_MS || uidLength != lastUIDLength ||
            memcmp(uid, lastUID, uidLength) != 0) {

            // New card detected
            Serial.printf("[NFCHandler] Card detected, UID: ");
            for (uint8_t i = 0; i < uidLength; i++) {
                Serial.printf("%02X ", uid[i]);
            }
            Serial.println();

            // Store card info
            memcpy(lastUID, uid, uidLength);
            lastUIDLength = uidLength;
            lastCardTime = now;

            // Trigger callback
            if (cardDetectedCallback) {
                cardDetectedCallback(uid, uidLength);
            }

            // Reset error count on successful read
            errorCount = 0;
            consecutiveSuccesses++;
        }
    } else {
        // No card present - this is normal, not an error
    }
}

bool NFCHandler::readCardUID(uint8_t* uid, uint8_t* uidLength) {
    if (!initialized) {
        handleScanError("NFC not initialized");
        return false;
    }

    bool cardPresent = nfc->readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, uidLength, 50);

    if (!cardPresent) {
        handleScanError("No card detected");
        return false;
    }

    return true;
}

void NFCHandler::handleScanError(const char* error) {
    errorCount++;
    strncpy(lastError, error, 63);

    if (errorCount > 10) {
        Serial.printf("[NFCHandler] Persistent errors: %s\n", error);
        if (errorCallback) {
            errorCallback();
        }

        // Attempt recovery
        if (errorCount > 20) {
            attemptRecovery();
        }
    }
}

void NFCHandler::attemptRecovery() {
    Serial.println("[NFCHandler] Attempting recovery...");

    if (nfc) {
        delete nfc;
        nfc = nullptr;
    }

    initialized = false;
    errorCount = 0;
    delay(500);

    // Reinitialize
    init();
}

bool NFCHandler::scanForCard(uint8_t* uid, uint8_t* uidLength) {
    return readCardUID(uid, uidLength);
}
