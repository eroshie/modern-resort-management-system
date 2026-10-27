import { api } from '../api.js';
import { openModal, closeModal, showToast } from '../components/modal.js';

export async function renderAmenitiesView(container) {
    const { services } = await api.getServices();
    const { guests } = await api.getGuests();

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h1>Amenity & Service Reservations</h1>
                <p>Manage spa bookings, fine dining reservations, and private excursions.</p>
            </div>
            <div class="view-actions">
                <button class="btn btn-primary" id="bookServiceBtn"><i class="fa-solid fa-spa"></i> Reserve Service</button>
            </div>
        </div>

        <div class="card">
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Reservation ID</th>
                            <th>Service Name</th>
                            <th>Category</th>
                            <th>Guest</th>
                            <th>Reservation Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${services.map(s => {
                            const guest = guests.find(g => g.id === s.guest_id) || { first_name: 'Guest', last_name: '' };
                            return `
                                <tr>
                                    <td>#${s.id}</td>
                                    <td><strong>${s.name}</strong></td>
                                    <td><span class="badge badge-info">${s.category}</span></td>
                                    <td>${guest.first_name} ${guest.last_name}</td>
                                    <td>${s.reservation_time}</td>
                                    <td><span class="badge badge-success">${s.status}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('bookServiceBtn').onclick = () => {
        openModal('Reserve Amenity or Service', `
            <form id="serviceForm">
                <div class="form-group">
                    <label class="form-label">Service / Amenity Name</label>
                    <input type="text" class="form-control" name="name" placeholder="e.g. Couples Hot Stone Massage" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select class="form-control" name="category">
                        <option value="Spa">Spa</option>
                        <option value="Dining">Dining</option>
                        <option value="Excursion">Excursion</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Guest</label>
                    <select class="form-control" name="guest_id">
                        ${guests.map(g => `<option value="${g.id}">${g.first_name} ${g.last_name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Reservation Date & Time</label>
                    <input type="datetime-local" class="form-control" name="reservation_time" required>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">Confirm Reservation</button>
                </div>
            </form>
        `, async (form) => {
            const data = Object.fromEntries(new FormData(form).entries());
            await api.createService(data);
            closeModal();
            showToast('Amenity reserved successfully!');
            renderAmenitiesView(container);
        });
    };
}