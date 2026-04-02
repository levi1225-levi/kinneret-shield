# Kinneret Shield

Wall-mounted NFC attendance check-in device for TanenbaumCHAT.

Students tap their NFC card on the device as they enter the classroom. The device reads the card, sends the attendance record to a server, and shows a confirmation on the OLED screen with sound and LED animation.

## Project Structure

```
kinneret-shield/
├── expo-app/       # React Native (Expo) management app
├── backend/        # NestJS + Prisma + Supabase server
├── firmware/       # ESP32-S3 PlatformIO firmware
├── cad/            # 3D enclosure design files
├── sdcard/         # MicroSD card files for the device
└── app/            # Legacy Flutter app (replaced by expo-app)
```

## Hardware

- **HermitX ESP32-S3 NFC Card Reader Module** (99 × 62mm)
- **HiLetgo 2.42" SSD1309 OLED Display** (128×64, I2C)
- **3D-printed enclosure** (136 × 96 × 26mm, 3 pieces)
- **NFC cards** (NTAG213 or MIFARE Classic, 13.56 MHz)

## Quick Start

### Expo App
```bash
cd expo-app
npm install
npx expo start
```

### Backend
```bash
cd backend
npm install
cp .env.example .env   # Edit with your Supabase credentials
npx prisma migrate dev --name init
npm run start:dev
```

### Firmware
Open `firmware/` in VS Code with PlatformIO. Edit `src/config.h` with your settings, then upload to the ESP32-S3.

## License

MIT
