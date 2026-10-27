import { api } from '../api.js';
import { openModal, closeModal, showToast } from '../components/modal.js';

export async function renderGuestsView(container) {
    const { guests } = await api.getGuests();

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h1>Guest Directory</h1>
                <p>Manage guest profiles, contact records, and loyalty reward points.</p>
            </div>
            <div class="view-actions">
                <button class="btn btn-primary" id="registerGuestBtn"><i class="fa-solid fa-user-plus"></i> Register Guest</button>
            </div>
        </div>

        <div class="filter-bar">
            <div class="search-input-group">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Search guests by name or email..." id="guestSearchInput">
            </div>
        </div>

        <div class="card">
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Guest ID</th>
                            <th>Full Name</th>
                            <th>Email Address</th>
                            <th>Phone Number</th>
                            <th>Loyalty Points</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="guestsTableBody">
                        ${renderGuestRows(guests)}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const searchInput = document.getElementById('guestSearchInput');
    searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = guests.filter(g => 
            g.first_name.toLowerCase().includes(query) || 
            g.last_name.toLowerCase().includes(query) || 
            g.email.toLowerCase().includes(query)
        );
        document.getElementById('guestsTableBody').innerHTML = renderGuestRows(filtered);
    };

    document.getElementById('registerGuestBtn').onclick = () => {
        openModal('Register New Guest', `
            <form id="registerGuestForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">First Name</label>
                        <input type="text" class="form-control" name="first_name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Last Name</label>
                        <input type="text" class="form-control" name="last_name" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-control" name="email" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input type="text" class="form-control" name="phone" required>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">Save Guest</button>
                </div>
            </form>
        `, async (form) => {
            const data = Object.fromEntries(new FormData(form).entries());
            await api.createGuest(data);
            closeModal();
            showToast('Guest registered successfully!');
            renderGuestsView(container);
        });
    };
}

function renderGuestRows(guests) {
    if (guests.length === 0) {
        return `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">No guests found.</td></tr>`;
    }
    return guests.map(g => `
        <tr>
            <td>#${g.id}</td>
            <td><strong>${g.first_name} ${g.last_name}</strong></td>
            <td>${g.email}</td>
            <td>${g.phone}</td>
            <td><span class="badge badge-info"><i class="fa-solid fa-award" style="margin-right:4px;"></i> ${g.loyalty_points} pts</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="alert('Viewing history for ${g.first_name} ${g.last_name}')">Profile</button>
            </td>
        </tr>
    `).join('');
}