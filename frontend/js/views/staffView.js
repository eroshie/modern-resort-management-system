import { api } from '../api.js';
import { openModal, closeModal, showToast } from '../components/modal.js';

export async function renderStaffView(container) {
    const { staff } = await api.getStaff();

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h1>Staff Operations & Tasks</h1>
                <p>Coordinate housekeeping, front desk operations, and shift schedules.</p>
            </div>
            <div class="view-actions">
                <button class="btn btn-primary" id="addStaffBtn"><i class="fa-solid fa-user-plus"></i> Add Staff Member</button>
            </div>
        </div>

        <div class="card">
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Staff ID</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${staff.map(s => {
                            const badge = s.status === 'On Duty' ? 'success' : s.status === 'Break' ? 'warning' : 'danger';
                            return `
                                <tr>
                                    <td>#${s.id}</td>
                                    <td><strong>${s.name}</strong></td>
                                    <td>${s.role}</td>
                                    <td>${s.department}</td>
                                    <td><span class="badge badge-${badge}">${s.status}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('addStaffBtn').onclick = () => {
        openModal('Add Staff Member', `
            <form id="addStaffForm">
                <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-control" name="name" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Role / Title</label>
                    <input type="text" class="form-control" name="role" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Department</label>
                    <select class="form-control" name="department">
                        <option value="Front Office">Front Office</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Guest Services">Guest Services</option>
                        <option value="Engineering">Engineering</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">Save Staff Member</button>
                </div>
            </form>
        `, async (form) => {
            const data = Object.fromEntries(new FormData(form).entries());
            await api.createStaff(data);
            closeModal();
            showToast('Staff member added successfully!');
            renderStaffView(container);
        });
    };
}