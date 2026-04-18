// localStorage keys – no static data; everything from user actions
const KEYS = {
    BOOKS: 'student_portal_books',
    BOOK_RENTALS: 'student_portal_book_rentals',
    BOOK_PURCHASES: 'student_portal_book_purchases',
    NOTES: 'student_portal_notes',
    NOTE_RENTALS: 'student_portal_note_rentals',
    NOTE_PURCHASES: 'student_portal_note_purchases',
    HELP: 'student_portal_help',
    NOTIFICATIONS: 'student_portal_notifications',
    BOOKMARKS: 'student_portal_bookmarks',
    ACTIVITY: 'student_portal_activity',
    ANNOUNCEMENTS: 'student_portal_announcements',
    NOTE_COMMENTS: 'student_portal_note_comments',
};

const get = (key) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const set = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Storage set failed', e);
    }
};

export const bookStorage = {
    getAll: () => get(KEYS.BOOKS),
    add: (book) => {
        const list = bookStorage.getAll();
        const id = 'B' + Date.now();
        list.push({ ...book, id, rentalCount: book.rentalCount || 0 });
        set(KEYS.BOOKS, list);
        return id;
    },
    getById: (id) => bookStorage.getAll().find((b) => b.id === id),
    incrementRentalCount: (bookId) => {
        const list = bookStorage.getAll();
        const idx = list.findIndex((b) => b.id === bookId);
        if (idx !== -1) {
            list[idx].rentalCount = (list[idx].rentalCount || 0) + 1;
            set(KEYS.BOOKS, list);
        }
    },
};

export const bookRentalStorage = {
    getAll: () => get(KEYS.BOOK_RENTALS),
    getByEmail: (email) => bookRentalStorage.getAll().filter((r) => (r.studentEmail || '').toLowerCase() === (email || '').toLowerCase()),
    add: (rental) => {
        const list = bookRentalStorage.getAll();
        const id = 'R' + Date.now();
        list.push({ ...rental, id });
        set(KEYS.BOOK_RENTALS, list);
        return id;
    },
};

export const bookPurchaseStorage = {
    getAll: () => get(KEYS.BOOK_PURCHASES),
    getByEmail: (email) => bookPurchaseStorage.getAll().filter((p) => (p.studentEmail || '').toLowerCase() === (email || '').toLowerCase()),
    add: (purchase) => {
        const list = bookPurchaseStorage.getAll();
        const id = 'BP' + Date.now();
        list.push({ ...purchase, id });
        set(KEYS.BOOK_PURCHASES, list);
        return id;
    },
};

export const noteStorage = {
    getAll: () => get(KEYS.NOTES),
    add: (note) => {
        const list = noteStorage.getAll();
        const id = 'N' + Date.now();
        list.push({ ...note, id, downloadCount: note.downloadCount || 0, uploadedAt: note.uploadedAt || new Date().toISOString().slice(0, 10) });
        set(KEYS.NOTES, list);
        return id;
    },
    getById: (id) => noteStorage.getAll().find((n) => n.id === id),
    incrementDownloadCount: (noteId) => {
        const list = noteStorage.getAll();
        const idx = list.findIndex((n) => n.id === noteId);
        if (idx !== -1) {
            list[idx].downloadCount = (list[idx].downloadCount || 0) + 1;
            set(KEYS.NOTES, list);
        }
    },
};

export const noteRentalStorage = {
    getAll: () => get(KEYS.NOTE_RENTALS),
    getByEmail: (email) => noteRentalStorage.getAll().filter((r) => (r.studentEmail || '').toLowerCase() === (email || '').toLowerCase()),
    add: (rental) => {
        const list = noteRentalStorage.getAll();
        const id = 'NR' + Date.now();
        list.push({ ...rental, id });
        set(KEYS.NOTE_RENTALS, list);
        return id;
    },
};

export const notePurchaseStorage = {
    getAll: () => get(KEYS.NOTE_PURCHASES),
    getByEmail: (email) => notePurchaseStorage.getAll().filter((p) => (p.studentEmail || '').toLowerCase() === (email || '').toLowerCase()),
    add: (purchase) => {
        const list = notePurchaseStorage.getAll();
        const id = 'NP' + Date.now();
        list.push({ ...purchase, id });
        set(KEYS.NOTE_PURCHASES, list);
        return id;
    },
};

export const helpStorage = {
    getAll: () => get(KEYS.HELP),
    add: (post) => {
        const list = helpStorage.getAll();
        const id = 'H' + Date.now();
        list.push({
            ...post,
            id,
            date: new Date().toISOString().slice(0, 10),
            members: post.members || 0,
            ratingAverage: post.ratingAverage || 0,
            ratingCount: post.ratingCount || 0,
        });
        set(KEYS.HELP, list);
        return id;
    },
    update: (id, updater) => {
        const list = helpStorage.getAll();
        const idx = list.findIndex((p) => p.id === id);
        if (idx !== -1) {
            list[idx] = updater(list[idx]);
            set(KEYS.HELP, list);
        }
    },
};

