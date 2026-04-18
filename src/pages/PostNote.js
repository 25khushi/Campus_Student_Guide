import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Validator } from '../utils/validator';
import { noteStorage } from '../utils/storage';
import { auth } from '../utils/auth';

const PostNote = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        type: 'rent',
        subject: 'DSA',
        topic: '',
        unit: '',
        semester: '3',
        description: '',
        contact: '',
        rentPerDay: '',
        maxDays: '7',
        buyPrice: '',
        materialName: '',
        materialData: '',
        materialType: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (user?.email) {
            setForm((prev) => ({ ...prev, contact: user.email }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleMaterialChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError('File too large. Please upload a file up to 5MB.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setForm((prev) => ({
                ...prev,
                materialName: file.name,
                materialType: file.type || 'application/octet-stream',
                materialData: String(reader.result || ''),
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!Validator.isNotEmpty(form.topic)) { setError('Topic is required'); return; }
        if (!Validator.isNotEmpty(form.contact)) {
            setError('Contact email is required');
            return;
        }
        if (!Validator.isValidEmail(form.contact)) {
            setError('Valid email required');
            return;
        }
        if (form.type === 'rent') {
            const rent = parseInt(form.rentPerDay, 10);
            const max = parseInt(form.maxDays, 10);
            if (isNaN(rent) || rent < 1) {
                setError('Enter valid rent per day (₹)');
                return;
            }
            if (isNaN(max) || max < 1 || max > 30) {
                setError('Max days should be 1–30');
                return;
            }
            noteStorage.add({
                type: 'rent',
                subject: form.subject,
                topic: form.topic.trim(),
                unit: form.unit.trim(),
                semester: form.semester,
                description: form.description.trim(),
                contact: form.contact.trim(),
                rentPerDay: rent,
                maxDays: max,
                materialName: form.materialName,
                materialType: form.materialType,
                materialData: form.materialData,
            });
            alert('Notes added for rent! Students can rent them for the number of days they need.');
        } else {
            const price = parseInt(form.buyPrice, 10);
            if (isNaN(price) || price < 0) {
                setError('Enter valid price (₹)');
                return;
            }
            noteStorage.add({
                type: 'buy',
                subject: form.subject,
                topic: form.topic.trim(),
                unit: form.unit.trim(),
                semester: form.semester,
                description: form.description.trim(),
                contact: form.contact.trim(),
                buyPrice: price,
                materialName: form.materialName,
                materialType: form.materialType,
                materialData: form.materialData,
            });
            alert('Notes added for sale! Students can buy them once.');
        }
        navigate('/notes');
    };

    return (
        <div className="container py-4">
            <h1 className="page-title mb-2"><i className="fas fa-edit me-2"></i>Add Notes – For Rent or Buy</h1>
            <p className="text-center text-muted mb-4">Offer notes to rent (per day) or to buy (one-time).</p>
            <hr className="page-divider" />
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Notes are for</label>
                                    <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                                        <option value="rent">Rent (student chooses days, e.g. 5 days)</option>
                                        <option value="buy">Buy (one-time purchase)</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Subject *</label>
                                    <select className="form-select" name="subject" value={form.subject} onChange={handleChange}>
                                        {['DSA', 'DBMS', 'OS', 'CN', 'Math', 'Other'].map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Topic *</label>
                                    <input type="text" className="form-control" name="topic" value={form.topic} onChange={handleChange} placeholder="e.g. Trees & Graphs" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Unit / Chapter (optional)</label>
                                    <input type="text" className="form-control" name="unit" value={form.unit} onChange={handleChange} placeholder="e.g. Unit 3 - Trees" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Semester</label>
                                    <select className="form-select" name="semester" value={form.semester} onChange={handleChange}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description (optional)</label>
                                    <textarea className="form-control" name="description" rows="2" value={form.description} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Upload notes material (PDF, DOC, PPT, ZIP, etc.)</label>
                                    <input type="file" className="form-control" onChange={handleMaterialChange} />
                                    {form.materialName && (
                                        <small className="text-muted d-block mt-1">
                                            Selected file: <strong>{form.materialName}</strong>
                                        </small>
                                    )}
                                </div>
                                {form.type === 'rent' && (
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Rent per day (₹) *</label>
                                            <input type="number" className="form-control" name="rentPerDay" value={form.rentPerDay} onChange={handleChange} min="1" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Max rental days *</label>
                                            <input type="number" className="form-control" name="maxDays" value={form.maxDays} onChange={handleChange} min="1" max="30" />
                                        </div>
                                    </div>
                                )}
                                {form.type === 'buy' && (
                                    <div className="mb-3">
                                        <label className="form-label">Price (₹) *</label>
                                        <input type="number" className="form-control" name="buyPrice" value={form.buyPrice} onChange={handleChange} min="0" placeholder="e.g. 50" />
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">Your contact email *</label>
                                    <input type="email" className="form-control" name="contact" value={form.contact} onChange={handleChange} placeholder="your@email.com" />
                                </div>
                                {error && <div className="text-danger mb-2">{error}</div>}
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary">Add Notes</button>
                                    <Link to="/notes" className="btn btn-outline-secondary">Cancel</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostNote;
