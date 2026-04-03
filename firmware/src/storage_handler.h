#ifndef STORAGE_HANDLER_H
#define STORAGE_HANDLER_H

#include <Arduino.h>
#include "config.h"
#include <SD.h>
#include <ArduinoJson.h>

typedef struct {
    uint8_t uid[10];
    uint8_t uidLength;
    unsigned long timestamp;
    bool synced;
} AttendanceEvent;

typedef struct {
    char device_id[MAX_DEVICE_ID_LENGTH];
    char api_key[MAX_API_KEY_LENGTH];
    char location_name[MAX_ROOM_NAME_LENGTH];
    char supabase_url[256];
    char wifi_ssid[64];
    char wifi_password[64];
} DeviceConfig;

class StorageHandler {
public:
    StorageHandler();
    ~StorageHandler();

    // Initialization
    void init();

    // Configuration management
    bool loadDeviceConfig(DeviceConfig& config);
    bool saveDeviceConfig(const DeviceConfig& config);

    // Attendance logging
    void logAttendanceEvent(uint8_t* uid, uint8_t uidLength);
    int getCheckinCountToday();

    // Offline queue management
    bool queueCardTap(uint8_t* uid, uint8_t uidLength);
    bool dequeueCardTap(uint8_t* uid, uint8_t* uidLength);
    int getQueueSize();
    bool clearQueue();

    // Sync functionality
    bool isSyncNeeded() const { return queueSize > 0; }
    void markEventSynced(uint8_t* uid, uint8_t uidLength);

    // File operations
    bool fileExists(const char* path);
    bool deleteFile(const char* path);
    void listFiles(const char* path);

    // Status
    bool isReady() const { return initialized; }
    bool isSDCardPresent() const { return sdCardPresent; }
    const char* getLastError() const { return lastError; }

private:
    // SD card operations
    bool initSDCard();
    void readSDCardInfo();

    // CSV logging
    void logToCSV(uint8_t* uid, uint8_t uidLength);
    char* formatCSVLine(uint8_t* uid, uint8_t uidLength);

    // Queue operations
    bool loadSyncQueue();
    bool saveSyncQueue();

    // File helpers
    File openFile(const char* path, const char* mode);
    void closeFile(File& file);

    // Members
    bool initialized;
    bool sdCardPresent;
    char lastError[64];
    AttendanceEvent* syncQueue;
    int queueSize;
    int queueCapacity;
    unsigned long lastCSVCheck;

    // Configuration cache
    DeviceConfig cachedConfig;
};

#endif // STORAGE_HANDLER_H
