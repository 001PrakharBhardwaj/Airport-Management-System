PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Flight_Status (
    status_id INTEGER PRIMARY KEY AUTOINCREMENT,
    status_name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Aircrafts (
    aircraft_id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    registration_no TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Gates (
    gate_id INTEGER PRIMARY KEY AUTOINCREMENT,
    gate_code TEXT UNIQUE NOT NULL,
    terminal TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Flights (
    flight_id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_no TEXT UNIQUE NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    scheduled_departure TEXT NOT NULL,
    scheduled_arrival TEXT NOT NULL,
    actual_departure TEXT,
    actual_arrival TEXT,
    status_id INTEGER NOT NULL,
    gate_id INTEGER,
    aircraft_id INTEGER,
    FOREIGN KEY (status_id) REFERENCES Flight_Status(status_id),
    FOREIGN KEY (gate_id) REFERENCES Gates(gate_id),
    FOREIGN KEY (aircraft_id) REFERENCES Aircrafts(aircraft_id)
);

CREATE TABLE IF NOT EXISTS Passengers (
    passenger_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    date_of_birth TEXT
);

CREATE TABLE IF NOT EXISTS Passports (
    passport_id INTEGER PRIMARY KEY AUTOINCREMENT,
    passenger_id INTEGER UNIQUE NOT NULL,
    passport_number TEXT UNIQUE NOT NULL,
    country TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    is_verified INTEGER NOT NULL DEFAULT 0 CHECK (is_verified IN (0, 1)),
    FOREIGN KEY (passenger_id) REFERENCES Passengers(passenger_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Passenger_History (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    passenger_id INTEGER NOT NULL,
    flight_id INTEGER NOT NULL,
    ticket_id INTEGER,
    travel_date TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (passenger_id) REFERENCES Passengers(passenger_id),
    FOREIGN KEY (flight_id) REFERENCES Flights(flight_id)
);

CREATE TABLE IF NOT EXISTS Seats (
    seat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_id INTEGER NOT NULL,
    seat_number TEXT NOT NULL,
    class_type TEXT NOT NULL CHECK (class_type IN ('Economy', 'Business', 'First Class')),
    is_available INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0, 1)),
    UNIQUE (flight_id, seat_number),
    FOREIGN KEY (flight_id) REFERENCES Flights(flight_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Meal_Menu (
    meal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_name TEXT NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('Veg', 'Non-Veg')),
    meal_price REAL NOT NULL CHECK (meal_price >= 0),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS Tickets (
    ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_ref TEXT UNIQUE NOT NULL,
    passenger_id INTEGER NOT NULL,
    flight_id INTEGER NOT NULL,
    seat_id INTEGER,
    class_type TEXT NOT NULL CHECK (class_type IN ('Economy', 'Business', 'First Class')),
    base_fare REAL NOT NULL CHECK (base_fare >= 0),
    dynamic_multiplier REAL NOT NULL DEFAULT 1.0 CHECK (dynamic_multiplier > 0),
    total_fare REAL NOT NULL CHECK (total_fare >= 0),
    booking_type TEXT NOT NULL CHECK (booking_type IN ('One Way', 'Round Trip')),
    return_flight_id INTEGER,
    meal_id INTEGER,
    booking_status TEXT NOT NULL DEFAULT 'Booked' CHECK (booking_status IN ('Booked', 'Cancelled', 'Checked-In')),
    booked_at TEXT NOT NULL,
    FOREIGN KEY (passenger_id) REFERENCES Passengers(passenger_id),
    FOREIGN KEY (flight_id) REFERENCES Flights(flight_id),
    FOREIGN KEY (seat_id) REFERENCES Seats(seat_id),
    FOREIGN KEY (return_flight_id) REFERENCES Flights(flight_id),
    FOREIGN KEY (meal_id) REFERENCES Meal_Menu(meal_id)
);

CREATE TABLE IF NOT EXISTS Payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('Pending', 'Success', 'Failed')),
    paid_at TEXT,
    FOREIGN KEY (ticket_id) REFERENCES Tickets(ticket_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Booking_History (
    booking_history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    action_time TEXT NOT NULL,
    remarks TEXT,
    FOREIGN KEY (ticket_id) REFERENCES Tickets(ticket_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Checkins (
    checkin_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER UNIQUE NOT NULL,
    checkin_mode TEXT NOT NULL CHECK (checkin_mode IN ('Online', 'Counter')),
    queue_number INTEGER,
    upgraded_class TEXT CHECK (upgraded_class IN ('Economy', 'Business', 'First Class')),
    checked_in_at TEXT NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES Tickets(ticket_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Boarding_Pass (
    boarding_pass_id INTEGER PRIMARY KEY AUTOINCREMENT,
    checkin_id INTEGER UNIQUE NOT NULL,
    boarding_code TEXT UNIQUE NOT NULL,
    gate_id INTEGER,
    boarding_group TEXT,
    issued_at TEXT NOT NULL,
    FOREIGN KEY (checkin_id) REFERENCES Checkins(checkin_id) ON DELETE CASCADE,
    FOREIGN KEY (gate_id) REFERENCES Gates(gate_id)
);

CREATE TABLE IF NOT EXISTS Baggage (
    baggage_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    weight_kg REAL NOT NULL CHECK (weight_kg >= 0),
    baggage_tag TEXT UNIQUE NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Checked-In', 'In Transit', 'Loaded', 'Arrived', 'Lost')),
    is_lost_reported INTEGER NOT NULL DEFAULT 0 CHECK (is_lost_reported IN (0, 1)),
    checked_in_at TEXT NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES Tickets(ticket_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Baggage_Tracking (
    tracking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    baggage_id INTEGER NOT NULL,
    location TEXT NOT NULL,
    status_update TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (baggage_id) REFERENCES Baggage(baggage_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Roles (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Staff (
    staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_flight_id INTEGER,
    shift_start TEXT,
    shift_end TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    FOREIGN KEY (role_id) REFERENCES Roles(role_id),
    FOREIGN KEY (assigned_flight_id) REFERENCES Flights(flight_id)
);

CREATE TABLE IF NOT EXISTS Attendance (
    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    attendance_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Leave')),
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Salaries (
    salary_id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    pay_month TEXT NOT NULL,
    base_salary REAL NOT NULL CHECK (base_salary >= 0),
    bonus REAL NOT NULL DEFAULT 0 CHECK (bonus >= 0),
    deductions REAL NOT NULL DEFAULT 0 CHECK (deductions >= 0),
    net_salary REAL NOT NULL CHECK (net_salary >= 0),
    paid_on TEXT,
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id) ON DELETE CASCADE
);
