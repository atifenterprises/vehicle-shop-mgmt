import React, { useState, useContext, createContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        //check session on mount
        const checkSession = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    setIsAuthenticated(false);
                    setLoading(false);
                    return;
                }
                const response = await fetch('http://localhost:5000/api/session', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                });
                const result = await response.json();
                setIsAuthenticated(response.ok && result.isAuthenticated);

            } catch (error) {
                console.error('Session check error:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (email, password, name) => {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('access_token', result.session.access_token);
            setIsAuthenticated(true);
            return result;
        } else {
            throw new Error(result.message || 'Login failed');
        }
    };
    const logout = async () => {
        try {
            await fetch('http://localhost:5000/api/signout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            localStorage.removeItem('access_token');
            setIsAuthenticated(false);
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };


    return (
        <AuthContext.Provider value={{ isAuthenticated,loading, login, logout }}>
            {children}
        </AuthContext.Provider>

    );
};

export const useAuth = () => useContext(AuthContext);