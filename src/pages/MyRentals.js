import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookRentalStorage, bookPurchaseStorage } from '../utils/storage';
import { auth } from '../utils/auth';

const MyRentals = () => {
    const [email, setEmail] = useState('');
    const [rentals, setRentals] = useState([]);
    const [purchases, setPurchases] = useState([]);

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (user?.email) {
            setEmail(user.email);
        }
    }, []);

    useEffect(() => {
        if (email.trim()) {
            setRentals(bookRentalStorage.getByEmail(email));
            setPurchases(bookPurchaseStorage.getByEmail(email));
        } else {
            setRentals([]);
            setPurchases([]);
        }
    }, [email]);

    return (
        <div className="container py-4">
            <h1 className="page-title mb-2"><i className="fas fa-list me-2"></i>My Book Activity</h1>
            <p className="text-center text-muted mb-4">Enter your email to see your rentals and purchase requests.</p>
            <hr className="page-divider" />
            <div className="row justify-content-center mb-4">
                <div className="col-lg-6">
                    <label className="form-label">Your email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
            </div>
            {rentals.length === 0 && purchases.length === 0 ? (
                <div className="text-center py-4 text-muted">
                    {email.trim() ? 'No book activity found for this email.' : 'Enter your email above to see your activity.'}
                </div>
            ) : (
                <div className="row g-3">
                    {rentals.map((r) => (
                        <div key={r.id} className="col-12">
                            <div className="card shadow">
                                <div className="card-body d-flex flex-wrap align-items-center justify-content-between">
                                    <div>
                                        <span className="badge bg-primary me-2">{r.id}</span>
                                        <strong>{r.bookTitle}</strong>
                                        <p className="small text-muted mb-0 mt-1">{r.days} days · Return by {r.returnBy} · ₹{r.totalAmount}</p>
                                    </div>
                                    <span className={`badge ${r.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>{r.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {purchases.map((p) => (
                        <div key={p.id} className="col-12">
                            <div className="card shadow">
                                <div className="card-body d-flex flex-wrap align-items-center justify-content-between">
                                    <div>
                                        <span className="badge bg-success me-2">{p.id}</span>
                                        <strong>{p.bookTitle}</strong>
                                        <p className="small text-muted mb-0 mt-1">Purchase request · ₹{p.buyPrice}</p>
                                    </div>
                                    <span className={`badge ${p.status === 'requested' ? 'bg-warning text-dark' : 'bg-secondary'}`}>{p.status || 'requested'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <p className="text-center mt-4"><Link to="/books">Back to Books</Link></p>
        </div>
    );
};

export default MyRentals;
