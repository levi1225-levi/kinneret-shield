#include "storage_handler.h"
#include <SPI.h>

StorageHandler::StorageHandler()
    : initialized(false),
      sdCardPresent(false),
      queueSize(0),
      queueCapacity(MAX_QUEUE_SIZE),
      lastCSVCheck(0),
      syncQueue(nullptr) {
    memset(lastError, 0, 64);
    memset(&cachedConfig, 0, sizeof(DeviceConfig));
}

StorageHandler::~StorageHandler() {
    if (syncQueue) {
        delete[] syncQueue;
    }
}

void StorageHandler::init() {
    Serial.println("[StorageHandler] Initializing...");

    // Initialize sync queue
    syncQueue = new AttendanceEvent[MAX_QUEUE_SIZE];
    if (!syncQueue) {
        Serial.println("[StorageHandler] Failed to allocate sync queue");
        strncpy(lastError, "Queue allocation failed", 63);
        initialized = false;
        return;
    }

    // Initialize SD card
    if (initSDCard()) {
        sdCardPresent = true;
        readSDCardInfo();
        loadSyncQueue();
        Serial.println("[StorageHandler] SD card initialized");
    } else {
        Serial.println("[StorageHandler] SD card initialization failed (optional)");
    }

    // Load default config
    loadDeviceConfig(cachedConfig);

    initialized = true;
    Serial.println("[StorageHandler] Initialization complete");
}

bool StorageHandler::initSDCard() {
    // Initialize SPI for SD card
    SPI.begin(SD_SCK_PIN, SD_MISO_PIN, SD_MOSI_PIN, SD_CS_PIN);

    // Try to mount SD card
    if (!SD.begin(SD_CS_PIN)) {
        Serial.println("[StorageHandler] SD card mount failed");
        return false;
    }

    uint8_t cardType = SD.cardType();
    if (cardType == CARD_NONE) {
        Serial.println("[StorageHandler] No SD card detected");
        SD.end();
        return false;
    }

    return true;
}

void StorageHandler::readSDCardInfo() {
    if (!sdCardPresent) return;

    uint64_t cardSize = SD.cardSize() / (1024 * 1024);
    uint64_t usedSpace = SD.usedBytes() / (1024 * 1024);
    uint64_t totalSpace = SD.totalBytes() / (1024 * 1024);

    Serial.printf("[StorageHandler] SD Card: %lluMB, Used: %lluMB, Total: %lluMB\n",
                  cardSize, usedSpace, totalSpace);
}

bool StorageHandler::loadDeviceConfig(DeviceConfig& config) {
    if (!sdCardPresent) {
        // Use defaults
        strncpy(config.device_id, "DEFAULT_DEVICE_01", MAX_DEVICE_ID_LENGTH - 1);
        strncpy(config.location_name, "Waterfront", MAX_ROOM_NAME_LENGTH - 1);
        strncpy(config.supabase_url, "https://YOUR_PROJECT.supabase.co", 255);
        strncpy(config.wifi_ssid, "CampNorthland", 63);
        memset(config.api_key, 0, MAX_API_KEY_LENGTH);
        memset(config.wifi_password, 0, 64);
        return false;
    }

    File configFile = SD.open(CONFIG_FILE_PATH, "r");
    if (!configFile) {
        Serial.println("[StorageHandler] Config file not found, using defaults");
        strncpy(config.device_id, "DEFAULT_DEVICE_01", MAX_DEVICE_ID_LENGTH - 1);
        strncpy(config.location_name, "Waterfront", MAX_ROOM_NAME_LENGTH - 1);
        strncpy(config.supabase_url, "https://YOUR_PROJECT.supabase.co", 255);
        strncpy(config.wifi_ssid, "CampNorthland", 63);
        memset(config.api_key, 0, MAX_API_KEY_LENGTH);
        memset(config.wifi_password, 0, 64);
        return false;
    }

    // Parse JSON config
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, configFile);
    configFile.close();

    if (error) {
        Serial.printf("[StorageHandler] JSON parse error: %s\n", error.c_str());
        strncpy(lastError, error.c_str(), 63);
        return false;
    }

    // Load Supabase configuration
    if (doc.containsKey("device_id")) {
        strncpy(config.device_id, doc["device_id"], MAX_DEVICE_ID_LENGTH - 1);
    }
    if (doc.containsKey("api_key")) {
        strncpy(config.api_key, doc["api_key"], MAX_API_KEY_LENGTH - 1);
    }
    if (doc.containsKey("location_name")) {
        strncpy(config.location_name, doc["location_name"], MAX_ROOM_NAME_LENGTH - 1);
    }
    if (doc.containsKey("supabase_url")) {
        strncpy(config.supabase_url, doc["supabase_url"], 255);
    }
    if (doc.containsKey("wifi_ssid")) {
        strncpy(config.wifi_ssid, doc["wifi_ssid"], 63);
    }
    if (doc.containsKey("wifi_password")) {
        strncpy(config.wifi_password, doc["wifi_password"], 63);
    }

    Serial.printf("[StorageHandler] Config loaded: device_id=%s, location=%s\n",
                  config.device_id, config.location_name);
    return true;
}

