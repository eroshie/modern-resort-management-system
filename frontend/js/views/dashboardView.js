import { api } from '../api.js';
import { openModal, closeModal, showToast } from '../components/modal.js';

export async function renderDashboardView(container) {
    const analytics = await api.getAnalytics();
    const { bookings } = await api.getBookings();
    const { rooms } = await api.getRooms();
    const { guests } = await api.getGuests();

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h1>Resort Overview</h1>
                <p>Welcome back, Alexander. Here is what's happening at Aura Resort today.</p>
            </div>
            <div class="view-actions" style="display:flex; gap: 12px;">
                <button class="btn btn-secondary" id="quickCheckInBtn"><i class="fa-solid fa-right-to-bracket"></i> Quick Check-In</button>
                <button class="btn btn-primary" id="newBookingBtn"><i class="fa-solid fa-plus"></i> New Booking</button>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-content">
                    <h3>Occupancy Rate</h3>
                    <div class="kpi-value">${analytics.occupancy_rate}%</div>
                    <div class="kpi-trend positive"><i class="fa-solid fa-arrow-trend-up"></i> +4.2% from last week</div>
                </div>
                <div class="kpi-icon blue"><i class="fa-solid fa-chart-pie"></i></div>
            </div>
            <div class="kpi-card">
                <div class="kpi-content">
                    <h3>Total Revenue</h3>
                    <div class="kpi-value">$${analytics.total_revenue.toLocaleString()}</div>
                    <div class="kpi-trend positive"><i class="fa-solid fa-arrow-trend-up"></i> +12.8% vs last month</div>
                </div>
                <div class="kpi-icon green"><i class="fa-solid fa-dollar-sign"></i></div>
            </div>
            <div class="kpi-card">
                <div class="kpi-content">
                    <h3>Active Guests</h3>
                    <div class="kpi-value">${analytics.active_guests}</div>
                    <div class="kpi-trend positive"><i class="fa-solid fa-user-group"></i> Currently checked in</div>
                </div>
                <div class="kpi-icon amber"><i class="fa-solid fa-users"></i></div>
            </div>
            <div class="kpi-card">
                <div class="kpi-content">
                    <h3>Available Rooms</h3>
                    <div class="kpi-value">${rooms.filter(r => r.status === 'Available').length} / ${rooms.length}</div>
                    <div class="kpi-trend positive"><i class="fa-solid fa-door-open"></i> Ready for allocation</div>
                </div>
                <div class="kpi-icon indigo"><i class="fa-solid fa-hotel"></i></div>
            </div>
        </div>

        <!-- Chart & Quick Status Grid -->
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Weekly Occupancy Trend</h3>
                </div>
                <div style="position: relative; height: 260px;">
                    <canvas id="occupancyChart"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Room Status Breakdown</h3>
                </div>
                <div style="display:flex; flex-direction:column; gap: 16px; justify-content: center; height: 260px;">
                    ${renderRoomStatusBars(rooms)}
                </div>
            </div>
        </div>

        <!-- Recent Bookings Table -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Recent Bookings</h3>
                <a href="#rooms" class="btn btn-secondary btn-sm">View All Rooms</a>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Guest Name</th>
                            <th>Room</th>
                            <th>Check-In</th>
                            <th>Check-Out</th>
                            <th>Status</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bookings.map(b => {
                            const guest = guests.find(g => g.id === b.guest_id) || { first_name: 'Unknown', last_name: '' };
                            const room = rooms.find(r => r.id === b.room_id) || { room_number: 'N/A' };
                            return `
                                <tr>
                                    <td>#${b.id}</td>
                                    <td><strong>${guest.first_name} ${guest.last_name}</strong></td>
                                    <td>Room ${room.room_number}</td>
                                    <td>${b.check_in_date}</td>
                                    <td>${b.check_out_date}</td>
                                    <td><span class="badge badge-${b.status === 'Confirmed' ? 'success' : 'warning'}">${b.status}</span></td>
                                    <td>$${b.total_amount}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Render Chart.js Occupancy Chart
    const ctx = document.getElementById('occupancyChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Occupancy Rate (%)',
                data: [65, 70, 78, 85, 92, 98, 90],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 100 },
                x: { grid: { display: false } }
            }
        }
    });

    // Event Listeners for Quick Action Buttons
    document.getElementById('newBookingBtn').onclick = () => openBookingModal(rooms, guests, container);
    document.getElementById('quickCheckInBtn').onclick = () => openBookingModal(rooms, guests, container);
}

function renderRoomStatusBars(rooms) {
    const total = rooms.length;
    const available = rooms.filter(r => r.status === 'Available').length;
    const occupied = rooms.filter(r => r.status === 'Occupied').length;
    const cleaning = rooms.filter(r => r.status === 'Cleaning').length;

    const getPct = (val) => total > 0 ? (val / total) * 100 : 0;

    return `
        <div>
            <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:6px;">
                <span>Available</span><span>${available} Rooms</span>
            </div>
            <div style="background:var(--surface); height:8px; border-radius:4px; overflow:hidden;">
                <div style="background:var(--success); width:${getPct(available)}%; height:100%;"></div>
            </div>
        </div>
        <div>
            <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:6px;">
                <span>Occupied</span><span>${occupied} Rooms</span>
            </div>
            <div style="background:var(--surface); height:8px; border-radius:4px; overflow:hidden;">
                <div style="background:var(--primary); width:${getPct(occupied)}%; height:100%;"></div>
            </div>
        </div>
        <div>
            <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:6px;">
                <span>Cleaning / Maintenance</span><span>${cleaning} Rooms</span>
            </div>
            <div style="background:var(--surface); height:8px; border-radius:4px; overflow:hidden;">
                <div style="background:var(--warning); width:${getPct(cleaning)}%; height:100%;"></div>
            </div>
        </div>
    `;
}

function openBookingModal(rooms, guests, container) {
    openModal('Create New Booking', `
        <form id="bookingForm">
            <div class="form-group">
                <label class="form-label">Select Guest</label>
                <select class="form-control" name="guest_id" required>
                    ${guests.map(g => `<option value="${g.id}">${g.first_name} ${g.last_name} (${g.email})</option>`).join('')}
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
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        await api.createBooking(data);
        closeModal();
        showToast('Booking successfully created!');
        renderDashboardView(container);
    });
}