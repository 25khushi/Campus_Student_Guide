import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { helpStorage, activityStorage, notificationStorage, bookmarkStorage } from '../utils/storage';
import { auth } from '../utils/auth';

const categories = [
    { id: 'all', name: 'All', icon: 'fa-th-large' },
    { id: 'rides', name: 'Ride Share', icon: 'fa-car' },
    { id: 'roommate', name: 'Roommate', icon: 'fa-user-friends' },
    { id: 'study', name: 'Study Group', icon: 'fa-users' },
    { id: 'tutoring', name: 'Tutoring', icon: 'fa-chalkboard-teacher' },
    { id: 'other', name: 'Other', icon: 'fa-question-circle' },
];

const StudentHelp = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [posts, setPosts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        type: 'request',
        category: 'rides',
        title: '',
        description: '',
        location: '',
        pickupLocation: '',
        destination: '',
        contact: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [search, setSearch] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    useEffect(() => {
        setPosts(helpStorage.getAll());
    }, []);

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (user?.email) {
            setForm((prev) => ({ ...prev, contact: user.email }));
            setCurrentUserEmail(user.email);
        }
    }, []);

    useEffect(() => {
        const refreshUser = () => {
            const user = auth.getCurrentUser();
            const email = user?.email || '';
            setCurrentUserEmail(email);
            if (email) {
                setForm((prev) => ({ ...prev, contact: email }));
            }
            setPosts(helpStorage.getAll());
        };
        window.addEventListener('student_portal_auth_changed', refreshUser);
        window.addEventListener('storage', refreshUser);
        return () => {
            window.removeEventListener('student_portal_auth_changed', refreshUser);
            window.removeEventListener('storage', refreshUser);
        };
    }, []);

    const filtered = posts.filter((p) => {
        if (currentUserEmail && (p.contact || '').toLowerCase() !== currentUserEmail.toLowerCase()) return false;
        if (activeCategory !== 'all' && p.category !== activeCategory) return false;
        if (search && !(`${p.title} ${p.description}`.toLowerCase().includes(search.toLowerCase()))) return false;
        if (locationFilter && !(p.location || '').toLowerCase().includes(locationFilter.toLowerCase())) return false;
        return true;
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError('');
        setSuccess(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        
        if (!form.title.trim()) {
            setError('Title is required');
            return;
        }
        if (!form.description.trim()) { setError('Description is required'); return; }
        if (!form.contact.trim()) {
            setError('Contact email is required');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(form.contact)) {
            setError('Valid email required');
            return;
        }
        
        const user = auth.getCurrentUser();
        const base = {
            type: form.type,
            category: form.category,
            title: form.title.trim(),
            description: form.description.trim(),
            contact: form.contact.trim(),
            location: form.location.trim(),
            pickupLocation: form.pickupLocation.trim(),
            destination: form.destination.trim(),
        };
        const id = helpStorage.add({
            ...base,
            members: form.category === 'study' ? 1 : 0,
        });
        if (user?.email) {
            activityStorage.log({
                type: 'help-post',
                userEmail: user.email,
                description: `You posted a ${form.category} ${form.type === 'offer' ? 'offer' : 'request'}: "${form.title.trim()}".`,
                relatedId: id,
            });
        }

        setPosts(helpStorage.getAll());
        setForm({
            type: 'request',
            category: 'rides',
            title: '',
            description: '',
            location: '',
            pickupLocation: '',
            destination: '',
            contact: user?.email || '',
        });
        setSuccess(true);
        setShowForm(false);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="container py-3 py-md-4 px-3 px-sm-4 student-help-page">
            <h1 className="page-title mb-2 student-help-title">
                <i className="fas fa-hands-helping me-2"></i>Student Help
            </h1>
            <p className="text-center text-muted mb-3 mb-md-4 student-help-subtitle">
                {currentUserEmail
                    ? 'Showing only your help posts for this account.'
                    : 'Request or offer help: ride share, roommate, study group, tutoring, or anything else.'}
            </p>
            <hr className="page-divider" />

            <div className="row mb-3">
                <div className="col-md-6 mb-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search title or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="col-md-6 mb-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Filter by location..."
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    />
                </div>
            </div>

            {success && (
                <div className="alert alert-success alert-dismissible fade show mb-3 mb-md-4" role="alert">
                    <i className="fas fa-check-circle me-2"></i><strong>Posted successfully!</strong> Your request/offer is now visible to others.
                    <button type="button" className="btn-close" onClick={() => setSuccess(false)} aria-label="Close"></button>
                </div>
            )}

            <div className="d-flex justify-content-center gap-2 mb-3 mb-md-4 flex-wrap">
                <button type="button" className="btn btn-primary btn-responsive" onClick={() => { setShowForm(!showForm); setSuccess(false); }}>
                    <i className="fas fa-plus me-1"></i>{showForm ? 'Hide form' : 'Post request or offer'}
                </button>
            </div>

            {showForm && (
                <div className="card shadow mb-3 mb-md-4 student-help-form">
                    <div className="card-body p-3 p-md-4">
                        <h5 className="fw-bold mb-3"><i className="fas fa-edit me-2"></i>Post your request or offer</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-2 g-md-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label">I want to</label>
                                    <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                                        <option value="request">Request help</option>
                                        <option value="offer">Offer help</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Category</label>
                                    <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                                        {categories.filter((c) => c.id !== 'all').map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                                <div className="mb-3 mt-2">
                                <label className="form-label">Title <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Ride to City Mall on Saturday" />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description <span className="text-danger">*</span></label>
                                <textarea className="form-control" name="description" rows="3" value={form.description} onChange={handleChange} placeholder="Details..." />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">General location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Near Main Gate, Hostel A"
                                />
                            </div>
                            {form.category === 'rides' && (
                                <div className="row g-2">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Pickup location</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="pickupLocation"
                                            value={form.pickupLocation}
                                            onChange={handleChange}
                                            placeholder="e.g. Hostel A"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Destination</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="destination"
                                            value={form.destination}
                                            onChange={handleChange}
                                            placeholder="e.g. City Mall"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="mb-3">
                                <label className="form-label">Your contact email <span className="text-danger">*</span></label>
                                <input type="email" className="form-control" name="contact" value={form.contact} onChange={handleChange} placeholder="your@email.com" />
                            </div>
                            {error && <div className="alert alert-danger mb-3">{error}</div>}
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary"><i className="fas fa-paper-plane me-1"></i>Post</button>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowForm(false); setError(''); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="row">
                <aside className="col-12 col-md-3 col-lg-2 mb-3 mb-md-0 student-help-sidebar">
                    <div className="student-help-categories">
                        <h6 className="d-md-none mb-2 fw-bold" style={{ color: 'var(--primary)' }}>Categories</h6>
                        <ul className="nav flex-column flex-md-column flex-row flex-md-row flex-wrap flex-md-nowrap">
                            {categories.map((cat) => (
                                <li key={cat.id} className="nav-item flex-fill flex-md-fill-auto">
                                    <button
                                        type="button"
                                        className={`nav-link text-start text-md-start text-center text-md-center w-100 student-help-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat.id)}
                                    >
                                        <i className={`fas ${cat.icon} me-1 me-md-2`}></i>{cat.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
                <main className="col-12 col-md-9 col-lg-10 student-help-main">
                    {filtered.length > 0 && (
                        <div className="mb-2 mb-md-3">
                            <small className="text-muted">
                                Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'post' : 'posts'} 
                                {activeCategory !== 'all' && ` in ${categories.find(c => c.id === activeCategory)?.name}`}
                            </small>
                        </div>
                    )}
                    <div className="row g-2 g-md-3">
                        {filtered.map((item) => {
                            const isRide = item.category === 'rides';
                            const isStudy = item.category === 'study';
                            const isTutoring = item.category === 'tutoring';
                            const bookmarked = currentUserEmail && bookmarkStorage.isBookmarked(currentUserEmail, 'help', item.id);
                            const toggleBookmark = () => {
                                if (!currentUserEmail) {
                                    alert('Please login first to bookmark a post.');
                                    return;
                                }
                                bookmarkStorage.toggle(currentUserEmail, 'help', item.id);
                                setPosts(helpStorage.getAll());
                            };
                            const handleContact = () => {
                                const user = auth.getCurrentUser();
                                if (user?.email) {
                                    activityStorage.log({
                                        type: 'help-contact',
                                        userEmail: user.email,
                                        description: `You contacted ${item.type === 'offer' ? 'helper' : 'student'}: "${item.title}".`,
                                        relatedId: item.id,
                                    });
                                    notificationStorage.add({
                                        toEmail: item.contact,
                                        type: 'help-contact',
                                        message: `${user.email} contacted you about "${item.title}".`,
                                        relatedId: item.id,
                                    });
                                }
                                window.location.href = `mailto:${item.contact}?subject=Regarding your student help post&body=Hi,%0D%0A%0D%0AI saw your post "${item.title}" on the student portal.`;
                            };

                            const handleJoinGroup = () => {
                                const user = auth.getCurrentUser();
                                if (!user?.email) {
                                    alert('Please login first to join a group.');
                                    return;
                                }
                                helpStorage.update(item.id, (prev) => ({
                                    ...prev,
                                    members: (prev.members || 0) + 1,
                                }));
                                setPosts(helpStorage.getAll());
                                activityStorage.log({
                                    type: 'help-join-group',
                                    userEmail: user.email,
                                    description: `You joined study group "${item.title}".`,
                                    relatedId: item.id,
                                });
                                notificationStorage.add({
                                    toEmail: item.contact,
                                    type: 'help-join-group',
                                    message: `${user.email} joined your study group "${item.title}".`,
                                    relatedId: item.id,
                                });
                            };

                            const handleRateTutor = (rating) => {
                                const user = auth.getCurrentUser();
                                if (!user?.email) {
                                    alert('Please login first to rate a tutor.');
                                    return;
                                }
                                helpStorage.update(item.id, (prev) => {
                                    const count = prev.ratingCount || 0;
                                    const avg = prev.ratingAverage || 0;
                                    const newCount = count + 1;
                                    const newAvg = ((avg * count) + rating) / newCount;
                                    return { ...prev, ratingAverage: newAvg, ratingCount: newCount };
                                });
                                setPosts(helpStorage.getAll());
                                activityStorage.log({
                                    type: 'help-tutor-rating',
                                    userEmail: user.email,
                                    description: `You rated tutor post "${item.title}" with ${rating} stars.`,
                                    relatedId: item.id,
                                });
                                notificationStorage.add({
                                    toEmail: item.contact,
                                    type: 'help-tutor-rating',
                                    message: `${user.email} rated your tutoring post "${item.title}" with ${rating} stars.`,
                                    relatedId: item.id,
                                });
                            };

                            return (
                                <div key={item.id} className="col-12 col-md-6 col-lg-4">
                                    <div className="card shadow h-100 student-help-card">
                                        <div className="card-body p-3 p-md-3 d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-start mb-1">
                                                <div className="d-flex flex-wrap gap-1 gap-md-2">
                                                <span className="badge student-help-badge" style={{ background: item.type === 'offer' ? 'var(--secondary)' : 'var(--primary)' }}>
                                                    {item.type === 'offer' ? 'Offer' : 'Request'}
                                                </span>
                                                <span className="badge bg-light text-dark">{categories.find((c) => c.id === item.category)?.name || item.category}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-link btn-sm p-0"
                                                    onClick={toggleBookmark}
                                                    title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                                                >
                                                    <i className={`fas ${bookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
                                                </button>
                                            </div>
                                            <h6 className="fw-bold mt-1 mb-2 student-help-card-title">{item.title}</h6>
                                            {item.location && (
                                                <p className="small text-muted mb-1">
                                                    <i className="fas fa-map-marker-alt me-1 text-primary"></i>{item.location}
                                                </p>
                                            )}
                                            {isRide && (
                                                <p className="small text-muted mb-1">
                                                    🚗 {item.pickupLocation || 'Pickup ?'} → {item.destination || 'Destination ?'}
                                                </p>
                                            )}
                                            {isStudy && (
                                                <p className="small text-muted mb-1">
                                                    👥 Members: <strong>{item.members || 0}</strong>
                                                </p>
                                            )}
                                            {isTutoring && (
                                                <p className="small text-muted mb-1">
                                                    ⭐ Rating: <strong>{item.ratingAverage ? item.ratingAverage.toFixed(1) : 'No ratings'}</strong>
                                                    {item.ratingCount ? ` (${item.ratingCount} votes)` : ''}
                                                </p>
                                            )}
                                            <p className="small text-muted mb-2 line-clamp-3">{item.description}</p>
                                            <div className="mt-auto">
                                                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                                    <small className="text-muted"><i className="fas fa-calendar me-1"></i>{item.date}</small>
                                                    <small className="text-muted d-block d-md-inline"><i className="fas fa-envelope me-1"></i>{item.contact}</small>
                                                </div>
                                                <div className="d-flex flex-wrap gap-2">
                                                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleContact}>
                                                        <i className="fas fa-comment-dots me-1"></i>Contact
                                                    </button>
                                                    {isStudy && (
                                                        <button type="button" className="btn btn-primary btn-sm" onClick={handleJoinGroup}>
                                                            <i className="fas fa-user-plus me-1"></i>Join group
                                                        </button>
                                                    )}
                                                    {isTutoring && (
                                                        <div className="d-flex align-items-center gap-1 small">
                                                            <span className="text-muted">Rate:</span>
                                                            {[1,2,3,4,5].map((r) => (
                                                                <button
                                                                    key={r}
                                                                    type="button"
                                                                    className="btn btn-link p-0"
                                                                    onClick={() => handleRateTutor(r)}
                                                                >
                                                                    <i className={`fas fa-star${(item.ratingAverage || 0) >= r ? '' : '-o'}`}></i>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {filtered.length === 0 && (
                        <div className="text-center py-4 py-md-5 text-muted">
                            <i className="fas fa-inbox fa-3x fa-md-4x mb-2 mb-md-3"></i>
                            <h5 className="h6 h5-md mb-2">No posts in this category yet</h5>
                            <p className="small mb-0">Use the form above to post your request or offer.</p>
                        </div>
                    )}
                </main>
            </div>
            <p className="text-center mt-4 text-muted small">
                <Link to="/lost-found">Lost & Found</Link> · <Link to="/books">Books</Link> · <Link to="/notes">Notes</Link>
            </p>
        </div>
    );
};

export default StudentHelp;
