import { api } from '../api.js';
import { openModal, closeModal, showToast } from '../components/modal.js';

export async function renderBillingView(container) {
    const { invoices } = await api.getInvoices();
    const { guests } = await api.getGuests();

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h1>Billing & Invoices</h1>
                <p>Track guest folios, issue invoices, and process secure payments.</p>
            </div>
            <div class="view-actions">
                <button class="btn btn-primary" id="newInvoiceBtn"><i class="fa-solid fa-file-invoice"></i> Generate Invoice</button>
            </div>
        </div>

        <div class="card">
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Invoice ID</th>
                            <th>Booking ID</th>
                            <th>Guest</th>
                            <th>Issued Date</th>
                            <th>Amount Due</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoices.map(inv => {
                            const guest = guests.find(g => g.id === inv.guest_id) || { first_name: 'Guest', last_name: '' };
                            const isPaid = inv.status === 'Paid';
                            return `
                                <tr>
                                    <td>#${inv.id}</td>
                                    <td>#${inv.booking_id}</td>
                                    <td><strong>${guest.first_name} ${guest.last_name}</strong></td>
                                    <td>${inv.issued_date}</td>
                                    <td>$${inv.amount_due.toLocaleString()}</td>
                                    <td><span class="badge badge-${isPaid ? 'success' : 'warning'}">${inv.status}</span></td>
                                    <td>
                                        ${!isPaid ? `<button class="btn btn-success btn-sm pay-invoice-btn" data-id="${inv.id}">Mark Paid</button>` : `<span style="color: var(--text-muted); font-size: 13px;">Completed</span>`}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.querySelectorAll('.pay-invoice-btn').forEach(btn => {
        btn.onclick = async () => {
            const invId = btn.dataset.id;
            await api.payInvoice(invId);
            showToast('Invoice marked as paid!');
            renderBillingView(container);
        };
    });

    document.getElementById('newInvoiceBtn').onclick = () => {
        openModal('Generate New Invoice', `
            <form id="invoiceForm">
                <div class="form-group">
                    <label class="form-label">Guest</label>
                    <select class="form-control" name="guest_id">
                        ${guests.map(g => `<option value="${g.id}">${g.first_name} ${g.last_name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Booking ID</label>
                    <input type="number" class="form-control" name="booking_id" placeholder="1001" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Amount Due ($)</label>
                    <input type="number" step="0.01" class="form-control" name="amount_due" placeholder="450.00" required>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">Issue Invoice</button>
                </div>
            </form>
        `, async (form) => {
            const data = Object.fromEntries(new FormData(form).entries());
            await api.createInvoice(data);
            closeModal();
            showToast('Invoice generated successfully!');
            renderBillingView(container);
        });
    };
}