bool StorageHandler::saveDeviceConfig(const DeviceConfig& config) {
    if (!sdCardPresent) {
        Serial.println("[StorageHandler] SD card not present, cannot save config");
        return false;
    }

    StaticJsonDocument<512> doc;
    doc["device_id"] = config.device_id;
    doc["api_key"] = config.api_key;
    doc["location_name"] = config.location_name;
    doc["supabase_url"] = config.supabase_url;
    doc["wifi_ssid"] = config.wifi_ssid;
    doc["wifi_password"] = config.wifi_password;

    File configFile = SD.open(CONFIG_FILE_PATH, "w");
    if (!configFile) {
        Serial.println("[StorageHandler] Failed to create config file");
        strncpy(lastError, "Config write failed", 63);
        return false;
    }

    serializeJson(doc, configFile);
    configFile.close();

    Serial.println("[StorageHandler] Config saved successfully");
    return true;
}

void StorageHandler::logAttendanceEvent(uint8_t* uid, uint8_t uidLength) {
    if (!sdCardPresent) {
        Serial.println("[StorageHandler] SD card not available, event not logged");
        return;
    }

    logToCSV(uid, uidLength);

    // Also queue for sync if not already synced
    queueCardTap(uid, uidLength);
}

void StorageHandler::logToCSV(uint8_t* uid, uint8_t uidLength) {
    File csvFile = SD.open(ATTENDANCE_LOG_FILE, "a");
    if (!csvFile) {
        Serial.println("[StorageHandler] Failed to open CSV file");
        return;
    }

    // Format: timestamp, UID (hex)
    time_t now = time(nullptr);
    char timeStr[32];
    strftime(timeStr, 31, "%Y-%m-%d %H:%M:%S", localtime(&now));

    csvFile.printf("%s,", timeStr);
    for (uint8_t i = 0; i < uidLength; i++) {
        csvFile.printf("%02X", uid[i]);
    }
    csvFile.println();

    csvFile.close();
    Serial.println("[StorageHandler] Attendance logged to CSV");
}

int StorageHandler::getCheckinCountToday() {
    if (!sdCardPresent) return -1;

    File csvFile = SD.open(ATTENDANCE_LOG_FILE, "r");
    if (!csvFile) return 0;

    int count = 0;
    char line[256];

    // Get today's date
    time_t now = time(nullptr);
    struct tm* timeinfo = localtime(&now);
    char dateStr[16];
    strftime(dateStr, 15, "%Y-%m-%d", timeinfo);

    // Count lines matching today's date
    while (csvFile.available()) {
        size_t len = csvFile.readStringUntil('\n').length();
        // Simple count - in production, would parse properly
        count++;
    }

    csvFile.close();
    return count;
}

