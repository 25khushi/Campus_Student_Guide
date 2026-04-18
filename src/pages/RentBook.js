import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Validator } from '../utils/validator';
import { bookStorage, bookRentalStorage, bookPurchaseStorage, bookStorage as books, activityStorage, notificationStorage } from '../utils/storage';
import { auth } from '../utils/auth';

const RentBook = () => {
    const { id } = useParams();
    const location = useLocation();
    const [book, setBook] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [days, setDays] = useState(5);
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [error, setError] = useState('');
    const [done, setDone] = useState(null); // { returnBy, rentalId }
    const mode = new URLSearchParams(location.search).get('mode') === 'buy' ? 'buy' : 'rent';
    const isBuyMode = mode === 'buy';

    useEffect(() => {
        const b = id ? bookStorage.getById(id) : null;
        setBook(b || null);
        if (b) setDays(Math.min(5, b.maxDays));
        setLoaded(true);
    }, [id]);

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (user?.email) {
            setStudentEmail(user.email);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!book) return;
        if (!Validator.isNotEmpty(studentName)) {
            setError('Your name is required');
            return;
        }
        if (!Validator.isNotEmpty(studentEmail)) {
            setError('Your email is required');
            return;
        }
        if (!Validator.isValidEmail(studentEmail)) {
            setError('Valid email required');
            return;
        }
        if (isBuyMode) {
            if (book.salePrice == null) {
                setError('This book is not available for purchase.');
                return;
            }
            const purchaseId = bookPurchaseStorage.add({
                bookId: book.id,
                bookTitle: book.title,
                buyPrice: book.salePrice,
                studentName: studentName.trim(),
                studentEmail: studentEmail.trim(),
                ownerContact: book.contact,
                status: 'requested',
            });
            activityStorage.log({
                type: 'book-buy',
                userEmail: studentEmail.trim(),
                description: `You requested to buy "${book.title}".`,
                relatedId: purchaseId,
            });
            notificationStorage.add({
                toEmail: book.contact,
                type: 'book-buy',
                message: `${studentName.trim()} wants to buy your book "${book.title}".`,
                relatedId: purchaseId,
            });
            setDone({ mode: 'buy', purchaseId, total: book.salePrice });
            return;
        }

        const d = parseInt(days, 10);
        if (isNaN(d) || d < 1 || d > book.maxDays) {
            setError(`Please choose 1 to ${book.maxDays} days`);
            return;
        }
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + d);
        const returnBy = returnDate.toISOString().slice(0, 10);
        const total = d * book.rentPerDay;
        const rentalId = bookRentalStorage.add({
            bookId: book.id,
            bookTitle: book.title,
            days: d,
            rentPerDay: book.rentPerDay,
            totalAmount: total,
            returnBy,
            studentName: studentName.trim(),
            studentEmail: studentEmail.trim(),
            ownerContact: book.contact,
            status: 'active',
        });
        books.incrementRentalCount(book.id);
        activityStorage.log({
            type: 'book-rent',
            userEmail: studentEmail.trim(),
            description: `You rented "${book.title}" for ${d} day${d > 1 ? 's' : ''}.`,
            relatedId: rentalId,
        });
        notificationStorage.add({
            toEmail: book.contact,
            type: 'book-rent',
            message: `${studentName.trim()} rented your book "${book.title}" for ${d} day${d > 1 ? 's' : ''}.`,
            relatedId: rentalId,
        });
        setDone({ mode: 'rent', returnBy, rentalId, total, days: d });
    };

    if (loaded && !book) {
        return (
            <div className="container py-4">
                <p className="text-center text-muted">Book not found.</p>
                <Link to="/books">Back to Books</Link>
            </div>
        );
    }
    if (!book) return null;

    if (done) {
        return (
            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="card shadow border-success">
                            <div className="card-body text-center p-4">
                                <i className="fas fa-check-circle fa-4x text-success mb-3"></i>
                                {done.mode === 'buy' ? (
                                    <>
                                        <h5 className="fw-bold text-success">Book purchase requested</h5>
                                        <p className="mb-1">Purchase ID: <strong>{done.purchaseId}</strong></p>
                                    </>
                                ) : (
                                    <>
                                        <h5 className="fw-bold text-success">Book reserved for {done.days} days</h5>
                                        <p className="mb-1">Rental ID: <strong>{done.rentalId}</strong></p>
                                        <p className="mb-1">Return by: <strong>{done.returnBy}</strong></p>
                                    </>
                                )}
                                <p className="mb-1">Amount: ₹{done.total}</p>
                                <p className="small text-muted mt-2">Contact the book owner at: {book.contact} to collect the book.</p>
                                <Link to="/books" className="btn btn-primary mt-3">Back to Books</Link>
                                <Link to="/my-rentals" className="btn btn-outline-primary mt-3 ms-2">My Rentals</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const options = [];
    for (let i = 1; i <= book.maxDays; i++) options.push(i);

    return (
        <div className="container py-4">
            <h1 className="page-title mb-2">{isBuyMode ? 'Buy this book' : 'Rent this book'}</h1>
            <p className="text-center text-muted mb-4">
                {isBuyMode ? 'Confirm purchase request and contact the owner to complete payment.' : 'Select how many days you need the book (e.g. 5 days).'}
            </p>
            <hr className="page-divider" />
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card shadow mb-4">
                        <div className="card-body">
                            <h5 className="fw-bold">{book.title}</h5>
                            <p className="small text-muted mb-0">
                                {book.course}
                                {!isBuyMode && <> · ₹{book.rentPerDay}/day · Max {book.maxDays} days</>}
                                {isBuyMode && <> · Buy price ₹{book.salePrice != null ? book.salePrice : 'N/A'}</>}
                            </p>
                            {book.materialData && (
                                <p className="small mt-2 mb-0">
                                    <a
                                        href={book.materialData}
                                        download={book.materialName || `${book.title}.file`}
                                        className="text-decoration-none"
                                    >
                                        <i className="fas fa-file-download me-1"></i>
                                        {book.materialName || 'Download attached material'}
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {!isBuyMode && (
                                    <div className="mb-3">
                                        <label className="form-label">Rent for how many days? *</label>
                                        <select className="form-select" value={days} onChange={(e) => setDays(parseInt(e.target.value, 10))}>
                                            {options.map((d) => (
                                                <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                        <small className="text-muted">Total: ₹{days * book.rentPerDay} (₹{book.rentPerDay} × {days} days)</small>
                                    </div>
                                )}
                                {isBuyMode && (
                                    <div className="mb-3">
                                        <label className="form-label">Purchase amount</label>
                                        <input type="text" className="form-control" value={book.salePrice != null ? `₹${book.salePrice}` : 'Not available'} readOnly />
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">Your name *</label>
                                    <input type="text" className="form-control" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Your name" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Your email *</label>
                                    <input type="email" className="form-control" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="your@email.com" />
                                </div>
                                {error && <div className="text-danger mb-2">{error}</div>}
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary">{isBuyMode ? 'Confirm purchase request' : 'Confirm rental'}</button>
                                    <Link to="/books" className="btn btn-outline-secondary">Cancel</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RentBook;
