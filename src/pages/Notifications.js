import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../utils/auth';
import { notificationStorage } from '../utils/storage';

const Notifications = () => {
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const refresh = () => {
            const u = auth.getCurrentUser();
            setUser(u);
            if (!u?.email) {
                setItems([]);
                return;
            }
            setItems(notificationStorage.getByUser(u.email));
        };
        refresh();
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
                <h1 className="page-title mb-2"><i className="fas fa-bell me-2"></i>Notifications</h1>
                <p className="text-center text-muted mb-4">Please login to see your notifications.</p>
                <hr className="page-divider" />
                <div className="text-center">
                    <Link to="/login" className="btn btn-primary">Go to Login</Link>
                </div>
            </div>
        );
    }

    const handleMarkAllRead = () => {
        notificationStorage.markAllReadForUser(user.email);
        setItems(notificationStorage.getByUser(user.email));
    };

    const handleMarkRead = (id) => {
        notificationStorage.markRead(id);
        setItems(notificationStorage.getByUser(user.email));
    };

    const unreadCount = items.filter((n) => !n.read).length;
    const visibleItems = filter === 'unread' ? items.filter((n) => !n.read) : items;

    return (
        <div className="container py-4">
            <h1 className="page-title mb-2"><i className="fas fa-bell me-2"></i>Notifications</h1>
            <p className="text-center text-muted mb-4">
                You have <strong>{unreadCount}</strong> unread notification{unreadCount === 1 ? '' : 's'}.
            </p>
            <hr className="page-divider" />

            <div className="row justify-content-center">
                <div className="col-lg-9">
                    <div className="card shadow">
                        <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div className="small text-muted">
                                <i className="fas fa-user-circle me-1"></i>{user.email}
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setFilter('all')}
                                >
                                    All
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setFilter('unread')}
                                >
                                    Unread
                                </button>
                                <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleMarkAllRead} disabled={items.length === 0 || unreadCount === 0}>
                                    Mark all as read
                                </button>
                                <Link to="/" className="btn btn-outline-secondary btn-sm">Back to Home</Link>
                            </div>
                        </div>
                        <div className="list-group list-group-flush">
                            {visibleItems.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="fas fa-inbox fa-3x mb-3"></i>
                                    <p className="mb-0">{items.length === 0 ? 'No notifications yet.' : 'No unread notifications.'}</p>
                                    <p className="small mb-0">When someone rents your book/notes or contacts you, it will show here.</p>
                                </div>
                            ) : (
                                visibleItems.map((n) => (
                                    <button
                                        key={n.id}
                                        type="button"
                                        className={`list-group-item list-group-item-action ${n.read ? '' : 'fw-semibold'}`}
                                        onClick={() => !n.read && handleMarkRead(n.id)}
                                    >
                                        <div className="d-flex justify-content-between gap-3">
                                            <div>
                                                <div className="d-flex align-items-center gap-2">
                                                    {!n.read && <span className="badge bg-danger">NEW</span>}
                                                    <span>{n.message}</span>
                                                </div>
                                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="text-muted small d-none d-md-block">
                                                {n.type || 'notification'}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;

