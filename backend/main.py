from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
from pathlib import Path
import datetime

from database import init_db, get_db

app = FastAPI(title="Modern Resort Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

# Pydantic Models matching exact API contracts
class RoomCreate(BaseModel):
    room_number: str
    type: str
    price_per_night: float
    capacity: int
    status: Optional[str] = "Available"

class GuestCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str

class BookingCreate(BaseModel):
    room_id: int
    guest_id: int
    check_in_date: str
    check_out_date: str

class StaffCreate(BaseModel):
    name: str
    role: str
    department: str
    status: Optional[str] = "On Duty"

class ServiceCreate(BaseModel):
    name: str
    category: str
    guest_id: int
    reservation_time: str

class InvoiceCreate(BaseModel):
    booking_id: int
    guest_id: int
    amount_due: float

# API Endpoints
@app.get("/api/rooms")
def list_rooms():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, room_number, type, status, price_per_night, capacity FROM rooms")
    rows = cursor.fetchall()
    conn.close()
    rooms = [dict(row) for row in rows]
    return {"rooms": rooms}

@app.post("/api/rooms")
def create_room(room: RoomCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO rooms (room_number, type, status, price_per_night, capacity) VALUES (?, ?, ?, ?, ?)",
        (room.room_number, room.type, room.status, room.price_per_night, room.capacity)
    )
    conn.commit()
    room_id = cursor.lastrowid
    cursor.execute("SELECT id, room_number, type, status, price_per_night, capacity FROM rooms WHERE id = ?", (room_id,))
    new_room = dict(cursor.fetchone())
    conn.close()
    return {"room": new_room}

@app.get("/api/guests")
def list_guests():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, first_name, last_name, email, phone, loyalty_points FROM guests")
    rows = cursor.fetchall()
    conn.close()
    guests = [dict(row) for row in rows]
    return {"guests": guests}

@app.post("/api/guests")
def register_guest(guest: GuestCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO guests (first_name, last_name, email, phone, loyalty_points) VALUES (?, ?, ?, ?, ?)",
        (guest.first_name, guest.last_name, guest.email, guest.phone, 100)
    )
    conn.commit()
    guest_id = cursor.lastrowid
    cursor.execute("SELECT id, first_name, last_name, email, phone, loyalty_points FROM guests WHERE id = ?", (guest_id,))
    new_guest = dict(cursor.fetchone())
    conn.close()
    return {"guest": new_guest}

@app.get("/api/bookings")
def list_bookings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, room_id, guest_id, check_in_date, check_out_date, status, total_amount FROM bookings")
    rows = cursor.fetchall()
    conn.close()
    bookings = [dict(row) for row in rows]
    return {"bookings": bookings}

@app.post("/api/bookings")
def create_booking(booking: BookingCreate):
    conn = get_db()
    cursor = conn.cursor()

    # Get room price
    cursor.execute("SELECT price_per_night FROM rooms WHERE id = ?", (booking.room_id,))
    room_row = cursor.fetchone()
    price = room_row["price_per_night"] if room_row else 200.0

    # Calculate duration
    try:
        d1 = datetime.datetime.strptime(booking.check_in_date, "%Y-%m-%d")
        d2 = datetime.datetime.strptime(booking.check_out_date, "%Y-%m-%d")
        days = max(1, (d2 - d1).days)
    except Exception:
        days = 1

    total_amount = price * days

    cursor.execute(
        "INSERT INTO bookings (room_id, guest_id, check_in_date, check_out_date, status, total_amount) VALUES (?, ?, ?, ?, ?, ?)",
        (booking.room_id, booking.guest_id, booking.check_in_date, booking.check_out_date, "Confirmed", total_amount)
    )
    booking_id = cursor.lastrowid

    # Update room status to Occupied
    cursor.execute("UPDATE rooms SET status = 'Occupied' WHERE id = ?", (booking.room_id,))

    # Auto-generate invoice
    today_str = datetime.date.today().isoformat()
    cursor.execute(
        "INSERT INTO invoices (booking_id, guest_id, amount_due, status, issued_date) VALUES (?, ?, ?, ?, ?)",
        (booking_id, booking.guest_id, total_amount, "Pending", today_str)
    )

    conn.commit()
    cursor.execute("SELECT id, room_id, guest_id, check_in_date, check_out_date, status, total_amount FROM bookings WHERE id = ?", (booking_id,))
    new_booking = dict(cursor.fetchone())
    conn.close()
    return {"booking": new_booking}

@app.get("/api/staff")
def list_staff():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, role, department, status FROM staff")
    rows = cursor.fetchall()
    conn.close()
    staff = [dict(row) for row in rows]
    return {"staff": staff}

@app.post("/api/staff")
def add_staff(staff: StaffCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO staff (name, role, department, status) VALUES (?, ?, ?, ?)",
        (staff.name, staff.role, staff.department, staff.status or "On Duty")
    )
    conn.commit()
    staff_id = cursor.lastrowid
    cursor.execute("SELECT id, name, role, department, status FROM staff WHERE id = ?", (staff_id,))
    new_staff = dict(cursor.fetchone())
    conn.close()
    return {"staff_member": new_staff}

@app.get("/api/services")
def list_services():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, category, guest_id, reservation_time, status FROM services")
    rows = cursor.fetchall()
    conn.close()
    services = [dict(row) for row in rows]
    return {"services": services}

@app.post("/api/services")
def create_service(service: ServiceCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO services (name, category, guest_id, reservation_time, status) VALUES (?, ?, ?, ?, ?)",
        (service.name, service.category, service.guest_id, service.reservation_time, "Reserved")
    )
    conn.commit()
    service_id = cursor.lastrowid
    cursor.execute("SELECT id, name, category, guest_id, reservation_time, status FROM services WHERE id = ?", (service_id,))
    new_service = dict(cursor.fetchone())
    conn.close()
    return {"service": new_service}

@app.get("/api/invoices")
def list_invoices():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, booking_id, guest_id, amount_due, status, issued_date FROM invoices")
    rows = cursor.fetchall()
    conn.close()
    invoices = [dict(row) for row in rows]
    return {"invoices": invoices}

@app.post("/api/invoices")
def create_invoice(invoice: InvoiceCreate):
    conn = get_db()
    cursor = conn.cursor()
    today_str = datetime.date.today().isoformat()
    cursor.execute(
        "INSERT INTO invoices (booking_id, guest_id, amount_due, status, issued_date) VALUES (?, ?, ?, ?, ?)",
        (invoice.booking_id, invoice.guest_id, invoice.amount_due, "Pending", today_str)
    )
    conn.commit()
    inv_id = cursor.lastrowid
    cursor.execute("SELECT id, booking_id, guest_id, amount_due, status, issued_date FROM invoices WHERE id = ?", (inv_id,))
    new_invoice = dict(cursor.fetchone())
    conn.close()
    return {"invoice": new_invoice}

@app.get("/api/analytics")
def get_analytics():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) as occupied FROM rooms")
    room_stats = cursor.fetchone()
    total_rooms = room_stats["total"] or 1
    occupied_rooms = room_stats["occupied"] or 0
    occupancy_rate = round((occupied_rooms / total_rooms) * 100, 1)

    cursor.execute("SELECT SUM(amount_due) as total_rev FROM invoices WHERE status = 'Paid'")
    rev_row = cursor.fetchone()
    total_revenue = rev_row["total_rev"] or 0.0

    cursor.execute("SELECT COUNT(*) as active FROM guests")
    guest_row = cursor.fetchone()
    active_guests = guest_row["active"] or 0

    conn.close()

    return {
        "occupancy_rate": occupancy_rate,
        "total_revenue": total_revenue,
        "active_guests": active_guests
    }

# Mount frontend static files
frontend_path = Path(__file__).resolve().parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
