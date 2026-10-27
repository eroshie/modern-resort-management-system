import { initRouter } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Hash Router
    initRouter();

    // Mobile Sidebar Drawer Toggle
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

    if (sidebarToggle) {
        sidebarToggle.onclick = () => {
            sidebar.classList.add('mobile-open');
        };
    }

    if (sidebarCloseBtn) {
        sidebarCloseBtn.onclick = () => {
            sidebar.classList.remove('mobile-open');
        };
    }

    // Close mobile sidebar when clicking a nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = () => {
            sidebar.classList.remove('mobile-open');
        };
    });
});