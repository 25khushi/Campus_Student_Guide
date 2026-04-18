import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Validator } from '../utils/validator';
import { lostFoundStorage, activityStorage } from '../utils/storage';
import { auth } from '../utils/auth';

const ReportLost = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ title: '', description: '', location: '', contact: '' });
    const [imagePreview, setImagePreview] = useState(null);
    const [imageData, setImageData] = useState(null);
    const [error, setError] = useState('');
    const [trackingId, setTrackingId] = useState(null);

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
        if (!Validator.isNotEmpty(formData.location)) { setError('Location where lost is required'); return; }
        if (!Validator.isNotEmpty(formData.contact)) { setError('Contact email is required'); return; }
        if (!Validator.isValidEmail(formData.contact)) { setError('Please enter a valid email'); return; }
        
        const id = lostFoundStorage.add({
            type: 'lost',
            title: formData.title.trim(),
            description: formData.description.trim(),
            location: formData.location.trim(),
            contact: formData.contact.trim(),
            image: imageData || null,
        });

        const user = auth.getCurrentUser();
        if (user?.email) {
            activityStorage.log({
                type: 'lost-report',
                userEmail: user.email,
                description: `You reported lost item "${formData.title.trim()}".`,
                relatedId: id,
            });
        }

        setTrackingId(id);
    };

    return (
        <div className="container py-4">
            <h1 className="page-title mb-2"><i className="fas fa-exclamation-triangle me-2"></i>Report Lost Item</h1>
            <p className="text-center text-muted mb-4">Login and submit details so others can help you find it.</p>
            <hr className="page-divider" />
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-3">
                                    <label className="form-label">Item name / Title <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Blue Backpack" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description <span className="text-danger">*</span></label>
                                    <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange} placeholder="Describe the item, any identifying marks..." />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Where did you lose it? <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Main Library, Lab 302" />
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
                                        <h6 className="fw-bold"><i className="fas fa-check-circle me-2"></i>Report submitted successfully!</h6>
                                        <p className="mb-2">Your tracking ID: <strong className="fs-5">{trackingId}</strong></p>
                                        <p className="small mb-2">Save this ID to track your report. You can track it at: <Link to="/track">Track My Report</Link></p>
                                        <div className="d-flex gap-2">
                                            <Link to="/track" className="btn btn-primary btn-sm">Track Now</Link>
                                            <Link to="/lost-found" className="btn btn-outline-secondary btn-sm">View All</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-primary"><i className="fas fa-paper-plane me-1"></i>Submit Report</button>
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

export default ReportLost;
