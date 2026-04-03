#include "display_handler.h"
#include <Wire.h>

DisplayHandler::DisplayHandler()
    : display(nullptr),
      initialized(false),
      lastUpdateTime(0),
      animationFrame(0),
      animationDirection(true),
      breathingBrightness(0),
      spinnerFrame(0),
      lastAnimationUpdate(0) {
    memset(lastError, 0, 64);
    memset(currentScreen, 0, 32);
}

DisplayHandler::~DisplayHandler() {
    if (display) delete display;
}

void DisplayHandler::init() {
    Serial.println("[DisplayHandler] Initializing...");

    // Create SSD1306 display object
    display = new Adafruit_SSD1306(OLED_WIDTH, OLED_HEIGHT, &Wire, -1);

    // Initialize the display
    if (!display->begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
        Serial.println("[DisplayHandler] SSD1306 initialization failed!");
        strncpy(lastError, "SSD1306 Init Failed", 63);
        initialized = false;
        return;
    }

    display->setTextSize(1);
    display->setTextColor(SSD1306_WHITE);
    display->clearDisplay();
    display->display();

    initialized = true;
    lastUpdateTime = millis();
    strncpy(currentScreen, "BOOT", 31);

    Serial.println("[DisplayHandler] Initialization complete");
}

void DisplayHandler::update() {
    if (!initialized) return;

    unsigned long now = millis();

    // Update animations periodically
    if (now - lastAnimationUpdate > OLED_UPDATE_INTERVAL_MS) {
        lastAnimationUpdate = now;
        animationFrame = (animationFrame + 1) % 100;
        spinnerFrame = (spinnerFrame + 1) % 4;
    }
}

void DisplayHandler::clearDisplay() {
    if (!display) return;
    display->clearDisplay();
}

void DisplayHandler::updateDisplay() {
    if (!display) return;
    display->display();
}

void DisplayHandler::drawCenteredText(int y, const char* text, int size) {
    if (!display) return;

    display->setTextSize(size);
    display->setTextColor(SSD1306_WHITE);

    int16_t x1, y1;
    uint16_t w, h;
    display->getTextBounds(text, 0, y, &x1, &y1, &w, &h);
    int x = (OLED_WIDTH - w) / 2;

    display->setCursor(x, y);
    display->println(text);
}

void DisplayHandler::drawRightAlignedText(int x, int y, const char* text, int size) {
    if (!display) return;

    display->setTextSize(size);
    display->setTextColor(SSD1306_WHITE);
    display->setCursor(x, y);
    display->println(text);
}

void DisplayHandler::drawWiFiSignal(int rssi) {
    if (!display) return;

    // Draw WiFi icon in top right
    int x = OLED_WIDTH - 20;
    int y = 2;

    if (rssi > -50) {
        display->drawRect(x, y, 3, 3, SSD1306_WHITE);
        display->drawRect(x + 4, y + 1, 3, 4, SSD1306_WHITE);
        display->drawRect(x + 8, y + 2, 3, 5, SSD1306_WHITE);
        display->drawRect(x + 12, y + 3, 3, 6, SSD1306_WHITE);
    } else if (rssi > -60) {
        display->drawRect(x, y, 3, 3, SSD1306_WHITE);
        display->drawRect(x + 4, y + 1, 3, 4, SSD1306_WHITE);
        display->drawRect(x + 8, y + 2, 3, 5, SSD1306_WHITE);
    } else if (rssi > -70) {
        display->drawRect(x, y, 3, 3, SSD1306_WHITE);
        display->drawRect(x + 4, y + 1, 3, 4, SSD1306_WHITE);
    } else {
        display->drawRect(x, y, 3, 3, SSD1306_WHITE);
    }
}

void DisplayHandler::drawProgressBar(int y, int percent) {
    if (!display) return;

    int barWidth = OLED_WIDTH - 10;
    int filledWidth = (barWidth * percent) / 100;

    display->drawRect(5, y, barWidth, 8, SSD1306_WHITE);
    display->fillRect(5, y, filledWidth, 8, SSD1306_WHITE);
}

