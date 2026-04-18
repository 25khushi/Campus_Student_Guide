import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lostFoundStorage, activityStorage, notificationStorage, bookmarkStorage } from '../utils/storage';
import { auth } from '../utils/auth';

const LostAndFound = () => {
    const [activeTab, setActiveTab] = useState('lost');
    const [lostItems, setLostItems] = useState([]);
    const [foundItems, setFoundItems] = useState([]);
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    const refresh = () => {
        setLostItems(lostFoundStorage.getLost());
        setFoundItems(lostFoundStorage.getFound());
    };

    useEffect(() => {
        refresh();
        const user = auth.getCurrentUser();
        if (user?.email) {
            setCurrentUserEmail(user.email);
        }
    }, []);

    const items = activeTab === 'lost' ? lostItems : foundItems;

    return (
        <div className="container py-3 py-md-4 px-3 px-sm-4">
            <h1 className="page-title mb-2 lost-found-title">
                <i className="fas fa-search me-2"></i>Lost & Found
            </h1>
            <p className="text-center text-muted mb-3 mb-md-4 lost-found-subtitle">Report lost items or submit found items. Track your reports.</p>
            <hr className="page-divider" />

            <div className="lost-found-actions d-flex flex-wrap justify-content-center gap-2 mb-3 mb-md-4">
                <Link to="/report-lost" className="btn btn-primary btn-sm btn-responsive">
                    <i className="fas fa-plus me-1"></i>Report Lost
                </Link>
                <Link to="/report-found" className="btn btn-outline-primary btn-sm btn-responsive">
                    <i className="fas fa-hand-holding me-1"></i>Report Found
                </Link>
                <Link to="/track" className="btn btn-outline-primary btn-sm btn-responsive">
                    <i className="fas fa-map-marked-alt me-1"></i>Track Report
                </Link>
            </div>

            <ul className="nav nav-tabs lost-found-tabs justify-content-center mb-3 mb-md-4 flex-wrap">
                <li className="nav-item">
                    <button type="button" className={`nav-link ${activeTab === 'lost' ? 'active' : ''}`} onClick={() => setActiveTab('lost')} style={activeTab === 'lost' ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' } : {}}>
                        <i className="fas fa-exclamation-triangle me-1"></i>Lost
                    </button>
                </li>
                <li className="nav-item">
                    <button type="button" className={`nav-link ${activeTab === 'found' ? 'active' : ''}`} onClick={() => setActiveTab('found')} style={activeTab === 'found' ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' } : {}}>
                        <i className="fas fa-check-circle me-1"></i>Found
                    </button>
                </li>
            </ul>

            <div className="row g-3 g-md-4">
                {items.length === 0 ? (
                    <div className="col-12 text-center py-4 py-md-5">
                        <i className="fas fa-inbox fa-3x fa-md-4x text-muted mb-2 mb-md-3"></i>
                        <h4 className="text-muted h5 h4-md">No {activeTab} items yet</h4>
                        <p className="text-muted small mb-0">Be the first to report one.</p>
                    </div>
                ) : (
                    items.map((item) => {
                        const isFound = item.type === 'found';
                        const handleContact = () => {
                            const user = auth.getCurrentUser();
                            const email = user?.email;
                            if (email) {
                                activityStorage.log({
                                    type: 'lostfound-contact',
                                    userEmail: email,
                                    description: `You contacted ${isFound ? 'finder' : 'owner'} about "${item.title}".`,
                                    relatedId: item.id,
                                });
                                notificationStorage.add({
                                    toEmail: item.contact,
                                    type: 'lostfound-contact',
                                    message: `${email} contacted you about "${item.title}".`,
                                    relatedId: item.id,
                                });
                            }
                            window.location.href = `mailto:${item.contact}?subject=Regarding ${item.type} item "${item.title}"&body=Hi,%0D%0A%0D%0AI saw your ${item.type} item "${item.title}" (ID ${item.id}) on the student portal.`;
                        };

                        const handleClaim = () => {
                            const user = auth.getCurrentUser();
                            const email = user?.email;
                            if (!email) {
                                alert('Please login first to claim an item.');
                                return;
                            }
                            lostFoundStorage.updateStatus(item.id, 'claimed');
                            refresh();
                            activityStorage.log({
                                type: 'lostfound-claim',
                                userEmail: email,
                                description: `You marked item "${item.title}" as claimed.`,
                                relatedId: item.id,
                            });
                            notificationStorage.add({
                                toEmail: item.contact,
                                type: 'lostfound-claim',
                                message: `Someone marked "${item.title}" as claimed and may have contacted you.`,
                                relatedId: item.id,
                            });
                        };

                        const bookmarked = currentUserEmail && bookmarkStorage.isBookmarked(currentUserEmail, 'lostfound', item.id);
                        const toggleBookmark = () => {
                            if (!currentUserEmail) {
                                alert('Please login first to bookmark a report.');
                                return;
                            }
                            bookmarkStorage.toggle(currentUserEmail, 'lostfound', item.id);
                            refresh();
                        };

                        return (
                            <div key={item.id} className="col-12 col-sm-6 col-lg-4">
                                <div className="card shadow h-100 lost-found-card">
                                    {item.image && <img src={item.image} className="card-img-top lost-found-card-img" alt={item.title} />}
                                    <div className="card-body p-3 p-md-3 d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                            <span className={`badge mb-0 ${item.type === 'lost' ? 'bg-warning text-dark' : 'bg-success'}`}>{item.type === 'lost' ? 'Lost' : 'Found'}</span>
                                            <button
                                                type="button"
                                                className="btn btn-link btn-sm p-0"
                                                onClick={toggleBookmark}
                                                title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                                            >
                                                <i className={`fas ${bookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
                                            </button>
                                        </div>
                                        <h6 className="fw-bold mb-1 lost-found-card-title">{item.title}</h6>
                                        <p className="small text-muted mb-1 line-clamp-2">{item.description}</p>
                                        <small><i className="fas fa-map-marker-alt me-1 text-primary"></i>{item.location}</small>
                                        <br />
                                        <small className="text-muted"><i className="fas fa-calendar me-1"></i>{item.date}</small>
                                        <br />
                                        <span className="badge bg-info me-1 mt-2">ID: {item.id}</span>
                                        <span className={`badge mt-2 ${item.status === 'pending' || item.status === 'unclaimed' ? 'bg-secondary' : 'bg-info'}`}>{item.status}</span>
                                        <div className="mt-2 d-flex flex-wrap gap-2">
                                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleContact}>
                                                <i className="fas fa-envelope me-1"></i>{isFound ? 'Contact finder' : 'Contact owner'}
                                            </button>
                                            {isFound && item.status !== 'claimed' && (
                                                <button type="button" className="btn btn-primary btn-sm" onClick={handleClaim}>
                                                    <i className="fas fa-check me-1"></i>Mark as claimed
                                                </button>
                                            )}
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

export default LostAndFound;
