import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../Services/api';
import { Box } from 'lucide-react';
import '../Styles/auth.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [touched, setTouched] = useState({});
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

    // Calculate password strength
    const calculatePasswordStrength = (password) => {
        let score = 0;

        if (!password) return { score: 0, label: '', color: '' };

        // Length check
        if (password.length >= 6) score += 1;
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;

        // Character type checks
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;

        // Determine label and color
        if (score <= 2) return { score: 1, label: 'Weak', color: '#EF4444' };
        if (score <= 4) return { score: 2, label: 'Fair', color: '#F59E0B' };
        if (score <= 5) return { score: 3, label: 'Good', color: '#10B981' };
        return { score: 4, label: 'Strong', color: '#059669' };
    };

    useEffect(() => {
        setPasswordStrength(calculatePasswordStrength(formData.password));
    }, [formData.password]);

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email is required';
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return '';
    };

    const validateName = (name) => {
        if (!name) return 'Full name is required';
        if (name.length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
        return '';
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phone) return 'Phone number is required';
        if (!phoneRegex.test(phone.replace(/\D/g, ''))) return 'Please enter a valid 10-digit phone number';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
        if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
        return '';
    };

    const validateConfirmPassword = (confirmPassword, password) => {
        if (!confirmPassword) return 'Please confirm your password';
        if (confirmPassword !== password) return 'Passwords do not match';
        return '';
    };

    const validateForm = () => {
        const newErrors = {
            email: validateEmail(formData.email),
            name: validateName(formData.name),
            phone: validatePhone(formData.phone),
            password: validatePassword(formData.password),
            confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password)
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Real-time validation for touched fields
        if (touched[name]) {
            validateField(name, value);
        }
    };

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'email':
                error = validateEmail(value);
                break;
            case 'name':
                error = validateName(value);
                break;
            case 'phone':
                error = validatePhone(value);
                break;
            case 'password':
                error = validatePassword(value);
                // Also revalidate confirm password when password changes
                if (formData.confirmPassword) {
                    setErrors(prev => ({
                        ...prev,
                        password: error,
                        confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
                    }));
                    return;
                }
                break;
            case 'confirmPassword':
                error = validateConfirmPassword(value, formData.password);
                break;
            default:
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const handlePhoneChange = (e) => {
        const { value } = e.target;
        // Only allow digits
        const cleaned = value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({ ...prev, phone: cleaned }));

        if (touched.phone) {
            setErrors(prev => ({ ...prev, phone: validatePhone(cleaned) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({
            email: true,
            name: true,
            phone: true,
            password: true,
            confirmPassword: true
        });

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors(prev => ({ ...prev, submit: '' }));

        try {
            // Call the actual registration API
            const response = await authAPI.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                phone: formData.phone || null
            });

            if (response.data.success) {
                // On success, redirect to login with success message
                navigate('/login', {
                    state: {
                        message: 'Account created successfully! Please login.',
                        type: 'success'
                    }
                });
            } else {
                setErrors(prev => ({
                    ...prev,
                    submit: response.data.message || 'Registration failed. Please try again.'
                }));
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            setErrors(prev => ({
                ...prev,
                submit: errorMessage
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page register-page">
            {/* Background Elements */}
            <div className="auth-bg-shapes">
                <div className="auth-shape auth-shape-1"></div>
                <div className="auth-shape auth-shape-2"></div>
                <div className="auth-shape auth-shape-3"></div>
            </div>

            {/* Navbar */}
            <nav className="auth-navbar">
                <Link to="/" className="auth-logo">
                    <div className="logo-icon">
                        <Box size={24} />
                    </div>
                    <span className="logo-text">RentFlow</span>
                </Link>
                <Link to="/" className="home-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Home
                </Link>
            </nav>

            {/* Main Content */}
            <div className="auth-container">
                <div className="auth-card auth-card-register animate-slide-up">
                    {/* Card Header */}
                    <div className="auth-header">
                        <div className="auth-icon-wrapper">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">Join RentFlow and start managing your rentals</p>
                    </div>

                    {/* Form */}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        {errors.submit && (
                            <div className="form-error-banner">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <circle cx="12" cy="16" r="1" fill="currentColor" />
                                </svg>
                                <span>{errors.submit}</span>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className={`form-group ${errors.email && touched.email ? 'has-error' : ''} ${formData.email && !errors.email ? 'is-valid' : ''}`}>
                            <label htmlFor="email" className="form-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Your Email
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="admin@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    autoComplete="email"
                                />
                                {formData.email && !errors.email && (
                                    <span className="input-icon valid">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                            {errors.email && touched.email && (
                                <span className="form-error">{errors.email}</span>
                            )}
                        </div>

                        {/* Name Field */}
                        <div className={`form-group ${errors.name && touched.name ? 'has-error' : ''} ${formData.name && !errors.name ? 'is-valid' : ''}`}>
                            <label htmlFor="name" className="form-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Your Name
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="form-input"
                                    placeholder="e.g. John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    autoComplete="name"
                                />
                                {formData.name && !errors.name && (
                                    <span className="input-icon valid">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                            {errors.name && touched.name && (
                                <span className="form-error">{errors.name}</span>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div className={`form-group ${errors.phone && touched.phone ? 'has-error' : ''} ${formData.phone && !errors.phone ? 'is-valid' : ''}`}>
                            <label htmlFor="phone" className="form-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 16.92V19.92C22 20.48 21.78 21.02 21.39 21.41C20.99 21.79 20.46 22 19.92 22C16.34 21.68 12.91 20.41 10.04 18.28C7.36 16.31 5.14 13.89 3.47 11.02C1.33 8.13 0.06 4.68 0.02 1.08C0 0.54 0.21 0.01 0.59 -0.38C0.98 -0.78 1.51 -1 2.08 -1H5.08C6.06 -1 6.89 -0.3 7.05 0.67C7.21 1.65 7.51 2.6 7.94 3.49C8.23 4.08 8.09 4.79 7.6 5.23L6.27 6.56C7.78 9.16 9.93 11.31 12.53 12.82L13.86 11.49C14.3 11 15.01 10.86 15.6 11.15C16.49 11.58 17.44 11.88 18.42 12.04C19.41 12.2 20.09 13.05 20.08 14.01V16.92H22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Your Phone
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="form-input"
                                    placeholder="e.g. 9098980900"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    onBlur={handleBlur}
                                    autoComplete="tel"
                                    maxLength="10"
                                />
                                {formData.phone && !errors.phone && (
                                    <span className="input-icon valid">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                            {errors.phone && touched.phone && (
                                <span className="form-error">{errors.phone}</span>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className={`form-group ${errors.password && touched.password ? 'has-error' : ''}`}>
                            <label htmlFor="password" className="form-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Password
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Password Strength Meter */}
                            {formData.password && (
                                <div className="password-strength">
                                    <div className="strength-bars">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`strength-bar ${passwordStrength.score >= level ? 'active' : ''}`}
                                                style={{
                                                    backgroundColor: passwordStrength.score >= level ? passwordStrength.color : '#E5E7EB'
                                                }}
                                            ></div>
                                        ))}
                                    </div>
                                    <span className="strength-label" style={{ color: passwordStrength.color }}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                            )}

                            {errors.password && touched.password && (
                                <span className="form-error">{errors.password}</span>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className={`form-group ${errors.confirmPassword && touched.confirmPassword ? 'has-error' : ''} ${formData.confirmPassword && !errors.confirmPassword ? 'is-valid' : ''}`}>
                            <label htmlFor="confirmPassword" className="form-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Confirm Password
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className="form-input"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && touched.confirmPassword && (
                                <span className="form-error">{errors.confirmPassword}</span>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign Up</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login" className="auth-link">Login</Link></p>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="auth-decoration">
                <div className="decoration-circle circle-1"></div>
                <div className="decoration-circle circle-2"></div>
            </div>
        </div>
    );
};

export default RegisterPage;
