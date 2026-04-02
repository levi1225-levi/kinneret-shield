#ifndef NFC_HANDLER_H
#define NFC_HANDLER_H

#include <Arduino.h>
#include "config.h"
#include <Adafruit_PN532.h>

typedef void (*NFCCardCallback)(uint8_t* uid, uint8_t uidLength);
typedef void (*NFCErrorCallback)();

class NFCHandler {
public:
    NFCHandler();
    ~NFCHandler();

    // Initialization
    void init();

    // Main update loop - call periodically from state machine
    void update();

    // Register callbacks
    void onCardDetected(NFCCardCallback callback) { cardDetectedCallback = callback; }
    void onCardReadError(NFCErrorCallback callback) { errorCallback = callback; }

    // Manual scan request
    bool scanForCard(uint8_t* uid, uint8_t* uidLength);

    // Status queries
    bool isReady() const { return initialized; }
    const char* getLastError() const { return lastError; }

private:
    // NFC scanning
    bool readCardUID(uint8_t* uid, uint8_t* uidLength);
    void handleScanError(const char* error);
    void attemptRecovery();

    // Members
    Adafruit_PN532* nfc;
    bool initialized;
    unsigned long lastScanTime;
    unsigned long lastCardTime;
    uint8_t lastUID[10];
    uint8_t lastUIDLength;
    char lastError[64];
    int errorCount;
    int consecutiveSuccesses;

    // Callbacks
    NFCCardCallback cardDetectedCallback;
    NFCErrorCallback errorCallback;
};

#endif // NFC_HANDLER_H
