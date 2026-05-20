-- ============ AUTH SCHEMA ============

CREATE TABLE auth.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  schema_name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL,
  tenant_id UUID REFERENCES auth.tenants(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============ STORE1 SCHEMA ============

CREATE TABLE store1.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  store_location VARCHAR(200) NOT NULL,
  incident_type VARCHAR(50) NOT NULL,
  suspect_details TEXT NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE store1.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES store1.incidents(id),
  tenant_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE store1.incident_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES store1.incidents(id),
  previous_status VARCHAR(30),
  new_status VARCHAR(30) NOT NULL,
  changed_by VARCHAR(100) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW()
);

-- ============ STORE2 SCHEMA ============

CREATE TABLE store2.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  store_location VARCHAR(200) NOT NULL,
  incident_type VARCHAR(50) NOT NULL,
  suspect_details TEXT NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE store2.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES store2.incidents(id),
  tenant_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE store2.incident_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES store2.incidents(id),
  previous_status VARCHAR(30),
  new_status VARCHAR(30) NOT NULL,
  changed_by VARCHAR(100) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW()
);

-- ============ VERIFICATION SCHEMA ============

CREATE TABLE verification.verification_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL UNIQUE,
  tenant_id UUID NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending_ai',
  ai_confidence_score DECIMAL(3,2),
  ai_validated_at TIMESTAMP,
  analyst_id UUID,
  decision VARCHAR(20),
  notes TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE verification.verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES verification.verification_records(id),
  action VARCHAR(50) NOT NULL,
  actor VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
