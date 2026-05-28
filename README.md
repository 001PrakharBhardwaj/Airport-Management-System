# Airport Management System (Python + SQL)

This project is a complete airport management system using **Python** and **SQLite (SQL)**, covering:

- Flight Management
- Passenger Management
- Ticket Booking System
- Check-In System
- Baggage Management
- Staff Management
- In-ticket meal booking (Veg / Non-Veg menu)

## Tech Stack

- Python 3.10+
- SQLite (built-in with Python)

## Files

- `schema.sql` -> all SQL tables
- `app.py` -> service logic + demo flow
- `airport_management.db` -> generated database after first run

## Run

```bash
python app.py
```

This will:
1. Create all tables
2. Seed lookup data (statuses, roles, meal menu)
3. Add demo aircraft, gate, flight, seats, passenger
4. Book ticket with seat + veg meal
5. Perform online check-in and boarding pass generation
6. Check in baggage and track status

## Core SQL Tables Included

### Flight Management
- `Flights`
- `Aircrafts`
- `Gates`
- `Flight_Status`

### Passenger Management
- `Passengers`
- `Passports`
- `Passenger_History`

### Ticket Booking
- `Tickets`
- `Seats`
- `Payments`
- `Booking_History`
- `Meal_Menu` (for veg/non-veg food booking during ticket booking)

### Check-In
- `Checkins`
- `Boarding_Pass`
- `Baggage`

### Baggage Management
- `Baggage`
- `Baggage_Tracking`

### Staff Management
- `Staff`
- `Roles`
- `Attendance`
- `Salaries`

## Implemented Features

### Flight Management
- Add/Edit/Delete flights
- Flight scheduling
- Arrival/departure actual-time updates
- Flight status handling: On Time, Delayed, Boarding, Cancelled
- Gate assignment
- Aircraft assignment

### Passenger Management
- Passenger registration
- Passport verification
- Passenger profile retrieval
- Search by name/passport/ticket
- Travel history

### Ticket Booking System
- Ticket booking and cancellation
- Seat selection and locking
- Ticket generation
- Fare calculation by class
- Dynamic pricing by seat availability
- One-way and round-trip booking support
- Meal booking during booking (Veg/Non-Veg menu)

### Check-In System
- Online/counter check-in
- Boarding pass generation
- Boarding queue number
- Boarding group generation
- Seat upgrade field support

### Baggage Management
- Baggage check-in with weight validation
- Baggage tracking updates
- Lost baggage reporting
- QR/barcode-style tag simulation

### Staff Management
- Add staff by role
- Duty scheduling by flight
- Attendance tracking
- Salary records

## Customize Further

You can extend this project with:
- Flask/FastAPI REST API
- Admin dashboard UI
- Authentication/authorization
- Refund workflow on cancellation
- Email/SMS alerts
