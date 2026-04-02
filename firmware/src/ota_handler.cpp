#include "ota_handler.h"

OTAHandler::OTAHandler()
    : initialized(false),
      updating(false),
      updateStartTime(0),
      progressCallback(nullptr),
      completeCallback(nullptr),
      totalBytes(0),
      downloadedBytes(0) {
    memset(lastError, 0, 64);
    memset(latestVersion, 0, 32);
}

OTAHandler::~OTAHandler() {
}

void OTAHandler::init() {
    Serial.println("[OTAHandler] Initializing...");
    initialized = true;
}

bool OTAHandler::checkForUpdates() {
    if (!initialized) return false;

    Serial.println("[OTAHandler] Checking for updates...");

    // TODO: Implement version check with server
    // This would make an HTTP request to get the latest firmware version
    // and compare with FIRMWARE_VERSION

    return false; // No updates available by default
}

bool OTAHandler::downloadAndFlash(const char* firmwareUrl, const char* version) {
    if (!initialized || updating) {
        return false;
    }

    Serial.printf("[OTAHandler] Starting firmware update: %s -> %s\n", FIRMWARE_VERSION, version);

    updating = true;
    updateStartTime = millis();
    downloadedBytes = 0;
    totalBytes = 0;

    // Begin OTA update
    if (!Update.begin(-1, U_FLASH)) {
        Serial.printf("[OTAHandler] Update begin failed: %s\n", Update.errorString());
        strncpy(lastError, Update.errorString(), 63);
        updating = false;
        reportUpdateComplete(false);
        return false;
    }

    // Stream firmware from URL
    if (!streamFirmware(firmwareUrl, downloadedBytes)) {
        Serial.println("[OTAHandler] Firmware stream failed");
        Update.abort();
        updating = false;
        reportUpdateComplete(false);
        return false;
    }

    // End update and verify
    if (!Update.end(true)) {
        Serial.printf("[OTAHandler] Update end failed: %s\n", Update.errorString());
        strncpy(lastError, Update.errorString(), 63);
        updating = false;
        reportUpdateComplete(false);
        return false;
    }

    Serial.println("[OTAHandler] Firmware update complete, restarting...");
    strncpy(latestVersion, version, 31);
    updating = false;
    reportUpdateComplete(true);

    // Restart will happen in state machine after delay
    return true;
}

bool OTAHandler::streamFirmware(const char* url, size_t& downloadedBytes) {
    HTTPClient http;

    Serial.printf("[OTAHandler] Downloading from: %s\n", url);

    http.begin(url);
    http.setTimeout(30000);

    int httpCode = http.GET();

    if (httpCode != HTTP_CODE_OK) {
        Serial.printf("[OTAHandler] HTTP error: %d\n", httpCode);
        snprintf(lastError, 63, "HTTP %d", httpCode);
        http.end();
        return false;
    }

    // Get total size
    totalBytes = http.getSize();
    Serial.printf("[OTAHandler] Firmware size: %d bytes\n", totalBytes);

    // Get stream
    WiFiClient* stream = http.getStreamPtr();
    if (!stream) {
        strncpy(lastError, "Stream error", 63);
        http.end();
        return false;
    }

    // Read and write in chunks
    uint8_t buffer[1024];
    int bufferLen;
    downloadedBytes = 0;

    while (http.connected() && (bufferLen = stream->readBytes(buffer, sizeof(buffer))) > 0) {
        // Write to flash
        if (Update.write(buffer, bufferLen) != bufferLen) {
            Serial.printf("[OTAHandler] Flash write failed: %s\n", Update.errorString());
            strncpy(lastError, Update.errorString(), 63);
            http.end();
            return false;
        }

        downloadedBytes += bufferLen;

        // Report progress
        int percent = (downloadedBytes * 100) / totalBytes;
        reportUpdateProgress(percent);

        Serial.printf(".");
        if (percent % 10 == 0) {
            Serial.printf(" %d%%\n", percent);
        }

        // Prevent watchdog timeout
        vTaskDelay(pdMS_TO_TICKS(10));
    }

    http.end();
    Serial.println("\n[OTAHandler] Download complete");
    return true;
}

bool OTAHandler::verifyFirmwareSignature(const char* firmware, size_t size) {
    // TODO: Implement signature verification for security
    // This would verify the firmware is signed by the server
    return true; // Placeholder
}

bool OTAHandler::rollbackOnFailure() {
    // TODO: Implement rollback to previous firmware
    // This requires storing backup of current firmware
    return false; // Placeholder
}

void OTAHandler::reportUpdateProgress(int percent) {
    if (progressCallback) {
        progressCallback(percent);
    }
}

void OTAHandler::reportUpdateComplete(bool success) {
    if (completeCallback) {
        completeCallback(success);
    }
}
