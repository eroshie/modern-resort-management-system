import sqlite3

DB_NAME = "resort.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_number TEXT NOT NULL,
            type TEXT NOT NULL,
            status TEXT NOT NULL,
            price_per_night REAL NOT NULL,
            capacity INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS guests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            loyalty_points INTEGER DEFAULT 100
        );

        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            guest_id INTEGER NOT NULL,
            check_in_date TEXT NOT NULL,
            check_out_date TEXT NOT NULL,
            status TEXT NOT NULL,
            total_amount REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            department TEXT NOT NULL,
            status TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            guest_id INTEGER NOT NULL,
            reservation_time TEXT NOT NULL,
            status TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            guest_id INTEGER NOT NULL,
            amount_due REAL NOT NULL,
            status TEXT NOT NULL,
            issued_date TEXT NOT NULL
        );
    """)

    # Seed initial data if tables are empty
    cursor.execute("SELECT COUNT(*) FROM rooms")
    if cursor.fetchone()[0] == 0:
        rooms_seed = [
            (101, "101", "Deluxe Suite", "Occupied", 350.0, 2),
            (102, "102", "Deluxe Suite", "Available", 350.0, 2),
            (103, "103", "Ocean Villa", "Occupied", 650.0, 4),
            (104, "104", "Ocean Villa", "Cleaning", 650.0, 4),
            (201, "201", "Standard Double", "Available", 220.0, 2),
            (202, "202", "Standard Double", "Available", 220.0, 2),
            (203, "203", "Penthouse", "Occupied", 1200.0, 6),
            (204, "204", "Penthouse", "Maintenance", 1200.0, 6)
        ]
        cursor.executemany("INSERT INTO rooms (id, room_number, type, status, price_per_night, capacity) VALUES (?, ?, ?, ?, ?, ?)", rooms_seed)

    cursor.execute("SELECT COUNT(*) FROM guests")
    if cursor.fetchone()[0] == 0:
        guests_seed = [
            (1, "Sophia", "Vanderbilt", "sophia.v@example.com", "+1-555-0192", 1250),
            (2, "Liam", "Montgomery", "liam.m@example.com", "+1-555-0483", 450),
            (3, "Elena", "Rostova", "elena.r@example.com", "+1-555-0921", 890),
            (4, "Marcus", "Aurelius", "marcus.a@example.com", "+1-555-3829", 3200)
        ]
        cursor.executemany("INSERT INTO guests (id, first_name, last_name, email, phone, loyalty_points) VALUES (?, ?, ?, ?, ?, ?)", guests_seed)

    cursor.execute("SELECT COUNT(*) FROM bookings")
    if cursor.fetchone()[0] == 0:
        bookings_seed = [
            (1001, 101, 1, "2025-05-10", "2025-05-15", "Confirmed", 1750.0),
            (1002, 103, 2, "2025-05-12", "2025-05-18", "Confirmed", 3900.0),
            (1003, 203, 4, "2025-05-08", "2025-05-14", "Confirmed", 7200.0)
        ]
        cursor.executemany("INSERT INTO bookings (id, room_id, guest_id, check_in_date, check_out_date, status, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)", bookings_seed)

    cursor.execute("SELECT COUNT(*) FROM staff")
    if cursor.fetchone()[0] == 0:
        staff_seed = [
            (1, "Clara Oswald", "Front Desk Supervisor", "Front Office", "On Duty"),
            (2, "John Watson", "Head Concierge", "Guest Services", "On Duty"),
            (3, "Sarah Jenkins", "Executive Housekeeper", "Housekeeping", "Break"),
            (4, "David Tennant", "Maintenance Engineer", "Engineering", "Off Duty")
        ]
        cursor.executemany("INSERT INTO staff (id, name, role, department, status) VALUES (?, ?, ?, ?, ?)", staff_seed)

    cursor.execute("SELECT COUNT(*) FROM services")
    if cursor.fetchone()[0] == 0:
        services_seed = [
            (501, "Aromatherapy Full Body Massage", "Spa", 1, "2025-05-11 14:00", "Reserved"),
            (502, "Sunset Private Yacht Excursion", "Excursion", 2, "2025-05-13 17:30", "Confirmed"),
            (503, "Chef's Table Omakase Dinner", "Dining", 4, "2025-05-10 20:00", "Completed")
        ]
        cursor.executemany("INSERT INTO services (id, name, category, guest_id, reservation_time, status) VALUES (?, ?, ?, ?, ?, ?)", services_seed)

    cursor.execute("SELECT COUNT(*) FROM invoices")
    if cursor.fetchone()[0] == 0:
        invoices_seed = [
            (8001, 1001, 1, 1750.0, "Paid", "2025-05-10"),
            (8002, 1002, 2, 3900.0, "Pending", "2025-05-12"),
            (8003, 1003, 4, 7200.0, "Paid", "2025-05-08")
        ]
        cursor.executemany("INSERT INTO invoices (id, booking_id, guest_id, amount_due, status, issued_date) VALUES (?, ?, ?, ?, ?, ?)", invoices_seed)

    conn.commit()
    conn.close()
