import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Validator } from '../utils/validator';
import { bookStorage } from '../utils/storage';
import { auth } from '../utils/auth';

const PostBook = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        author: '',
        course: '',
        semester: '',
        rentPerDay: '',
        maxDays: '14',
        salePrice: '',
        condition: 'Good',
        description: '',
        contact: '',
        materialName: '',
        materialType: '',
        materialData: '',
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
        if (file.size > 10 * 1024 * 1024) {
            setError('File too large. Please upload a file up to 10MB.');
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
        if (!Validator.isNotEmpty(form.title)) {
            setError('Book title is required');
            return;
        }
        if (!Validator.isNotEmpty(form.course)) { setError('Course/Subject is required'); return; }
        const rent = parseInt(form.rentPerDay, 10);
        if (isNaN(rent) || rent < 1) {
            setError('Enter valid rent per day (₹)');
            return;
        }
        const max = parseInt(form.maxDays, 10);
        if (isNaN(max) || max < 1 || max > 90) {
            setError('Max days should be 1–90');
            return;
        }
        if (!Validator.isNotEmpty(form.contact)) {
            setError('Your contact email is required');
            return;
        }
        if (!Validator.isValidEmail(form.contact)) { setError('Valid email required'); return; }
        const sale = form.salePrice ? parseInt(form.salePrice, 10) : null;
        if (form.salePrice && (isNaN(sale) || sale < 0)) {
            setError('Enter valid sale price (₹) or leave blank');
            return;
        }
        bookStorage.add({
            title: form.title.trim(),
            author: form.author.trim(),
            course: form.course.trim(),
            semester: form.semester.trim(),
            rentPerDay: rent,
            maxDays: max,
            salePrice: sale,
            condition: form.condition,
            description: form.description.trim(),
            contact: form.contact.trim(),
            materialName: form.materialName,
            materialType: form.materialType,
            materialData: form.materialData,
        });
        alert('Book added for rent! Students can now rent it for the number of days they need.');
        navigate('/books');
    };

    return (
        <div className="container py-4">
            <h1 className="page-title mb-2"><i className="fas fa-plus-circle me-2"></i>Add Book for Rent</h1>
            <p className="text-center text-muted mb-4">Offer your book for rent. Students will choose how many days they need (e.g. 5 days).</p>
            <hr className="page-divider" />
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Book title *</label>
                                    <input type="text" className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Introduction to Algorithms" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Author</label>
                                    <input type="text" className="form-control" name="author" value={form.author} onChange={handleChange} placeholder="e.g. Cormen" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Course / Subject *</label>
                                    <input type="text" className="form-control" name="course" value={form.course} onChange={handleChange} placeholder="e.g. DSA, DBMS" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Semester (optional)</label>
                                    <input type="text" className="form-control" name="semester" value={form.semester} onChange={handleChange} placeholder="e.g. 3" />
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Rent per day (₹) *</label>
                                        <input type="number" className="form-control" name="rentPerDay" value={form.rentPerDay} onChange={handleChange} placeholder="10" min="1" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Max rental days *</label>
                                        <input type="number" className="form-control" name="maxDays" value={form.maxDays} onChange={handleChange} min="1" max="90" />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Sale price (₹, optional)</label>
                                        <input type="number" className="form-control" name="salePrice" value={form.salePrice} onChange={handleChange} min="0" placeholder="e.g. 250" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Condition</label>
                                        <select className="form-select" name="condition" value={form.condition} onChange={handleChange}>
                                            <option value="New">New</option>
                                            <option value="Like new">Like new</option>
                                            <option value="Good">Good</option>
                                            <option value="Used">Used</option>
                                            <option value="Old">Old</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description (optional)</label>
                                    <textarea className="form-control" name="description" rows="2" value={form.description} onChange={handleChange} placeholder="Edition, condition, etc." />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Upload material (PDF, DOC, PPT, ZIP, etc.)</label>
                                    <input type="file" className="form-control" onChange={handleMaterialChange} />
                                    {form.materialName && (
                                        <small className="text-muted d-block mt-1">
                                            Selected file: <strong>{form.materialName}</strong>
                                        </small>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Your contact email *</label>
                                    <input type="email" className="form-control" name="contact" value={form.contact} onChange={handleChange} placeholder="your@email.com" />
                                </div>
                                {error && <div className="text-danger mb-2">{error}</div>}
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary">Add Book</button>
                                    <Link to="/books" className="btn btn-outline-secondary">Cancel</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostBook;
