import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Validator } from '../utils/validator';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', mobile: '', password: '', terms: false });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!Validator.isValidName(formData.name)) newErrors.name = 'Name must be at least 3 characters';
        if (!Validator.isValidEmail(formData.email)) newErrors.email = 'Enter valid email';
        if (!Validator.isValidMobile(formData.mobile)) newErrors.mobile = 'Enter 10-digit mobile number';
        if (!Validator.isValidPassword(formData.password)) newErrors.password = 'Password must be 6+ characters';
        if (!formData.terms) newErrors.terms = 'You must accept terms and conditions';
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            alert('Registration successful!');
            navigate('/login');
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <h2>Register</h2>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-floating mb-3">
                        <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
                        <label htmlFor="name"><i className="fas fa-user me-2"></i>Full Name</label>
                        {errors.name && <div className="text-danger small">{errors.name}</div>}
                    </div>
                    <div className="form-floating mb-3">
                        <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                        <label htmlFor="email"><i className="fas fa-envelope me-2"></i>Email address</label>
                        {errors.email && <div className="text-danger small">{errors.email}</div>}
                    </div>
                    <div className="form-floating mb-3">
                        <input type="tel" className={`form-control ${errors.mobile ? 'is-invalid' : ''}`} id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile" maxLength="10" required />
                        <label htmlFor="mobile"><i className="fas fa-phone me-2"></i>Mobile Number</label>
                        {errors.mobile && <div className="text-danger small">{errors.mobile}</div>}
                    </div>
                    <div className="form-floating mb-3">
                        <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
                        <label htmlFor="password"><i className="fas fa-lock me-2"></i>Password</label>
                        {errors.password && <div className="text-danger small">{errors.password}</div>}
                    </div>
                    <div className="form-check mb-3">
                        <input type="checkbox" className="form-check-input" id="terms" name="terms" checked={formData.terms} onChange={handleChange} required />
                        <label className="form-check-label" htmlFor="terms">I agree to the Terms & Conditions</label>
                        {errors.terms && <div className="text-danger small">{errors.terms}</div>}
                    </div>
                    <div className="d-grid mb-3">
                        <button type="submit" className="btn btn-primary btn-lg"><i className="fas fa-user-plus me-2"></i>Register</button>
                    </div>
                    <p className="text-center mt-3" style={{ color: '#94a3b8' }}>Already have an account? <Link to="/login">Login here</Link></p>
                </form>
            </div>
        </div>
    );
};

export default Register;
