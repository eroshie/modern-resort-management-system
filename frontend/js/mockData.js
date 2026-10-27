export const seedData = {
    rooms: [
        { id: 101, room_number: "101", type: "Deluxe Suite", status: "Occupied", price_per_night: 350, capacity: 2 },
        { id: 102, room_number: "102", type: "Deluxe Suite", status: "Available", price_per_night: 350, capacity: 2 },
        { id: 103, room_number: "103", type: "Ocean Villa", status: "Occupied", price_per_night: 650, capacity: 4 },
        { id: 104, room_number: "104", type: "Ocean Villa", status: "Cleaning", price_per_night: 650, capacity: 4 },
        { id: 201, room_number: "201", type: "Standard Double", status: "Available", price_per_night: 220, capacity: 2 },
        { id: 202, room_number: "202", type: "Standard Double", status: "Available", price_per_night: 220, capacity: 2 },
        { id: 203, room_number: "203", type: "Penthouse", status: "Occupied", price_per_night: 1200, capacity: 6 },
        { id: 204, room_number: "204", type: "Penthouse", status: "Maintenance", price_per_night: 1200, capacity: 6 }
    ],
    guests: [
        { id: 1, first_name: "Sophia", last_name: "Vanderbilt", email: "sophia.v@example.com", phone: "+1-555-0192", loyalty_points: 1250 },
        { id: 2, first_name: "Liam", last_name: "Montgomery", email: "liam.m@example.com", phone: "+1-555-0483", loyalty_points: 450 },
        { id: 3, first_name: "Elena", last_name: "rostova", email: "elena.r@example.com", phone: "+1-555-0921", loyalty_points: 890 },
        { id: 4, first_name: "Marcus", last_name: "Aurelius", email: "marcus.a@example.com", phone: "+1-555-3829", loyalty_points: 3200 }
    ],
    bookings: [
        { id: 1001, room_id: 101, guest_id: 1, check_in_date: "2025-05-10", check_out_date: "2025-05-15", status: "Confirmed", total_amount: 1750 },
        { id: 1002, room_id: 103, guest_id: 2, check_in_date: "2025-05-12", check_out_date: "2025-05-18", status: "Confirmed", total_amount: 3900 },
        { id: 1003, room_id: 203, guest_id: 4, check_in_date: "2025-05-08", check_out_date: "2025-05-14", status: "Confirmed", total_amount: 7200 }
    ],
    staff: [
        { id: 1, name: "Clara Oswald", role: "Front Desk Supervisor", department: "Front Office", status: "On Duty" },
        { id: 2, name: "John Watson", role: "Head Concierge", department: "Guest Services", status: "On Duty" },
        { id: 3, name: "Sarah Jenkins", role: "Executive Housekeeper", department: "Housekeeping", status: "Break" },
        { id: 4, name: "David Tennant", role: "Maintenance Engineer", department: "Engineering", status: "Off Duty" }
    ],
    services: [
        { id: 501, name: "Aromatherapy Full Body Massage", category: "Spa", guest_id: 1, reservation_time: "2025-05-11 14:00", status: "Reserved" },
        { id: 502, name: "Sunset Private Yacht Excursion", category: "Excursion", guest_id: 2, reservation_time: "2025-05-13 17:30", status: "Confirmed" },
        { id: 503, name: "Chef's Table Omakase Dinner", category: "Dining", guest_id: 4, reservation_time: "2025-05-10 20:00", status: "Completed" }
    ],
    invoices: [
        { id: 8001, booking_id: 1001, guest_id: 1, amount_due: 1750, status: "Paid", issued_date: "2025-05-10" },
        { id: 8002, booking_id: 1002, guest_id: 2, amount_due: 3900, status: "Pending", issued_date: "2025-05-12" },
        { id: 8003, booking_id: 1003, guest_id: 4, amount_due: 7200, status: "Paid", issued_date: "2025-05-08" }
    ]
};