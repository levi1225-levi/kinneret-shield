# Kinneret Shield - ESP32-S3 Firmware

Complete production-ready firmware for the Kinneret Shield NFC check-in device. This firmware runs on an ESP32-S3 and interfaces with:
- PN532 NFC card reader (I2C)
- SSD1309 OLED display (I2C, 128×64)
- 8× WS2812B NeoPixel LEDs
- MAX98357A I2S audio amplifier
- MicroSD card for local logging and configuration

## Project Structure

```
kinneret-shield/firmware/
├── platformio.ini           # PlatformIO configuration
├── src/
│   ├── main.cpp            # Main entry point and event callbacks
│   ├── config.h            # Pin definitions and constants
│   ├── state_machine.h/.cpp  # Core state machine implementation
│   ├── nfc_handler.h/.cpp   # PN532 NFC reader interface
│   ├── display_handler.h/.cpp # SSD1306/SSD1309 OLED driver
│   ├── led_handler.h/.cpp   # WS2812B NeoPixel controller
│   ├── audio_handler.h/.cpp # MAX98357A I2S audio playback
│   ├── network_handler.h/.cpp # WiFi and server communication
│   ├── storage_handler.h/.cpp # SD card and configuration management
│   └── ota_handler.h/.cpp   # Over-the-air firmware updates
└── README.md               # This file
```

## Features

### Hardware Support
- **ESP32-S3** microcontroller with dual-core Xtensa processor
- **PN532** NFC/RFID reader via I2C with debounce and auto-recovery
- **SSD1309** OLED display with multi-screen UI
- **WS2812B** addressable LEDs with 9 animation patterns
- **MAX98357A** I2S audio amplifier with tone generation
- **MicroSD** card for local logging and offline sync queue
- **USB-C** power input

### Firmware Features
- **State Machine**: Boot → WiFi → Server → Idle → (Card Detection → Processing → Success/Failure)
- **Emergency Modes**: Lockdown and evacuation alerts from server
- **Offline Operation**: Local logging to SD card, sync when reconnected
- **Web UI**: Configuration endpoint at `192.168.4.1` during WiFi setup
- **Over-the-Air Updates**: Download and flash firmware from server
- **Non-blocking Design**: Uses `millis()` for all timing, no `delay()` in main loop
- **Robust Error Handling**: Auto-recovery from NFC/WiFi/server failures
- **Audio Feedback**: Different tones for boot, card tap, success, failure, emergency

### Display Screens
- **Boot**: Firmware version and initialization progress
- **Idle**: Room name, current time, WiFi status
- **WiFi Setup**: AP name and connection instructions
- **Processing**: Spinner animation during server communication
- **Success**: Student name, check-in/out status, timestamp
- **Error**: Error message with retry instructions
- **Emergency**: LOCKDOWN or EVACUATION alert with flashing
- **Offline**: Server unavailable message
- **Firmware Update**: Progress bar and percentage

### LED Patterns
- **Solid**: Solid color
- **Breathing**: Smooth sine-wave fade in/out
- **Pulse**: Triangle-wave pulse
- **Flash**: 50% duty cycle blink
- **Spin**: Single LED rotating around the ring
- **Sweep**: All LEDs light up then fade
- **Chase**: Moving light trail
- **Alternating**: Alternating color pattern
- **Rainbow**: HSV color wheel animation

### Audio Effects
- **Boot Chime**: Two-tone ascending (C5→G5)
- **Card Beep**: High-pitched single tone (C6)
- **Success**: Two-tone ascending (C5→G5)
- **Failure**: Descending buzz (400Hz→350Hz)
- **Emergency Alarm**: Alternating siren (1kHz↔500Hz)

## Setup & Build

### Prerequisites
1. **PlatformIO**: Install via VS Code extension or CLI
   ```bash
   pip install platformio
   ```

