-- ============================================================
-- Kinneret Shield - Camp Northland Database Schema
-- Supabase PostgreSQL Migration
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUMS ────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('management');
CREATE TYPE device_status AS ENUM ('online', 'offline', 'error');
CREATE TYPE attendance_status AS ENUM ('checked_in', 'checked_out', 'auto_checked_out');
CREATE TYPE alert_type AS ENUM ('unauthorized_access', 'device_offline', 'capacity_exceeded', 'unknown_card', 'emergency');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE emergency_event_type AS ENUM ('lockdown', 'evacuation', 'drill', 'all_clear');
CREATE TYPE location_type AS ENUM ('waterfront', 'cabin', 'dining_hall', 'sports_field', 'arts_crafts', 'main_office', 'amphitheatre', 'canteen', 'other');

-- ─── USERS (Management Staff) ─────────────────────────────

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'management',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);

-- ─── CAMPERS ──────────────────────────────────────────────

CREATE TABLE campers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  cabin TEXT,
  age_group TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_notes TEXT,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campers_cabin ON campers(cabin);
CREATE INDEX idx_campers_active ON campers(is_active);

-- ─── NFC WRISTBANDS ───────────────────────────────────────

CREATE TABLE nfc_wristbands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_uid TEXT UNIQUE NOT NULL,
  camper_id UUID REFERENCES campers(id) ON DELETE SET NULL,
  label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nfc_wristbands_uid ON nfc_wristbands(card_uid);
CREATE INDEX idx_nfc_wristbands_camper ON nfc_wristbands(camper_id);

-- ─── LOCATIONS (Camp Areas) ───────────────────────────────

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  floor INTEGER NOT NULL DEFAULT 1,
  location_code TEXT UNIQUE NOT NULL,
  type location_type NOT NULL DEFAULT 'other',
  capacity INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_code ON locations(location_code);

-- ─── DEVICES (HermitX NFC Readers) ───────────────────────

CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  serial_number TEXT UNIQUE NOT NULL,
  firmware_version TEXT NOT NULL DEFAULT '1.0.0',
  status device_status NOT NULL DEFAULT 'offline',
  last_heartbeat TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  api_key TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_devices_location ON devices(location_id);
CREATE INDEX idx_devices_serial ON devices(serial_number);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_api_key ON devices(api_key);

-- ─── ATTENDANCE RECORDS ───────────────────────────────────

CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camper_id UUID REFERENCES campers(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  nfc_card_uid TEXT NOT NULL,
  status attendance_status NOT NULL DEFAULT 'checked_in',
  check_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attendance_camper ON attendance_records(camper_id);
CREATE INDEX idx_attendance_location ON attendance_records(location_id);
CREATE INDEX idx_attendance_device ON attendance_records(device_id);
CREATE INDEX idx_attendance_status ON attendance_records(status);
CREATE INDEX idx_attendance_check_in ON attendance_records(check_in_at DESC);
-- idx_attendance_check_in above covers date queries

-- ─── ALERTS ───────────────────────────────────────────────

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  type alert_type NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'medium',
  message TEXT NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_resolved ON alerts(is_resolved);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- ─── EMERGENCY EVENTS ─────────────────────────────────────

CREATE TABLE emergency_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type emergency_event_type NOT NULL,
  message TEXT NOT NULL,
  initiated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ended_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_emergency_active ON emergency_events(is_active);

-- ─── INVITE CODES ─────────────────────────────────────────

CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(4), 'hex'),
  role user_role NOT NULL DEFAULT 'management',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  used_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_used ON invite_codes(is_used);

-- ─── DAILY REPORTS ────────────────────────────────────────

CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_check_ins INTEGER NOT NULL DEFAULT 0,
  total_check_outs INTEGER NOT NULL DEFAULT 0,
  unique_campers INTEGER NOT NULL DEFAULT 0,
  peak_occupancy INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(location_id, date)
);

CREATE INDEX idx_daily_reports_date ON daily_reports(date DESC);

-- ─── DEVICE LOGS ──────────────────────────────────────────

CREATE TABLE device_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_device_logs_device ON device_logs(device_id);
CREATE INDEX idx_device_logs_created ON device_logs(created_at DESC);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_campers_updated_at BEFORE UPDATE ON campers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_nfc_wristbands_updated_at BEFORE UPDATE ON nfc_wristbands FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_wristbands ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_logs ENABLE ROW LEVEL SECURITY;

-- Management users can read/write everything
CREATE POLICY "Management full access to users" ON users FOR ALL USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE role = 'management' AND is_active = true)
);

CREATE POLICY "Management full access to campers" ON campers FOR ALL USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE role = 'management' AND is_active = true)
);

CREATE POLICY "Management full access to nfc_wristbands" ON nfc_wristbands FOR ALL USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE role = 'management' AND is_active = true)
);

