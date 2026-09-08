-- AEROVAULT database foundation
-- This script only creates missing objects. It never drops, truncates, or alters tables.
-- It uses a new database so it does not modify the legacy `flight_management` database.

CREATE DATABASE IF NOT EXISTS aerovault
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aerovault;

CREATE TABLE IF NOT EXISTS passengers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  date_of_birth DATE NULL,
  passport_number VARCHAR(50) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_passengers_email (email),
  UNIQUE KEY uq_passengers_passport_number (passport_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS flights (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  flight_number VARCHAR(16) NOT NULL,
  departure_airport CHAR(3) NOT NULL,
  arrival_airport CHAR(3) NOT NULL,
  scheduled_departure DATETIME NOT NULL,
  scheduled_arrival DATETIME NOT NULL,
  status ENUM('scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  capacity SMALLINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_flights_flight_number_departure (flight_number, scheduled_departure),
  KEY idx_flights_scheduled_departure (scheduled_departure),
  KEY idx_flights_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reservations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_reference CHAR(8) NOT NULL,
  passenger_id BIGINT UNSIGNED NOT NULL,
  flight_id BIGINT UNSIGNED NOT NULL,
  seat_number VARCHAR(8) NULL,
  cabin_class ENUM('economy', 'premium_economy', 'business', 'first') NOT NULL DEFAULT 'economy',
  status ENUM('reserved', 'confirmed', 'checked_in', 'cancelled') NOT NULL DEFAULT 'reserved',
  fare_amount DECIMAL(10, 2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reservations_booking_reference (booking_reference),
  UNIQUE KEY uq_reservations_flight_seat (flight_id, seat_number),
  KEY idx_reservations_passenger (passenger_id),
  KEY idx_reservations_flight (flight_id),
  KEY idx_reservations_status (status),
  CONSTRAINT fk_reservations_passenger
    FOREIGN KEY (passenger_id) REFERENCES passengers (id),
  CONSTRAINT fk_reservations_flight
    FOREIGN KEY (flight_id) REFERENCES flights (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS services (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  service_code VARCHAR(32) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) NULL,
  service_type ENUM('baggage', 'meal', 'lounge', 'onboard', 'other') NOT NULL DEFAULT 'other',
  price DECIMAL(10, 2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_services_service_code (service_code),
  KEY idx_services_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reservation_services (
  reservation_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED NOT NULL,
  quantity SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (reservation_id, service_id),
  CONSTRAINT fk_reservation_services_reservation
    FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE CASCADE,
  CONSTRAINT fk_reservation_services_service
    FOREIGN KEY (service_id) REFERENCES services (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS flight_operations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  flight_id BIGINT UNSIGNED NOT NULL,
  terminal VARCHAR(10) NULL,
  gate VARCHAR(10) NULL,
  actual_departure DATETIME NULL,
  actual_arrival DATETIME NULL,
  delay_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  notes VARCHAR(500) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_flight_operations_flight (flight_id),
  CONSTRAINT fk_flight_operations_flight
    FOREIGN KEY (flight_id) REFERENCES flights (id) ON DELETE CASCADE
) ENGINE=InnoDB;
