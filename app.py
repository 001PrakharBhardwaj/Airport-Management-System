import mysql.connector

# Database Connection

con = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Pr10032006akhar",
    database="airport"
)

cursor = con.cursor()


# Add Flight

def add_flight():
    flight_no = input("Enter Flight Number: ")
    source = input("Enter Source: ")
    destination = input("Enter Destination: ")
    departure = input("Enter Departure Time: ")

    query = """
    INSERT INTO flights
    VALUES (%s, %s, %s, %s)
    """

    values = (flight_no, source, destination, departure)

    cursor.execute(query, values)
    con.commit()

    print("Flight Added Successfully")


# View Flights

def view_flights():

    cursor.execute("SELECT * FROM flights")

    data = cursor.fetchall()

    print("\n--- Flights ---")

    for row in data:
        print(row)


# Add Passenger

def add_passenger():

    name = input("Enter Passenger Name: ")
    age = int(input("Enter Age: "))
    gender = input("Enter Gender: ")

    query = """
    INSERT INTO passengers(name, age, gender)
    VALUES (%s, %s, %s)
    """

    values = (name, age, gender)

    cursor.execute(query, values)
    con.commit()

    print("Passenger Added Successfully")


# View Passengers

def view_passengers():

    cursor.execute("SELECT * FROM passengers")

    data = cursor.fetchall()

    print("\n--- Passengers ---")

    for row in data:
        print(row)


# Book Ticket

def book_ticket():

    passenger_id = int(input("Enter Passenger ID: "))
    flight_no = input("Enter Flight Number: ")

    query = """
    INSERT INTO bookings(passenger_id, flight_no)
    VALUES (%s, %s)
    """

    values = (passenger_id, flight_no)

    cursor.execute(query, values)
    con.commit()

    print("Ticket Booked Successfully")


# View Bookings

def view_bookings():

    query = """
    SELECT * FROM bookings
    """

    cursor.execute(query)

    data = cursor.fetchall()

    print("\n--- Bookings ---")

    for row in data:
        print(row)


# Main Menu

while True:

    print("\n===== AIRPORT MANAGEMENT SYSTEM =====")

    print("1. Add Flight")
    print("2. View Flights")
    print("3. Add Passenger")
    print("4. View Passengers")
    print("5. Book Ticket")
    print("6. View Bookings")
    print("7. Exit")

    choice = int(input("Enter Your Choice: "))

    if choice == 1:
        add_flight()

    elif choice == 2:
        view_flights()

    elif choice == 3:
        add_passenger()

    elif choice == 4:
        view_passengers()

    elif choice == 5:
        book_ticket()

    elif choice == 6:
        view_bookings()

    elif choice == 7:
        print("Thank You")
        break

    else:
        print("Invalid Choice")