CREATE POLICY "Management full access to locations" ON locations FOR ALL USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE role = 'management' AND is_active = true)
);

CREATE POLICY "Management full access to devices" ON devices FOR ALL USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE role = 'management' AND is_active = true)
);

CREATE POLICY "Management full access to attendance" ON attendance_records FOR ALL USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE role = 'management' AND is_active = true)
);

CREATE POLICY "Management full access to alerts" ON alerts FOR ALL USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE role = 'management' AND is_active = true)
);

CREATE POLICY "Management full access to emergencies" ON emergency_events FOR ALL USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE role = 'management' AND is_active = true)
);

CREATE POLICY "Management full access to invites" ON invite_codes FOR ALL USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE role = 'management' AND is_active = true)
);

CREATE POLICY "Management full access to reports" ON daily_reports FOR ALL USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE role = 'management' AND is_active = true)
);

CREATE POLICY "Management full access to device_logs" ON device_logs FOR ALL USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE role = 'management' AND is_active = true)
);

-- Service role (for Edge Functions / device API) bypasses RLS automatically

-- ─── SEED DATA: Default Camp Locations ────────────────────

INSERT INTO locations (name, area, floor, location_code, type, capacity) VALUES
  ('Waterfront', 'Lake Zone', 1, 'WF-01', 'waterfront', 40),
  ('Cabin 1', 'Cabin Row', 1, 'CB-01', 'cabin', 12),
  ('Cabin 2', 'Cabin Row', 1, 'CB-02', 'cabin', 12),
  ('Cabin 3', 'Cabin Row', 1, 'CB-03', 'cabin', 12),
  ('Cabin 4', 'Cabin Row', 1, 'CB-04', 'cabin', 12),
  ('Cabin 5', 'Cabin Row', 1, 'CB-05', 'cabin', 12),
  ('Cabin 6', 'Cabin Row', 1, 'CB-06', 'cabin', 12),
  ('Cabin 7', 'Cabin Row', 1, 'CB-07', 'cabin', 12),
  ('Cabin 8', 'Cabin Row', 1, 'CB-08', 'cabin', 12),
  ('Dining Hall', 'Central', 1, 'DH-01', 'dining_hall', 200),
  ('Sports Field', 'Athletics Zone', 1, 'SF-01', 'sports_field', 60),
  ('Arts & Crafts', 'Creative Zone', 1, 'AC-01', 'arts_crafts', 30),
  ('Main Office', 'Administration', 1, 'MO-01', 'main_office', 10),
  ('Amphitheatre', 'Central', 1, 'AT-01', 'amphitheatre', 150),
  ('Canteen', 'Central', 1, 'CN-01', 'canteen', 50);

-- ─── HELPER FUNCTIONS ─────────────────────────────────────

