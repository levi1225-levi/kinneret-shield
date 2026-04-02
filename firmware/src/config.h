#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ============================================================================
// FIRMWARE VERSION
// ============================================================================
#define FIRMWARE_VERSION "1.0.0"
#define FIRMWARE_BUILD_DATE __DATE__

// ============================================================================
// I2C PIN CONFIGURATION
// ============================================================================
#define I2C_SDA 8   // GPIO8 - I2C SDA for PN532 and OLED
#define I2C_SCL 9   // GPIO9 - I2C SCL for PN532 and OLED

// ============================================================================
// NFC READER (PN532)
// ============================================================================
#define PN532_ADDRESS 0x24  // Default I2C address for PN532
#define NFC_SCAN_INTERVAL_MS 200  // Scan for cards every 200ms
#define NFC_DEBOUNCE_TIME_MS 3000  // Don't re-read same card within 3 seconds

// ============================================================================
// OLED DISPLAY (SSD1309)
// ============================================================================
#define OLED_ADDRESS 0x3C
#define OLED_WIDTH 128
#define OLED_HEIGHT 64
#define OLED_UPDATE_INTERVAL_MS 100

// ============================================================================
// NEOPIXEL LEDs (WS2812B)
// ============================================================================
#define NEOPIXEL_PIN 40  // GPIO40 - NeoPixel data pin
#define NEOPIXEL_COUNT 8  // 8 LEDs
#define LED_BRIGHTNESS 255  // 0-255

// ============================================================================
// I2S AUDIO (MAX98357A)
// ============================================================================
#define I2S_BCLK_PIN 41  // Bit clock
#define I2S_LRC_PIN 42   // Left/Right clock (word select)
#define I2S_DIN_PIN 2    // Data in
#define I2S_NUM I2S_NUM_0
#define I2S_SAMPLE_RATE 44100
#define I2S_BITS_PER_SAMPLE I2S_BITS_PER_SAMPLE_16
#define I2S_CHANNELS 1

// ============================================================================
// SD CARD (SPI)
// ============================================================================
#define SD_CS_PIN 1    // Chip select
#define SD_MOSI_PIN 35 // SPI MOSI
#define SD_MISO_PIN 37 // SPI MISO
#define SD_SCK_PIN 36  // SPI Clock

// ============================================================================
// NETWORK & SERVER
// ============================================================================
#define WIFI_MANAGER_AP_NAME "KinneretShield"
#define WIFI_RECONNECT_INTERVAL_MS 5000
#define WIFI_CONNECT_TIMEOUT_MS 30000

// Server API configuration
#define SERVER_API_BASE_URL "http://attendance.school.local"
#define API_ENDPOINT_TAP "/api/attendance/tap"
#define API_ENDPOINT_HEARTBEAT "/api/devices/heartbeat"
#define API_KEY_HEADER "X-API-Key"
#define DEVICE_ID "DEFAULT_DEVICE_01"  // Override from SD config

// ============================================================================
// TIMING & INTERVALS
// ============================================================================
#define HEARTBEAT_INTERVAL_MS 30000  // Send heartbeat every 30 seconds
#define STATE_LOOP_INTERVAL_MS 50    // Main loop interval
#define BOOT_SCREEN_DURATION_MS 3000 // Show boot screen for 3 seconds
#define SUCCESS_SCREEN_DURATION_MS 2000
#define ERROR_SCREEN_DURATION_MS 3000

// ============================================================================
// AUDIO FREQUENCIES (Hz) - For I2S tone generation
// ============================================================================
#define TONE_BOOT_HZ1 523   // C5
#define TONE_BOOT_HZ2 784   // G5
#define TONE_CARD_BEEP 1047 // C6
#define TONE_SUCCESS_HZ1 523 // C5
#define TONE_SUCCESS_HZ2 784 // G5
#define TONE_FAILURE 262 // C4
#define TONE_SIREN_HI 1000
#define TONE_SIREN_LO 500
#define TONE_DURATION_MS 200

// ============================================================================
// STORAGE
// ============================================================================
#define CONFIG_FILE_PATH "/config.json"
#define ATTENDANCE_LOG_FILE "/attendance.csv"
#define SYNC_QUEUE_FILE "/sync_queue.json"
#define MAX_QUEUE_SIZE 500  // Max offline events to store

// ============================================================================
// STATE MACHINE
// ============================================================================
enum DeviceState {
    STATE_BOOT,
    STATE_WIFI_CONNECTING,
    STATE_SERVER_CONNECTING,
    STATE_IDLE,
    STATE_CARD_DETECTED,
    STATE_PROCESSING,
    STATE_SUCCESS,
    STATE_FAILURE,
    STATE_ERROR,
    STATE_EMERGENCY,
    STATE_FIRMWARE_UPDATE,
    STATE_OFFLINE
};

// ============================================================================
// EMERGENCY MODES
// ============================================================================
enum EmergencyMode {
    EMERGENCY_NONE = 0,
    EMERGENCY_LOCKDOWN = 1,
    EMERGENCY_EVACUATION = 2
};

// ============================================================================
// CONSTANTS
// ============================================================================
#define MAX_RETRY_ATTEMPTS 3
#define HTTP_TIMEOUT_MS 10000
#define JSON_BUFFER_SIZE 1024
#define MAX_DEVICE_ID_LENGTH 32
#define MAX_API_KEY_LENGTH 64
#define MAX_ROOM_NAME_LENGTH 32

#endif // CONFIG_H
