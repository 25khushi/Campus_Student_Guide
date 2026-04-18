import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Validator } from '../utils/validator';
import { lostFoundStorage, activityStorage, notificationStorage } from '../utils/storage';
import { auth } from '../utils/auth';

const ReportFound = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ title: '', description: '', location: '', contact: '' });
    const [imagePreview, setImagePreview] = useState(null);
    const [imageData, setImageData] = useState(null);
    const [error, setError] = useState('');
    const [trackingId, setTrackingId] = useState(null);
    const [matches, setMatches] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setImageData(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!Validator.isNotEmpty(formData.title)) { setError('Item name/title is required'); return; }
        if (!Validator.isNotEmpty(formData.description)) { setError('Description is required'); return; }
        if (!Validator.isNotEmpty(formData.location)) { setError('Location where found is required'); return; }
        if (!Validator.isNotEmpty(formData.contact)) { setError('Contact email is required'); return; }
        if (!Validator.isValidEmail(formData.contact)) { setError('Please enter a valid email'); return; }

        const possibleMatches = lostFoundStorage.findMatchingLostForFound({
            title: formData.title,
            location: formData.location,
        });

        const id = lostFoundStorage.add({
            type: 'found',
            title: formData.title.trim(),
            description: formData.description.trim(),
            location: formData.location.trim(),
            contact: formData.contact.trim(),
            image: imageData || null,
        });

        const user = auth.getCurrentUser();
        const finderEmail = user?.email || formData.contact.trim();
        if (finderEmail) {
            activityStorage.log({
                type: 'found-report',
                userEmail: finderEmail,
                description: `You reported found item "${formData.title.trim()}".`,
                relatedId: id,
            });
        }
        possibleMatches.forEach((lost) => {
            notificationStorage.add({
                toEmail: lost.contact,
                type: 'lost-found-match',
                message: `Someone reported a found item "${formData.title.trim()}" that may match your lost report "${lost.title}".`,
                relatedId: lost.id,
            });
        });

        setTrackingId(id);
        setMatches(possibleMatches);
    };

    return (
        <div className="container py-4">
            <h1 className="page-title mb-2"><i className="fas fa-hand-holding me-2"></i>Report Found Item</h1>
            <p className="text-center text-muted mb-4">Found something? Submit it here so the owner can claim it.</p>
            <hr className="page-divider" />
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-3">
                                    <label className="form-label">Item name / Title <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Black Umbrella" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description <span className="text-danger">*</span></label>
                                    <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange} placeholder="Describe the item so owner can identify..." />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Where did you find it? <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Main Gate, Canteen" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Upload photo (optional)</label>
                                    <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                                    {imagePreview && <img src={imagePreview} alt="Preview" className="img-thumbnail mt-2" style={{ maxHeight: '150px' }} />}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Your contact email <span className="text-danger">*</span></label>
                                    <input type="email" className="form-control" name="contact" value={formData.contact} onChange={handleChange} placeholder="your@email.com" />
                                </div>
                                {error && <div className="text-danger mb-3">{error}</div>}
                                {trackingId ? (
                                    <div className="alert alert-success">
                                        <h6 className="fw-bold"><i className="fas fa-check-circle me-2"></i>Found item submitted successfully!</h6>
                                        <p className="mb-2">Your tracking ID: <strong className="fs-5">{trackingId}</strong></p>
                                        <p className="small mb-2">Save this ID to track your report. Owner can contact you at: <strong>{formData.contact}</strong></p>
                                        {matches.length > 0 && (
                                            <div className="mt-3">
                                                <hr />
                                                <h6 className="fw-bold mb-2"><i className="fas fa-link me-2"></i>Possible matching lost reports</h6>
                                                <p className="small text-muted mb-2">
                                                    These students reported a <strong>lost</strong> item that looks similar. You can email them directly.
                                                </p>
                                                <div className="list-group mb-2">
                                                    {matches.map((item) => (
                                                        <div key={item.id} className="list-group-item list-group-item-action">
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div>
                                                                    <div className="fw-bold">{item.title}</div>
                                                                    <div className="small text-muted mb-1">
                                                                        <i className="fas fa-map-marker-alt me-1 text-primary"></i>
                                                                        {item.location} · <i className="fas fa-calendar me-1"></i>{item.date}
                                                                    </div>
                                                                    <div className="small text-muted">{item.description}</div>
                                                                </div>
                                                                <span className="badge bg-warning text-dark ms-2">Lost report</span>
                                                            </div>
                                                            <div className="small mt-2">
                                                                <i className="fas fa-envelope me-1"></i>
                                                                <a href={`mailto:${item.contact}`} className="text-decoration-none">
                                                                    {item.contact}
                                                                </a>
                                                            </div>
                                                            <div className="small text-muted mt-1">
                                                                Tracking ID: <code>{item.id}</code>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="d-flex gap-2">
                                            <Link to="/track" className="btn btn-primary btn-sm">Track Now</Link>
                                            <Link to="/lost-found" className="btn btn-outline-secondary btn-sm">View All</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-primary"><i className="fas fa-paper-plane me-1"></i>Submit Found Item</button>
                                        <Link to="/lost-found" className="btn btn-outline-secondary">Cancel</Link>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportFound;