-- Get current occupancy for a location
CREATE OR REPLACE FUNCTION get_location_occupancy(loc_id UUID)
RETURNS TABLE(current_occupancy BIGINT, capacity INTEGER, occupancy_percentage NUMERIC, is_at_capacity BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(ar.id) AS current_occupancy,
    l.capacity,
    ROUND((COUNT(ar.id)::NUMERIC / NULLIF(l.capacity, 0)) * 100, 1) AS occupancy_percentage,
    COUNT(ar.id) >= l.capacity AS is_at_capacity
  FROM locations l
  LEFT JOIN attendance_records ar ON ar.location_id = l.id AND ar.status = 'checked_in'
  WHERE l.id = loc_id
  GROUP BY l.id, l.capacity;
END;
$$ LANGUAGE plpgsql;

-- Get all location occupancies
CREATE OR REPLACE FUNCTION get_all_occupancies()
RETURNS TABLE(
  location_id UUID,
  location_name TEXT,
  current_occupancy BIGINT,
  capacity INTEGER,
  occupancy_percentage NUMERIC,
  is_at_capacity BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id AS location_id,
    l.name AS location_name,
    COUNT(ar.id) AS current_occupancy,
    l.capacity,
    ROUND((COUNT(ar.id)::NUMERIC / NULLIF(l.capacity, 0)) * 100, 1) AS occupancy_percentage,
    COUNT(ar.id) >= l.capacity AS is_at_capacity
  FROM locations l
  LEFT JOIN attendance_records ar ON ar.location_id = l.id AND ar.status = 'checked_in'
  GROUP BY l.id, l.name, l.capacity
  ORDER BY l.name;
END;
$$ LANGUAGE plpgsql;

-- Process NFC tap (check in or check out)
CREATE OR REPLACE FUNCTION process_nfc_tap(
  p_device_id UUID,
  p_card_uid TEXT,
  p_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  v_device devices%ROWTYPE;
  v_wristband nfc_wristbands%ROWTYPE;
  v_camper campers%ROWTYPE;
  v_existing attendance_records%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Look up device
  SELECT * INTO v_device FROM devices WHERE id = p_device_id AND status != 'error';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'device_not_found', 'message', 'Device not found or in error state');
  END IF;

  -- Look up wristband
  SELECT * INTO v_wristband FROM nfc_wristbands WHERE card_uid = p_card_uid AND is_active = true;
  IF NOT FOUND THEN
    -- Create alert for unknown card
    INSERT INTO alerts (device_id, location_id, type, severity, message)
    VALUES (p_device_id, v_device.location_id, 'unknown_card', 'medium',
      'Unknown NFC wristband tapped: ' || p_card_uid);
    RETURN jsonb_build_object('success', false, 'error', 'unknown_card', 'message', 'Wristband not registered');
  END IF;

  -- Look up camper
  IF v_wristband.camper_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unassigned_wristband', 'message', 'Wristband not assigned to a camper');
  END IF;

  SELECT * INTO v_camper FROM campers WHERE id = v_wristband.camper_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'camper_inactive', 'message', 'Camper account is inactive');
  END IF;

  -- Check if camper is already checked in at THIS location
  SELECT * INTO v_existing FROM attendance_records
  WHERE camper_id = v_camper.id
    AND location_id = v_device.location_id
    AND status = 'checked_in'
  ORDER BY check_in_at DESC
  LIMIT 1;

  IF FOUND THEN
    -- CHECK OUT: camper is tapping out of this location
    UPDATE attendance_records SET
      status = 'checked_out',
      check_out_at = p_timestamp
    WHERE id = v_existing.id;

    v_result := jsonb_build_object(
      'success', true,
      'action', 'check_out',
      'camper_name', v_camper.first_name || ' ' || v_camper.last_name,
      'camper_id', v_camper.id,
      'location_name', (SELECT name FROM locations WHERE id = v_device.location_id),
      'record_id', v_existing.id
    );
  ELSE
    -- Auto-checkout from any OTHER location first
    UPDATE attendance_records SET
      status = 'auto_checked_out',
      check_out_at = p_timestamp
    WHERE camper_id = v_camper.id
      AND status = 'checked_in'
      AND location_id != v_device.location_id;

    -- CHECK IN: create new attendance record
    INSERT INTO attendance_records (camper_id, location_id, device_id, nfc_card_uid, status, check_in_at)
    VALUES (v_camper.id, v_device.location_id, p_device_id, p_card_uid, 'checked_in', p_timestamp)
    RETURNING id INTO v_existing;

    -- Check capacity
    PERFORM 1 FROM get_location_occupancy(v_device.location_id) WHERE is_at_capacity = true;
    IF FOUND THEN
      INSERT INTO alerts (device_id, location_id, type, severity, message)
      VALUES (p_device_id, v_device.location_id, 'capacity_exceeded', 'high',
        (SELECT name FROM locations WHERE id = v_device.location_id) || ' has reached capacity');
    END IF;

    v_result := jsonb_build_object(
      'success', true,
      'action', 'check_in',
      'camper_name', v_camper.first_name || ' ' || v_camper.last_name,
      'camper_id', v_camper.id,
      'location_name', (SELECT name FROM locations WHERE id = v_device.location_id),
      'record_id', v_existing.id
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Auto-checkout: check out all campers who have been checked in for more than X hours
CREATE OR REPLACE FUNCTION auto_checkout(p_hours_threshold INTEGER DEFAULT 8)
RETURNS JSONB AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE attendance_records SET
    status = 'auto_checked_out',
    check_out_at = NOW()
  WHERE status = 'checked_in'
    AND check_in_at < NOW() - (p_hours_threshold || ' hours')::INTERVAL;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'auto_checked_out', v_count,
    'threshold_hours', p_hours_threshold
  );
END;
$$ LANGUAGE plpgsql;

-- Generate daily reports for all locations for a given date
CREATE OR REPLACE FUNCTION generate_daily_reports(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
DECLARE
  v_location RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_location IN SELECT id, name FROM locations LOOP
    INSERT INTO daily_reports (location_id, date, total_check_ins, total_check_outs, unique_campers, peak_occupancy)
    SELECT
      v_location.id,
      p_date,
      COUNT(*) FILTER (WHERE status IN ('checked_in', 'checked_out', 'auto_checked_out')),
      COUNT(*) FILTER (WHERE status IN ('checked_out', 'auto_checked_out')),
      COUNT(DISTINCT camper_id),
      0  -- peak_occupancy would need time-series analysis
    FROM attendance_records
    WHERE location_id = v_location.id
      AND check_in_at::DATE = p_date
    ON CONFLICT (location_id, date) DO UPDATE SET
      total_check_ins = EXCLUDED.total_check_ins,
      total_check_outs = EXCLUDED.total_check_outs,
      unique_campers = EXCLUDED.unique_campers,
      generated_at = NOW();

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'locations_processed', v_count,
    'date', p_date
  );
END;
$$ LANGUAGE plpgsql;
