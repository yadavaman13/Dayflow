import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            navigate('/login');
            return;
        }

        setUser(JSON.parse(userData));
    }, [navigate]);

    const handleLogout = () => {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login
        navigate('/login');
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px',
            color: 'white'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
                <h1 style={{ marginBottom: '24px' }}>Welcome to Dashboard</h1>
                
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px'
                }}>
                    <h2 style={{ marginBottom: '16px' }}>User Information</h2>
                    
                    {user.photoURL && (
                        <img 
                            src={user.photoURL} 
                            alt="Profile" 
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                marginBottom: '16px',
                                border: '3px solid white'
                            }}
                        />
                    )}
                    
                    <p><strong>Name:</strong> {user.name || user.username || 'N/A'}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        padding: '12px 32px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '2px solid white',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.color = '#667eea';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.color = 'white';
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