void DisplayHandler::drawCheckmark() {
    if (!display) return;

    // Simple checkmark pattern
    display->drawLine(40, 30, 50, 40, SSD1306_WHITE);
    display->drawLine(50, 40, 70, 20, SSD1306_WHITE);
    display->drawLine(40, 31, 50, 41, SSD1306_WHITE);
    display->drawLine(50, 41, 70, 21, SSD1306_WHITE);
}

void DisplayHandler::drawXMark() {
    if (!display) return;

    // Simple X mark pattern
    display->drawLine(40, 20, 70, 50, SSD1306_WHITE);
    display->drawLine(70, 20, 40, 50, SSD1306_WHITE);
    display->drawLine(40, 21, 70, 51, SSD1306_WHITE);
    display->drawLine(70, 21, 40, 51, SSD1306_WHITE);
}

void DisplayHandler::drawSpinner(int x, int y, int frame) {
    if (!display) return;

    const char* spinner[] = {"|", "/", "-", "\\"};
    display->setTextSize(2);
    display->setCursor(x, y);
    display->println(spinner[frame % 4]);
}

// ============================================================================
// SCREEN IMPLEMENTATIONS
// ============================================================================

void DisplayHandler::showBootScreen(const char* version) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "BOOT", 31);

    // Main title
    display->setTextSize(2);
    display->setTextColor(SSD1306_WHITE);
    drawCenteredText(5, "Kinneret", 2);

    // Subtitle
    display->setTextSize(1);
    drawCenteredText(22, "Shield", 2);

    // Camp name
    drawCenteredText(38, "Camp Northland", 1);

    // Version
    char versionStr[32];
    snprintf(versionStr, 31, "v%s", version);
    drawCenteredText(48, versionStr, 1);

    // Status
    drawCenteredText(58, "Initializing...", 1);

    updateDisplay();
}

void DisplayHandler::showIdleScreen(const char* roomName) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "IDLE", 31);

    // Location name (large, centered)
    display->setTextSize(2);
    display->setTextColor(SSD1306_WHITE);
    drawCenteredText(5, roomName, 2);

    // Divider line
    display->drawLine(0, 20, OLED_WIDTH, 20, SSD1306_WHITE);

    // Status
    display->setTextSize(1);
    drawCenteredText(28, "Ready", 1);
    drawCenteredText(38, "Tap Wristband", 1);
    drawCenteredText(48, "to Check In", 1);

    // WiFi signal (top right)
    drawWiFiSignal(-50);

    updateDisplay();
}

void DisplayHandler::showWiFiSetupScreen(const char* apName) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "WIFI_SETUP", 31);

    display->setTextSize(1);
    display->setTextColor(SSD1306_WHITE);

    drawCenteredText(5, "WiFi Setup Required", 1);

    display->drawLine(0, 15, OLED_WIDTH, 15, SSD1306_WHITE);

    drawCenteredText(20, "Connect to:", 1);
    drawCenteredText(30, apName, 1);

    drawCenteredText(45, "Then open:", 1);
    drawCenteredText(55, "192.168.4.1", 1);

    updateDisplay();
}

void DisplayHandler::showStatusScreen(const char* line1, const char* line2) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "STATUS", 31);

    display->setTextSize(1);
    display->setTextColor(SSD1306_WHITE);

    drawCenteredText(20, line1, 2);
    drawCenteredText(40, line2, 1);

    updateDisplay();
}

void DisplayHandler::showProcessingScreen() {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "PROCESSING", 31);

    display->setTextSize(1);
    display->setTextColor(SSD1306_WHITE);

    drawCenteredText(10, "Processing...", 2);
    drawSpinner(58, 35, spinnerFrame);
    drawCenteredText(50, "Please wait", 1);

    updateDisplay();
}