2. **USB Driver**: Ensure ESP32-S3 USB-UART driver is installed
   - CH340 or CP2102 drivers commonly required

3. **Libraries**: All dependencies listed in `platformio.ini` are auto-installed

### Building

```bash
# Build firmware
pio run -e esp32-s3-devkitc-1

# Clean and rebuild
pio run -e esp32-s3-devkitc-1 --target clean

# Upload to device
pio run -e esp32-s3-devkitc-1 --target upload

# Monitor serial output
pio device monitor -b 115200
```

### First-Time Setup

1. **Plug in via USB-C** - Device boots and enters WiFi setup mode
2. **Connect to AP**: Look for "KinneretShield-XXXX" WiFi network
3. **Open config portal**: Navigate to `http://192.168.4.1` in browser
4. **Enter WiFi credentials**: Select your school WiFi network
5. **Device configuration**: Set device ID, room name, and API key
6. **Save & reboot**: Configuration is stored on SD card

### Configuration File (config.json)

```json
{
  "device_id": "ROOM_101_DEVICE",
  "room_name": "Grade 5 - Room 101",
  "api_key": "your-secret-api-key-here"
}
```

Place this on the MicroSD card root for automatic configuration on boot.

## Pin Assignments

| Signal | GPIO | Purpose |
|--------|------|---------|
| I2C SDA | 8 | PN532 NFC + OLED data |
| I2C SCL | 9 | PN532 NFC + OLED clock |
| NeoPixel | 40 | WS2812B LED data |
| I2S BCLK | 41 | MAX98357A bit clock |
| I2S LRC | 42 | MAX98357A word select |
| I2S DIN | 2 | MAX98357A data in |
| SD SPI CS | 1 | MicroSD chip select |
| SD SPI MOSI | 35 | MicroSD data out |
| SD SPI MISO | 37 | MicroSD data in |
| SD SPI SCK | 36 | MicroSD clock |

## API Endpoints

The device communicates with the school attendance server:

### POST /api/attendance/tap
Send NFC card tap events:
```json
{
  "device_id": "ROOM_101_DEVICE",
  "card_uid": "1A2B3C4D",
  "timestamp": 1640000000
}
```

Response:
```json
{
  "status": "success",
  "student_name": "John Smith",
  "action": "check_in"
}
```

### POST /api/devices/heartbeat
Send device status (every 30 seconds):
```json
{
  "device_id": "ROOM_101_DEVICE",
  "firmware_version": "1.0.0",
  "free_heap": 102400,
  "wifi_rssi": -65,
  "uptime": 3600
}
```

### WebSocket Commands
Server can send real-time commands via WebSocket:
```json
{
  "command": "lockdown",
  "param": "evacuation_drill"
}
```

Supported commands:
- `lockdown` - Enter emergency lockdown mode
- `evacuation` - Enter emergency evacuation mode
- `all_clear` - Clear emergency mode
- `update_config` - Reload configuration from server
- `firmware_update` - URL to new firmware binary

## Logging & Debugging

### Serial Output
Connect via USB and monitor at 115200 baud:
```bash
pio device monitor -b 115200
```

### Local Logging
- **attendance.csv**: All card taps logged locally with timestamp
- **sync_queue.json**: Pending events not yet sent to server (offline mode)

### Log Levels
The firmware uses `Serial.println()` for all debug output:
- `[Main]` - Main loop and state transitions
- `[StateMachine]` - State machine events
- `[NFCHandler]` - NFC reader status
- `[DisplayHandler]` - Display updates
- `[LEDHandler]` - LED animations
- `[AudioHandler]` - Audio playback
- `[NetworkHandler]` - WiFi and server communication
- `[StorageHandler]` - SD card operations
- `[OTAHandler]` - Firmware update progress

### Debug Mode
Uncomment `#define DEBUG_MODE` in `main.cpp` to enable test functions:
```cpp
testNFCReader();
testLEDs();
testAudio();
testDisplay();
```

