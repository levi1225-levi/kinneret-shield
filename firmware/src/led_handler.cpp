#include "led_handler.h"

LEDHandler::LEDHandler()
    : pixels(nullptr),
      initialized(false),
      currentPattern(LED_PATTERN_OFF),
      currentColor(LED_COLOR_BLUE),
      patternStartTime(0),
      lastUpdateTime(0),
      patternFrame(0),
      brightness(LED_BRIGHTNESS),
      pulseValue(0),
      pulseDirection(true),
      spinPosition(0),
      chasePosition(0),
      flashState(0),
      alternatingState(0),
      rainbowOffset(0) {
}

LEDHandler::~LEDHandler() {
    if (pixels) {
        pixels->clear();
        pixels->show();
        delete pixels;
    }
}

void LEDHandler::init() {
    Serial.println("[LEDHandler] Initializing...");

    pixels = new Adafruit_NeoPixel(NEOPIXEL_COUNT, NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);
    pixels->begin();
    pixels->setBrightness(brightness);
    pixels->clear();
    pixels->show();

    initialized = true;
    patternStartTime = millis();
    lastUpdateTime = millis();

    Serial.println("[LEDHandler] Initialization complete");
}

void LEDHandler::update() {
    if (!initialized) return;

    unsigned long now = millis();

    // Update every 50ms for smooth animations
    if (now - lastUpdateTime < 50) {
        return;
    }

    lastUpdateTime = now;
    patternFrame++;

    // Execute pattern-specific update logic
    switch (currentPattern) {
    case LED_PATTERN_BREATHING:
        updateBreathingPattern();
        break;
    case LED_PATTERN_PULSE:
        updatePulsePattern();
        break;
    case LED_PATTERN_FLASH:
        updateFlashPattern();
        break;
    case LED_PATTERN_SPIN:
        updateSpinPattern();
        break;
    case LED_PATTERN_SWEEP:
        updateSweepPattern();
        break;
    case LED_PATTERN_CHASE:
        updateChasePattern();
        break;
    case LED_PATTERN_ALTERNATING:
        updateAlternatingPattern();
        break;
    case LED_PATTERN_RAINBOW:
        updateRainbowPattern();
        break;
    case LED_PATTERN_SOLID:
    default:
        // Solid color is set once, no update needed
        break;
    }
}

void LEDHandler::setPattern(LEDPattern pattern, LEDColor color) {
    currentPattern = pattern;
    currentColor = color;
    patternStartTime = millis();
    patternFrame = 0;

    uint8_t r, g, b;
    getRGBFromColor(color, r, g, b);

    switch (pattern) {
    case LED_PATTERN_OFF:
        pixels->clear();
        break;

    case LED_PATTERN_SOLID:
        for (int i = 0; i < NEOPIXEL_COUNT; i++) {
            pixels->setPixelColor(i, pixels->Color(r, g, b));
        }
        break;

    case LED_PATTERN_BREATHING:
        pulseValue = 0;
        pulseDirection = true;
        for (int i = 0; i < NEOPIXEL_COUNT; i++) {
            pixels->setPixelColor(i, pixels->Color(0, 0, 0));
        }
        break;

    case LED_PATTERN_PULSE:
        pulseValue = 0;
        pulseDirection = true;
        break;

    case LED_PATTERN_FLASH:
        flashState = 0;
        for (int i = 0; i < NEOPIXEL_COUNT; i++) {
            pixels->setPixelColor(i, pixels->Color(r, g, b));
        }
        break;

    case LED_PATTERN_SPIN:
        spinPosition = 0;
        for (int i = 0; i < NEOPIXEL_COUNT; i++) {
            pixels->setPixelColor(i, pixels->Color(0, 0, 0));
        }
        break;

    case LED_PATTERN_SWEEP:
        for (int i = 0; i < NEOPIXEL_COUNT; i++) {
            pixels->setPixelColor(i, pixels->Color(r, g, b));
        }
        break;

    case LED_PATTERN_CHASE:
        chasePosition = 0;
        for (int i = 0; i < NEOPIXEL_COUNT; i++) {
            pixels->setPixelColor(i, pixels->Color(0, 0, 0));
        }
        break;

    case LED_PATTERN_ALTERNATING:
        alternatingState = 0;
        break;

    case LED_PATTERN_RAINBOW:
        rainbowOffset = 0;
        break;

    default:
        break;
    }

    pixels->show();
}

