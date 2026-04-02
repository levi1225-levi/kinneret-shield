#ifndef OTA_HANDLER_H
#define OTA_HANDLER_H

#include <Arduino.h>
#include "config.h"
#include <Update.h>
#include <HTTPClient.h>

typedef void (*OTAProgressCallback)(int percent);
typedef void (*OTACompleteCallback)(bool success);

class OTAHandler {
public:
    OTAHandler();
    ~OTAHandler();

    // Initialization
    void init();

    // Update management
    bool checkForUpdates();
    bool downloadAndFlash(const char* firmwareUrl, const char* version);
    void setProgressCallback(OTAProgressCallback callback) { progressCallback = callback; }
    void setCompleteCallback(OTACompleteCallback callback) { completeCallback = callback; }

    // Status
    bool isUpdating() const { return updating; }
    bool isReady() const { return initialized; }
    const char* getLastError() const { return lastError; }
    const char* getLatestVersion() const { return latestVersion; }

private:
    // Helper methods
    bool verifyFirmwareSignature(const char* firmware, size_t size);
    bool rollbackOnFailure();
    void reportUpdateProgress(int percent);
    void reportUpdateComplete(bool success);

    // HTTP streaming
    bool streamFirmware(const char* url, size_t& downloadedBytes);

    // Members
    bool initialized;
    bool updating;
    char lastError[64];
    char latestVersion[32];
    unsigned long updateStartTime;

    // Callbacks
    OTAProgressCallback progressCallback;
    OTACompleteCallback completeCallback;

    // Update state
    size_t totalBytes;
    size_t downloadedBytes;
};

#endif // OTA_HANDLER_H
