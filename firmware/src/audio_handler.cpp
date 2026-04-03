#include "audio_handler.h"
#include <math.h>

AudioHandler::AudioHandler()
    : initialized(false),
      playing(false),
      volume(150),
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

    if (i2sInitialized) {
        // Zero out the DMA buffer to prevent noise
        i2s_zero_dma_buffer(I2S_NUM);
        initialized = true;
        Serial.println("[AudioHandler] Initialization complete");
    } else {
        Serial.println("[AudioHandler] Initialization failed - continuing without audio");
        initialized = false;
    }
}

void AudioHandler::initI2S() {
    i2s_config_t i2s_config = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
        .sample_rate = I2S_SAMPLE_RATE,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
        .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
        .communication_format = I2S_COMM_FORMAT_STAND_I2S,
        .intr_alloc_flags = 0,
        .dma_buf_count = 8,
        .dma_buf_len = 64,
        .use_apll = false
    };

    i2s_pin_config_t pin_config = {
        .bck_io_num = I2S_BCLK_PIN,
        .ws_io_num = I2S_LRC_PIN,
        .data_out_num = I2S_DOUT_PIN,
        .data_in_num = I2S_PIN_NO_CHANGE
    };

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
        i2s_zero_dma_buffer(I2S_NUM);
        i2s_driver_uninstall(I2S_NUM);
        i2sInitialized = false;
    }
}

void AudioHandler::update() {
    if (!initialized) return;
}

void AudioHandler::generateTone(uint16_t frequency, uint32_t durationMs) {
    if (!i2sInitialized) return;
    generateSineWave(frequency, durationMs, volume);
}

void AudioHandler::generateSineWave(uint16_t frequency, uint32_t durationMs, uint8_t volumePercent) {
    if (!i2sInitialized) return;

    playing = true;
    audioStartTime = millis();

    // Use small chunks to avoid huge allocations
    const size_t chunkSize = 512;
    int16_t samples[chunkSize];
    size_t totalSamples = (sampleRate * durationMs) / 1000;
    size_t samplesWritten = 0;

    while (samplesWritten < totalSamples) {
        size_t count = min(chunkSize, totalSamples - samplesWritten);
        for (size_t i = 0; i < count; i++) {
            float angle = 2.0f * M_PI * frequency * (samplesWritten + i) / sampleRate;
            samples[i] = (int16_t)(sinf(angle) * 16000 * volumePercent / 255);
        }
        size_t bytes_written = 0;
        i2s_write(I2S_NUM, samples, count * sizeof(int16_t), &bytes_written, 500 / portTICK_PERIOD_MS);
        samplesWritten += count;
    }

    // Write silence after tone to clear buffer
    memset(samples, 0, chunkSize * sizeof(int16_t));
    size_t bytes_written = 0;
    i2s_write(I2S_NUM, samples, chunkSize * sizeof(int16_t), &bytes_written, 100 / portTICK_PERIOD_MS);

    playing = false;
}

void AudioHandler::writeSamples(int16_t* samples, size_t count) {
    if (!i2sInitialized) return;
    size_t bytes_written = 0;
    i2s_write(I2S_NUM, samples, count * sizeof(int16_t), &bytes_written, 500 / portTICK_PERIOD_MS);
}

void AudioHandler::playBootChime() {
    if (!initialized) return;
    Serial.println("[AudioHandler] Playing boot chime");
    generateTone(TONE_BOOT_HZ1, 150);
    generateTone(TONE_BOOT_HZ2, 150);
    i2s_zero_dma_buffer(I2S_NUM);
}

void AudioHandler::playCardBeep() {
    if (!initialized) return;
    Serial.println("[AudioHandler] Playing card beep");
    generateTone(TONE_CARD_BEEP, 100);
    i2s_zero_dma_buffer(I2S_NUM);
}

void AudioHandler::playSuccessTone() {
    if (!initialized) return;
    Serial.println("[AudioHandler] Playing success tone");
    generateTone(TONE_SUCCESS_HZ1, 100);
    generateTone(TONE_SUCCESS_HZ2, 100);
    i2s_zero_dma_buffer(I2S_NUM);
}

void AudioHandler::playFailureTone() {
    if (!initialized) return;
    Serial.println("[AudioHandler] Playing failure tone");
    generateTone(400, 100);
    generateTone(350, 100);
    i2s_zero_dma_buffer(I2S_NUM);
}

void AudioHandler::playEmergencyAlarm() {
    if (!initialized) return;
    Serial.println("[AudioHandler] Playing emergency alarm");
    playing = true;
    audioStartTime = millis();

    for (int i = 0; i < 3; i++) {
        generateTone(TONE_SIREN_HI, 150);
        generateTone(TONE_SIREN_LO, 150);
    }
    i2s_zero_dma_buffer(I2S_NUM);
}

void AudioHandler::setVolume(uint8_t newVolume) {
    volume = newVolume;
    Serial.printf("[AudioHandler] Volume set to %d\n", volume);
}

void AudioHandler::stopAllAudio() {
    playing = false;
    if (i2sInitialized) {
        i2s_zero_dma_buffer(I2S_NUM);
    }
}
