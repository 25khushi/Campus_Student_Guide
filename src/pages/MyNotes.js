import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { noteRentalStorage, notePurchaseStorage } from '../utils/storage';
import { auth } from '../utils/auth';

const MyNotes = () => {
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
            setRentals(noteRentalStorage.getByEmail(email));
            setPurchases(notePurchaseStorage.getByEmail(email));
        } else {
            setRentals([]);
            setPurchases([]);
        }
    }, [email]);

    const hasAny = rentals.length > 0 || purchases.length > 0;

    return (
        <div className="container py-4">
            <h1 className="page-title mb-2"><i className="fas fa-sticky-note me-2"></i>My Notes</h1>
            <p className="text-center text-muted mb-4">Enter your email to see your rented and purchased notes.</p>
            <hr className="page-divider" />
            <div className="row justify-content-center mb-4">
                <div className="col-lg-6">
                    <label className="form-label">Your email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
            </div>
            {!email.trim() && <div className="text-center text-muted">Enter your email above.</div>}
            {email.trim() && !hasAny && <div className="text-center text-muted">No notes found for this email.</div>}
            {rentals.length > 0 && (
                <>
                    <h5 className="fw-bold mb-2" style={{ color: 'var(--primary)' }}>Rented notes</h5>
                    <div className="row g-3 mb-4">
                        {rentals.map((r) => (
                            <div key={r.id} className="col-12">
                                <div className="card shadow">
                                    <div className="card-body">
                                        <strong>{r.noteTopic}</strong> ({r.subject}) · {r.days} days · Return by {r.returnBy} · ₹{r.totalAmount}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            {purchases.length > 0 && (
                <>
                    <h5 className="fw-bold mb-2" style={{ color: 'var(--primary)' }}>Purchased notes</h5>
                    <div className="row g-3">
                        {purchases.map((p) => (
                            <div key={p.id} className="col-12">
                                <div className="card shadow">
                                    <div className="card-body">
                                        <strong>{p.noteTopic}</strong> ({p.subject}) · ₹{p.buyPrice}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            <p className="text-center mt-4"><Link to="/notes">Back to Notes</Link></p>
        </div>
    );
};

export default MyNotes;
