#ifndef DISPLAY_HANDLER_H
#define DISPLAY_HANDLER_H

#include <Arduino.h>
#include "config.h"
#include <Adafruit_SSD1306.h>

class DisplayHandler {
public:
    DisplayHandler();
    ~DisplayHandler();

    // Initialization
    void init();

    // Main update loop
    void update();

    // Display screens
    void showBootScreen(const char* version);
    void showIdleScreen(const char* roomName);
    void showWiFiSetupScreen(const char* apName);
    void showStatusScreen(const char* line1, const char* line2);
    void showProcessingScreen();
    void showSuccessScreen(const char* studentName, const char* status);
    void showErrorScreen(const char* errorMsg);
    void showEmergencyScreen(const char* emergencyType);
    void showOfflineScreen();
    void showFirmwareUpdateScreen(int progress);
    void showStatsScreen(int checkinCount);

    // Status accessors
    bool isReady() const { return initialized; }
    const char* getLastError() const { return lastError; }

private:
    // Helper methods
    void clearDisplay();
    void updateDisplay();
    void drawCenteredText(int y, const char* text, int size = 1);
    void drawRightAlignedText(int x, int y, const char* text, int size = 1);
    void drawLogo();
    void drawWiFiSignal(int rssi);
    void drawBattery();
    void drawCheckmark();
    void drawXMark();

    // Animation helpers
    void drawProgressBar(int y, int percent);
    void drawSpinner(int x, int y, int frame);

    // Members
    Adafruit_SSD1306* display;
    bool initialized;
    char lastError[64];
    char currentScreen[32];
    unsigned long lastUpdateTime;
    int animationFrame;
    bool animationDirection;

    // Animation states
    int breathingBrightness;
    int spinnerFrame;
    unsigned long lastAnimationUpdate;
};

#endif // DISPLAY_HANDLER_H
