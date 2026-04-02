# Kinneret Shield - Deployment Guide

## Pre-Deployment Checklist

### Hardware Assembly
- [ ] ESP32-S3 dev board soldered and tested
- [ ] PN532 NFC reader connected via I2C (SDA/SCL to GPIO 8/9)
- [ ] SSD1309 OLED display connected via I2C (shared I2C bus)
- [ ] WS2812B LED strip connected (data pin 40, 5V power)
- [ ] MAX98357A amplifier connected (I2S pins 41/42/2, speaker connected)
- [ ] MicroSD card slot connected (SPI pins 1/35/37/36)
- [ ] USB-C power connector soldered
- [ ] All ground connections verified with continuity tester
- [ ] Power supply provides stable 5V at 2A+

### Firmware Preparation
- [ ] All source files compile without errors
- [ ] Firmware size < 2MB (available flash space)
- [ ] No memory leaks in heap allocation
- [ ] UART output is clean (no garbage data)
- [ ] All subsystems initialize without errors

### Configuration Files
- [ ] `config.json` created on MicroSD card:
  ```json
  {
    "device_id": "ROOM_XXX_DEVICE_01",
    "room_name": "Classroom XXX",
    "api_key": "secret-api-key-here"
  }
  ```
- [ ] MicroSD card formatted as FAT32
- [ ] MicroSD card inserted in device
- [ ] Attendance log folder structure created if needed

### Server Integration
- [ ] Server API endpoints implemented:
  - [ ] POST `/api/attendance/tap` - handle card tap events
  - [ ] POST `/api/devices/heartbeat` - receive device status
  - [ ] WebSocket for emergency commands
- [ ] Student UID database populated
- [ ] API key issued and secured
- [ ] CORS configured for device requests
- [ ] Rate limiting configured (or disabled for devices)
- [ ] Server logs configured to capture device events

### Network Configuration
- [ ] School WiFi network accessible from device location
- [ ] WiFi security: WPA2/WPA3 (WEP not supported)
- [ ] 2.4 GHz band available (5 GHz not supported)
- [ ] Device can reach server endpoint from WiFi
- [ ] Firewall rules allow device outbound to server
- [ ] DNS resolution working (or use IP address)

### Physical Installation
- [ ] Wall-mounted location selected (near entrance/exit)
- [ ] Device mounted at 4-5 feet height for easy card tap
- [ ] OLED display visible from 3+ feet away
- [ ] Speaker audible without being disruptive
- [ ] LEDs visible in room lighting conditions
- [ ] USB-C power available nearby
- [ ] Surge protector or UPS connected
- [ ] Device protected from water/dust splash

### Testing
- [ ] Device powers on successfully
- [ ] Boot sequence completes (blue LED breathing = ready)
- [ ] WiFi connects to school network within 30 seconds
- [ ] Server heartbeat received (check server logs)
- [ ] NFC card detection working (tested with sample cards)
- [ ] Display shows correct room name and time
- [ ] All audio tones audible at normal speaking volume
- [ ] LED animations visible in room light
- [ ] OLED display contrast adequate
- [ ] Offline mode works (simulate server disconnect)
- [ ] Sync queue transfers to server when reconnected
- [ ] Emergency mode triggers on server command
- [ ] OTA firmware update works

## Deployment Process

### 1. Pre-Deployment Testing (1-2 hours)

```bash
# Connect to device via USB
cd kinneret-shield/firmware
pio device monitor -b 115200

# Verify boot messages:
# [Main] Setup complete, entering main loop
# [NFCHandler] Initialization complete
# [StateMachine] Transition: 0 -> 1

# Test NFC - tap card and verify:
# [NFCHandler] Card detected, UID: XX XX XX XX
# [DisplayHandler] Success screen
# Audio tone plays

# Test WiFi - should auto-connect
# [NetworkHandler] WiFi connected
# [NetworkHandler] SSID: [School WiFi]
```

### 2. Field Deployment (30 minutes per device)

1. **Power up at location**
   - Plug USB-C into wall outlet/UPS
   - Wait 10 seconds for boot
   - Blue LED should be breathing

2. **Verify network connectivity**
   - Check for WiFi connection (should auto-connect)
   - Verify OLED shows correct room name
   - Check server logs for heartbeat (should arrive in 30s)

3. **Initial card tap test**
   - Have staff member tap their card
   - Verify success screen and sound
   - Check server logs for event arrival
   - Verify attendance recorded in system

4. **Functionality test suite**
   - [ ] Tap multiple cards in sequence
   - [ ] Leave device for 5 minutes, verify heartbeats
   - [ ] Disconnect WiFi (remove power, no WiFi)
   - [ ] Tap cards offline (should queue locally)
   - [ ] Reconnect WiFi (queued events should sync)
   - [ ] Trigger emergency mode from server
   - [ ] Verify LOCKDOWN displayed and alarm plays
   - [ ] Clear emergency from server
   - [ ] Verify back to normal idle state

5. **Sign off and documentation**
   - [ ] Take photos of installation
   - [ ] Record device ID and location
   - [ ] Note any issues or adjustments made
   - [ ] Update school inventory
   - [ ] Provide staff training (5 min)

### 3. First Week Monitoring

Daily checks:
- [ ] Device still powered on (green indicator if available)
- [ ] No error messages on OLED
- [ ] Attendance events appear in system
- [ ] No orphaned cards in queue
- [ ] WiFi signal strength adequate
- [ ] Audio/LED feedback working

Weekly checks:
- [ ] Review server logs for errors
- [ ] Check SD card free space
- [ ] Verify no hanging processes
- [ ] Confirm backups are working
- [ ] Staff feedback on usability

## Troubleshooting in Field