export const lostFoundStorage = {
    getAll: () => get('student_portal_lost_found'),
    getLost: () => lostFoundStorage.getAll().filter((item) => item.type === 'lost'),
    getFound: () => lostFoundStorage.getAll().filter((item) => item.type === 'found'),
    findMatchingLostForFound: ({ title, location }) => {
        const qTitle = (title || '').trim().toLowerCase();
        const qLocation = (location || '').trim().toLowerCase();
        if (!qTitle) return [];
        return lostFoundStorage.getLost().filter((item) => {
            const t = (item.title || '').toLowerCase();
            const loc = (item.location || '').toLowerCase();
            const titleMatch = t.includes(qTitle) || qTitle.includes(t);
            const locationMatch = !qLocation || loc.includes(qLocation) || qLocation.includes(loc);
            return titleMatch && locationMatch;
        });
    },
    add: (item) => {
        const list = lostFoundStorage.getAll();
        const id = (item.type === 'lost' ? 'L' : 'F') + Date.now();
        const newItem = {
            ...item,
            id,
            date: new Date().toISOString().slice(0, 10),
            status: item.type === 'lost' ? 'pending' : 'unclaimed',
            image: item.image || '/Img/books/newArrival1.jpg', // fallback image
        };
        list.push(newItem);
        set('student_portal_lost_found', list);
        return id;
    },
    getById: (id) => lostFoundStorage.getAll().find((item) => item.id === id),
    updateStatus: (id, newStatus) => {
        const list = lostFoundStorage.getAll();
        const index = list.findIndex((item) => item.id === id);
        if (index !== -1) {
            list[index].status = newStatus;
            set('student_portal_lost_found', list);
        }
    },
};

export const notificationStorage = {
    getAll: () => get(KEYS.NOTIFICATIONS),
    getByUser: (email) => notificationStorage.getAll().filter((n) => (n.toEmail || '').toLowerCase() === (email || '').toLowerCase()),
    add: (notification) => {
        const list = notificationStorage.getAll();
        const id = 'NT' + Date.now();
        list.unshift({
            id,
            createdAt: new Date().toISOString(),
            read: false,
            ...notification,
        });
        set(KEYS.NOTIFICATIONS, list);
        return id;
    },
    markRead: (id) => {
        const list = notificationStorage.getAll();
        const idx = list.findIndex((n) => n.id === id);
        if (idx !== -1) {
            list[idx].read = true;
            set(KEYS.NOTIFICATIONS, list);
        }
    },
    markAllReadForUser: (email) => {
        const list = notificationStorage.getAll();
        const lower = (email || '').toLowerCase();
        let changed = false;
        const updated = list.map((n) => {
            if ((n.toEmail || '').toLowerCase() === lower && !n.read) {
                changed = true;
                return { ...n, read: true };
            }
            return n;
        });
        if (changed) set(KEYS.NOTIFICATIONS, updated);
    },
};

export const bookmarkStorage = {
    getAll: () => get(KEYS.BOOKMARKS),
    getByUser: (email) => bookmarkStorage.getAll().filter((b) => (b.userEmail || '').toLowerCase() === (email || '').toLowerCase()),
    isBookmarked: (userEmail, type, itemId) => {
        const lower = (userEmail || '').toLowerCase();
        return !!bookmarkStorage.getAll().find(
            (b) => (b.userEmail || '').toLowerCase() === lower && b.type === type && b.itemId === itemId
        );
    },
    toggle: (userEmail, type, itemId) => {
        const list = bookmarkStorage.getAll();
        const lower = (userEmail || '').toLowerCase();
        const idx = list.findIndex(
            (b) => (b.userEmail || '').toLowerCase() === lower && b.type === type && b.itemId === itemId
        );
        if (idx !== -1) {
            list.splice(idx, 1);
        } else {
            list.push({
                id: 'BM' + Date.now(),
                userEmail,
                type,
                itemId,
                createdAt: new Date().toISOString(),
            });
        }
        set(KEYS.BOOKMARKS, list);
    },
};

export const activityStorage = {
    getAll: () => get(KEYS.ACTIVITY),
    getRecent: (limit = 10) => activityStorage.getAll().slice(0, limit),
    getByUser: (email) => {
        const lower = (email || '').toLowerCase();
        return activityStorage.getAll().filter((a) => (a.userEmail || '').toLowerCase() === lower);
    },
    log: (activity) => {
        const list = activityStorage.getAll();
        const id = 'A' + Date.now();
        list.unshift({
            id,
            createdAt: new Date().toISOString(),
            ...activity,
        });
        set(KEYS.ACTIVITY, list);
        return id;
    },
};

export const announcementStorage = {
    getAll: () => get(KEYS.ANNOUNCEMENTS),
    add: (announcement) => {
        const list = announcementStorage.getAll();
        const id = 'AN' + Date.now();
        list.unshift({
            id,
            createdAt: new Date().toISOString().slice(0, 10),
            ...announcement,
        });
        set(KEYS.ANNOUNCEMENTS, list);
        return id;
    },
};

export const noteCommentStorage = {
    getByNoteId: (noteId) => {
        const all = get(KEYS.NOTE_COMMENTS);
        return all.filter((c) => c.noteId === noteId);
    },
    add: (noteId, comment) => {
        const all = get(KEYS.NOTE_COMMENTS);
        const id = 'NC' + Date.now();
        all.push({
            id,
            noteId,
            createdAt: new Date().toISOString(),
            ...comment,
        });
        set(KEYS.NOTE_COMMENTS, all);
        return id;
    },
};

