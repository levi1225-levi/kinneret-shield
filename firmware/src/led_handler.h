#ifndef LED_HANDLER_H
#define LED_HANDLER_H

#include <Arduino.h>
#include "config.h"
#include <Adafruit_NeoPixel.h>

// LED Pattern definitions
enum LEDPattern {
    LED_PATTERN_OFF = 0,
    LED_PATTERN_SOLID = 1,
    LED_PATTERN_BREATHING = 2,
    LED_PATTERN_PULSE = 3,
    LED_PATTERN_FLASH = 4,
    LED_PATTERN_SPIN = 5,
    LED_PATTERN_SWEEP = 6,
    LED_PATTERN_CHASE = 7,
    LED_PATTERN_ALTERNATING = 8,
    LED_PATTERN_RAINBOW = 9
};

// Color definitions
enum LEDColor {
    LED_COLOR_OFF = 0,
    LED_COLOR_RED = 1,
    LED_COLOR_GREEN = 2,
    LED_COLOR_BLUE = 3,
    LED_COLOR_YELLOW = 4,
    LED_COLOR_CYAN = 5,
    LED_COLOR_MAGENTA = 6,
    LED_COLOR_WHITE = 7,
    LED_COLOR_ORANGE = 8
};

class LEDHandler {
public:
    LEDHandler();
    ~LEDHandler();

    // Initialization
    void init();

    // Main update loop
    void update();

    // Pattern control
    void setPattern(LEDPattern pattern, LEDColor color);
    void bootAnimation();
    void stopAll();

    // Manual control
    void setColor(int ledIndex, uint8_t r, uint8_t g, uint8_t b);
    void setBrightness(uint8_t brightness);
    void show();

private:
    // Animation helpers
    void updateBreathingPattern();
    void updatePulsePattern();
    void updateFlashPattern();
    void updateSpinPattern();
    void updateSweepPattern();
    void updateChasePattern();
    void updateAlternatingPattern();
    void updateRainbowPattern();

    // Color conversion
    uint32_t colorToRGB(LEDColor color);
    void getRGBFromColor(LEDColor color, uint8_t& r, uint8_t& g, uint8_t& b);

    // Members
    Adafruit_NeoPixel* pixels;
    bool initialized;
    LEDPattern currentPattern;
    LEDColor currentColor;
    unsigned long patternStartTime;
    unsigned long lastUpdateTime;
    int patternFrame;
    uint8_t brightness;

    // Animation states
    uint8_t pulseValue;
    bool pulseDirection;
    int spinPosition;
    int chasePosition;
    int flashState;
    int alternatingState;
    int rainbowOffset;
};

#endif // LED_HANDLER_H
