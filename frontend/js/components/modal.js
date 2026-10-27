export function openModal(title, htmlContent, onsubmit) {
    const overlay = document.getElementById('globalModal');
    const container = document.getElementById('modalContainer');

    container.innerHTML = `
        <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close" id="modalCloseBtn"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            ${htmlContent}
        </div>
    `;

    overlay.classList.add('active');

    const closeBtn = document.getElementById('modalCloseBtn');
    closeBtn.onclick = closeModal;

    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
    };

    if (onsubmit) {
        const form = container.querySelector('form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await onsubmit(form);
            };
        }
    }
}

export function closeModal() {
    const overlay = document.getElementById('globalModal');
    overlay.classList.remove('active');
}

export function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}