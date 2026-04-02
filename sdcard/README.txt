====================================================
  KINNERET SHIELD - MicroSD Card Setup
====================================================

HOW TO PREPARE YOUR SD CARD
----------------------------

1. Use a MicroSD card (any size, even 1 GB is plenty).
   Format it as FAT32.

2. Copy ONLY the config.json file to the ROOT of the
   SD card. Do NOT put it in a folder.

3. Edit config.json BEFORE inserting the card:

   - device_id:  A unique name for this device.
                  Example: "ROOM_201", "MAIN_ENTRANCE"
                  Must match what you register in the
                  backend admin panel.

   - room_name:  The display name shown on the OLED
                  screen when the device is idle.
                  Example: "Room 201", "Library"

   - api_key:    The secret key that authenticates
                  this device with the backend server.
                  Get this from your backend .env file
                  (DEVICE_AUTH_SECRET).

   - server_url: The URL of your backend server.
                  Example: "http://192.168.1.100:3000"
                  Must be reachable from the school
                  Wi-Fi network.

   - wifi_ssid:  (Optional) Pre-configure Wi-Fi.
                  Leave empty ("") to use the WiFi
                  Manager captive portal instead.

   - wifi_password: (Optional) Wi-Fi password.
                  Leave empty ("") if using WiFi Manager.

4. Insert the card into the MicroSD slot on the
   HermitX board. The slot is on the bottom edge,
   near the USB-C port.

5. Power on the device. It will read the config
   automatically on boot.


WHAT THE DEVICE CREATES ON THE SD CARD
----------------------------------------

The firmware automatically creates these files
during operation (you don't need to create them):

  /attendance.csv   - Local log of every NFC tap
                      Format: timestamp, card_UID
                      Useful as a backup if the
                      server is unreachable.

  /sync_queue.json  - Queue of taps waiting to be
                      sent to the server. Cleared
                      automatically after sync.


TROUBLESHOOTING
---------------

  Card not detected?
    - Make sure it's formatted as FAT32 (not exFAT).
    - Try a different card. Some ultra-high-speed
      cards (UHS-II) can be finicky with ESP32.
    - Check that the card clicks into the slot
      properly (push until it clicks).

  Config not loading?
    - Open Serial Monitor (115200 baud) and look for
      "[StorageHandler]" messages.
    - Make sure config.json is valid JSON. No trailing
      commas, no comments.
    - File must be named exactly "config.json" (lowercase).

  Card full?
    - The attendance.csv file can grow large over time.
      You can safely delete it - the server has the
      real records. Or copy it to your computer as a
      backup first.


====================================================
  Kinneret Shield v1.0 - TanenbaumCHAT
====================================================
