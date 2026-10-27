import { api } from '../api.js';
import { openModal, closeModal, showToast } from '../components/modal.js';

export async function renderRoomsView(container) {
    const { rooms } = await api.getRooms();
    const { guests } = await api.getGuests();

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h1>Room Management & Booking</h1>
                <p>Monitor real-time room status, housekeeping, and schedule new reservations.</p>
            </div>
            <div class="view-actions" style="display:flex; gap: 12px;">
                <button class="btn btn-secondary" id="addRoomBtn"><i class="fa-solid fa-plus"></i> Add Room</button>
                <button class="btn btn-primary" id="bookRoomBtn"><i class="fa-solid fa-calendar-plus"></i> New Booking</button>
            </div>
        </div>

        <div class="filter-bar">
            <div class="search-input-group">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Filter by room number or type..." id="roomSearchInput">
            </div>
            <select class="filter-select" id="roomStatusFilter">
                <option value="all">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
            </select>
        </div>

        <div class="rooms-grid" id="roomsGrid">
            ${renderRoomCards(rooms)}
        </div>
    `;

    // Search & Filter listeners
    const searchInput = document.getElementById('roomSearchInput');
    const statusFilter = document.getElementById('roomStatusFilter');

    const filterRooms = async () => {
        const query = searchInput.value.toLowerCase();
        const status = statusFilter.value;
        const filtered = rooms.filter(r => {
            const matchQuery = r.room_number.toLowerCase().includes(query) || r.type.toLowerCase().includes(query);
            const matchStatus = status === 'all' || r.status === status;
            return matchQuery && matchStatus;
        });
        document.getElementById('roomsGrid').innerHTML = renderRoomCards(filtered);
        attachRoomListeners(rooms, guests, container);
    };

    searchInput.oninput = filterRooms;
    statusFilter.onchange = filterRooms;

    attachRoomListeners(rooms, guests, container);

    document.getElementById('addRoomBtn').onclick = () => {
        openModal('Add New Room', `
            <form id="addRoomForm">
                <div class="form-group">
                    <label class="form-label">Room Number</label>
                    <input type="text" class="form-control" name="room_number" placeholder="e.g. 305" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Room Type</label>
                    <input type="text" class="form-control" name="type" placeholder="e.g. Deluxe Suite" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Price Per Night ($)</label>
                        <input type="number" class="form-control" name="price_per_night" placeholder="350" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Capacity (Guests)</label>
                        <input type="number" class="form-control" name="capacity" placeholder="2" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">Save Room</button>
                </div>
            </form>
        `, async (form) => {
            const data = Object.fromEntries(new FormData(form).entries());
            await api.createRoom(data);
            closeModal();
            showToast('Room added successfully!');
            renderRoomsView(container);
        });
    };

    document.getElementById('bookRoomBtn').onclick = () => openBookingModal(rooms, guests, container);
}

function renderRoomCards(rooms) {
    if (rooms.length === 0) {
        return `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">No rooms found matching criteria.</div>`;
    }
    return rooms.map(r => {
        const badgeClass = r.status === 'Available' ? 'success' : r.status === 'Occupied' ? 'info' : 'warning';
        return `
            <div class="room-card">
                <div class="room-card-header">
                    <span class="room-number">Room ${r.room_number}</span>
                    <span class="badge badge-${badgeClass}">${r.status}</span>
                </div>
                <div class="room-card-body">
                    <div class="room-detail-row"><span>Type</span><span>${r.type}</span></div>
                    <div class="room-detail-row"><span>Rate / Night</span><span>$${r.price_per_night}</span></div>
                    <div class="room-detail-row"><span>Capacity</span><span>${r.capacity} Guests</span></div>
                </div>
                <div class="room-card-footer">
                    <button class="btn btn-secondary btn-sm status-action-btn" data-id="${r.id}" data-status="Available">Set Available</button>
                    <button class="btn btn-secondary btn-sm status-action-btn" data-id="${r.id}" data-status="Cleaning">Set Cleaning</button>
                </div>
            </div>
        `;
    }).join('');
}

function attachRoomListeners(rooms, guests, container) {
    document.querySelectorAll('.status-action-btn').forEach(btn => {
        btn.onclick = async () => {
            const roomId = btn.dataset.id;
            const status = btn.dataset.status;
            await api.updateRoomStatus(roomId, status);
            showToast(`Room status updated to ${status}`);
            renderRoomsView(container);
        };
    });
}

function openBookingModal(rooms, guests, container) {
    openModal('Create New Booking', `
        <form id="bookingForm">
            <div class="form-group">
                <label class="form-label">Select Guest</label>
                <select class="form-control" name="guest_id" required>
                    ${guests.map(g => `<option value="${g.id}">${g.first_name} ${g.last_name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Select Room</label>
                <select class="form-control" name="room_id" required>
                    ${rooms.filter(r => r.status === 'Available').map(r => `<option value="${r.id}">Room ${r.room_number} - ${r.type} ($${r.price_per_night}/night)</option>`).join('')}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Check-In Date</label>
                    <input type="date" class="form-control" name="check_in_date" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Check-Out Date</label>
                    <input type="date" class="form-control" name="check_out_date" required>
                </div>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-primary">Confirm Booking</button>
            </div>
        </form>
    `, async (form) => {
        const data = Object.fromEntries(new FormData(form).entries());
        await api.createBooking(data);
        closeModal();
        showToast('Booking successfully created!');
        renderRoomsView(container);
    });
}