void LEDHandler::bootAnimation() {
    // Blue chase animation on boot
    for (int cycle = 0; cycle < 3; cycle++) {
        for (int i = 0; i < NEOPIXEL_COUNT; i++) {
            pixels->clear();
            pixels->setPixelColor(i, pixels->Color(0, 0, 255));
            pixels->show();
            delay(50);
        }
    }
    pixels->clear();
    pixels->show();
}

void LEDHandler::stopAll() {
    if (pixels) {
        pixels->clear();
        pixels->show();
        currentPattern = LED_PATTERN_OFF;
    }
}

void LEDHandler::setColor(int ledIndex, uint8_t r, uint8_t g, uint8_t b) {
    if (!pixels || ledIndex >= NEOPIXEL_COUNT) return;
    pixels->setPixelColor(ledIndex, pixels->Color(r, g, b));
}

void LEDHandler::setBrightness(uint8_t newBrightness) {
    brightness = newBrightness;
    if (pixels) {
        pixels->setBrightness(brightness);
        pixels->show();
    }
}

void LEDHandler::show() {
    if (pixels) {
        pixels->show();
    }
}

// ============================================================================
// PATTERN IMPLEMENTATIONS
// ============================================================================

void LEDHandler::updateBreathingPattern() {
    uint8_t r, g, b;
    getRGBFromColor(currentColor, r, g, b);

    // Sine wave breathing effect
    uint8_t brightness_val = 127 + 127 * sin(patternFrame * 0.02);

    uint8_t r_val = (r * brightness_val) / 255;
    uint8_t g_val = (g * brightness_val) / 255;
    uint8_t b_val = (b * brightness_val) / 255;

    for (int i = 0; i < NEOPIXEL_COUNT; i++) {
        pixels->setPixelColor(i, pixels->Color(r_val, g_val, b_val));
    }
    pixels->show();
}

void LEDHandler::updatePulsePattern() {
    uint8_t r, g, b;
    getRGBFromColor(currentColor, r, g, b);

    // Triangle wave pulse
    if (patternFrame % 20 < 10) {
        pulseValue = (patternFrame % 20) * 25;
    } else {
        pulseValue = 250 - ((patternFrame % 20) * 25);
    }

    uint8_t r_val = (r * pulseValue) / 255;
    uint8_t g_val = (g * pulseValue) / 255;
    uint8_t b_val = (b * pulseValue) / 255;

    for (int i = 0; i < NEOPIXEL_COUNT; i++) {
        pixels->setPixelColor(i, pixels->Color(r_val, g_val, b_val));
    }
    pixels->show();
}

void LEDHandler::updateFlashPattern() {
    uint8_t r, g, b;
    getRGBFromColor(currentColor, r, g, b);

    flashState = (patternFrame / 5) % 2;

    if (flashState) {
        for (int i = 0; i < NEOPIXEL_COUNT; i++) {
            pixels->setPixelColor(i, pixels->Color(r, g, b));
        }
    } else {
        pixels->clear();
    }
    pixels->show();
}

void LEDHandler::updateSpinPattern() {
    uint8_t r, g, b;
    getRGBFromColor(currentColor, r, g, b);

    spinPosition = (patternFrame / 2) % NEOPIXEL_COUNT;

    pixels->clear();
    pixels->setPixelColor(spinPosition, pixels->Color(r, g, b));
    if (spinPosition > 0) {
        pixels->setPixelColor(spinPosition - 1, pixels->Color(r / 2, g / 2, b / 2));
    }
    pixels->show();
}

