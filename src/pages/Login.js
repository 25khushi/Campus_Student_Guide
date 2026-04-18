import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Validator } from '../utils/validator';
import { auth } from '../utils/auth';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');

    useEffect(() => {
        const existing = auth.getCurrentUser();
        if (existing?.email) {
            setInfo(`You are already signed in as ${existing.email}`);
            setFormData((prev) => ({ ...prev, email: existing.email }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setInfo('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!Validator.isNotEmpty(formData.email)) { setError('Email is required'); return; }
        if (!Validator.isValidEmail(formData.email)) { setError('Please enter a valid email'); return; }
        if (!Validator.isNotEmpty(formData.password)) { setError('Password is required'); return; }
        if (!Validator.isValidPassword(formData.password)) { setError('Password must be at least 6 characters'); return; }

        auth.setCurrentUser({ email: formData.email.trim() });
        setInfo('Login successful. You are now signed in.');
        navigate('/');
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <h2>Login</h2>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-floating mb-3">
                        <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                        <label htmlFor="email"><i className="fas fa-envelope me-2"></i>Email address</label>
                    </div>
                    <div className="form-floating mb-2">
                        <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
                        <label htmlFor="password"><i className="fas fa-lock me-2"></i>Password</label>
                    </div>
                    {error && <div id="error-message" className="text-danger mb-3">{error}</div>}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="rememberMe" />
                            <label className="form-check-label" htmlFor="rememberMe" style={{ color: '#94a3b8' }}>Remember me</label>
                        </div>
                        <a href="#" className="small">Forgot password?</a>
                    </div>
                    {info && !error && <div className="text-success small mb-2">{info}</div>}
                    <div className="d-grid mb-3">
                        <button type="submit" className="btn btn-primary btn-lg"><i className="fas fa-sign-in-alt me-2"></i>Login</button>
                    </div>
                    <div className="divider text-center my-3" style={{ color: '#94a3b8' }}>OR</div>
                    <div className="d-grid gap-2">
                        <button type="button" className="btn social-btn btn-google"><i className="fab fa-google me-2"></i> Continue with Google</button>
                        <button type="button" className="btn social-btn btn-facebook"><i className="fab fa-facebook-f me-2"></i> Continue with Facebook</button>
                        <button type="button" className="btn social-btn btn-github"><i className="fab fa-github me-2"></i> Continue with GitHub</button>
                    </div>
                    <p className="text-center mt-3" style={{ color: '#94a3b8' }}>
                        New to Student Portal? <Link to="/register">Create an account</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
