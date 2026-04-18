// Lost & Found items - mock data
export const lostFoundDatabase = {
    lost: [
        { id: 'L1', type: 'lost', title: 'Blue Backpack', description: 'Lost near library. Contains notebooks and a water bottle.', location: 'Main Library', date: '2025-02-05', image: '/Img/books/newArrival1.jpg', status: 'pending', reportedBy: 'student@college.edu' },
        { id: 'L2', type: 'lost', title: 'Silver Laptop Charger', description: 'Dell charger left in Lab 302.', location: 'Computer Lab 302', date: '2025-02-06', image: '/Img/books/mostViewed2.png', status: 'pending', reportedBy: 'user@mail.com' },
        { id: 'L3', type: 'lost', title: 'Keys with Keychain', description: 'Set of keys with a red keychain. Lost in cafeteria.', location: 'Cafeteria', date: '2025-02-07', image: '/Img/books/newArrival3.jpg', status: 'found', reportedBy: 'john@college.edu' },
        { id: 'L4', type: 'lost', title: 'Wallet - Brown Leather', description: 'Brown leather wallet with ID and cards.', location: 'Sports Ground', date: '2025-02-04', image: '/Img/books/nonfiction1.jpg', status: 'pending', reportedBy: 'student@college.edu' },
        { id: 'L5', type: 'lost', title: 'Wireless Earphones', description: 'White wireless earphones in a small case.', location: 'Auditorium', date: '2025-02-08', image: '/Img/books/mostViewed4.jpg', status: 'pending', reportedBy: 'user@mail.com' }
    ],
    found: [
        { id: 'F1', type: 'found', title: 'Umbrella - Black', description: 'Black umbrella found near gate.', location: 'Main Gate', date: '2025-02-06', image: '/Img/books/fiction1.jpg', status: 'claimed', reportedBy: 'staff@college.edu' },
        { id: 'F2', type: 'found', title: 'Water Bottle', description: 'Blue steel water bottle in canteen.', location: 'Canteen', date: '2025-02-07', image: '/Img/books/science1.jpg', status: 'unclaimed', reportedBy: 'student@college.edu' },
        { id: 'F3', type: 'found', title: 'Notebook - Physics', description: 'Physics notes notebook with name on first page.', location: 'Lecture Hall A', date: '2025-02-05', image: '/Img/books/newArrival2.jpg', status: 'unclaimed', reportedBy: 'user@mail.com' },
        { id: 'F4', type: 'found', title: 'ID Card', description: 'College ID card found in parking.', location: 'Parking Lot', date: '2025-02-08', image: '/Img/books/mostViewed3.jpg', status: 'unclaimed', reportedBy: 'staff@college.edu' }
    ]
};

export const getLostItems = () => lostFoundDatabase.lost;
export const getFoundItems = () => lostFoundDatabase.found;
export const getAllLostFound = () => [...lostFoundDatabase.lost, ...lostFoundDatabase.found];
export const getItemById = (id) => getAllLostFound().find(item => item.id === id);