void DisplayHandler::showSuccessScreen(const char* camperName, const char* status) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "SUCCESS", 31);

    display->setTextSize(1);
    display->setTextColor(SSD1306_WHITE);

    // Checkmark
    drawCheckmark();

    // Camper name
    drawCenteredText(25, camperName, 2);

    // Status (Checked In or Checked Out)
    char statusMsg[64];
    if (strcmp(status, "check-in") == 0 || strcmp(status, "in") == 0) {
        snprintf(statusMsg, 63, "Checked In");
    } else if (strcmp(status, "check-out") == 0 || strcmp(status, "out") == 0) {
        snprintf(statusMsg, 63, "Checked Out");
    } else {
        snprintf(statusMsg, 63, "%s", status);
    }
    drawCenteredText(40, statusMsg, 1);

    // Time
    char timeStr[32];
    time_t now = time(nullptr);
    struct tm* timeinfo = localtime(&now);
    strftime(timeStr, 31, "%H:%M", timeinfo);
    drawCenteredText(52, timeStr, 1);

    updateDisplay();
}

void DisplayHandler::showErrorScreen(const char* errorMsg) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "ERROR", 31);

    display->setTextSize(1);
    display->setTextColor(SSD1306_WHITE);

    // X mark
    drawXMark();

    // Error message (examples: "Unknown wristband", "Not registered", etc.)
    drawCenteredText(35, errorMsg, 1);
    drawCenteredText(48, "Try again", 1);

    updateDisplay();
}

void DisplayHandler::showEmergencyScreen(const char* emergencyType) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "EMERGENCY", 31);

    display->setTextSize(2);
    display->setTextColor(SSD1306_WHITE);

    // Flashing effect with animation frame
    if ((animationFrame / 10) % 2) {
        drawCenteredText(10, "ALERT!", 2);
        drawCenteredText(30, emergencyType, 2);
        display->drawRect(0, 0, OLED_WIDTH, OLED_HEIGHT, SSD1306_WHITE);
    } else {
        clearDisplay();
        display->setTextSize(1);
        drawCenteredText(25, "EMERGENCY MODE", 1);
        drawCenteredText(35, emergencyType, 1);
    }

    updateDisplay();
}

void DisplayHandler::showOfflineScreen() {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "OFFLINE", 31);

    display->setTextSize(2);
    display->setTextColor(SSD1306_WHITE);

    drawCenteredText(12, "Offline Mode", 1);

    display->setTextSize(1);
    drawCenteredText(28, "No Supabase connection", 1);
    drawCenteredText(38, "Local logging enabled", 1);

    // Show queued event count if available
    char queuedStr[32];
    snprintf(queuedStr, 31, "Queued: %d", 0);  // Would be passed as parameter ideally
    drawCenteredText(50, queuedStr, 1);

    updateDisplay();
}

void DisplayHandler::showFirmwareUpdateScreen(int progress) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "FIRMWARE_UPDATE", 31);

    display->setTextSize(1);
    display->setTextColor(SSD1306_WHITE);

    drawCenteredText(10, "Firmware Update", 2);

    // Progress percentage
    char progressStr[16];
    snprintf(progressStr, 15, "%d%%", progress);
    drawCenteredText(30, progressStr, 1);

    // Progress bar
    drawProgressBar(40, progress);

    drawCenteredText(55, "DO NOT POWER OFF", 1);

    updateDisplay();
}

void DisplayHandler::showStatsScreen(int checkinCount) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "STATS", 31);

    display->setTextSize(1);
    display->setTextColor(SSD1306_WHITE);

    drawCenteredText(10, "Today's Statistics", 1);

    display->drawLine(0, 20, OLED_WIDTH, 20, SSD1306_WHITE);

    char statsStr[64];
    snprintf(statsStr, 63, "Check-ins: %d", checkinCount);
    drawCenteredText(35, statsStr, 1);

    updateDisplay();
}