void LEDHandler::updateSweepPattern() {
    uint8_t r, g, b;
    getRGBFromColor(currentColor, r, g, b);

    // Sweep animation: light all LEDs then fade
    int fadeProgress = (patternFrame / 2) % 100;

    if (fadeProgress < 50) {
        // Lighting up
        uint8_t brightness_val = (fadeProgress * 5);
        uint8_t r_val = (r * brightness_val) / 255;
        uint8_t g_val = (g * brightness_val) / 255;
        uint8_t b_val = (b * brightness_val) / 255;

        for (int i = 0; i < NEOPIXEL_COUNT; i++) {
            pixels->setPixelColor(i, pixels->Color(r_val, g_val, b_val));
        }
    } else {
        // Fading out
        uint8_t brightness_val = 250 - ((fadeProgress - 50) * 5);
        uint8_t r_val = (r * brightness_val) / 255;
        uint8_t g_val = (g * brightness_val) / 255;
        uint8_t b_val = (b * brightness_val) / 255;

        for (int i = 0; i < NEOPIXEL_COUNT; i++) {
            pixels->setPixelColor(i, pixels->Color(r_val, g_val, b_val));
        }
    }
    pixels->show();
}

void LEDHandler::updateChasePattern() {
    uint8_t r, g, b;
    getRGBFromColor(currentColor, r, g, b);

    chasePosition = (patternFrame / 2) % NEOPIXEL_COUNT;

    pixels->clear();
    for (int i = 0; i < 3; i++) {
        int pos = (chasePosition - i + NEOPIXEL_COUNT) % NEOPIXEL_COUNT;
        uint8_t brightness_val = 255 - (i * 85);
        uint8_t r_val = (r * brightness_val) / 255;
        uint8_t g_val = (g * brightness_val) / 255;
        uint8_t b_val = (b * brightness_val) / 255;
        pixels->setPixelColor(pos, pixels->Color(r_val, g_val, b_val));
    }
    pixels->show();
}

void LEDHandler::updateAlternatingPattern() {
    uint8_t r1, g1, b1;
    uint8_t r2, g2, b2;

    getRGBFromColor(currentColor, r1, g1, b1);
    LEDColor secondColor = (currentColor == LED_COLOR_RED) ? LED_COLOR_BLUE : LED_COLOR_RED;
    getRGBFromColor(secondColor, r2, g2, b2);

    alternatingState = (patternFrame / 5) % 2;

    for (int i = 0; i < NEOPIXEL_COUNT; i++) {
        if ((i + alternatingState) % 2) {
            pixels->setPixelColor(i, pixels->Color(r1, g1, b1));
        } else {
            pixels->setPixelColor(i, pixels->Color(r2, g2, b2));
        }
    }
    pixels->show();
}

void LEDHandler::updateRainbowPattern() {
    rainbowOffset = (patternFrame / 2) % 256;

    for (int i = 0; i < NEOPIXEL_COUNT; i++) {
        uint32_t color = pixels->ColorHSV((rainbowOffset + (i * 65536 / NEOPIXEL_COUNT)) & 0xFFFF);
        pixels->setPixelColor(i, color);
    }
    pixels->show();
}

// ============================================================================
// COLOR CONVERSION
// ============================================================================

uint32_t LEDHandler::colorToRGB(LEDColor color) {
    uint8_t r, g, b;
    getRGBFromColor(color, r, g, b);
    return pixels->Color(r, g, b);
}

void LEDHandler::getRGBFromColor(LEDColor color, uint8_t& r, uint8_t& g, uint8_t& b) {
    switch (color) {
    case LED_COLOR_RED:
        r = 255;
        g = 0;
        b = 0;
        break;
    case LED_COLOR_GREEN:
        r = 0;
        g = 255;
        b = 0;
        break;
    case LED_COLOR_BLUE:
        r = 0;
        g = 0;
        b = 255;
        break;
    case LED_COLOR_YELLOW:
        r = 255;
        g = 255;
        b = 0;
        break;
    case LED_COLOR_CYAN:
        r = 0;
        g = 255;
        b = 255;
        break;
    case LED_COLOR_MAGENTA:
        r = 255;
        g = 0;
        b = 255;
        break;
    case LED_COLOR_WHITE:
        r = 255;
        g = 255;
        b = 255;
        break;
    case LED_COLOR_ORANGE:
        r = 255;
        g = 165;
        b = 0;
        break;
    case LED_COLOR_OFF:
    default:
        r = 0;
        g = 0;
        b = 0;
        break;
    }
}
