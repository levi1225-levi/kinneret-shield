#include "display_handler.h"
#include <Wire.h>

DisplayHandler::DisplayHandler()
    : display(nullptr),
      initialized(false),
      lastUpdateTime(0),
      animationFrame(0),
      spinnerFrame(0),
      lastAnimationUpdate(0) {
    memset(lastError, 0, 64);
    memset(currentScreen, 0, 32);
}

DisplayHandler::~DisplayHandler() {
    if (display) delete display;
}

void DisplayHandler::init() {
    Serial.println("[DisplayHandler] Initializing SSD1309 OLED...");

    // Create SSD1306Wire display (works with SSD1309 too)
    // GEOMETRY_128_64 for 128x64, SDA=GPIO10, SCL=GPIO9
    display = new SSD1306Wire(OLED_ADDRESS, I2C_SDA, I2C_SCL);

    if (!display->init()) {
        Serial.println("[DisplayHandler] SSD1309 initialization failed!");
        strncpy(lastError, "SSD1309 Init Failed", 63);
        initialized = false;
        return;
    }

    display->flipScreenVertically();
    display->setFont(ArialMT_Plain_10);
    display->setTextAlignment(TEXT_ALIGN_CENTER);
    display->clear();
    display->display();

    initialized = true;
    lastUpdateTime = millis();
    strncpy(currentScreen, "BOOT", 31);

    Serial.println("[DisplayHandler] SSD1309 OLED initialized successfully");
}

void DisplayHandler::update() {
    if (!initialized) return;

    unsigned long now = millis();

    if (now - lastAnimationUpdate > OLED_UPDATE_INTERVAL_MS) {
        lastAnimationUpdate = now;
        animationFrame = (animationFrame + 1) % 100;
        spinnerFrame = (spinnerFrame + 1) % 4;
    }
}

void DisplayHandler::clearDisplay() {
    if (!display) return;
    display->clear();
}

void DisplayHandler::updateDisplay() {
    if (!display) return;
    display->display();
}

void DisplayHandler::drawCenteredText(int y, const char* text, int fontSize) {
    if (!display) return;

    switch (fontSize) {
    case 2:
        display->setFont(ArialMT_Plain_16);
        break;
    case 3:
        display->setFont(ArialMT_Plain_24);
        break;
    default:
        display->setFont(ArialMT_Plain_10);
        break;
    }
    display->setTextAlignment(TEXT_ALIGN_CENTER);
    display->drawString(OLED_WIDTH / 2, y, text);
}

void DisplayHandler::drawProgressBar(int y, int percent) {
    if (!display) return;

    int barWidth = OLED_WIDTH - 20;
    int filledWidth = (barWidth * percent) / 100;

    display->drawRect(10, y, barWidth, 10);
    display->fillRect(10, y, filledWidth, 10);
}

void DisplayHandler::drawCheckmark() {
    if (!display) return;
    display->drawLine(50, 8, 58, 16);
    display->drawLine(58, 16, 74, 0);
    display->drawLine(50, 9, 58, 17);
    display->drawLine(58, 17, 74, 1);
}

void DisplayHandler::drawXMark() {
    if (!display) return;
    display->drawLine(52, 0, 74, 18);
    display->drawLine(74, 0, 52, 18);
    display->drawLine(52, 1, 74, 19);
    display->drawLine(74, 1, 52, 19);
}

// ============================================================================
// SCREEN IMPLEMENTATIONS
// ============================================================================

void DisplayHandler::showBootScreen(const char* version) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "BOOT", 31);

    drawCenteredText(2, "Kinneret", 2);
    drawCenteredText(20, "Shield", 2);
    drawCenteredText(40, "Camp Northland", 1);

    char versionStr[32];
    snprintf(versionStr, 31, "v%s", version);
    drawCenteredText(52, versionStr, 1);

    updateDisplay();
}

void DisplayHandler::showIdleScreen(const char* roomName) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "IDLE", 31);

    drawCenteredText(0, roomName, 2);
    display->drawLine(0, 20, OLED_WIDTH, 20);

    drawCenteredText(26, "Ready", 1);
    drawCenteredText(38, "Tap Wristband", 1);
    drawCenteredText(50, "to Check In", 1);

    updateDisplay();
}

void DisplayHandler::showWiFiSetupScreen(const char* apName) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "WIFI_SETUP", 31);

    drawCenteredText(0, "WiFi Setup Required", 1);
    display->drawLine(0, 14, OLED_WIDTH, 14);

    drawCenteredText(18, "Connect to:", 1);
    drawCenteredText(30, apName, 1);

    drawCenteredText(44, "Then open:", 1);
    drawCenteredText(54, "192.168.4.1", 1);

    updateDisplay();
}

void DisplayHandler::showStatusScreen(const char* line1, const char* line2) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "STATUS", 31);

    drawCenteredText(15, line1, 2);
    drawCenteredText(38, line2, 1);

    updateDisplay();
}

