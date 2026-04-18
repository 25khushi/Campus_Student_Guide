import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../utils/auth';
import { notificationStorage } from '../utils/storage';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const refreshUserAndUnread = () => {
        const user = auth.getCurrentUser();
        setCurrentUser(user);
        if (user?.email) {
            setUnreadCount(notificationStorage.getByUser(user.email).filter((n) => !n.read).length);
        } else {
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        refreshUserAndUnread();

        const onAuthChange = () => refreshUserAndUnread();
        window.addEventListener('student_portal_auth_changed', onAuthChange);
        window.addEventListener('storage', onAuthChange);
        return () => {
            window.removeEventListener('student_portal_auth_changed', onAuthChange);
            window.removeEventListener('storage', onAuthChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // refresh when route changes (e.g. after login redirect)
        refreshUserAndUnread();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const handleLogout = () => {
        auth.clearCurrentUser();
        setCurrentUser(null);
        setUnreadCount(0);
        navigate('/');
    };

    return (
        <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container-fluid px-4">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <i className="fas fa-user-graduate me-2 fa-lg"></i>
                    <span>Student Portal</span>
                </Link>

                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                    <i className="fas fa-bars text-white fs-4"></i>
                </button>

                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/"><i className="fas fa-home me-1"></i>Home</Link>
                        </li>
                        <li className="nav-item dropdown">
                            <span className="nav-link dropdown-toggle" id="lostDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: 'pointer' }}>
                                <i className="fas fa-search me-1"></i>Lost & Found
                            </span>
                            <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby="lostDropdown">
                                <li><Link className="dropdown-item" to="/lost-found"><i className="fas fa-search me-2"></i>Lost & Found</Link></li>
                                <li><Link className="dropdown-item" to="/report-lost"><i className="fas fa-exclamation-triangle me-2"></i>Report Lost</Link></li>
                                <li><Link className="dropdown-item" to="/report-found"><i className="fas fa-hand-holding me-2"></i>Report Found</Link></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><Link className="dropdown-item" to="/track"><i className="fas fa-map-marked-alt me-2"></i>Track Report</Link></li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/books"><i className="fas fa-book me-1"></i>Books</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/notes"><i className="fas fa-sticky-note me-1"></i>Notes</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/student-help"><i className="fas fa-hands-helping me-1"></i>Student Help</Link>
                        </li>
                    </ul>

                    {currentUser?.email && (
                        <>
                            <Link to="/notifications" className="btn btn-outline-light me-2 position-relative">
                                <i className="fas fa-bell"></i>
                                {unreadCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                            <Link to="/profile" className="btn btn-outline-light me-2 d-none d-md-inline">
                                <i className="fas fa-user-circle me-1"></i>
                                Profile
                            </Link>
                        </>
                    )}

                    {currentUser?.email ? (
                        <>
                            <span className="text-white-50 me-2 small d-none d-md-inline">
                                {currentUser.email}
                            </span>
                            <button
                                type="button"
                                className="btn btn-outline-light px-3"
                                onClick={handleLogout}
                            >
                                <i className="fas fa-sign-out-alt me-1"></i>Logout
                            </button>
                        </>
                    ) : (
                        <Link className="btn btn-outline-light login-btn px-3" to="/login">
                            <i className="fas fa-user me-1"></i>Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;
