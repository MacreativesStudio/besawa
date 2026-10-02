-- ====================================================================
-- BE SAWA — INITIAL RELATIONAL SCHEMA MIGRATION (001)
-- Target: PostgreSQL 14+ / Supabase
-- ====================================================================

CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(36) REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS therapists (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(100) NOT NULL,
    bio TEXT NOT NULL,
    years_experience INTEGER DEFAULT 0,
    languages TEXT[] NOT NULL DEFAULT ARRAY['English', 'Swahili'],
    areas_of_practice TEXT[] NOT NULL,
    profile_photo_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    is_active BOOLEAN DEFAULT TRUE,
    supports_online BOOLEAN DEFAULT TRUE,
    supports_in_person BOOLEAN DEFAULT TRUE,
    session_rate_override NUMERIC(10,2),
    internal_admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS therapist_credentials (
    id VARCHAR(36) PRIMARY KEY,
    therapist_id VARCHAR(36) NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    issuing_authority VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    issued_date DATE,
    expiry_date DATE,
    document_file_url TEXT NOT NULL,
    verification_notes TEXT,
    verified_by VARCHAR(36) REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS service_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) REFERENCES service_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 50,
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    delivery_mode VARCHAR(50) NOT NULL DEFAULT 'BOTH',
    is_active BOOLEAN DEFAULT TRUE,
    booking_instructions TEXT,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS therapist_services (
    therapist_id VARCHAR(36) REFERENCES therapists(id) ON DELETE CASCADE,
    service_id VARCHAR(36) REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (therapist_id, service_id)
);

CREATE TABLE IF NOT EXISTS packages (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    number_of_sessions INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    validity_days INTEGER NOT NULL DEFAULT 90,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS package_services (
    package_id VARCHAR(36) REFERENCES packages(id) ON DELETE CASCADE,
    service_id VARCHAR(36) REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (package_id, service_id)
);

CREATE TABLE IF NOT EXISTS availability_rules (
    id VARCHAR(36) PRIMARY KEY,
    therapist_id VARCHAR(36) REFERENCES therapists(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 50,
    break_duration_minutes INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS availability_exceptions (
    id VARCHAR(36) PRIMARY KEY,
    therapist_id VARCHAR(36) REFERENCES therapists(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    is_available BOOLEAN DEFAULT FALSE,
    start_time TIME,
    end_time TIME,
    reason TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(36) PRIMARY KEY,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    service_id VARCHAR(36) NOT NULL REFERENCES services(id),
    therapist_id VARCHAR(36) NOT NULL REFERENCES therapists(id),
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    delivery_mode VARCHAR(50) NOT NULL DEFAULT 'ONLINE',
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_PAYMENT',
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    provider VARCHAR(50) NOT NULL DEFAULT 'MPESA',
    provider_reference VARCHAR(255),
    internal_reference VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    phone_number VARCHAR(50),
    failure_reason TEXT,
    raw_metadata JSONB,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS settlements (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    therapist_id VARCHAR(36) NOT NULL REFERENCES therapists(id),
    gross_session_amount NUMERIC(10, 2) NOT NULL,
    platform_commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
    platform_commission_amount NUMERIC(10, 2) NOT NULL,
    therapist_payable_amount NUMERIC(10, 2) NOT NULL,
    adjustments NUMERIC(10, 2) DEFAULT 0.00,
    settlement_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    settlement_period VARCHAR(20) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    payout_reference VARCHAR(255),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faqs (
    id VARCHAR(36) PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(36) PRIMARY KEY,
    client_alias VARCHAR(100) NOT NULL,
    quote TEXT NOT NULL,
    session_category VARCHAR(100),
    is_verified BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
