import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const storedUser = localStorage.getItem('hunarmand_user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                // Optional: Verify token with backend
                // try {
                //     const { data } = await api.get('/api/auth/me');
                //     setUser(data.user);
                // } catch (err) {
                //     logout();
                // }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            if (data.success) {
                setUser(data.user);
                // Store user + token
                localStorage.setItem('hunarmand_user', JSON.stringify({ ...data.user, token: data.token }));
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (err) {
            console.error(err);
            return {
                success: false,
                message: err.response?.data?.message || 'Connection error. Is the backend running?'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('hunarmand_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

