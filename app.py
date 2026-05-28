import sqlite3
import uuid
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable


DB_PATH = Path("airport_management.db")
SCHEMA_PATH = Path("schema.sql")


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


@dataclass
class FareBreakdown:
    base_fare: float
    dynamic_multiplier: float
    meal_price: float
    total_fare: float


class AirportManagementSystem:
    def __init__(self, db_path: Path = DB_PATH, schema_path: Path = SCHEMA_PATH) -> None:
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self._initialize_database(schema_path)

    def _initialize_database(self, schema_path: Path) -> None:
        if not schema_path.exists():
            raise FileNotFoundError(f"Missing schema file: {schema_path}")

        schema_sql = schema_path.read_text(encoding="utf-8")
        self.conn.executescript(schema_sql)
        self._seed_lookups()
        self.conn.commit()

    def _seed_lookups(self) -> None:
        statuses = ["On Time", "Delayed", "Boarding", "Cancelled"]
        roles = ["Pilot", "Cabin Crew", "Security", "Ground Staff", "Admin"]
        meals = [
            ("Paneer Wrap", "Veg", 250.0),
            ("Veg Sandwich", "Veg", 200.0),
            ("Chicken Roll", "Non-Veg", 300.0),
            ("Fish Meal", "Non-Veg", 350.0),
        ]
        for s in statuses:
            self.conn.execute("INSERT OR IGNORE INTO Flight_Status(status_name) VALUES (?)", (s,))
        for r in roles:
            self.conn.execute("INSERT OR IGNORE INTO Roles(role_name) VALUES (?)", (r,))
        for name, meal_type, price in meals:
            self.conn.execute(
                """
                INSERT OR IGNORE INTO Meal_Menu(meal_name, meal_type, meal_price)
                VALUES (?, ?, ?)
                """,
                (name, meal_type, price),
            )

    def close(self) -> None:
        self.conn.commit()
        self.conn.close()

    def _one(self, query: str, params: Iterable[Any] = ()) -> sqlite3.Row | None:
        return self.conn.execute(query, tuple(params)).fetchone()

    def _all(self, query: str, params: Iterable[Any] = ()) -> list[sqlite3.Row]:
        return self.conn.execute(query, tuple(params)).fetchall()

    # ------------------------------
    # 1) Flight Management
    # ------------------------------
    def add_aircraft(self, model: str, capacity: int, registration_no: str) -> int:
        cur = self.conn.execute(
            """
            INSERT INTO Aircrafts(model, capacity, registration_no)
            VALUES (?, ?, ?)
            """,
            (model, capacity, registration_no),
        )
        self.conn.commit()
        return int(cur.lastrowid)

    def add_gate(self, gate_code: str, terminal: str) -> int:
        cur = self.conn.execute(
            "INSERT INTO Gates(gate_code, terminal) VALUES (?, ?)",
            (gate_code, terminal),
        )
        self.conn.commit()
        return int(cur.lastrowid)

    def add_flight(
        self,
        flight_no: str,
        origin: str,
        destination: str,
        scheduled_departure: str,
        scheduled_arrival: str,
        status: str = "On Time",
        gate_id: int | None = None,
        aircraft_id: int | None = None,
    ) -> int:
        status_row = self._one("SELECT status_id FROM Flight_Status WHERE status_name = ?", (status,))
        if not status_row:
            raise ValueError(f"Invalid status: {status}")
        cur = self.conn.execute(
            """
            INSERT INTO Flights(
                flight_no, origin, destination, scheduled_departure, scheduled_arrival,
                status_id, gate_id, aircraft_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                flight_no,
                origin,
                destination,
                scheduled_departure,
                scheduled_arrival,
                status_row["status_id"],
                gate_id,
                aircraft_id,
            ),
        )
        self.conn.commit()
        return int(cur.lastrowid)

    def edit_flight_schedule(self, flight_id: int, scheduled_departure: str, scheduled_arrival: str) -> None:
        self.conn.execute(
            "UPDATE Flights SET scheduled_departure = ?, scheduled_arrival = ? WHERE flight_id = ?",
            (scheduled_departure, scheduled_arrival, flight_id),
        )
        self.conn.commit()

    def delete_flight(self, flight_id: int) -> None:
        self.conn.execute("DELETE FROM Flights WHERE flight_id = ?", (flight_id,))
        self.conn.commit()

    def update_flight_status(
        self,
        flight_id: int,
        status: str,
        actual_departure: str | None = None,
        actual_arrival: str | None = None,
    ) -> None:
        status_row = self._one("SELECT status_id FROM Flight_Status WHERE status_name = ?", (status,))
        if not status_row:
            raise ValueError(f"Invalid status: {status}")
        self.conn.execute(
            """
            UPDATE Flights
            SET status_id = ?, actual_departure = COALESCE(?, actual_departure),
                actual_arrival = COALESCE(?, actual_arrival)
            WHERE flight_id = ?
            """,
            (status_row["status_id"], actual_departure, actual_arrival, flight_id),
        )
        self.conn.commit()

    def assign_gate(self, flight_id: int, gate_id: int) -> None:
        self.conn.execute("UPDATE Flights SET gate_id = ? WHERE flight_id = ?", (gate_id, flight_id))
        self.conn.commit()

    def assign_aircraft(self, flight_id: int, aircraft_id: int) -> None:
        self.conn.execute("UPDATE Flights SET aircraft_id = ? WHERE flight_id = ?", (aircraft_id, flight_id))
        self.conn.commit()

    # ------------------------------
    # 2) Passenger Management
    # ------------------------------
    def register_passenger(self, full_name: str, email: str, phone: str, date_of_birth: str) -> int:
        cur = self.conn.execute(
            """
            INSERT INTO Passengers(full_name, email, phone, date_of_birth)
            VALUES (?, ?, ?, ?)
            """,
            (full_name, email, phone, date_of_birth),
        )
        self.conn.commit()
        return int(cur.lastrowid)

    def add_or_verify_passport(
        self, passenger_id: int, passport_number: str, country: str, expiry_date: str, is_verified: bool
    ) -> None:
        exists = self._one("SELECT passport_id FROM Passports WHERE passenger_id = ?", (passenger_id,))
        if exists:
            self.conn.execute(
                """
                UPDATE Passports
                SET passport_number = ?, country = ?, expiry_date = ?, is_verified = ?
                WHERE passenger_id = ?
                """,
                (passport_number, country, expiry_date, int(is_verified), passenger_id),
            )
        else:
            self.conn.execute(
                """
                INSERT INTO Passports(passenger_id, passport_number, country, expiry_date, is_verified)
                VALUES (?, ?, ?, ?, ?)
                """,
                (passenger_id, passport_number, country, expiry_date, int(is_verified)),
            )
        self.conn.commit()

    def get_passenger_profile(self, passenger_id: int) -> sqlite3.Row | None:
        return self._one(
            """
            SELECT p.passenger_id, p.full_name, p.email, p.phone, p.date_of_birth,
                   pp.passport_number, pp.country, pp.expiry_date, pp.is_verified
            FROM Passengers p
            LEFT JOIN Passports pp ON pp.passenger_id = p.passenger_id
            WHERE p.passenger_id = ?
            """,
            (passenger_id,),
        )

    def search_passenger(
        self, name: str | None = None, passport_id: str | None = None, ticket_ref: str | None = None
    ) -> list[sqlite3.Row]:
        conditions: list[str] = []
        params: list[Any] = []

        if name:
            conditions.append("p.full_name LIKE ?")
            params.append(f"%{name}%")
        if passport_id:
            conditions.append("pp.passport_number = ?")
            params.append(passport_id)
        if ticket_ref:
            conditions.append("t.ticket_ref = ?")
            params.append(ticket_ref)

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        query = f"""
            SELECT DISTINCT p.passenger_id, p.full_name, p.email, p.phone
            FROM Passengers p
            LEFT JOIN Passports pp ON pp.passenger_id = p.passenger_id
            LEFT JOIN Tickets t ON t.passenger_id = p.passenger_id
            {where_clause}
        """
        return self._all(query, params)

    def get_travel_history(self, passenger_id: int) -> list[sqlite3.Row]:
        return self._all(
            """
            SELECT ph.history_id, f.flight_no, f.origin, f.destination, ph.travel_date, ph.notes
            FROM Passenger_History ph
            JOIN Flights f ON f.flight_id = ph.flight_id
            WHERE ph.passenger_id = ?
            ORDER BY ph.travel_date DESC
            """,
            (passenger_id,),
        )

    # ------------------------------
    # 3) Ticket Booking + Meals
    # ------------------------------
    def add_seat(self, flight_id: int, seat_number: str, class_type: str) -> int:
        cur = self.conn.execute(
            """
            INSERT INTO Seats(flight_id, seat_number, class_type)
            VALUES (?, ?, ?)
            """,
            (flight_id, seat_number, class_type),
        )
        self.conn.commit()
        return int(cur.lastrowid)

    def get_meal_menu(self, meal_type: str | None = None) -> list[sqlite3.Row]:
        if meal_type:
            return self._all(
                """
                SELECT meal_id, meal_name, meal_type, meal_price
                FROM Meal_Menu
                WHERE is_active = 1 AND meal_type = ?
                ORDER BY meal_price
                """,
                (meal_type,),
            )
        return self._all(
            """
            SELECT meal_id, meal_name, meal_type, meal_price
            FROM Meal_Menu
            WHERE is_active = 1
            ORDER BY meal_type, meal_price
            """
        )

    def _seat_availability_ratio(self, flight_id: int) -> float:
        seats = self._one(
            """
            SELECT
                SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END) AS available_count,
                COUNT(*) AS total_count
            FROM Seats
            WHERE flight_id = ?
            """,
            (flight_id,),
        )
        if not seats or seats["total_count"] == 0:
            return 1.0
        return seats["available_count"] / seats["total_count"]

    def _class_base_fare(self, class_type: str) -> float:
        fare_map = {"Economy": 5000.0, "Business": 11000.0, "First Class": 18000.0}
        if class_type not in fare_map:
            raise ValueError("Invalid class type.")
        return fare_map[class_type]

    def calculate_fare(
        self, flight_id: int, class_type: str, meal_id: int | None = None, booking_type: str = "One Way"
    ) -> FareBreakdown:
        base_fare = self._class_base_fare(class_type)
        availability_ratio = self._seat_availability_ratio(flight_id)
        dynamic_multiplier = 1.5 if availability_ratio < 0.25 else 1.2 if availability_ratio < 0.5 else 1.0
        meal_price = 0.0
        if meal_id is not None:
            meal_row = self._one("SELECT meal_price FROM Meal_Menu WHERE meal_id = ? AND is_active = 1", (meal_id,))
            if not meal_row:
                raise ValueError("Invalid meal ID.")
            meal_price = float(meal_row["meal_price"])

        subtotal = base_fare * dynamic_multiplier + meal_price
        total_fare = subtotal * (1.8 if booking_type == "Round Trip" else 1.0)
        return FareBreakdown(base_fare, dynamic_multiplier, meal_price, round(total_fare, 2))

    def _reserve_seat(self, seat_id: int) -> None:
        row = self._one("SELECT is_available FROM Seats WHERE seat_id = ?", (seat_id,))
        if not row:
            raise ValueError("Seat not found.")
        if row["is_available"] == 0:
            raise ValueError("Seat already booked.")
        self.conn.execute("UPDATE Seats SET is_available = 0 WHERE seat_id = ?", (seat_id,))

    def book_ticket(
        self,
        passenger_id: int,
        flight_id: int,
        class_type: str,
        seat_id: int | None = None,
        meal_id: int | None = None,
        booking_type: str = "One Way",
        return_flight_id: int | None = None,
        payment_method: str = "UPI",
    ) -> str:
        fare = self.calculate_fare(flight_id, class_type, meal_id, booking_type)
        if seat_id:
            self._reserve_seat(seat_id)

        ticket_ref = f"TKT-{uuid.uuid4().hex[:8].upper()}"
        cur = self.conn.execute(
            """
            INSERT INTO Tickets(
                ticket_ref, passenger_id, flight_id, seat_id, class_type,
                base_fare, dynamic_multiplier, total_fare, booking_type,
                return_flight_id, meal_id, booked_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                ticket_ref,
                passenger_id,
                flight_id,
                seat_id,
                class_type,
                fare.base_fare,
                fare.dynamic_multiplier,
                fare.total_fare,
                booking_type,
                return_flight_id,
                meal_id,
                now_iso(),
            ),
        )
        ticket_id = int(cur.lastrowid)

        self.conn.execute(
            """
            INSERT INTO Payments(ticket_id, amount, payment_method, payment_status, paid_at)
            VALUES (?, ?, ?, 'Success', ?)
            """,
            (ticket_id, fare.total_fare, payment_method, now_iso()),
        )
        self.conn.execute(
            """
            INSERT INTO Booking_History(ticket_id, action, action_time, remarks)
            VALUES (?, 'BOOK', ?, ?)
            """,
            (ticket_id, now_iso(), "Ticket booked successfully."),
        )
        self.conn.execute(
            """
            INSERT INTO Passenger_History(passenger_id, flight_id, ticket_id, travel_date, notes)
            VALUES (?, ?, ?, ?, ?)
            """,
            (passenger_id, flight_id, ticket_id, now_iso(), "Booked flight."),
        )
        self.conn.commit()
        return ticket_ref

    def cancel_ticket(self, ticket_ref: str, reason: str = "Customer request") -> None:
        ticket = self._one("SELECT ticket_id, seat_id FROM Tickets WHERE ticket_ref = ?", (ticket_ref,))
        if not ticket:
            raise ValueError("Ticket not found.")
        self.conn.execute(
            "UPDATE Tickets SET booking_status = 'Cancelled' WHERE ticket_id = ?",
            (ticket["ticket_id"],),
        )
        if ticket["seat_id"]:
            self.conn.execute("UPDATE Seats SET is_available = 1 WHERE seat_id = ?", (ticket["seat_id"],))
        self.conn.execute(
            """
            INSERT INTO Booking_History(ticket_id, action, action_time, remarks)
            VALUES (?, 'CANCEL', ?, ?)
            """,
            (ticket["ticket_id"], now_iso(), reason),
        )
        self.conn.commit()

    def get_ticket_details(self, ticket_ref: str) -> sqlite3.Row | None:
        return self._one(
            """
            SELECT t.ticket_ref, p.full_name, f.flight_no, f.origin, f.destination,
                   t.class_type, s.seat_number, t.total_fare, t.booking_status,
                   m.meal_name, m.meal_type
            FROM Tickets t
            JOIN Passengers p ON p.passenger_id = t.passenger_id
            JOIN Flights f ON f.flight_id = t.flight_id
            LEFT JOIN Seats s ON s.seat_id = t.seat_id
            LEFT JOIN Meal_Menu m ON m.meal_id = t.meal_id
            WHERE t.ticket_ref = ?
            """,
            (ticket_ref,),
        )

    # ------------------------------
    # 4) Check-In System
    # ------------------------------
    def check_in_ticket(
        self, ticket_ref: str, checkin_mode: str = "Online", upgraded_class: str | None = None
    ) -> str:
        ticket = self._one(
            """
            SELECT t.ticket_id, t.flight_id, f.gate_id
            FROM Tickets t
            JOIN Flights f ON f.flight_id = t.flight_id
            WHERE t.ticket_ref = ? AND t.booking_status = 'Booked'
            """,
            (ticket_ref,),
        )
        if not ticket:
            raise ValueError("Ticket not found or cannot be checked in.")

        queue_no_row = self._one("SELECT COALESCE(MAX(queue_number), 0) + 1 AS next_q FROM Checkins")
        queue_number = queue_no_row["next_q"] if queue_no_row else 1

        cur = self.conn.execute(
            """
            INSERT INTO Checkins(ticket_id, checkin_mode, queue_number, upgraded_class, checked_in_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (ticket["ticket_id"], checkin_mode, queue_number, upgraded_class, now_iso()),
        )
        checkin_id = int(cur.lastrowid)
        boarding_code = f"BP-{uuid.uuid4().hex[:8].upper()}"
        self.conn.execute(
            """
            INSERT INTO Boarding_Pass(checkin_id, boarding_code, gate_id, boarding_group, issued_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (checkin_id, boarding_code, ticket["gate_id"], f"G{(queue_number - 1) // 20 + 1}", now_iso()),
        )
        self.conn.execute(
            "UPDATE Tickets SET booking_status = 'Checked-In' WHERE ticket_id = ?",
            (ticket["ticket_id"],),
        )
        self.conn.commit()
        return boarding_code

    # ------------------------------
    # 5) Baggage Management
    # ------------------------------
    def checkin_baggage(self, ticket_ref: str, weight_kg: float, max_weight_kg: float = 25.0) -> str:
        if weight_kg > max_weight_kg:
            raise ValueError(f"Baggage overweight. Allowed: {max_weight_kg}kg")
        ticket = self._one("SELECT ticket_id FROM Tickets WHERE ticket_ref = ?", (ticket_ref,))
        if not ticket:
            raise ValueError("Ticket not found.")
        baggage_tag = f"BG-{uuid.uuid4().hex[:8].upper()}"
        qr_code = f"QR-{uuid.uuid4().hex[:10].upper()}"
        cur = self.conn.execute(
            """
            INSERT INTO Baggage(ticket_id, weight_kg, baggage_tag, qr_code, status, checked_in_at)
            VALUES (?, ?, ?, ?, 'Checked-In', ?)
            """,
            (ticket["ticket_id"], weight_kg, baggage_tag, qr_code, now_iso()),
        )
        baggage_id = int(cur.lastrowid)
        self.conn.execute(
            """
            INSERT INTO Baggage_Tracking(baggage_id, location, status_update, updated_at)
            VALUES (?, 'Check-In Counter', 'Checked-In', ?)
            """,
            (baggage_id, now_iso()),
        )
        self.conn.commit()
        return baggage_tag

    def update_baggage_status(self, baggage_tag: str, location: str, status: str) -> None:
        baggage = self._one("SELECT baggage_id FROM Baggage WHERE baggage_tag = ?", (baggage_tag,))
        if not baggage:
            raise ValueError("Baggage not found.")
        self.conn.execute(
            "UPDATE Baggage SET status = ? WHERE baggage_id = ?",
            (status, baggage["baggage_id"]),
        )
        self.conn.execute(
            """
            INSERT INTO Baggage_Tracking(baggage_id, location, status_update, updated_at)
            VALUES (?, ?, ?, ?)
            """,
            (baggage["baggage_id"], location, status, now_iso()),
        )
        self.conn.commit()

    def report_lost_baggage(self, baggage_tag: str) -> None:
        self.update_baggage_status(baggage_tag, "Unknown", "Lost")
        self.conn.execute(
            "UPDATE Baggage SET is_lost_reported = 1 WHERE baggage_tag = ?",
            (baggage_tag,),
        )
        self.conn.commit()

    # ------------------------------
    # 6) Staff Management
    # ------------------------------
    def add_staff(self, full_name: str, role_name: str) -> int:
        role = self._one("SELECT role_id FROM Roles WHERE role_name = ?", (role_name,))
        if not role:
            raise ValueError("Invalid role.")
        cur = self.conn.execute(
            "INSERT INTO Staff(full_name, role_id) VALUES (?, ?)",
            (full_name, role["role_id"]),
        )
        self.conn.commit()
        return int(cur.lastrowid)

    def schedule_staff_duty(self, staff_id: int, flight_id: int, shift_start: str, shift_end: str) -> None:
        self.conn.execute(
            """
            UPDATE Staff
            SET assigned_flight_id = ?, shift_start = ?, shift_end = ?
            WHERE staff_id = ?
            """,
            (flight_id, shift_start, shift_end, staff_id),
        )
        self.conn.commit()

    def mark_attendance(self, staff_id: int, attendance_date: str, status: str) -> None:
        self.conn.execute(
            """
            INSERT INTO Attendance(staff_id, attendance_date, status)
            VALUES (?, ?, ?)
            """,
            (staff_id, attendance_date, status),
        )
        self.conn.commit()

    def add_salary_record(self, staff_id: int, pay_month: str, base_salary: float, bonus: float, deductions: float) -> None:
        net_salary = max(0.0, base_salary + bonus - deductions)
        self.conn.execute(
            """
            INSERT INTO Salaries(staff_id, pay_month, base_salary, bonus, deductions, net_salary, paid_on)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (staff_id, pay_month, base_salary, bonus, deductions, net_salary, now_iso()),
        )
        self.conn.commit()


def seed_demo_data(system: AirportManagementSystem) -> dict[str, Any]:
    aircraft = system._one("SELECT aircraft_id FROM Aircrafts WHERE registration_no = ?", ("VT-AMS-320",))
    if aircraft:
        aircraft_id = int(aircraft["aircraft_id"])
    else:
        aircraft_id = system.add_aircraft("Airbus A320", 180, "VT-AMS-320")

    gate = system._one("SELECT gate_id FROM Gates WHERE gate_code = ?", ("A12",))
    if gate:
        gate_id = int(gate["gate_id"])
    else:
        gate_id = system.add_gate("A12", "T1")

    flight = system._one("SELECT flight_id FROM Flights WHERE flight_no = ?", ("AI202",))
    if flight:
        flight_id = int(flight["flight_id"])
    else:
        flight_id = system.add_flight(
            flight_no="AI202",
            origin="DEL",
            destination="BOM",
            scheduled_departure="2026-06-01T09:00:00",
            scheduled_arrival="2026-06-01T11:00:00",
            gate_id=gate_id,
            aircraft_id=aircraft_id,
        )

    for idx in range(1, 31):
        class_type = "Economy" if idx <= 20 else "Business" if idx <= 28 else "First Class"
        seat_number = f"{idx}A"
        seat_exists = system._one(
            "SELECT seat_id FROM Seats WHERE flight_id = ? AND seat_number = ?",
            (flight_id, seat_number),
        )
        if not seat_exists:
            system.add_seat(flight_id, seat_number, class_type)

    passenger = system._one("SELECT passenger_id FROM Passengers WHERE email = ?", ("rahul@example.com",))
    if passenger:
        passenger_id = int(passenger["passenger_id"])
    else:
        passenger_id = system.register_passenger("Rahul Sharma", "rahul@example.com", "+919999999999", "1998-03-22")
    system.add_or_verify_passport(passenger_id, "N1234567", "India", "2031-05-30", True)
    return {"flight_id": flight_id, "passenger_id": passenger_id}


def main() -> None:
    print("Initializing Airport Management System...")
    system = AirportManagementSystem()
    try:
        demo = seed_demo_data(system)
        meal_options = system.get_meal_menu("Veg")
        selected_meal_id = meal_options[0]["meal_id"] if meal_options else None
        seat = system._one(
            """
            SELECT seat_id FROM Seats
            WHERE flight_id = ? AND class_type = 'Economy' AND is_available = 1
            LIMIT 1
            """,
            (demo["flight_id"],),
        )
        ticket_ref = system.book_ticket(
            passenger_id=demo["passenger_id"],
            flight_id=demo["flight_id"],
            class_type="Economy",
            seat_id=seat["seat_id"] if seat else None,
            meal_id=selected_meal_id,
            booking_type="One Way",
        )
        boarding_code = system.check_in_ticket(ticket_ref, checkin_mode="Online")
        baggage_tag = system.checkin_baggage(ticket_ref, weight_kg=18.5)
        system.update_baggage_status(baggage_tag, "Loading Bay", "Loaded")

        ticket = system.get_ticket_details(ticket_ref)
        print("\n--- Ticket Generated ---")
        print(f"Ticket Ref: {ticket['ticket_ref']}")
        print(f"Passenger : {ticket['full_name']}")
        print(f"Flight    : {ticket['flight_no']} ({ticket['origin']} -> {ticket['destination']})")
        print(f"Class     : {ticket['class_type']} | Seat: {ticket['seat_number']}")
        print(f"Meal      : {ticket['meal_name']} ({ticket['meal_type']})")
        print(f"Fare      : INR {ticket['total_fare']}")
        print(f"Status    : {ticket['booking_status']}")
        print(f"Board Pass: {boarding_code}")
        print(f"Baggage   : {baggage_tag}")
        print("\nSystem demo complete. Database saved at airport_management.db")
    finally:
        system.close()


if __name__ == "__main__":
    main()
