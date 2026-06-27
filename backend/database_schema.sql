-- GS LinkOps AI PostgreSQL Schema
-- Complete platform schema draft. No seed data is included.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    country TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    timezone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS satellites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    satellite_name TEXT NOT NULL,
    satellite_code TEXT,
    norad_id TEXT,
    tle_line_1 TEXT,
    tle_line_2 TEXT,
    band TEXT,
    downlink_frequency TEXT,
    polarization TEXT,
    modulation TEXT,
    coding TEXT,
    data_rate_mbps NUMERIC,
    frame_format TEXT,
    sensor_type TEXT,
    channel TEXT,
    authorization_status TEXT DEFAULT 'Draft',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ground_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    station_name TEXT NOT NULL,
    station_code TEXT,
    country_city TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    altitude_m NUMERIC,
    antenna TEXT,
    supported_band TEXT,
    frequency_range TEXT,
    polarization TEXT,
    minimum_elevation_deg NUMERIC DEFAULT 10,
    demodulator TEXT,
    max_data_rate_mbps NUMERIC,
    transfer_method TEXT,
    authorization_status TEXT DEFAULT 'Draft',
    commercial_status TEXT DEFAULT 'Draft',
    cost_per_pass_usd NUMERIC,
    cost_per_minute_usd NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pass_windows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    satellite_id UUID REFERENCES satellites(id),
    station_id UUID REFERENCES ground_stations(id),
    start_utc TIMESTAMPTZ,
    end_utc TIMESTAMPTZ,
    duration_min NUMERIC,
    max_elevation_deg NUMERIC,
    start_azimuth_deg NUMERIC,
    end_azimuth_deg NUMERIC,
    score INTEGER,
    match_status TEXT,
    reason TEXT,
    orbit_mode TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_code TEXT UNIQUE NOT NULL,
    satellite_id UUID REFERENCES satellites(id),
    station_id UUID REFERENCES ground_stations(id),
    pass_window_id UUID REFERENCES pass_windows(id),
    mission_type TEXT DEFAULT 'Authorized Downlink',
    status TEXT DEFAULT 'New Request',
    scheduled_start_utc TIMESTAMPTZ,
    scheduled_end_utc TIMESTAMPTZ,
    objective TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mission_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id),
    old_status TEXT,
    new_status TEXT,
    changed_by TEXT,
    changed_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS station_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id),
    satellite_id UUID REFERENCES satellites(id),
    station_id UUID REFERENCES ground_stations(id),
    frequency TEXT,
    if_frequency TEXT,
    polarization TEXT,
    modulation TEXT,
    coding TEXT,
    data_rate_mbps NUMERIC,
    frame_format TEXT,
    sync_word TEXT,
    rs_status TEXT,
    ldpc_status TEXT,
    crc_status TEXT,
    ccsds_status TEXT,
    configuration_version TEXT,
    manufacturer_confirmed BOOLEAN DEFAULT FALSE,
    station_confirmed BOOLEAN DEFAULT FALSE,
    attachment_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reception_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id),
    actual_start_utc TIMESTAMPTZ,
    actual_end_utc TIMESTAMPTZ,
    antenna_tracking_status TEXT,
    signal_detected BOOLEAN DEFAULT FALSE,
    carrier_lock BOOLEAN DEFAULT FALSE,
    demod_lock BOOLEAN DEFAULT FALSE,
    frame_sync BOOLEAN DEFAULT FALSE,
    data_captured BOOLEAN DEFAULT FALSE,
    peak_snr TEXT,
    cn0 TEXT,
    received_size TEXT,
    station_conclusion TEXT,
    issue_description TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfer_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id),
    source_station_id UUID REFERENCES ground_stations(id),
    destination_organization_id UUID REFERENCES organizations(id),
    transfer_method TEXT,
    source_path TEXT,
    destination_path TEXT,
    file_count INTEGER,
    file_manifest TEXT,
    total_size TEXT,
    checksum_type TEXT DEFAULT 'SHA256',
    checksum_value TEXT,
    transfer_start_time TIMESTAMPTZ,
    transfer_end_time TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    transfer_status TEXT DEFAULT 'Waiting for File',
    confirmation_person TEXT,
    confirmation_time TIMESTAMPTZ,
    retention_hours INTEGER DEFAULT 72,
    auto_delete_status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id),
    customer_organization_id UUID REFERENCES organizations(id),
    supplier_organization_id UUID REFERENCES organizations(id),
    billing_mode TEXT,
    billing_trigger TEXT,
    scheduled_duration_min NUMERIC,
    actual_duration_min NUMERIC,
    billable_duration_min NUMERIC,
    station_cost_usd NUMERIC DEFAULT 0,
    client_price_usd NUMERIC DEFAULT 0,
    gs_service_fee_usd NUMERIC DEFAULT 0,
    gross_margin_usd NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    billing_status TEXT DEFAULT 'Hold',
    invoice_status TEXT DEFAULT 'Not Issued',
    client_payment_status TEXT DEFAULT 'Unpaid',
    supplier_settlement_status TEXT DEFAULT 'Unsettled',
    billing_decision_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id),
    report_type TEXT,
    title TEXT,
    body TEXT,
    generated_by TEXT DEFAULT 'GS LinkOps AI',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id),
    alert_type TEXT,
    severity TEXT,
    message TEXT,
    recommended_action TEXT,
    status TEXT DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS users_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor TEXT,
    action TEXT NOT NULL,
    object_type TEXT,
    object_id TEXT,
    detail JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);
