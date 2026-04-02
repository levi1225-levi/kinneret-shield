# Kinneret Shield - Quick Start Guide

## 5-Minute Setup

### 1. Install PlatformIO
```bash
# VS Code: Install "PlatformIO IDE" extension
# OR CLI:
pip install platformio
```

### 2. Clone/Extract Firmware
```bash
cd kinneret-shield/firmware
```

### 3. Connect ESP32-S3 via USB-C

### 4. Build & Upload
```bash
# Build
pio run -e esp32-s3-devkitc-1

# Upload
pio run -e esp32-s3-devkitc-1 --target upload

# Monitor (Ctrl+C to exit)
pio device monitor -b 115200
```

### 5. Initial Configuration
1. Wait for device to boot (blue LED breathing)
2. Look for WiFi network: `KinneretShield-XXXX`
3. Connect to it
4. Open browser to `http://192.168.4.1`
5. Select school WiFi, enter credentials
6. Save configuration (stored on SD card)

### 6. Test
- **Tap NFC card**: Should show success screen + sound
- **Check OLED**: Should display room name and time
- **Check LEDs**: Blue breathing pattern = idle state
- **Monitor output**: Serial console shows debug logs

## File Reference

| File | Purpose | Key Changes |
|------|---------|-------------|
| `platformio.ini` | Build config | ESP32-S3 board, library versions |
| `src/config.h` | Constants | Pin numbers, WiFi AP name, API URL |
| `src/state_machine.cpp` | State logic | Device behavior flow |
| `src/nfc_handler.cpp` | NFC scanning | Debounce time, I2C address |
| `src/network_handler.cpp` | Server comm | API endpoints, heartbeat interval |
| `src/storage_handler.cpp` | SD card | Config file path, queue size |

## Common Customizations

### Change WiFi AP Name
**File**: `src/config.h`
```cpp
#define WIFI_MANAGER_AP_NAME "MySchool-Shield"
```

### Change Server URL
**File**: `src/config.h`
```cpp
#define SERVER_API_BASE_URL "https://attendance.myschool.edu"
```

### Change Room Name
**On device**: Open `http://192.168.4.1` config page
**Or edit**: `config.json` on SD card:
```json
{
  "room_name": "Classroom 205"
}
```

### Adjust LED Brightness
**File**: `src/config.h`
```cpp
#define LED_BRIGHTNESS 128  // 0-255, reduce for dim rooms
```

### Adjust Audio Volume
**File**: `src/config.h`
```cpp
#define I2S_SAMPLE_RATE 44100  // or 48000 for better quality
```

### Change NFC Debounce Time
**File**: `src/config.h`
```cpp
#define NFC_DEBOUNCE_TIME_MS 5000  // 5 seconds instead of 3
```

### Disable Emergency Mode
**File**: `src/state_machine.cpp`, function `onServerCommand()`:
```cpp
// Comment out or remove:
// if (strcmp(command, "lockdown") == 0) { ... }
```

## Troubleshooting Checklist

- [ ] USB cable is working (try different cable)
- [ ] ESP32-S3 board detected in VS Code
- [ ] Serial monitor shows boot messages
- [ ] NFC reader I2C address is 0x24
- [ ] OLED I2C address is 0x3C
- [ ] All ground connections are solid
- [ ] Power supply provides 5V at 2A+
- [ ] MicroSD card is FAT32 formatted
- [ ] WiFi SSID is broadcasting (not hidden)
- [ ] School WiFi allows device connections

## Serial Output Guide

```
Good startup:
  [Main] Setup complete, entering main loop
  [NFCHandler] Initialization complete
  [DisplayHandler] Initialization complete
  [StateMachine] Transition: 0 -> 1  (BOOT -> WIFI)
  [NetworkHandler] Starting WiFi Manager...

Successful card tap:
  [NFCHandler] Card detected, UID: 1A 2B 3C 4D
  [StateMachine] Card detected, UID length: 4
  [StateMachine] Transition: 3 -> 4  (IDLE -> CARD_DETECTED)
  [NetworkHandler] POST to /api/attendance/tap
  [NetworkHandler] POST success: 200

Offline mode:
  [StateMachine] Entering OFFLINE
  [StorageHandler] Attendance logged to CSV
  [StorageHandler] Sync queue size: 1
```

## Testing Without a Card Reader

Edit `src/main.cpp` to simulate card taps:
```cpp
// In loop(), add:
if (millis() % 5000 == 0) {
    uint8_t testUID[] = {0x1A, 0x2B, 0x3C, 0x4D};
    onNFCCardDetected(testUID, 4);
}
```

## Updating Firmware in Field

### OTA (Over-the-Air)
```
Server sends: POST /api/firmware/check
Device downloads new firmware from server URL
Progress shown on OLED with percentage
Auto-restarts on completion
```

### Manual via USB
```bash
cd kinneret-shield/firmware
pio run -e esp32-s3-devkitc-1 --target upload
```

## Advanced Topics

### Monitoring Free Memory
```cpp
Serial.printf("Free heap: %u bytes\n", ESP.getFreeHeap());
```

### Forcing State for Testing
In `main.cpp`:
```cpp
// Force device to emergency mode
stateMachine->forceState(STATE_EMERGENCY);
```

### Checking WiFi Signal
```cpp
Serial.printf("WiFi RSSI: %d dBm\n", WiFi.RSSI());
// -30 dBm = excellent, -90 dBm = poor
```

### Viewing SD Card Files
On device (via serial console):
```cpp
StorageHandler* storage = stateMachine->getStorageHandler();
if (storage) storage->listFiles("/");
```

## Integration with Attendance Server

Your server backend should:

1. **Accept POST** to `/api/attendance/tap`
   - Parse `device_id`, `card_uid`, `timestamp`
   - Look up student by UID
   - Return `{status, student_name, action}`

2. **Accept POST** to `/api/devices/heartbeat`
   - Log device status for monitoring
   - Send device configuration if changed

3. **Send WebSocket** commands for emergency mode
   - Command: `{"command": "lockdown"}`
   - Command: `{"command": "all_clear"}`

4. **Host firmware** at known URL for OTA updates
   - GET `/firmware/latest.bin`
   - GET `/firmware/version.txt`

## Support Files

- **config.json**: Device configuration (on SD card)
- **attendance.csv**: Daily log of all card taps
- **sync_queue.json**: Events awaiting server sync

## Next Steps

1. ✅ Build and upload firmware
2. ✅ Configure WiFi and room name
3. ✅ Test NFC card detection
4. ✅ Verify server communication
5. ✅ Deploy to wall mount
6. ✅ Monitor first week of operation
7. ✅ Adjust LED/audio levels as needed
8. ✅ Set up OTA update infrastructure
