import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookStorage, noteStorage, activityStorage, announcementStorage } from '../utils/storage';
import { auth } from '../utils/auth';

const Home = () => {
    const [recentActivity, setRecentActivity] = useState([]);
    const [topBooks, setTopBooks] = useState([]);
    const [topNotes, setTopNotes] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    useEffect(() => {
        const user = auth.getCurrentUser();
        const email = user?.email || '';
        setCurrentUserEmail(email);
        setRecentActivity(email ? activityStorage.getByUser(email).slice(0, 8) : activityStorage.getRecent(8));

        const books = bookStorage.getAll()
            .slice()
            .sort((a, b) => (b.rentalCount || 0) - (a.rentalCount || 0))
            .slice(0, 3);
        setTopBooks(books);

        const notes = noteStorage.getAll()
            .slice()
            .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
            .slice(0, 3);
        setTopNotes(notes);

        setAnnouncements(announcementStorage.getAll().slice(0, 5));
    }, []);

    useEffect(() => {
        const refreshByUser = () => {
            const user = auth.getCurrentUser();
            const email = user?.email || '';
            setCurrentUserEmail(email);
            setRecentActivity(email ? activityStorage.getByUser(email).slice(0, 8) : activityStorage.getRecent(8));
        };
        window.addEventListener('student_portal_auth_changed', refreshByUser);
        window.addEventListener('storage', refreshByUser);
        return () => {
            window.removeEventListener('student_portal_auth_changed', refreshByUser);
            window.removeEventListener('storage', refreshByUser);
        };
    }, []);

    return (
        <div className="student-portal-home">
            {/* Hero + Summary */}
            <section className="hero-summary py-5">
                <div className="container">
                    <h1 className="text-center fw-bold mb-3" style={{ fontSize: '2rem', color: 'var(--primary)' }}>
                        <i className="fas fa-university me-2"></i>One Place for All Your College Needs
                    </h1>
                    <p className="text-center lead text-muted mx-auto mb-4" style={{ maxWidth: '700px' }}>
                        Lost something? Need a book? Looking for notes? Ride share, roommate, or study group? 
                        We help every student with everything in one website.
                    </p>
                    <hr className="page-divider" />
                </div>
            </section>

            {/* Summary cards - 4 main sections */}
            <section className="container pb-4">
                <h2 className="text-center fw-bold mb-4" style={{ color: 'var(--secondary)', fontSize: '1.35rem' }}>What we help with</h2>
                <div className="row g-4 mb-5">
                    <div className="col-md-6 col-lg-3">
                        <Link to="/lost-found" className="text-decoration-none">
                            <div className="card shadow h-100 summary-card border-0">
                                <div className="card-body text-center p-4">
                                    <div className="icon-wrap mb-3"><i className="fas fa-search fa-3x" style={{ color: 'var(--primary)' }}></i></div>
                                    <h5 className="fw-bold" style={{ color: 'var(--primary)' }}>Lost & Found</h5>
                                    <p className="small text-muted mb-0">Lost something? Report it with a photo. Found something? Submit it here. Track your report by ID.</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <Link to="/books" className="text-decoration-none">
                            <div className="card shadow h-100 summary-card border-0">
                                <div className="card-body text-center p-4">
                                    <div className="icon-wrap mb-3"><i className="fas fa-book fa-3x" style={{ color: 'var(--primary)' }}></i></div>
                                    <h5 className="fw-bold" style={{ color: 'var(--primary)' }}>Books</h5>
                                    <p className="small text-muted mb-0">Rent a book for the days you need (e.g. 5 days). Add your book for rent; students choose duration and get it.</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <Link to="/notes" className="text-decoration-none">
                            <div className="card shadow h-100 summary-card border-0">
                                <div className="card-body text-center p-4">
                                    <div className="icon-wrap mb-3"><i className="fas fa-sticky-note fa-3x" style={{ color: 'var(--primary)' }}></i></div>
                                    <h5 className="fw-bold" style={{ color: 'var(--primary)' }}>Notes</h5>
                                    <p className="small text-muted mb-0">Rent notes for X days or buy notes once. Add your notes for rent or sale; students choose rent or buy.</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <Link to="/student-help" className="text-decoration-none">
                            <div className="card shadow h-100 summary-card border-0">
                                <div className="card-body text-center p-4">
                                    <div className="icon-wrap mb-3"><i className="fas fa-hands-helping fa-3x" style={{ color: 'var(--primary)' }}></i></div>
                                    <h5 className="fw-bold" style={{ color: 'var(--primary)' }}>Student Help</h5>
                                    <p className="small text-muted mb-0">Ride share, find a roommate, study groups, tutoring, or any other help—all in one place.</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow border-0 p-4">
                            <h5 className="fw-bold mb-3" style={{ color: 'var(--primary)' }}><i className="fas fa-bolt me-2"></i>Quick actions</h5>
                            <div className="d-flex flex-wrap gap-2 justify-content-center">
                                <Link to="/report-lost" className="btn btn-outline-primary btn-sm">Report lost item</Link>
                                <Link to="/report-found" className="btn btn-outline-primary btn-sm">Report found item</Link>
                                <Link to="/track" className="btn btn-outline-primary btn-sm">Track my report</Link>
                                <Link to="/books" className="btn btn-outline-primary btn-sm">Rent a book</Link>
                                <Link to="/my-rentals" className="btn btn-outline-primary btn-sm">My book rentals</Link>
                                <Link to="/notes" className="btn btn-outline-primary btn-sm">Rent or buy notes</Link>
                                <Link to="/my-notes" className="btn btn-outline-primary btn-sm">My notes</Link>
                                <Link to="/student-help" className="btn btn-outline-primary btn-sm">Student help</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard sections */}
            <section className="container pb-5">
                <div className="row g-4">
                    {/* Recent activity */}
                    <div className="col-12 col-lg-5">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3" style={{ color: 'var(--primary)' }}>
                                    <i className="fas fa-stream me-2"></i>Recent activity
                                </h5>
                                {recentActivity.length === 0 ? (
                                    <p className="text-muted small mb-0">
                                        {currentUserEmail
                                            ? 'No activity in your account yet. Start by posting a book, notes, or a help request.'
                                            : 'No activity yet. Start by posting a book, notes, or a help request.'}
                                    </p>
                                ) : (
                                    <ul className="list-unstyled mb-0 home-activity-list">
                                        {recentActivity.map((a) => (
                                            <li key={a.id} className="home-activity-item">
                                                <span className="home-activity-dot" />
                                                <div className="home-activity-main">
                                                    <div className="small">{a.description}</div>
                                                    <div className="home-activity-meta small text-muted">
                                                        <i className="fas fa-clock me-1"></i>
                                                        {new Date(a.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Trending books & notes */}
                    <div className="col-12 col-lg-4">
                        <div className="card shadow-sm mb-3">
                            <div className="card-body">
                                <h6 className="fw-bold mb-2" style={{ color: 'var(--primary)' }}>
                                    <i className="fas fa-fire me-2"></i>Most rented books
                                </h6>
                                {topBooks.length === 0 ? (
                                    <p className="text-muted small mb-0">No rentals yet.</p>
                                ) : (
                                    <ul className="list-unstyled small mb-0">
                                        {topBooks.map((b) => (
                                            <li key={b.id} className="mb-2">
                                                <Link to="/books" className="text-decoration-none">
                                                    <strong>{b.title}</strong>
                                                </Link>
                                                <div className="text-muted">
                                                    {b.course} · {b.rentalCount || 0} rental{(b.rentalCount || 0) === 1 ? '' : 's'}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h6 className="fw-bold mb-2" style={{ color: 'var(--primary)' }}>
                                    <i className="fas fa-star me-2"></i>Most downloaded notes
                                </h6>
                                {topNotes.length === 0 ? (
                                    <p className="text-muted small mb-0">No notes downloaded yet.</p>
                                ) : (
                                    <ul className="list-unstyled small mb-0">
                                        {topNotes.map((n) => (
                                            <li key={n.id} className="mb-2">
                                                <Link to="/notes" className="text-decoration-none">
                                                    <strong>{n.topic}</strong>
                                                </Link>
                                                <div className="text-muted">
                                                    {n.subject} · {n.downloadCount || 0} download{(n.downloadCount || 0) === 1 ? '' : 's'}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="col-12 col-lg-3">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3" style={{ color: 'var(--primary)' }}>
                                    <i className="fas fa-bullhorn me-2"></i>Campus announcements
                                </h5>
                                {announcements.length === 0 ? (
                                    <p className="text-muted small mb-0">No announcements yet.</p>
                                ) : (
                                    <ul className="list-unstyled mb-0 small">
                                        {announcements.map((a) => (
                                            <li key={a.id} className="mb-2">
                                                <div className="fw-semibold">{a.title}</div>
                                                <div className="text-muted">
                                                    <i className="fas fa-calendar-alt me-1"></i>
                                                    {a.createdAt}
                                                </div>
                                                {a.body && <div className="text-muted">{a.body}</div>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
