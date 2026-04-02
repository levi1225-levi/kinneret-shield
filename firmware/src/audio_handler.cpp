#include "audio_handler.h"
#include <math.h>

AudioHandler::AudioHandler()
    : initialized(false),
      playing(false),
      volume(200),
      audioStartTime(0),
      sampleRate(I2S_SAMPLE_RATE),
      i2sInitialized(false) {
}

AudioHandler::~AudioHandler() {
    stopAllAudio();
}

void AudioHandler::init() {
    Serial.println("[AudioHandler] Initializing...");

    initI2S();
    initialized = true;

    Serial.println("[AudioHandler] Initialization complete");
}

void AudioHandler::initI2S() {
    // I2S configuration
    i2s_config_t i2s_config = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
        .sample_rate = I2S_SAMPLE_RATE,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_16,
        .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
        .communication_format = I2S_COMM_FORMAT_STAND_I2S,
        .intr_alloc_flags = 0,
        .dma_buf_count = 8,
        .dma_buf_len = 64,
        .use_apll = false
    };

    // Pin configuration
    i2s_pin_config_t pin_config = {
        .bck_io_num = I2S_BCLK_PIN,
        .ws_io_num = I2S_LRC_PIN,
        .data_out_num = I2S_DIN_PIN,
        .data_in_num = I2S_PIN_NO_CHANGE
    };

    // Install and start I2S driver
    esp_err_t err = i2s_driver_install(I2S_NUM, &i2s_config, 0, nullptr);
    if (err != ESP_OK) {
        Serial.printf("[AudioHandler] I2S driver install failed: %d\n", err);
        return;
    }

    err = i2s_set_pin(I2S_NUM, &pin_config);
    if (err != ESP_OK) {
        Serial.printf("[AudioHandler] I2S set pin failed: %d\n", err);
        i2s_driver_uninstall(I2S_NUM);
        return;
    }

    i2sInitialized = true;
    Serial.println("[AudioHandler] I2S initialized successfully");
}

void AudioHandler::stopI2S() {
    if (i2sInitialized) {
        i2s_driver_uninstall(I2S_NUM);
        i2sInitialized = false;
    }
}

void AudioHandler::update() {
    if (!initialized) return;

    // Check if audio playback should stop
    if (playing && (millis() - audioStartTime > 5000)) {
        // Stop audio after 5 seconds max
        playing = false;
    }
}

void AudioHandler::generateTone(uint16_t frequency, uint32_t durationMs) {
    if (!i2sInitialized) return;

    generateSineWave(frequency, durationMs, volume);
}

void AudioHandler::generateSineWave(uint16_t frequency, uint32_t durationMs, uint8_t volumePercent) {
    if (!i2sInitialized) return;

    playing = true;
    audioStartTime = millis();

    size_t sampleCount = (sampleRate * durationMs) / 1000;
    int16_t* samples = new int16_t[sampleCount];

    if (!samples) {
        Serial.println("[AudioHandler] Failed to allocate sample buffer");
        playing = false;
        return;
    }

    // Generate sine wave samples
    for (size_t i = 0; i < sampleCount; i++) {
        float angle = 2.0f * M_PI * frequency * i / sampleRate;
        int16_t sample = (int16_t)(sin(angle) * 32767 * volumePercent / 255);
        samples[i] = sample;
    }

    // Write samples to I2S
    writeSamples(samples, sampleCount);

    delete[] samples;
    playing = false;
}

void AudioHandler::writeSamples(int16_t* samples, size_t count) {
    if (!i2sInitialized) return;

    size_t bytes_written = 0;
    i2s_write(I2S_NUM, samples, count * sizeof(int16_t), &bytes_written, portMAX_DELAY);
}

void AudioHandler::playBootChime() {
    Serial.println("[AudioHandler] Playing boot chime");
    generateTone(TONE_BOOT_HZ1, 200);
    delay(100);
    generateTone(TONE_BOOT_HZ2, 200);
}

void AudioHandler::playCardBeep() {
    Serial.println("[AudioHandler] Playing card beep");
    generateTone(TONE_CARD_BEEP, TONE_DURATION_MS);
}

void AudioHandler::playSuccessTone() {
    Serial.println("[AudioHandler] Playing success tone");
    generateTone(TONE_SUCCESS_HZ1, 150);
    delay(100);
    generateTone(TONE_SUCCESS_HZ2, 150);
}

void AudioHandler::playFailureTone() {
    Serial.println("[AudioHandler] Playing failure tone");
    // Descending buzz
    for (int i = 0; i < 2; i++) {
        generateTone(400 - (i * 50), 100);
        delay(50);
    }
}

void AudioHandler::playEmergencyAlarm() {
    Serial.println("[AudioHandler] Playing emergency alarm");
    playing = true;
    audioStartTime = millis();

    // Alternating siren pattern
    for (int i = 0; i < 5; i++) {
        generateTone(TONE_SIREN_HI, 200);
        delay(50);
        generateTone(TONE_SIREN_LO, 200);
        delay(50);
    }
}

void AudioHandler::setVolume(uint8_t newVolume) {
    volume = newVolume;
    Serial.printf("[AudioHandler] Volume set to %d\n", volume);
}

void AudioHandler::stopAllAudio() {
    playing = false;
    // Clear any pending I2S data
    if (i2sInitialized) {
        i2s_zero_dma_buffer(I2S_NUM);
    }
}
