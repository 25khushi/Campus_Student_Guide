import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Validator } from '../utils/validator';
import { noteStorage, noteRentalStorage, notePurchaseStorage, noteCommentStorage, activityStorage, notificationStorage } from '../utils/storage';
import { auth } from '../utils/auth';

const NoteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [days, setDays] = useState(3);
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [error, setError] = useState('');
    const [done, setDone] = useState(null); // { type: 'rent'|'buy', ... }
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const n = id ? noteStorage.getById(id) : null;
        setNote(n || null);
        if (n && n.type === 'rent') setDays(Math.min(3, n.maxDays));
        setLoaded(true);
        if (n) {
            setComments(noteCommentStorage.getByNoteId(n.id));
        }
    }, [id]);

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (user?.email) {
            setStudentEmail(user.email);
        }
    }, []);

    const handleRent = (e) => {
        e.preventDefault();
        setError('');
        if (!note || note.type !== 'rent') return;
        if (!Validator.isNotEmpty(studentName)) { setError('Your name is required'); return; }
        if (!Validator.isNotEmpty(studentEmail)) { setError('Your email is required'); return; }
        if (!Validator.isValidEmail(studentEmail)) { setError('Valid email required'); return; }
        const d = parseInt(days, 10);
        if (isNaN(d) || d < 1 || d > note.maxDays) {
            setError(`Choose 1 to ${note.maxDays} days`);
            return;
        }
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + d);
        const returnBy = returnDate.toISOString().slice(0, 10);
        const total = d * note.rentPerDay;
        const rentalId = noteRentalStorage.add({
            noteId: note.id,
            noteTopic: note.topic,
            subject: note.subject,
            days: d,
            rentPerDay: note.rentPerDay,
            totalAmount: total,
            returnBy,
            studentName: studentName.trim(),
            studentEmail: studentEmail.trim(),
            ownerContact: note.contact,
            status: 'active',
        });
        noteStorage.incrementDownloadCount(note.id);
        activityStorage.log({
            type: 'note-rent',
            userEmail: studentEmail.trim(),
            description: `You rented notes "${note.topic}" for ${d} day${d > 1 ? 's' : ''}.`,
            relatedId: rentalId,
        });
        notificationStorage.add({
            toEmail: note.contact,
            type: 'note-rent',
            message: `${studentName.trim()} rented your notes "${note.topic}" for ${d} day${d > 1 ? 's' : ''}.`,
            relatedId: rentalId,
        });
        setDone({ type: 'rent', returnBy, total, days });
    };

    const handleBuy = (e) => {
        e.preventDefault();
        setError('');
        if (!note || note.type !== 'buy') return;
        if (!Validator.isNotEmpty(studentName)) { setError('Your name is required'); return; }
        if (!Validator.isNotEmpty(studentEmail)) { setError('Your email is required'); return; }
        if (!Validator.isValidEmail(studentEmail)) { setError('Valid email required'); return; }
        const purchaseId = notePurchaseStorage.add({
            noteId: note.id,
            noteTopic: note.topic,
            subject: note.subject,
            buyPrice: note.buyPrice,
            studentName: studentName.trim(),
            studentEmail: studentEmail.trim(),
            ownerContact: note.contact,
        });
        noteStorage.incrementDownloadCount(note.id);
        activityStorage.log({
            type: 'note-buy',
            userEmail: studentEmail.trim(),
            description: `You requested to buy notes "${note.topic}".`,
            relatedId: purchaseId,
        });
        notificationStorage.add({
            toEmail: note.contact,
            type: 'note-buy',
            message: `${studentName.trim()} wants to buy your notes "${note.topic}".`,
            relatedId: purchaseId,
        });
        setDone({ type: 'buy', price: note.buyPrice });
    };

    if (loaded && !note) {
        return (
            <div className="container py-4">
                <p className="text-center text-muted">Note not found.</p>
                <Link to="/notes">Back to Notes</Link>
            </div>
        );
    }
    if (!note) return null;

    if (done) {
        return (
            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="card shadow border-success">
                            <div className="card-body text-center p-4">
                                <i className="fas fa-check-circle fa-4x text-success mb-3"></i>
                                {done.type === 'rent' ? (
                                    <>
                                        <h5 className="fw-bold text-success">Notes reserved for {done.days} days</h5>
                                        <p className="mb-1">Return by: <strong>{done.returnBy}</strong></p>
                                        <p className="mb-1">Amount: ₹{done.total}</p>
                                    </>
                                ) : (
                                    <>
                                        <h5 className="fw-bold text-success">Notes purchase requested</h5>
                                        <p className="mb-1">Amount: ₹{done.price}</p>
                                    </>
                                )}
                                <p className="small text-muted mt-2">Contact the note owner at: {note.contact} to get the notes.</p>
                                <Link to="/notes" className="btn btn-primary mt-3">Back to Notes</Link>
                                <Link to="/my-notes" className="btn btn-outline-primary mt-3 ms-2">My Notes</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isRent = note.type === 'rent';

    const handleAddComment = (e) => {
        e.preventDefault();
        setError('');
        if (!note) return;
        if (!Validator.isNotEmpty(newComment)) {
            setError('Comment cannot be empty');
            return;
        }
        const user = auth.getCurrentUser();
        const email = user?.email || studentEmail;
        noteCommentStorage.add(note.id, {
            userEmail: email || 'anonymous',
            text: newComment.trim(),
        });
        setComments(noteCommentStorage.getByNoteId(note.id));
        setNewComment('');
    };

    return (
        <div className="container py-4">
            <h1 className="page-title mb-2">{isRent ? 'Rent notes' : 'Buy notes'}</h1>
            <p className="text-center text-muted mb-4">
                {isRent ? 'Choose how many days you need these notes (e.g. 5 days).' : 'Confirm purchase to get these notes once.'}
            </p>
            <hr className="page-divider" />
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card shadow mb-4">
                        <div className="card-body">
                            <h5 className="fw-bold mb-1">{note.topic}</h5>
                            <p className="small text-muted mb-1">
                                {note.subject} · Sem {note.semester}{note.unit && <> · {note.unit}</>}
                            </p>
                            {isRent && <p className="mb-0 mt-1">₹{note.rentPerDay}/day · Max {note.maxDays} days</p>}
                            {!isRent && <p className="mb-0 mt-1">₹{note.buyPrice} (one-time)</p>}
                            <p className="small text-muted mt-2 mb-0">
                                Uploaded {note.uploadedAt || ''}{note.contact && <> · by {note.contact}</>} · Downloads: <strong>{note.downloadCount || 0}</strong>
                            </p>
                            {note.materialData && (
                                <p className="small mt-2 mb-0">
                                    <a
                                        href={note.materialData}
                                        download={note.materialName || `${note.topic}.file`}
                                        className="text-decoration-none"
                                    >
                                        <i className="fas fa-file-download me-1"></i>
                                        {note.materialName || 'Download attached material'}
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="card shadow mb-4">
                        <div className="card-body p-4">
                            <form onSubmit={isRent ? handleRent : handleBuy}>
                                {isRent && (
                                    <div className="mb-3">
                                        <label className="form-label">Rent for how many days? *</label>
                                        <select className="form-select" value={days} onChange={(e) => setDays(parseInt(e.target.value, 10))}>
                                            {Array.from({ length: note.maxDays }, (_, i) => i + 1).map((d) => (
                                                <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                        <small className="text-muted">Total: ₹{days * note.rentPerDay}</small>
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
                                    <button type="submit" className="btn btn-primary">{isRent ? 'Confirm rent' : 'Confirm purchase'}</button>
                                    <Link to="/notes" className="btn btn-outline-secondary">Cancel</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-3"><i className="fas fa-comments me-2"></i>Discussion</h6>
                            {comments.length === 0 ? (
                                <p className="small text-muted">No comments yet. Be the first to ask a question or share a tip.</p>
                            ) : (
                                <ul className="list-unstyled mb-3 small">
                                    {comments.map((c) => (
                                        <li key={c.id} className="mb-2">
                                            <div className="fw-semibold">{c.userEmail}</div>
                                            <div>{c.text}</div>
                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                {new Date(c.createdAt).toLocaleString()}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <form onSubmit={handleAddComment}>
                                <div className="mb-2">
                                    <label className="form-label small">Add a comment</label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Ask a question about these notes or share a tip..."
                                    />
                                </div>
                                {error && <div className="text-danger mb-2 small">{error}</div>}
                                <button type="submit" className="btn btn-primary btn-sm">Post comment</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteDetail;
