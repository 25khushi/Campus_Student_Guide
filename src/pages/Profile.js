import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../utils/auth';
import { bookStorage, noteStorage, lostFoundStorage, helpStorage, bookmarkStorage, activityStorage } from '../utils/storage';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [lostFound, setLostFound] = useState([]);
    const [helpPosts, setHelpPosts] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [activity, setActivity] = useState([]);
    const [activeSection, setActiveSection] = useState('overview');

    const loadUserData = () => {
        const u = auth.getCurrentUser();
        setUser(u);
        if (!u?.email) return;
        const email = u.email.toLowerCase();
        setBooks(bookStorage.getAll().filter((b) => (b.contact || '').toLowerCase() === email));
        setNotes(noteStorage.getAll().filter((n) => (n.contact || '').toLowerCase() === email));
        setLostFound(lostFoundStorage.getAll().filter((i) => (i.contact || '').toLowerCase() === email));
        setHelpPosts(helpStorage.getAll().filter((p) => (p.contact || '').toLowerCase() === email));
        setBookmarks(bookmarkStorage.getByUser(email));
        setActivity(activityStorage.getByUser(email).slice(0, 10));
    };

    useEffect(() => {
        loadUserData();
        const refresh = () => loadUserData();
        window.addEventListener('student_portal_auth_changed', refresh);
        window.addEventListener('storage', refresh);
        return () => {
            window.removeEventListener('student_portal_auth_changed', refresh);
            window.removeEventListener('storage', refresh);
        };
    }, []);

    if (!user?.email) {
        return (
            <div className="container py-4">
                <h1 className="page-title mb-2"><i className="fas fa-user me-2"></i>Your Profile</h1>
                <p className="text-center text-muted mb-4">Please login to view your profile and activity.</p>
                <hr className="page-divider" />
                <div className="text-center">
                    <Link to="/login" className="btn btn-primary">Go to Login</Link>
                </div>
            </div>
        );
    }

    const email = user.email;
    const totals = {
        books: books.length,
        notes: notes.length,
        lostFound: lostFound.length,
        help: helpPosts.length,
        bookmarks: bookmarks.length,
    };

    const SectionButton = ({ id, icon, label }) => (
        <button
            type="button"
            className={`btn btn-sm ${activeSection === id ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveSection(id)}
        >
            <i className={`fas ${icon} me-1`}></i>{label}
        </button>
    );

    return (
        <div className="container py-4">
            <h1 className="page-title mb-2"><i className="fas fa-user me-2"></i>Your Profile</h1>
            <p className="text-center text-muted mb-4">See your own posts, reports, bookmarks, and recent activity.</p>
            <hr className="page-divider" />

            <div className="row justify-content-center mb-4">
                <div className="col-lg-10">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 14,
                                            background: 'rgba(139, 111, 71, 0.12)',
                                            color: 'var(--primary)',
                                            fontWeight: 800,
                                            fontSize: '1.2rem',
                                        }}
                                    >
                                        {(email || '?').trim().charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="fw-bold" style={{ fontSize: '1.05rem' }}>Student account</div>
                                        <div className="text-muted small"><i className="fas fa-envelope me-1"></i>{email}</div>
                                    </div>
                                </div>

                                <div className="d-flex flex-wrap gap-2">
                                    <span className="badge bg-light text-dark">Books: {totals.books}</span>
                                    <span className="badge bg-light text-dark">Notes: {totals.notes}</span>
                                    <span className="badge bg-light text-dark">Lost/Found: {totals.lostFound}</span>
                                    <span className="badge bg-light text-dark">Help: {totals.help}</span>
                                    <span className="badge bg-light text-dark">Saved: {totals.bookmarks}</span>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
                                <SectionButton id="overview" icon="fa-th-large" label="Overview" />
                                <SectionButton id="books" icon="fa-book" label="My Books" />
                                <SectionButton id="notes" icon="fa-sticky-note" label="My Notes" />
                                <SectionButton id="lostfound" icon="fa-search" label="Lost & Found" />
                                <SectionButton id="help" icon="fa-hands-helping" label="Student Help" />
                                <SectionButton id="saved" icon="fa-bookmark" label="Saved" />
                                <SectionButton id="activity" icon="fa-stream" label="Activity" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-10">
                    {activeSection === 'overview' && (
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="card shadow h-100">
                                    <div className="card-body">
                                        <h5 className="fw-bold mb-2" style={{ color: 'var(--primary)' }}>
                                            <i className="fas fa-book me-2"></i>Books you listed
                                        </h5>
                                        {books.length === 0 ? (
                                            <p className="small text-muted mb-0">You have not listed any books yet.</p>
                                        ) : (
                                            <ul className="list-group list-group-flush small">
                                                {books.slice(0, 5).map((b) => (
                                                    <li key={b.id} className="list-group-item px-0">
                                                        <strong>{b.title}</strong> {b.course && <>({b.course})</>} · ₹{b.rentPerDay}/day
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <div className="mt-3">
                                            <Link to="/books" className="btn btn-outline-primary btn-sm">Go to Books</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card shadow h-100">
                                    <div className="card-body">
                                        <h5 className="fw-bold mb-2" style={{ color: 'var(--primary)' }}>
                                            <i className="fas fa-sticky-note me-2"></i>Notes you uploaded
                                        </h5>
                                        {notes.length === 0 ? (
                                            <p className="small text-muted mb-0">You have not uploaded any notes yet.</p>
                                        ) : (
                                            <ul className="list-group list-group-flush small">
                                                {notes.slice(0, 5).map((n) => (
                                                    <li key={n.id} className="list-group-item px-0">
                                                        <strong>{n.topic}</strong> ({n.subject}) · Sem {n.semester} · downloads: {n.downloadCount || 0}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <div className="mt-3">
                                            <Link to="/notes" className="btn btn-outline-primary btn-sm">Go to Notes</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card shadow h-100">
                                    <div className="card-body">
                                        <h5 className="fw-bold mb-2" style={{ color: 'var(--primary)' }}>
                                            <i className="fas fa-search me-2"></i>Lost & Found reports
                                        </h5>
                                        {lostFound.length === 0 ? (
                                            <p className="small text-muted mb-0">You have not submitted any lost or found reports yet.</p>
                                        ) : (
                                            <ul className="list-group list-group-flush small">
                                                {lostFound.slice(0, 5).map((i) => (
                                                    <li key={i.id} className="list-group-item px-0">
                                                        <span className={`badge me-1 ${i.type === 'lost' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                            {i.type === 'lost' ? 'Lost' : 'Found'}
                                                        </span>
                                                        <strong>{i.title}</strong> · {i.location} · {i.status}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <div className="mt-3">
                                            <Link to="/lost-found" className="btn btn-outline-primary btn-sm">Go to Lost & Found</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card shadow h-100">
                                    <div className="card-body">
                                        <h5 className="fw-bold mb-2" style={{ color: 'var(--primary)' }}>
                                            <i className="fas fa-hands-helping me-2"></i>Student help posts
                                        </h5>
                                        {helpPosts.length === 0 ? (
                                            <p className="small text-muted mb-0">You have not created any student help posts yet.</p>
                                        ) : (
                                            <ul className="list-group list-group-flush small">
                                                {helpPosts.slice(0, 5).map((p) => (
                                                    <li key={p.id} className="list-group-item px-0">
                                                        <span className="badge bg-secondary me-1">{p.category}</span>
                                                        <strong>{p.title}</strong> · {p.date}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <div className="mt-3">
                                            <Link to="/student-help" className="btn btn-outline-primary btn-sm">Go to Student Help</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'books' && (
                        <div className="card shadow">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3" style={{ color: 'var(--primary)' }}>
                                    <i className="fas fa-book me-2"></i>My Books
                                </h5>
                                {books.length === 0 ? (
                                    <p className="small text-muted mb-0">You have not listed any books yet.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Subject</th>
                                                    <th>Rent/day</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {books.map((b) => (
                                                    <tr key={b.id}>
                                                        <td className="fw-semibold">{b.title}</td>
                                                        <td>{b.course || '—'}</td>
                                                        <td>₹{b.rentPerDay}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'notes' && (
                        <div className="card shadow">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3" style={{ color: 'var(--primary)' }}>
                                    <i className="fas fa-sticky-note me-2"></i>My Notes
                                </h5>
                                {notes.length === 0 ? (
                                    <p className="small text-muted mb-0">You have not uploaded any notes yet.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Topic</th>
                                                    <th>Subject</th>
                                                    <th>Sem</th>
                                                    <th>Downloads</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {notes.map((n) => (
                                                    <tr key={n.id}>
                                                        <td className="fw-semibold">{n.topic}</td>
                                                        <td>{n.subject}</td>
                                                        <td>{n.semester}</td>
                                                        <td>{n.downloadCount || 0}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'lostfound' && (
                        <div className="card shadow">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3" style={{ color: 'var(--primary)' }}>
                                    <i className="fas fa-search me-2"></i>My Lost & Found Reports
                                </h5>
                                {lostFound.length === 0 ? (
                                    <p className="small text-muted mb-0">You have not submitted any lost or found reports yet.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm align-middle">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Type</th>
                                                    <th>Title</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lostFound.map((i) => (
                                                    <tr key={i.id}>
                                                        <td><code>{i.id}</code></td>
                                                        <td>
                                                            <span className={`badge ${i.type === 'lost' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                                {i.type === 'lost' ? 'Lost' : 'Found'}
                                                            </span>
                                                        </td>
                                                        <td className="fw-semibold">{i.title}</td>
                                                        <td>{i.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'help' && (
                        <div className="card shadow">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3" style={{ color: 'var(--primary)' }}>
                                    <i className="fas fa-hands-helping me-2"></i>My Student Help Posts
                                </h5>
                                {helpPosts.length === 0 ? (
                                    <p className="small text-muted mb-0">You have not created any student help posts yet.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Category</th>
                                                    <th>Title</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {helpPosts.map((p) => (
                                                    <tr key={p.id}>
                                                        <td><span className="badge bg-secondary">{p.category}</span></td>
                                                        <td className="fw-semibold">{p.title}</td>
                                                        <td>{p.date}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'saved' && (
                        <div className="card shadow">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3" style={{ color: 'var(--primary)' }}>
                                    <i className="fas fa-bookmark me-2"></i>Saved items
                                </h5>
                                {bookmarks.length === 0 ? (
                                    <p className="small text-muted mb-0">You have no bookmarks yet.</p>
                                ) : (
                                    <ul className="list-group small">
                                        {bookmarks.map((b) => (
                                            <li key={b.id} className="list-group-item d-flex justify-content-between">
                                                <span>
                                                    <span className="badge bg-light text-dark me-2">{b.type}</span>
                                                    Item ID: <code>{b.itemId}</code>
                                                </span>
                                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                    {new Date(b.createdAt).toLocaleString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'activity' && (
                        <div className="card shadow">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3" style={{ color: 'var(--primary)' }}>
                                    <i className="fas fa-stream me-2"></i>Recent activity
                                </h5>
                                {activity.length === 0 ? (
                                    <p className="small text-muted mb-0">No recent activity.</p>
                                ) : (
                                    <ul className="list-group small">
                                        {activity.map((a) => (
                                            <li key={a.id} className="list-group-item">
                                                <div>{a.description}</div>
                                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                    {new Date(a.createdAt).toLocaleString()}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;

