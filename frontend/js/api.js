import { seedData } from './mockData.js';

function getStorage(key, defaultVal) {
    try {
        const val = localStorage.getItem(`aura_${key}`);
        return val ? JSON.parse(val) : defaultVal;
    } catch (e) {
        console.error('LocalStorage error:', e);
        return defaultVal;
    }
}

function setStorage(key, val) {
    try {
        localStorage.setItem(`aura_${key}`, JSON.stringify(val));
    } catch (e) {
        console.error('LocalStorage error:', e);
    }
}

// Initialize seed data if not present
if (!getStorage('initialized', false)) {
    setStorage('rooms', seedData.rooms);
    setStorage('guests', seedData.guests);
    setStorage('bookings', seedData.bookings);
    setStorage('staff', seedData.staff);
    setStorage('services', seedData.services);
    setStorage('invoices', seedData.invoices);
    setStorage('initialized', true);
}

export const api = {
    async getRooms() {
        const rooms = getStorage('rooms', seedData.rooms);
        return { rooms };
    },

    async createRoom(data) {
        const rooms = getStorage('rooms', seedData.rooms);
        const newRoom = {
            id: Date.now(),
            room_number: data.room_number,
            type: data.type,
            status: data.status || 'Available',
            price_per_night: parseFloat(data.price_per_night),
            capacity: parseInt(data.capacity)
        };
        rooms.push(newRoom);
        setStorage('rooms', rooms);
        return { room: newRoom };
    },

    async updateRoomStatus(roomId, status) {
        const rooms = getStorage('rooms', seedData.rooms);
        const room = rooms.find(r => r.id === parseInt(roomId));
        if (room) {
            room.status = status;
            setStorage('rooms', rooms);
        }
        return { room };
    },

    async getGuests() {
        const guests = getStorage('guests', seedData.guests);
        return { guests };
    },

    async createGuest(data) {
        const guests = getStorage('guests', seedData.guests);
        const newGuest = {
            id: Date.now(),
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            loyalty_points: 100
        };
        guests.push(newGuest);
        setStorage('guests', guests);
        return { guest: newGuest };
    },

    async getBookings() {
        const bookings = getStorage('bookings', seedData.bookings);
        return { bookings };
    },

    async createBooking(data) {
        const bookings = getStorage('bookings', seedData.bookings);
        const rooms = getStorage('rooms', seedData.rooms);
        
        const room = rooms.find(r => r.id === parseInt(data.room_id));
        const price = room ? room.price_per_night : 200;
        
        // Calculate total amount based on dates
        const checkIn = new Date(data.check_in_date);
        const checkOut = new Date(data.check_out_date);
        const diffTime = Math.abs(checkOut - checkIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const total_amount = price * diffDays;

        const newBooking = {
            id: Date.now(),
            room_id: parseInt(data.room_id),
            guest_id: parseInt(data.guest_id),
            check_in_date: data.check_in_date,
            check_out_date: data.check_out_date,
            status: 'Confirmed',
            total_amount: total_amount
        };

        bookings.push(newBooking);
        setStorage('bookings', bookings);

        // Update room status to Occupied
        if (room) {
            room.status = 'Occupied';
            setStorage('rooms', rooms);
        }

        // Also auto-generate an invoice
        const invoices = getStorage('invoices', seedData.invoices);
        const newInvoice = {
            id: Date.now() + 1,
            booking_id: newBooking.id,
            guest_id: newBooking.guest_id,
            amount_due: total_amount,
            status: 'Pending',
            issued_date: new Date().toISOString().split('T')[0]
        };
        invoices.push(newInvoice);
        setStorage('invoices', invoices);

        return { booking: newBooking };
    },

    async updateBookingStatus(bookingId, status) {
        const bookings = getStorage('bookings', seedData.bookings);
        const booking = bookings.find(b => b.id === parseInt(bookingId));
        if (booking) {
            booking.status = status;
            setStorage('bookings', bookings);

            // If checked out, free the room
            if (status === 'Checked-Out') {
                const rooms = getStorage('rooms', seedData.rooms);
                const room = rooms.find(r => r.id === booking.room_id);
                if (room) {
                    room.status = 'Cleaning';
                    setStorage('rooms', rooms);
                }
            }
        }
        return { booking };
    },

    async getStaff() {
        const staff = getStorage('staff', seedData.staff);
        return { staff };
    },

    async createStaff(data) {
        const staff = getStorage('staff', seedData.staff);
        const newStaff = {
            id: Date.now(),
            name: data.name,
            role: data.role,
            department: data.department,
            status: data.status || 'On Duty'
        };
        staff.push(newStaff);
        setStorage('staff', staff);
        return { staff_member: newStaff };
    },

    async getServices() {
        const services = getStorage('services', seedData.services);
        return { services };
    },

    async createService(data) {
        const services = getStorage('services', seedData.services);
        const newService = {
            id: Date.now(),
            name: data.name,
            category: data.category,
            guest_id: parseInt(data.guest_id),
            reservation_time: data.reservation_time,
            status: 'Reserved'
        };
        services.push(newService);
        setStorage('services', services);
        return { service: newService };
    },

    async getInvoices() {
        const invoices = getStorage('invoices', seedData.invoices);
        return { invoices };
    },

    async createInvoice(data) {
        const invoices = getStorage('invoices', seedData.invoices);
        const newInvoice = {
            id: Date.now(),
            booking_id: parseInt(data.booking_id),
            guest_id: parseInt(data.guest_id),
            amount_due: parseFloat(data.amount_due),
            status: 'Pending',
            issued_date: new Date().toISOString().split('T')[0]
        };
        invoices.push(newInvoice);
        setStorage('invoices', invoices);
        return { invoice: newInvoice };
    },

    async payInvoice(invoiceId) {
        const invoices = getStorage('invoices', seedData.invoices);
        const inv = invoices.find(i => i.id === parseInt(invoiceId));
        if (inv) {
            inv.status = 'Paid';
            setStorage('invoices', invoices);
        }
        return { invoice: inv };
    },

    async getAnalytics() {
        const rooms = getStorage('rooms', seedData.rooms);
        const bookings = getStorage('bookings', seedData.bookings);
        const guests = getStorage('guests', seedData.guests);
        const invoices = getStorage('invoices', seedData.invoices);

        const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
        const occupancy_rate = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0;

        const total_revenue = invoices
            .filter(i => i.status === 'Paid')
            .reduce((acc, curr) => acc + curr.amount_due, 0);

        const active_guests = guests.length;

        return {
            occupancy_rate: parseFloat(occupancy_rate.toFixed(1)),
            total_revenue,
            active_guests
        };
    }
};