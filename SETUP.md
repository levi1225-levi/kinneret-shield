# Kinneret Shield Setup Guide

This guide covers the complete setup process for the Kinneret Shield camp management system across all components: Supabase backend, mobile app, and HermitX devices.

## Part 1: Supabase Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project
3. Save your project URL and anon key for later steps

### 2. Run Database Migrations
1. In the Supabase Dashboard, navigate to the SQL Editor
2. Open the migration file at `supabase/migrations/001_camp_northland_schema.sql`
3. Copy the entire contents and paste into the Supabase SQL Editor
4. Click "Run" to execute the migration and create all necessary tables and functions

### 3. Obtain API Credentials
1. In the Supabase Dashboard, go to **Settings > API**
2. Copy your project **URL** (e.g., `https://YOUR_PROJECT.supabase.co`)
3. Copy your **anon (public)** API key
4. Save both values — you'll need them for the mobile app configuration

### 4. Deploy Edge Functions
1. Install the Supabase CLI: `npm install -g supabase`
2. Link your project: `supabase link --project-ref YOUR_PROJECT_ID`
3. Deploy the device-tap function:
   ```bash
   supabase functions deploy device-tap
   ```
4. Deploy the device-heartbeat function:
   ```bash
   supabase functions deploy device-heartbeat
   ```
5. Test the deployments in the Supabase Dashboard under Functions

## Part 2: Mobile App Setup

### 1. Configure Environment Variables
1. Navigate to the `expo-app` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and replace the placeholder values:
   - `EXPO_PUBLIC_SUPABASE_URL`: Use the URL from Part 1 Step 3
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Use the anon key from Part 1 Step 3

### 2. Install Dependencies
```bash
cd expo-app
npm install
```

### 3. Start the Development Server
```bash
npx expo start
```
You can now scan the QR code with Expo Go on iOS/Android or run in a simulator.

### 4. Create the First Management User
1. In the Supabase Dashboard, go to **Authentication > Users**
2. Click "Add user" and create a new user with:
   - Email: your desired admin email
   - Password: a secure password
3. After creating the user, click on it to view details and **copy the user's UUID** (under "User ID")
4. Go to **SQL Editor** in the Supabase Dashboard
5. Run the following query, replacing `UUID_HERE` and other values:
   ```sql
   INSERT INTO users (auth_id, email, name, role)
   VALUES ('UUID_HERE', 'admin@example.com', 'Admin User', 'management');
   ```
6. You can now log in to the mobile app with the email and password created in step 2

## Part 3: HermitX Device Setup

### 1. Flash Firmware via PlatformIO
1. Install PlatformIO: `pip install platformio` or use the VSCode extension
2. Navigate to the firmware directory
3. Run: `platformio run -t upload` to compile and flash to your device
4. Monitor the serial output to confirm successful flashing

### 2. Prepare the MicroSD Card
1. Format an MicroSD card as FAT32
2. Create a `config.json` file in the root of the card (see `sdcard/config.json` for template)
3. Update the JSON with your device information:
   ```json
   {
     "device_uuid": "YOUR_DEVICE_UUID",
     "api_key": "YOUR_API_KEY",
     "wifi_ssid": "YOUR_SSID",
     "wifi_password": "YOUR_PASSWORD"
   }
   ```
4. Safely eject the card

### 3. Register the Device in Supabase
1. In the Supabase Dashboard, go to **SQL Editor**
2. Insert a new device record:
   ```sql
   INSERT INTO devices (serial_number, name, location, status)
   VALUES ('YOUR_SERIAL_NUMBER', 'Tap Reader 1', 'Main Entrance', 'active');
   ```
3. Copy the auto-generated `api_key` from the response
4. Copy the device's `id` (this becomes your `device_uuid`)
5. Update `config.json` on the MicroSD card with:
   - `device_uuid`: The device `id` from step 4
   - `api_key`: The generated API key from step 3

### 4. Power On and Connect
1. Insert the MicroSD card into the HermitX device
2. Power on the device
3. The device will:
   - Read configuration from the SD card
   - Connect to your WiFi network
   - Begin sending heartbeat signals to the Supabase backend
4. Verify connectivity in the Supabase Dashboard under the `device_heartbeats` table

## Part 4: Registering Campers & Wristbands

### 1. Add Campers
You can add campers in two ways:

**Option A: Via Mobile App Admin Panel**
1. Log in with your management account
2. Navigate to the Admin panel
3. Select "Add Camper"
4. Enter camper details (name, age, cabin, etc.)
5. Save

**Option B: Via Supabase SQL**
1. In the Supabase Dashboard, go to **SQL Editor**
2. Run:
   ```sql
   INSERT INTO campers (name, age, cabin_id, status)
   VALUES ('Camper Name', 10, 'CABIN_UUID', 'checked_in');
   ```

### 2. Register NFC Wristbands
1. When a new, unregistered NFC wristband is tapped on a HermitX device, it creates an "unknown_card" alert
2. In the mobile app Admin panel, you'll see the alert with the wristband's UID
3. Click "Assign Wristband" and select the camper to assign it to
4. The system records the UID-to-camper mapping in the `camper_wristbands` table
5. Future taps with that UID will be properly tracked

## Part 5: Testing

### Demo Mode (No Supabase Required)
1. On the mobile app login screen, tap "Enter Demo Mode"
2. The app simulates camp data locally
3. Useful for testing UI without backend connection

### Production Mode (Supabase Required)
1. Log in with credentials from Part 2 Step 4
2. Once authenticated, you'll have access to:
   - Real-time camper and device data
   - Live tap alerts from HermitX devices
   - Admin panel for managing users and devices
3. Verify data flow:
   - Check `device_heartbeats` table in Supabase for regular device pings
   - Check `tap_events` table for tap activity
   - Monitor `unknown_card_alerts` for new wristband registrations

## Troubleshooting

### Supabase Connection Issues
- Verify the URL and anon key are correct in `.env`
- Check that your Supabase project is active in the dashboard
- Ensure the database schema migration completed successfully

### HermitX Device Not Connecting
- Verify the WiFi credentials in `config.json` are correct
- Check the device serial output for error messages
- Confirm the `api_key` and `device_uuid` match the Supabase records

### Mobile App Login Issues
- Ensure the management user was created in Part 2 Step 4
- Verify the user's `auth_id` matches their UUID in the `users` table
- Clear app cache and try logging in again

### Wristband Not Being Recognized
- Verify the HermitX device is actively connected (check `device_heartbeats`)
- Try tapping the wristband again — the device may be in low-power mode
- Check the `tap_events` table in Supabase to see if the tap was recorded
- Verify the wristband's UID is properly stored in the `camper_wristbands` table

## Next Steps

Once everything is set up and working:
1. Register all campers and assign wristbands
2. Deploy additional HermitX devices as needed
3. Create user accounts for staff members with appropriate roles
4. Set up any custom integrations or notification systems
5. Run end-to-end tests before camp starts

For additional documentation and API details, refer to:
- `supabase/migrations/001_camp_northland_schema.sql` — Database schema
- `expo-app/README.md` — Mobile app documentation
- Firmware documentation in the device-firmware directory