void DisplayHandler::showProcessingScreen() {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "PROCESSING", 31);

    drawCenteredText(8, "Processing...", 2);

    const char* spinner[] = {"|", "/", "-", "\\"};
    display->setFont(ArialMT_Plain_16);
    display->setTextAlignment(TEXT_ALIGN_CENTER);
    display->drawString(OLED_WIDTH / 2, 30, spinner[spinnerFrame % 4]);

    drawCenteredText(50, "Please wait", 1);

    updateDisplay();
}

void DisplayHandler::showSuccessScreen(const char* camperName, const char* status) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "SUCCESS", 31);

    drawCheckmark();

    drawCenteredText(22, camperName, 2);

    char statusMsg[64];
    if (strcmp(status, "check_in") == 0 || strcmp(status, "check-in") == 0 || strcmp(status, "in") == 0) {
        snprintf(statusMsg, 63, "Checked In");
    } else if (strcmp(status, "check_out") == 0 || strcmp(status, "check-out") == 0 || strcmp(status, "out") == 0) {
        snprintf(statusMsg, 63, "Checked Out");
    } else {
        snprintf(statusMsg, 63, "%s", status);
    }
    drawCenteredText(42, statusMsg, 1);

    char timeStr[32];
    time_t now = time(nullptr);
    struct tm* timeinfo = localtime(&now);
    strftime(timeStr, 31, "%H:%M", timeinfo);
    drawCenteredText(54, timeStr, 1);

    updateDisplay();
}

void DisplayHandler::showErrorScreen(const char* errorMsg) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "ERROR", 31);

    drawXMark();
    drawCenteredText(28, errorMsg, 1);
    drawCenteredText(42, "Try again", 1);

    updateDisplay();
}

void DisplayHandler::showEmergencyScreen(const char* emergencyType) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "EMERGENCY", 31);

    if ((animationFrame / 10) % 2) {
        drawCenteredText(5, "ALERT!", 3);
        drawCenteredText(35, emergencyType, 2);
        display->drawRect(0, 0, OLED_WIDTH, OLED_HEIGHT);
    } else {
        drawCenteredText(20, "EMERGENCY MODE", 1);
        drawCenteredText(34, emergencyType, 2);
    }

    updateDisplay();
}

void DisplayHandler::showOfflineScreen() {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "OFFLINE", 31);

    drawCenteredText(5, "Offline Mode", 2);
    drawCenteredText(28, "No server connection", 1);
    drawCenteredText(40, "Local logging enabled", 1);

    updateDisplay();
}

void DisplayHandler::showFirmwareUpdateScreen(int progress) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "FIRMWARE_UPDATE", 31);

    drawCenteredText(5, "Firmware Update", 2);

    char progressStr[16];
    snprintf(progressStr, 15, "%d%%", progress);
    drawCenteredText(28, progressStr, 1);

    drawProgressBar(40, progress);

    drawCenteredText(54, "DO NOT POWER OFF", 1);

    updateDisplay();
}

void DisplayHandler::showStatsScreen(int checkinCount) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "STATS", 31);

    drawCenteredText(5, "Today's Statistics", 1);
    display->drawLine(0, 18, OLED_WIDTH, 18);

    char statsStr[64];
    snprintf(statsStr, 63, "Check-ins: %d", checkinCount);
    drawCenteredText(30, statsStr, 1);

    updateDisplay();
}

// ============================================================================
// PROGRAM MODE SCREENS
// ============================================================================

void DisplayHandler::showProgramModeScreen(const char* roomName) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "PROGRAM", 31);

    drawCenteredText(0, "PROGRAM MODE", 2);
    display->drawLine(0, 20, OLED_WIDTH, 20);

    drawCenteredText(26, "Tap wristband", 1);
    drawCenteredText(38, "to register", 1);
    drawCenteredText(52, roomName, 1);

    updateDisplay();
}

void DisplayHandler::showProgramProcessingScreen() {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "PROG_PROCESS", 31);

    drawCenteredText(8, "Registering...", 2);

    const char* spinner[] = {"|", "/", "-", "\\"};
    display->setFont(ArialMT_Plain_16);
    display->setTextAlignment(TEXT_ALIGN_CENTER);
    display->drawString(OLED_WIDTH / 2, 30, spinner[spinnerFrame % 4]);

    drawCenteredText(50, "Please wait", 1);

    updateDisplay();
}

void DisplayHandler::showProgramSuccessScreen(const char* cardUid) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "PROG_SUCCESS", 31);

    drawCheckmark();
    drawCenteredText(22, "Registered!", 2);
    drawCenteredText(44, cardUid, 1);

    updateDisplay();
}

void DisplayHandler::showProgramErrorScreen(const char* errorMsg) {
    if (!display) return;

    clearDisplay();
    strncpy(currentScreen, "PROG_ERROR", 31);

    drawXMark();
    drawCenteredText(28, errorMsg, 1);
    drawCenteredText(42, "Try again", 1);

    updateDisplay();
}
