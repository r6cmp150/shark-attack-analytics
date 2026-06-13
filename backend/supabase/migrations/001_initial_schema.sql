-- ============================================================
-- Shark Attack Analytics — Initial Schema
-- Run this in your Supabase project: SQL Editor > New Query
-- ============================================================

-- incidents
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_of_attack DATE,
  time_of_attack TIME,
  time_of_day VARCHAR(10) CHECK (time_of_day IN ('dawn', 'morning', 'afternoon', 'dusk', 'night', 'unknown')),
  country VARCHAR(100),
  region VARCHAR(200),
  location_name VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  shark_species VARCHAR(200),
  victim_activity VARCHAR(50) CHECK (victim_activity IN ('surfing', 'swimming', 'diving', 'fishing', 'boating', 'snorkeling', 'wading', 'other')),
  outcome VARCHAR(20) CHECK (outcome IN ('fatal', 'injured', 'unharmed', 'unknown')),
  injury_description TEXT,
  motivation VARCHAR(20) CHECK (motivation IN ('predatory', 'investigatory', 'territorial', 'warning', 'retaliatory')),
  motivation_confidence DECIMAL(3, 2) CHECK (motivation_confidence >= 0.0 AND motivation_confidence <= 1.0),
  water_temperature DECIMAL(5, 2),
  water_visibility VARCHAR(10) CHECK (water_visibility IN ('clear', 'murky', 'unknown')),
  water_depth DECIMAL(8, 2),
  tidal_state VARCHAR(10) CHECK (tidal_state IN ('incoming', 'outgoing', 'high', 'low', 'unknown')),
  moon_phase VARCHAR(50),
  weather_conditions TEXT,
  proximity_to_fishing BOOLEAN,
  proximity_to_seal_colony BOOLEAN,
  bait_fish_present BOOLEAN,
  source_url TEXT,
  source_language VARCHAR(10),
  source_publication VARCHAR(200),
  is_confirmed BOOLEAN DEFAULT false,
  is_estimated BOOLEAN DEFAULT false,
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  raw_article_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incidents_date ON incidents(date_of_attack DESC);
CREATE INDEX idx_incidents_country ON incidents(country);
CREATE INDEX idx_incidents_coords ON incidents(latitude, longitude);
CREATE INDEX idx_incidents_outcome ON incidents(outcome);
CREATE INDEX idx_incidents_motivation ON incidents(motivation);
CREATE INDEX idx_incidents_confirmed ON incidents(is_confirmed);

-- regions
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  polygon_coordinates JSONB,
  is_named_zone BOOLEAN DEFAULT false,
  zone_name VARCHAR(200),
  zone_description TEXT,
  reporting_quality VARCHAR(10) CHECK (reporting_quality IN ('high', 'medium', 'low', 'unknown')) DEFAULT 'unknown',
  coastline_km DECIMAL(10, 2),
  coastal_population INTEGER,
  annual_beach_visitors_estimate INTEGER,
  water_temperature_avg DECIMAL(5, 2),
  primary_shark_species TEXT[]
);

CREATE INDEX idx_regions_country ON regions(country);
CREATE INDEX idx_regions_coords ON regions(latitude, longitude);

-- risk_estimates
CREATE TABLE risk_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
  confirmed_attacks INTEGER DEFAULT 0,
  estimated_unreported_attacks INTEGER DEFAULT 0,
  estimation_confidence DECIMAL(3, 2) CHECK (estimation_confidence >= 0.0 AND estimation_confidence <= 1.0),
  estimation_method TEXT,
  attacks_per_million_swimmers DECIMAL(10, 4),
  risk_tier VARCHAR(10) CHECK (risk_tier IN ('high', 'elevated', 'moderate', 'low', 'unknown')) DEFAULT 'unknown',
  relative_risk_score DECIMAL(8, 4),
  comparison_radius_km INTEGER,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risk_estimates_region ON risk_estimates(region_id);

-- named_zones
CREATE TABLE named_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  country VARCHAR(100),
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  polygon_coordinates JSONB,
  known_species TEXT[],
  peak_season_start VARCHAR(20),
  peak_season_end VARCHAR(20),
  total_attacks INTEGER DEFAULT 0,
  fatal_attacks INTEGER DEFAULT 0,
  safety_notes TEXT
);

-- shark_migrations
CREATE TABLE shark_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species VARCHAR(200) NOT NULL,
  region VARCHAR(200),
  month INTEGER CHECK (month BETWEEN 1 AND 12),
  presence_likelihood VARCHAR(10) CHECK (presence_likelihood IN ('high', 'medium', 'low')),
  feeding_activity VARCHAR(10) CHECK (feeding_activity IN ('high', 'medium', 'low')),
  notes TEXT
);

CREATE INDEX idx_shark_migrations_species ON shark_migrations(species);
CREATE INDEX idx_shark_migrations_month ON shark_migrations(month);
CREATE INDEX idx_shark_migrations_region ON shark_migrations(region);

-- auto-update updated_at on incidents
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
