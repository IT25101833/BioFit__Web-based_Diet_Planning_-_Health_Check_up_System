CREATE TABLE wellness_programmes (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(80),
    description VARCHAR(2000),
    status VARCHAR(40) NOT NULL DEFAULT 'Active',
    start_date DATE,
    end_date DATE,
    duration_weeks INT,
    capacity INT,
    enrolled INT DEFAULT 0,
    coach_name VARCHAR(120),
    nutrition_name VARCHAR(120),
    medical_name VARCHAR(120),
    goals VARCHAR(1000),
    included_services VARCHAR(1000),
    notes VARCHAR(2000),
    progress INT DEFAULT 0,
    last_updated DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE programme_enrolments (
    id VARCHAR(40) PRIMARY KEY,
    programme_id VARCHAR(40) NOT NULL,
    client_user_id BIGINT,
    client_id VARCHAR(40),
    client_name VARCHAR(120) NOT NULL,
    enrolled_date DATE,
    status VARCHAR(40) NOT NULL DEFAULT 'Active',
    coach_name VARCHAR(120),
    nutrition_name VARCHAR(120),
    progress INT DEFAULT 0,
    period_label VARCHAR(80),
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_enrol_programme FOREIGN KEY (programme_id) REFERENCES wellness_programmes (id)
);

CREATE TABLE appointments (
    id VARCHAR(40) PRIMARY KEY,
    client_user_id BIGINT,
    client_id VARCHAR(40),
    client_name VARCHAR(120),
    service_type VARCHAR(120) NOT NULL,
    professional VARCHAR(120),
    professional_role VARCHAR(80),
    programme VARCHAR(200),
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(40) NOT NULL,
    duration VARCHAR(40),
    status VARCHAR(40) NOT NULL DEFAULT 'Upcoming',
    booking_reference VARCHAR(80),
    notes VARCHAR(2000),
    location VARCHAR(200),
    audience VARCHAR(40) NOT NULL DEFAULT 'CLIENT',
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercises (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(80),
    difficulty VARCHAR(40),
    target_area VARCHAR(120),
    equipment VARCHAR(200),
    instructions VARCHAR(MAX),
    safety_notes VARCHAR(2000),
    sets_label VARCHAR(40),
    reps_label VARCHAR(40),
    duration_label VARCHAR(40),
    rest_label VARCHAR(40),
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workout_plans (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    client_user_id BIGINT,
    client_id VARCHAR(40),
    client_name VARCHAR(120),
    programme VARCHAR(200),
    goal VARCHAR(500),
    difficulty VARCHAR(40),
    start_date DATE,
    end_date DATE,
    sessions_per_week INT,
    session_duration VARCHAR(40),
    description VARCHAR(2000),
    current_week VARCHAR(80),
    total_weeks INT,
    progress INT DEFAULT 0,
    status VARCHAR(40) NOT NULL DEFAULT 'Active',
    plan_json VARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meal_plans (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    client_user_id BIGINT,
    client_id VARCHAR(40),
    client_name VARCHAR(120),
    programme VARCHAR(200),
    goal VARCHAR(500),
    description VARCHAR(2000),
    start_date DATE,
    end_date DATE,
    current_week VARCHAR(80),
    status VARCHAR(40) NOT NULL DEFAULT 'Active',
    progress INT DEFAULT 0,
    version_no INT DEFAULT 1,
    plan_json VARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dietary_restrictions (
    id VARCHAR(40) PRIMARY KEY,
    client_user_id BIGINT,
    client_id VARCHAR(40),
    client_name VARCHAR(120) NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(80) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'Active',
    date_recorded DATE,
    last_reviewed DATE,
    meal_plan VARCHAR(200),
    notes VARCHAR(2000),
    meal_plan_impact VARCHAR(2000),
    source VARCHAR(80),
    is_protected BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_tickets (
    id VARCHAR(40) PRIMARY KEY,
    client_user_id BIGINT,
    client_id VARCHAR(40),
    client_name VARCHAR(120),
    subject VARCHAR(300) NOT NULL,
    category VARCHAR(80),
    priority VARCHAR(40) DEFAULT 'Medium',
    status VARCHAR(40) NOT NULL DEFAULT 'Open',
    assigned_to VARCHAR(120),
    related_service VARCHAR(200),
    messages_json VARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id VARCHAR(40) PRIMARY KEY,
    user_id BIGINT,
    audience VARCHAR(40) NOT NULL,
    type VARCHAR(80),
    title VARCHAR(300) NOT NULL,
    body VARCHAR(2000),
    link VARCHAR(300),
    is_read BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
    id VARCHAR(40) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_name VARCHAR(120) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'Active',
    price_label VARCHAR(40),
    renews_on DATE,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id VARCHAR(40) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'LKR',
    status VARCHAR(40) NOT NULL,
    method_label VARCHAR(80),
    description VARCHAR(300),
    paid_at DATETIME2,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff_schedules (
    id VARCHAR(40) PRIMARY KEY,
    schedule_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    staff_id VARCHAR(40),
    staff_name VARCHAR(120) NOT NULL,
    role_label VARCHAR(80),
    service_label VARCHAR(120),
    client_name VARCHAR(120),
    programme VARCHAR(200),
    status VARCHAR(40) NOT NULL DEFAULT 'Scheduled',
    notes VARCHAR(1000),
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_client ON appointments (client_user_id);
CREATE INDEX idx_appointments_date ON appointments (appointment_date);
CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_audience ON notifications (audience);
CREATE INDEX idx_tickets_status ON support_tickets (status);
CREATE INDEX idx_meal_plans_client ON meal_plans (client_user_id);
CREATE INDEX idx_workout_plans_client ON workout_plans (client_user_id);