### Device won't power on
1. Check USB-C cable and wall outlet
2. Verify power supply (5V, 2A minimum)
3. Try different USB-C cable
4. Check for blown fuse or short circuit
5. If still dead, replace power board

### WiFi won't connect
1. Device will show "WiFi Setup" screen
2. Look for "KinneretShield-XXXX" AP
3. Connect and go to `192.168.4.1`
4. Re-enter WiFi credentials
5. If credentials are saved, check:
   - School WiFi is broadcasting
   - Device is in range (try moving closer)
   - WiFi is not blocking device MAC address
   - WiFi password hasn't changed

### NFC cards not reading
1. Device will show idle screen but no response to taps
2. Check NFC reader I2C connection
3. Verify PN532 power (3.3V)
4. Try tapping directly on reader (may have range issue)
5. Check card battery (some cards have low battery indicators)
6. Restart device (unplug/replug USB)
7. If persistent, replace NFC reader module

### Server communication failing
1. Check server is running and accessible
2. Verify network connectivity (should say "Connected" on screen)
3. Check server logs for device connection errors
4. Review API key and Device ID in config.json
5. Check firewall rules on school network
6. Test with device on different WiFi (to isolate network issue)

### Audio not working
1. Check speaker is connected to MAX98357A
2. Verify I2S pins (41, 42, 2) are correct
3. Check volume is not muted
4. Try increasing audio_volume in config (0-255)
5. Test with USB power (may need external power for audio)

### Display not updating
1. Check OLED I2C address is 0x3C
2. Verify SDA/SCL connections (GPIO 8/9)
3. Power cycle the device
4. Check display contrast (increase if dim)
5. Verify OLED module is not DOA

## Backup & Recovery

### Backup Procedures
```bash
# Before major update, backup SD card content:
cp -r /mnt/sdcard /backup/device_ROOM_XXX_backup_DATE

# If SD card corrupted, recreate from backup:
# Format new SD card as FAT32
# Copy config.json from backup
# Device will recreate other files on startup
```

### Rollback Firmware
```bash
# If update causes problems, rollback to previous:
# Device has built-in rollback if update fails
# OR manually upload older firmware:

pio run -e esp32-s3-devkitc-1 --target upload
# (uses firmware from previous build)
```

### Factory Reset
If device is in bad state:
```
1. Unplug USB power
2. Hold BOOT button
3. Plug in USB while holding BOOT
4. Firmware upload mode active
5. Run: pio run -e esp32-s3-devkitc-1 --target upload
6. Device reboots fresh
7. Re-enter WiFi credentials via 192.168.4.1
```

## Monitoring & Alerts

### Key Metrics to Monitor
- Device online/offline status
- WiFi signal strength (RSSI)
- Free heap memory
- Heartbeat interval (should be ~30s)
- Attendance event latency
- Queue size (should be 0 if online)
- Firmware version match

### Alert Thresholds
- Device offline > 5 minutes → investigate
- Free heap < 50KB → potential memory leak
- WiFi RSSI < -80 dBm → move device or router
- Queue size > 100 → server communication issue
- Heartbeat missing > 2 intervals → network issue

### Server-Side Logging
```sql
-- Example: Check device status
SELECT device_id, last_heartbeat, status
FROM device_status
WHERE location LIKE 'Room_%'
ORDER BY last_heartbeat DESC;

-- Example: Attendance events today
SELECT device_id, card_uid, timestamp, student_name
FROM attendance_events
WHERE DATE(timestamp) = CURDATE()
ORDER BY timestamp DESC;
```

## Performance Optimization

### Memory Usage
- Device: ~100KB static + ~50KB dynamic = ~150KB safe
- Budget: ESP32-S3 has 520KB SRAM, comfortably sufficient
- Heap fragments over time, restart weekly if < 50KB

### Network Bandwidth
- Heartbeat: ~200 bytes every 30 seconds = ~6.7 bytes/sec
- Attendance tap: ~100 bytes per event
- Efficient enough for school networks

### Power Consumption
- Active: ~200-300 mA (WiFi on, LEDs on)
- Idle: ~50-100 mA (WiFi sleep)
- Budget: Standard USB-C adapter (5V/2A) sufficient

## Maintenance Schedule

### Daily
- Visual inspection (powered on, no error messages)
- Test card tap (verify it works)

### Weekly
- Check free disk space (should have 1MB+ free)
- Review error logs on server
- Verify WiFi signal strength
- Check memory usage via serial console

### Monthly
- Power cycle device (full restart)
- Download and archive attendance logs
- Update firmware if new version available
- Clean dust from enclosure

### Quarterly
- Full system diagnostics
- Replace any degraded components
- Update security patches
- Review and optimize server database

## Decommissioning

When removing a device:
1. [ ] Export all historical attendance data
2. [ ] Backup configuration files
3. [ ] Remove API key from server
4. [ ] Unplug power
5. [ ] Label device for storage/redeployment
6. [ ] Update school inventory

## Documentation

- Device location and room assignment
- Assigned Device ID
- API key (stored securely, never in code)
- WiFi SSID used
- Installation date
- Any hardware modifications
- Known issues or quirks

## Support Escalation

**Level 1 - Try these:**
- Power cycle device
- Check WiFi connection
- Verify server is accessible
- Check server logs

**Level 2 - Check hardware:**
- Verify all connections with multimeter
- Test I2C bus with scanner tool
- Test individual components
- Review serial console output

**Level 3 - Replace:**
- If component fails testing, replace module
- Keep spare PN532 readers and OLED displays
- Document what was replaced

**Level 4 - RMA:**
- If multiple components fail, RMA entire unit
- Preserve data from SD card for recovery
- Contact manufacturer support

---

**Version**: 1.0.0
**Last Updated**: 2025-03-24
**Maintained By**: School IT Department
