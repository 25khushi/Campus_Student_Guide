import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookStorage, bookRentalStorage, bookmarkStorage } from '../utils/storage';
import { auth } from '../utils/auth';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [semesterFilter, setSemesterFilter] = useState('All');
    const [priceFilter, setPriceFilter] = useState('Any');
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (user?.email) {
            setCurrentUserEmail(user.email);
        }
    }, []);

    useEffect(() => {
        setBooks(bookStorage.getAll());
    }, []);

    const subjects = ['All', ...Array.from(new Set(bookStorage.getAll().map((b) => b.course).filter(Boolean)))];

    const filteredBooks = books.filter((b) => {
        if (subjectFilter !== 'All' && b.course !== subjectFilter) return false;
        if (semesterFilter !== 'All' && (b.semester || '') !== semesterFilter) return false;
        if (priceFilter === '≤20' && b.rentPerDay > 20) return false;
        if (priceFilter === '≤50' && b.rentPerDay > 50) return false;
        if (priceFilter === '>50' && b.rentPerDay <= 50) return false;
        return true;
    });

    const getOwnerTrustScore = (email) => {
        if (!email) return 0;
        return bookRentalStorage
            .getAll()
            .filter((r) => (r.ownerContact || '').toLowerCase() === email.toLowerCase()).length;
    };

    const handleRequestBook = (book) => {
        const user = auth.getCurrentUser();
        if (!user?.email) {
            alert('Please login first to request a book.');
            return;
        }
        alert(`Request sent to owner: ${book.contact}`);
    };

    const toggleBookmark = (bookId) => {
        if (!currentUserEmail) {
            alert('Please login first to bookmark a book.');
            return;
        }
        bookmarkStorage.toggle(currentUserEmail, 'book', bookId);
        setBooks(bookStorage.getAll());
    };

    const isBookmarked = (bookId) => {
        if (!currentUserEmail) return false;
        return bookmarkStorage.isBookmarked(currentUserEmail, 'book', bookId);
    };

    return (
        <div className="container py-4">
            <h1 className="page-title mb-2"><i className="fas fa-book me-2"></i>Books Marketplace</h1>
            <p className="text-center text-muted mb-4">Rent books by day or see sale price. Filter by subject, semester, and price.</p>
            <hr className="page-divider" />

            <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                <Link to="/post-book" className="btn btn-primary"><i className="fas fa-plus me-1"></i>Add Book for Rent</Link>
                <Link to="/my-rentals" className="btn btn-outline-primary"><i className="fas fa-list me-1"></i>My Rentals</Link>
            </div>

            <div className="row mb-3">
                <div className="col-md-4 mb-2">
                    <label className="form-label small">Subject</label>
                    <select className="form-select" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                        {subjects.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4 mb-2">
                    <label className="form-label small">Semester</label>
                    <select className="form-select" value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
                        <option value="All">All</option>
                        {[1,2,3,4,5,6,7,8].map((s) => (
                            <option key={s} value={String(s)}>{s}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4 mb-2">
                    <label className="form-label small">Rent per day</label>
                    <select className="form-select" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                        <option value="Any">Any</option>
                        <option value="≤20">≤ ₹20</option>
                        <option value="≤50">≤ ₹50</option>
                        <option value=">50">&gt; ₹50</option>
                    </select>
                </div>
            </div>

            <div className="row g-4">
                {filteredBooks.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">
                        <i className="fas fa-book fa-4x mb-3"></i>
                        <p>No books match your filters yet.</p>
                        <p className="small">Add a book so others can rent or buy it.</p>
                        <Link to="/post-book" className="btn btn-primary mt-2">Add Book for Rent</Link>
                    </div>
                ) : (
                    filteredBooks.map((b) => {
                        const trust = getOwnerTrustScore(b.contact);
                        const bookmarked = isBookmarked(b.id);
                        return (
                        <div key={b.id} className="col-md-6 col-lg-4">
                            <div className="card shadow h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <h6 className="fw-bold mb-0">{b.title}</h6>
                                        <button
                                            type="button"
                                            className="btn btn-link btn-sm p-0"
                                            onClick={() => toggleBookmark(b.id)}
                                            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                                        >
                                            <i className={`fas ${bookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
                                        </button>
                                    </div>
                                    {b.author && <div className="small text-muted mb-1">by {b.author}</div>}
                                    <p className="small text-muted mb-1">{b.description || '—'}</p>
                                    <div className="mb-1">
                                        {b.course && <span className="badge bg-secondary me-1">{b.course}</span>}
                                        {b.semester && <span className="badge bg-light text-dark me-1">Sem {b.semester}</span>}
                                        {b.condition && <span className="badge bg-info text-dark">{b.condition}</span>}
                                    </div>
                                    <p className="fw-bold mt-2 mb-0 small" style={{ color: 'var(--primary)' }}>
                                        ₹{b.rentPerDay}/day {b.maxDays && <span className="text-muted">· Max {b.maxDays} days</span>}
                                    </p>
                                    {b.salePrice != null && (
                                        <p className="small mb-0">Or buy: <strong>₹{b.salePrice}</strong></p>
                                    )}
                                    <p className="small text-muted mt-2 mb-1">
                                        Owner: <a href={`mailto:${b.contact}`} className="text-decoration-none">{b.contact}</a>
                                    </p>
                                    <p className="small text-muted mb-2">
                                        Trust score: <strong>{trust}</strong> rental{trust === 1 ? '' : 's'}
                                    </p>
                                    {b.materialData && (
                                        <p className="small mb-2">
                                            <a
                                                href={b.materialData}
                                                download={b.materialName || `${b.title}.file`}
                                                className="text-decoration-none"
                                            >
                                                <i className="fas fa-file-download me-1"></i>
                                                Download material
                                            </a>
                                        </p>
                                    )}
                                    <div className="mt-2 d-flex gap-2 flex-wrap">
                                        <Link to={`/book/${b.id}/rent`} className="btn btn-primary btn-sm">
                                            <i className="fas fa-calendar-check me-1"></i>Rent
                                        </Link>
                                        {b.salePrice != null && (
                                            <Link to={`/book/${b.id}/rent?mode=buy`} className="btn btn-success btn-sm">
                                                <i className="fas fa-shopping-cart me-1"></i>Buy
                                            </Link>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => handleRequestBook(b)}
                                        >
                                            <i className="fas fa-envelope me-1"></i>Request book
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Books;
