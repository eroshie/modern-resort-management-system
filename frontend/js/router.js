import { store } from './store.js';
import { renderDashboardView } from './views/dashboardView.js';
import { renderRoomsView } from './views/roomsView.js';
import { renderGuestsView } from './views/guestsView.js';
import { renderStaffView } from './views/staffView.js';
import { renderAmenitiesView } from './views/amenitiesView.js';
import { renderBillingView } from './views/billingView.js';

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
}

async function handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    store.setRoute(hash);

    // Highlight active sidebar item
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.route === hash) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    const container = document.getElementById('mainContent');
    container.innerHTML = '<div style="text-align:center; padding: 60px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>';

    switch (hash) {
        case 'dashboard':
            await renderDashboardView(container);
            break;
        case 'rooms':
            await renderRoomsView(container);
            break;
        case 'guests':
            await renderGuestsView(container);
            break;
        case 'staff':
            await renderStaffView(container);
            break;
        case 'amenities':
            await renderAmenitiesView(container);
            break;
        case 'billing':
            await renderBillingView(container);
            break;
        default:
            window.location.hash = '#dashboard';
            break;
    }
}