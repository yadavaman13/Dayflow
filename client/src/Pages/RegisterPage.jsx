import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { CalendarDays } from 'lucide-react';
import '../Styles/auth.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phone: '',
        joiningYear: currentYear,
        role: 'employee'
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [touched, setTouched] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email is required';
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return '';
    };

    const validateName = (name) => {
        if (!name) return 'Full name is required';
        if (name.trim().split(' ').length < 2) return 'Please enter first and last name';
        if (name.length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
        return '';
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phone) return ''; // Phone is optional
        if (!phoneRegex.test(phone.replace(/\D/g, ''))) return 'Please enter a valid 10-digit phone number';
        return '';
    };

    const validateJoiningYear = (year) => {
        if (!year) return 'Joining year is required';
        if (year < 2000 || year > currentYear + 1) return `Year must be between 2000 and ${currentYear + 1}`;
        return '';
    };

    const validateRole = (role) => {
        if (!role) return 'Role is required';
        return '';
    };

    const validateForm = () => {
        const newErrors = {
            email: validateEmail(formData.email),
            name: validateName(formData.name),
            phone: validatePhone(formData.phone),
            joiningYear: validateJoiningYear(formData.joiningYear),
            role: validateRole(formData.role)
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
            case 'joiningYear':
                error = validateJoiningYear(value);
                break;
            case 'role':
                error = validateRole(value);
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
            joiningYear: true,
            role: true
        });

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors(prev => ({ ...prev, submit: '' }));
        setSuccessMessage('');

        try {
            // Call the registration API
            const response = await authAPI.register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                joiningYear: parseInt(formData.joiningYear),
                role: formData.role
            });

            if (response.data.success) {
                // Show success message
                setSuccessMessage(`Employee registered successfully! Employee ID: ${response.data.data.employeeId}. An invite email has been sent to ${response.data.data.email}.`);

                // Reset form
                setFormData({
                    email: '',
                    name: '',
                    phone: '',
                    joiningYear: currentYear,
                    role: 'employee'
                });
                setTouched({});

                // Optionally redirect after a delay
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            message: 'Employee account created successfully!',
                            type: 'success'
                        }
                    });
                }, 3000);
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

            {/* Main Content */}
            <div className="auth-container">
                <div className="auth-card auth-card-register animate-slide-up">
                    {/* Card Header */}
                    <div className="auth-header">
                        <div className="auth-logo-card">
                            <span>DF</span>
                        </div>
                        <h1 className="auth-title">Register New Employee</h1>
                        <p className="auth-subtitle">Create employee account and send invite</p>
                    </div>

                    {/* Form */}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        {successMessage && (
                            <div className="form-success-banner">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{successMessage}</span>
                            </div>
                        )}

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

                        {/* Name Field */}
                        <div className={`form-group ${errors.name && touched.name ? 'has-error' : ''} ${formData.name && !errors.name ? 'is-valid' : ''}`}>
                            <label htmlFor="name" className="form-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Full Name *
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

                        {/* Email Field */}
                        <div className={`form-group ${errors.email && touched.email ? 'has-error' : ''} ${formData.email && !errors.email ? 'is-valid' : ''}`}>
                            <label htmlFor="email" className="form-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Email Address *
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="employee@company.com"
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

                        {/* Phone Field */}
                        <div className={`form-group ${errors.phone && touched.phone ? 'has-error' : ''} ${formData.phone && !errors.phone ? 'is-valid' : ''}`}>
                            <label htmlFor="phone" className="form-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 16.92V19.92C22 20.48 21.78 21.02 21.39 21.41C20.99 21.79 20.46 22 19.92 22C16.34 21.68 12.91 20.41 10.04 18.28C7.36 16.31 5.14 13.89 3.47 11.02C1.33 8.13 0.06 4.68 0.02 1.08C0 0.54 0.21 0.01 0.59 -0.38C0.98 -0.78 1.51 -1 2.08 -1H5.08C6.06 -1 6.89 -0.3 7.05 0.67C7.21 1.65 7.51 2.6 7.94 3.49C8.23 4.08 8.09 4.79 7.6 5.23L6.27 6.56C7.78 9.16 9.93 11.31 12.53 12.82L13.86 11.49C14.3 11 15.01 10.86 15.6 11.15C16.49 11.58 17.44 11.88 18.42 12.04C19.41 12.2 20.09 13.05 20.08 14.01V16.92H22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Phone Number
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="form-input"
                                    placeholder="9098980900"
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

                        {/* Joining Year Field */}
                        <div className={`form-group ${errors.joiningYear && touched.joiningYear ? 'has-error' : ''} ${formData.joiningYear && !errors.joiningYear ? 'is-valid' : ''}`}>
                            <label htmlFor="joiningYear" className="form-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Joining Year *
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    id="joiningYear"
                                    name="joiningYear"
                                    className="form-input"
                                    placeholder={currentYear.toString()}
                                    value={formData.joiningYear}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    min="2000"
                                    max={currentYear + 1}
                                />
                                {formData.joiningYear && !errors.joiningYear && (
                                    <span className="input-icon valid">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                            {errors.joiningYear && touched.joiningYear && (
                                <span className="form-error">{errors.joiningYear}</span>
                            )}
                        </div>

                        {/* Role Field */}
                        <div className={`form-group ${errors.role && touched.role ? 'has-error' : ''} ${formData.role && !errors.role ? 'is-valid' : ''}`}>
                            <label htmlFor="role" className="form-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Role *
                            </label>
                            <div className="input-wrapper">
                                <select
                                    id="role"
                                    name="role"
                                    className="form-input"
                                    value={formData.role}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                >
                                    <option value="employee">Employee</option>
                                    <option value="hr">HR</option>
                                </select>
                                {formData.role && !errors.role && (
                                    <span className="input-icon valid">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                            {errors.role && touched.role && (
                                <span className="form-error">{errors.role}</span>
                            )}
                        </div>

                        {/* Info Box */}
                        <div className="info-box">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="12" cy="8" r="1" fill="currentColor" />
                            </svg>
                            <div>
                                <p><strong>Note:</strong> Employee ID will be auto-generated based on name and joining year.</p>
                                <p>An invite email with password setup link will be sent to the employee's email address.</p>
                            </div>
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
                                    <span>Creating Employee...</span>
                                </>
                            ) : (
                                <>
                                    <span>Register Employee</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="auth-footer">
                        <p>Go back to <Link to="/login" className="auth-link">Login</Link></p>
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
