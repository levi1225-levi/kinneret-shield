#ifndef DISPLAY_HANDLER_H
#define DISPLAY_HANDLER_H

#include <Arduino.h>
#include "config.h"
#include <SSD1306Wire.h>

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
    void showProgramModeScreen(const char* roomName);
    void showProgramProcessingScreen();
    void showProgramSuccessScreen(const char* cardUid);
    void showProgramErrorScreen(const char* errorMsg);

    // Status accessors
    bool isReady() const { return initialized; }
    const char* getLastError() const { return lastError; }

private:
    // Helper methods
    void clearDisplay();
    void updateDisplay();
    void drawCenteredText(int y, const char* text, int fontSize);
    void drawProgressBar(int y, int percent);
    void drawCheckmark();
    void drawXMark();

    // Members
    SSD1306Wire* display;
    bool initialized;
    char lastError[64];
    char currentScreen[32];
    unsigned long lastUpdateTime;
    int animationFrame;
    int spinnerFrame;
    unsigned long lastAnimationUpdate;
};

#endif // DISPLAY_HANDLER_H
