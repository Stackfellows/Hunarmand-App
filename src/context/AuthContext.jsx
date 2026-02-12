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
                // Verify token with backend
                try {
                    const { data } = await api.get('/api/auth/me');
                    if (data.success) {
                        setUser(data.user);
                        // Update stored user in case data changed
                        localStorage.setItem('hunarmand_user', JSON.stringify({ ...data.user, token: parsedUser.token }));
                    } else {
                        logout();
                    }
                } catch (err) {
                    console.error('Token verification failed:', err);
                    logout();
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (cnic, password) => {
        console.log('[DEBUG] Attempting login at:', api.defaults.baseURL + '/api/auth/login');
        console.log('[DEBUG] Payload:', { cnic, passwordLen: password?.length });
        try {
            const { data } = await api.post('/api/auth/login', { cnic, password });
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
            const message = err.response?.data?.message ||
                (err.code === 'ERR_NETWORK' ? 'Cannot connect to server. Did you run "npm run dev"?' : 'Login failed');
            return {
                success: false,
                message: message
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

