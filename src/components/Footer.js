import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    useEffect(() => {
        const footer = document.querySelector('.footer');
        if (footer) setTimeout(() => footer.classList.add('show-footer'), 300);
    }, []);

    return (
        <footer className="footer text-white text-center py-4">
            <div className="container">
                <div className="row">
                    <div className="col-md-4 mb-3 mb-md-0 text-md-start">
                        <h5>Student Portal</h5>
                        <p className="small mb-0">One place for all college needs: Lost & Found, Books, Notes, Student Help.</p>
                    </div>
                    <div className="col-md-4 mb-3 mb-md-0">
                        <h6>Quick Links</h6>
                        <Link to="/" className="me-2">Home</Link> |
                        <Link to="/lost-found" className="mx-2">Lost & Found</Link> |
                        <Link to="/books" className="mx-2">Books</Link> |
                        <Link to="/my-rentals" className="mx-2">My Rentals</Link> |
                        <Link to="/notes" className="mx-2">Notes</Link> |
                        <Link to="/my-notes" className="mx-2">My Notes</Link> |
                        <Link to="/student-help" className="ms-2">Student Help</Link>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <h6>Follow Us</h6>
                        <div className="social-icons">
                            <a href="#"><i className="fab fa-facebook-f"></i></a>
                            <a href="#"><i className="fab fa-twitter"></i></a>
                            <a href="#"><i className="fab fa-instagram"></i></a>
                        </div>
                    </div>
                </div>
                <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '1rem 0' }} />
                <p className="mb-0 small">&copy; 2026 Student Portal. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