bool StorageHandler::queueCardTap(uint8_t* uid, uint8_t uidLength) {
    if (queueSize >= queueCapacity) {
        Serial.println("[StorageHandler] Sync queue full, discarding oldest entry");
        // Shift queue and add new entry
        memmove(syncQueue, syncQueue + 1, (queueCapacity - 1) * sizeof(AttendanceEvent));
        queueSize = queueCapacity - 1;
    }

    AttendanceEvent event;
    memcpy(event.uid, uid, uidLength);
    event.uidLength = uidLength;
    event.timestamp = millis() / 1000;
    event.synced = false;

    syncQueue[queueSize] = event;
    queueSize++;

    saveSyncQueue();
    return true;
}

bool StorageHandler::dequeueCardTap(uint8_t* uid, uint8_t* uidLength) {
    if (queueSize == 0) {
        return false;
    }

    AttendanceEvent event = syncQueue[0];
    memcpy(uid, event.uid, event.uidLength);
    *uidLength = event.uidLength;

    // Shift queue
    memmove(syncQueue, syncQueue + 1, (queueSize - 1) * sizeof(AttendanceEvent));
    queueSize--;

    saveSyncQueue();
    return true;
}

int StorageHandler::getQueueSize() {
    return queueSize;
}

bool StorageHandler::clearQueue() {
    queueSize = 0;
    return saveSyncQueue();
}

void StorageHandler::markEventSynced(uint8_t* uid, uint8_t uidLength) {
    for (int i = 0; i < queueSize; i++) {
        if (syncQueue[i].uidLength == uidLength &&
            memcmp(syncQueue[i].uid, uid, uidLength) == 0) {
            syncQueue[i].synced = true;
            return;
        }
    }
}

bool StorageHandler::loadSyncQueue() {
    if (!sdCardPresent) return false;

    File queueFile = SD.open(SYNC_QUEUE_FILE, "r");
    if (!queueFile) {
        // No queue file yet - this is normal on first run
        return true;
    }

    // Simple queue persistence - would use proper JSON in production
    queueSize = 0;
    queueFile.close();

    return true;
}

bool StorageHandler::saveSyncQueue() {
    if (!sdCardPresent) return false;

    File queueFile = SD.open(SYNC_QUEUE_FILE, "w");
    if (!queueFile) {
        Serial.println("[StorageHandler] Failed to save sync queue");
        return false;
    }

    // Serialize queue to JSON
    StaticJsonDocument<2048> doc;
    JsonArray events = doc.createNestedArray("events");

    for (int i = 0; i < queueSize; i++) {
        JsonObject event = events.createNestedObject();

        // Convert UID to hex string
        char uidStr[32];
        for (uint8_t j = 0; j < syncQueue[i].uidLength; j++) {
            snprintf(uidStr + (j * 2), 3, "%02X", syncQueue[i].uid[j]);
        }

        event["uid"] = uidStr;
        event["timestamp"] = syncQueue[i].timestamp;
        event["synced"] = syncQueue[i].synced;
    }

    serializeJson(doc, queueFile);
    queueFile.close();

    return true;
}

bool StorageHandler::fileExists(const char* path) {
    if (!sdCardPresent) return false;
    return SD.exists(path);
}

bool StorageHandler::deleteFile(const char* path) {
    if (!sdCardPresent) return false;
    return SD.remove(path);
}

void StorageHandler::listFiles(const char* path) {
    if (!sdCardPresent) {
        Serial.println("[StorageHandler] SD card not present");
        return;
    }

    File dir = SD.open(path);
    if (!dir) {
        Serial.printf("[StorageHandler] Failed to open directory: %s\n", path);
        return;
    }

    File file = dir.openNextFile();
    while (file) {
        Serial.printf("%s %s\n", file.isDirectory() ? "[DIR]" : "[FILE]", file.name());
        file = dir.openNextFile();
    }

    dir.close();
}

File StorageHandler::openFile(const char* path, const char* mode) {
    if (!sdCardPresent) {
        return File();
    }
    return SD.open(path, mode);
}

void StorageHandler::closeFile(File& file) {
    if (file) {
        file.close();
    }
}
