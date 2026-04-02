#ifndef AUDIO_HANDLER_H
#define AUDIO_HANDLER_H

#include <Arduino.h>
#include "config.h"
#include <driver/i2s.h>

class AudioHandler {
public:
    AudioHandler();
    ~AudioHandler();

    // Initialization
    void init();

    // Main update loop
    void update();

    // Sound effects
    void playBootChime();
    void playCardBeep();
    void playSuccessTone();
    void playFailureTone();
    void playEmergencyAlarm();

    // Control
    void setVolume(uint8_t volume);
    void stopAllAudio();

    // Status
    bool isReady() const { return initialized; }
    bool isPlaying() const { return playing; }

private:
    // Tone generation
    void generateTone(uint16_t frequency, uint32_t durationMs);
    void generateSineWave(uint16_t frequency, uint32_t durationMs, uint8_t volumePercent);
    void writeSamples(int16_t* samples, size_t count);

    // Helper methods
    void initI2S();
    void stopI2S();
    void configureI2S();

    // Members
    bool initialized;
    bool playing;
    uint8_t volume;
    unsigned long audioStartTime;
    uint32_t sampleRate;

    // I2S state
    bool i2sInitialized;
};

#endif // AUDIO_HANDLER_H
