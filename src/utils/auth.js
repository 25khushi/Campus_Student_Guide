const KEY = 'student_portal_current_user';
const AUTH_EVENT = 'student_portal_auth_changed';

export const auth = {
    getCurrentUser() {
        try {
            const raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },
    setCurrentUser(user) {
        try {
            localStorage.setItem(KEY, JSON.stringify(user));
            window.dispatchEvent(new Event(AUTH_EVENT));
        } catch {
            // ignore
        }
    },
    clearCurrentUser() {
        try {
            localStorage.removeItem(KEY);
            window.dispatchEvent(new Event(AUTH_EVENT));
        } catch {
            // ignore
        }
    },
};