## State Machine Diagram

```
    ┌─────────────────┐
    │     BOOT        │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ WIFI_CONNECTING │
    └────────┬────────┘
             │
             ▼
   ┌──────────────────┐
   │SERVER_CONNECTING │
   └────────┬─────────┘
            │
            ▼
   ┌─────────────────┐
   │      IDLE       │◄──────────────────┐
   └────────┬────────┘                   │
            │                            │
            │ (card tap)                 │
            ▼                            │
   ┌─────────────────┐                   │
   │ CARD_DETECTED   │                   │
   └────────┬────────┘                   │
            │                            │
            ▼                            │
   ┌─────────────────┐                   │
   │  PROCESSING     │                   │
   └────────┬────────┘                   │
            │                            │
      ┌─────┴─────┐                      │
      ▼           ▼                      │
   SUCCESS    FAILURE ──────────────────┘
      │           │
      └─────┬─────┘
            │
            └─►  IDLE

    Any state can transition to:
    - ERROR (recoverable system error)
    - EMERGENCY (server lockdown/evacuation)
    - OFFLINE (WiFi/server disconnected)
    - FIRMWARE_UPDATE (OTA in progress)
```

## Troubleshooting

### Device won't boot
1. Check USB power supply (5V, 2A minimum)
2. Verify USB-C cable is working
3. Check serial output for boot messages
4. Try holding BOOT button while plugging in USB

### NFC reader not detected
1. Verify I2C address with `i2cdetect` tool
2. Check SDA/SCL connections (pins 8, 9)
3. Look for pull-up resistors (typically 4.7kΩ)
4. Confirm wire length < 1 meter

### WiFi won't connect
1. SSID must broadcast (hidden networks need manual entry)
2. Check WiFi password and encryption type
3. Verify 2.4 GHz band (5 GHz not supported on most ESP32s)
4. Look for "KinneretShield-XXXX" AP to reconfigure

### Display not showing
1. Verify I2C address is 0x3C for SSD1309
2. Check contrast settings in code
3. Confirm OLED is powered (3.3V)
4. Test with I2C scanner

### Audio not working
1. Verify MAX98357 is powered (3.3V)
2. Check I2S pins (41, 42, 2)
3. Confirm external speaker is connected
4. Test with simple tone generation

### SD card not found
1. Format SD card as FAT32
2. Check CS pin (1) and SPI pins
3. Verify card is inserted properly
4. Try different SD card (some are picky about voltage)

## Performance & Power

- **Loop frequency**: ~50 ms main loop interval (non-blocking)
- **WiFi reconnect**: 5 second intervals
- **Heartbeat**: 30 second intervals
- **NFC scan**: 200 ms intervals
- **Display refresh**: 100 ms intervals
- **LED animation**: 50 ms frame updates
- **Power consumption**: ~200 mA average (WiFi on)
- **Idle current**: ~50 mA

## Security Considerations

1. **API Key**: Store in config.json on SD card (encrypted on server)
2. **HTTPS**: Use HTTPS URLs for all server communication
3. **Signature Verification**: OTA updates should be signed
4. **Physical Access**: Device is wall-mounted, but protect API key
5. **Local Logging**: CSV files contain student UIDs, keep SD card secure

## Future Enhancements

- [ ] Encrypted SD card storage
- [ ] HTTPS/TLS support
- [ ] Backup battery with shutdown grace period
- [ ] Multi-lane NFC scanning
- [ ] Advanced analytics dashboard
- [ ] Integration with student management systems
- [ ] QR code support alongside NFC
- [ ] Low-power idle mode
- [ ] Network time sync (NTP)
- [ ] Firmware rollback mechanism

## License

Proprietary - Kinneret School System

## Support

For issues, questions, or feature requests:
- Contact: it@kinneret.example.com
- Documentation: https://docs.kinneret.example.com
- Issue tracker: https://issues.kinneret.example.com
