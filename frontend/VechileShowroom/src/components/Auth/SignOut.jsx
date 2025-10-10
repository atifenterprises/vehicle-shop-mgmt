// SignOut.jsx
import React from 'react';
import { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { Navigate, useNavigate } from 'react-router-dom';

const SignOut = () => {
    const[message, setMessage] = useState('');
    const navigate = useNavigate();
    const handleSignOut = async () => {
        const token = localStorage.getItem('access_token');
        
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Sign out error:', err);
        }
    };

    return (
        <>
            <button onClick={handleSignOut}>Sign Out</button>
            {message && <p>{message}</p>}
        </>

    );
};

export default SignOut;