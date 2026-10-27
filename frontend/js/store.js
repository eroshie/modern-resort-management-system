// Global reactive state helper if needed
export const store = {
    currentRoute: 'dashboard',
    subscribers: [],

    subscribe(cb) {
        this.subscribers.push(cb);
    },

    notify() {
        this.subscribers.forEach(cb => cb(this.currentRoute));
    },

    setRoute(route) {
        this.currentRoute = route;
        this.notify();
    }
};