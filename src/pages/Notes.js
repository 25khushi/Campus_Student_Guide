import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { noteStorage, bookmarkStorage } from '../utils/storage';
import { auth } from '../utils/auth';

const subjects = ['All', 'DSA', 'DBMS', 'OS', 'CN', 'Math', 'Other'];

const Notes = () => {
    const [subject, setSubject] = useState('All');
    const [semester, setSemester] = useState('All');
    const [notes, setNotes] = useState([]);
    const [topNotes, setTopNotes] = useState([]);
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (user?.email) {
            setCurrentUserEmail(user.email);
        }
        const all = noteStorage.getAll();
        setNotes(all);
        const top = all
            .slice()
            .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
            .slice(0, 3);
        setTopNotes(top);
    }, []);

    const toggleBookmark = (noteId) => {
        if (!currentUserEmail) {
            alert('Please login first to bookmark notes.');
            return;
        }
        bookmarkStorage.toggle(currentUserEmail, 'note', noteId);
        setNotes(noteStorage.getAll());
    };

    const isBookmarked = (noteId) => {
        if (!currentUserEmail) return false;
        return bookmarkStorage.isBookmarked(currentUserEmail, 'note', noteId);
    };

    const filtered = notes.filter((n) => {
        if (subject !== 'All' && n.subject !== subject) return false;
        if (semester !== 'All' && String(n.semester) !== String(semester)) return false;
        return true;
    });

    return (
        <div className="container py-4">
            <h1 className="page-title mb-2"><i className="fas fa-sticky-note me-2"></i>Notes – Rent or Buy</h1>
            <p className="text-center text-muted mb-4">Rent notes for the days you need, or buy once. Filter by subject and semester, and see what’s most downloaded.</p>
            <hr className="page-divider" />

            <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
                {subjects.map((s) => (
                    <button key={s} className={`btn ${subject === s ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setSubject(s)}>{s}</button>
                ))}
                <Link to="/post-note" className="btn btn-primary"><i className="fas fa-plus me-1"></i>Add Notes</Link>
                <Link to="/my-notes" className="btn btn-outline-primary">My Notes</Link>
            </div>
            <div className="d-flex justify-content-center mb-4">
                <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted">Semester:</span>
                    <select className="form-select form-select-sm" style={{ width: '120px' }} value={semester} onChange={(e) => setSemester(e.target.value)}>
                        <option value="All">All</option>
                        {[1,2,3,4,5,6,7,8].map((s) => (
                            <option key={s} value={String(s)}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {topNotes.length > 0 && (
                <div className="mb-4">
                    <div className="card shadow-sm">
                        <div className="card-body py-2 px-3">
                            <h6 className="fw-bold mb-2" style={{ color: 'var(--primary)' }}>
                                <i className="fas fa-star me-1"></i>Most downloaded notes
                            </h6>
                            <div className="d-flex flex-wrap gap-3 small">
                                {topNotes.map((n) => (
                                    <div key={n.id}>
                                        <strong>{n.topic}</strong> ({n.subject}) · {n.downloadCount || 0} downloads
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="row g-4">
                {filtered.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">
                        <i className="fas fa-sticky-note fa-4x mb-3"></i>
                        <p>No notes yet in this category.</p>
                        <p className="small">Add notes to rent or sell so others can use them.</p>
                        <Link to="/post-note" className="btn btn-primary mt-2">Add Notes</Link>
                    </div>
                ) : filtered.map((n) => {
                    const bookmarked = isBookmarked(n.id);
                    return (
                        <div key={n.id} className="col-md-6 col-lg-4">
                            <div className="card shadow h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <div>
                                            <span className={`badge mb-1 me-1 ${n.type === 'rent' ? 'bg-info' : 'bg-success'}`}>{n.type === 'rent' ? 'Rent' : 'Buy'}</span>
                                            <h6 className="fw-bold mb-0">{n.topic}</h6>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-link btn-sm p-0"
                                            onClick={() => toggleBookmark(n.id)}
                                            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                                        >
                                            <i className={`fas ${bookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
                                        </button>
                                    </div>
                                    <p className="small text-muted mb-1">{n.description || '—'}</p>
                                    <span className="badge bg-secondary me-1">{n.subject}</span>
                                    <span className="badge bg-light text-dark me-1">Sem {n.semester}</span>
                                    {n.unit && <span className="badge bg-info text-dark">{n.unit}</span>}
                                    {n.type === 'rent' && <p className="fw-bold mt-2 mb-0 small" style={{ color: 'var(--primary)' }}>₹{n.rentPerDay}/day · Max {n.maxDays} days</p>}
                                    {n.type === 'buy' && <p className="fw-bold mt-2 mb-0 small" style={{ color: 'var(--primary)' }}>₹{n.buyPrice} (one-time)</p>}
                                    <p className="small text-muted mt-1 mb-1">
                                        Uploaded {n.uploadedAt || ''}{n.contact && <> · by {n.contact}</>}
                                    </p>
                                    <p className="small text-muted mb-2">
                                        Downloads: <strong>{n.downloadCount || 0}</strong>
                                    </p>
                                    {n.materialData && (
                                        <p className="small mb-2">
                                            <a
                                                href={n.materialData}
                                                download={n.materialName || `${n.topic}.file`}
                                                className="text-decoration-none"
                                            >
                                                <i className="fas fa-file-download me-1"></i>
                                                Download material
                                            </a>
                                        </p>
                                    )}
                                    <div className="mt-2 d-flex gap-2">
                                        <Link to={`/note/${n.id}`} className="btn btn-primary btn-sm">
                                            {n.type === 'rent' ? 'Rent / preview' : 'Buy / preview'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Notes;
