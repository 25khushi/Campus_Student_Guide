import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { lostFoundStorage } from '../utils/storage';

const TrackReport = () => {
    const [trackId, setTrackId] = useState('');
    const [result, setResult] = useState(null);

    const handleTrack = (e) => {
        e.preventDefault();
        if (!trackId.trim()) {
            setResult({ error: 'Please enter a report ID (e.g. L1234567890 or F1234567890).' });
            return;
        }
        const item = lostFoundStorage.getById(trackId.trim());
        if (item) {
            setResult({ item });
        } else {
            setResult({ error: `No report found with ID "${trackId.trim()}". Make sure you entered the correct tracking ID from your confirmation.` });
        }
    };

    return (
        <div className="container py-4">
            <h1 className="page-title mb-2"><i className="fas fa-map-marked-alt me-2"></i>Track My Report</h1>
            <p className="text-center text-muted mb-4">Enter your tracking ID (e.g. L1234567890 for Lost, F1234567890 for Found) to check status.</p>
            <hr className="page-divider" />
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <form onSubmit={handleTrack}>
                                <div className="mb-3">
                                    <label className="form-label">Tracking ID</label>
                                    <input type="text" className="form-control" placeholder="e.g. L1234567890 or F1234567890" value={trackId} onChange={(e) => { setTrackId(e.target.value); setResult(null); }} />
                                    <small className="text-muted">You received this ID when you submitted your report.</small>
                                </div>
                                <button type="submit" className="btn btn-primary w-100"><i className="fas fa-search me-1"></i>Track</button>
                            </form>
                            {result?.error && <div className="alert alert-warning mt-3 mb-0">{result.error}</div>}
                            {result?.item && (
                                <div className="mt-4 p-4 rounded border" style={{ background: 'var(--bg-light)' }}>
                                    <h6 className="fw-bold mb-3"><i className="fas fa-info-circle me-2"></i>Report Details</h6>
                                    <div className="row g-2 mb-2">
                                        <div className="col-4"><strong>Tracking ID:</strong></div>
                                        <div className="col-8"><code className="bg-white px-2 py-1 rounded">{result.item.id}</code></div>
                                    </div>
                                    <div className="row g-2 mb-2">
                                        <div className="col-4"><strong>Type:</strong></div>
                                        <div className="col-8"><span className={`badge ${result.item.type === 'lost' ? 'bg-warning text-dark' : 'bg-success'}`}>{result.item.type === 'lost' ? 'Lost Item' : 'Found Item'}</span></div>
                                    </div>
                                    <div className="row g-2 mb-2">
                                        <div className="col-4"><strong>Item:</strong></div>
                                        <div className="col-8">{result.item.title}</div>
                                    </div>
                                    <div className="row g-2 mb-2">
                                        <div className="col-4"><strong>Description:</strong></div>
                                        <div className="col-8">{result.item.description}</div>
                                    </div>
                                    <div className="row g-2 mb-2">
                                        <div className="col-4"><strong>Location:</strong></div>
                                        <div className="col-8"><i className="fas fa-map-marker-alt me-1 text-primary"></i>{result.item.location}</div>
                                    </div>
                                    <div className="row g-2 mb-2">
                                        <div className="col-4"><strong>Date Reported:</strong></div>
                                        <div className="col-8"><i className="fas fa-calendar me-1"></i>{result.item.date}</div>
                                    </div>
                                    <div className="row g-2 mb-2">
                                        <div className="col-4"><strong>Contact:</strong></div>
                                        <div className="col-8">{result.item.contact}</div>
                                    </div>
                                    <div className="row g-2 mb-0">
                                        <div className="col-4"><strong>Status:</strong></div>
                                        <div className="col-8">
                                            <span className={`badge ${result.item.status === 'pending' || result.item.status === 'unclaimed' ? 'bg-secondary' : 'bg-success'}`}>
                                                {result.item.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="text-center mt-3"><Link to="/lost-found"><i className="fas fa-arrow-left me-1"></i>Back to Lost & Found</Link></p>
                </div>
            </div>
        </div>
    );
};

export default TrackReport;
