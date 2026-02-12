import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, ChevronRight, ShieldCheck } from 'lucide-react';

export default function Login() {
    const [cnic, setCnic] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!loading && user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/employee');
            }
        }
    }, [user, loading, navigate]);

    const formatCNIC = (value) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');

        // Apply mask: XXXXX-XXXXXXX-X
        let formatted = '';
        if (digits.length > 0) {
            formatted += digits.substring(0, 5);
        }
        if (digits.length > 5) {
            formatted += '-' + digits.substring(5, 12);
        }
        if (digits.length > 12) {
            formatted += '-' + digits.substring(12, 13);
        }

        return formatted;
    };

    const handleCnicChange = (e) => {
        const value = e.target.value;
        const formatted = formatCNIC(value);
        if (formatted.length <= 15) { // 13 digits + 2 dashes
            setCnic(formatted);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(cnic, password);
        if (result.success) {
            // Check if user is admin
            const storedUser = JSON.parse(localStorage.getItem('hunarmand_user'));
            if (storedUser?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/employee');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-96 bg-[#0f4c75] rounded-b-[4rem] shadow-2xl z-0"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] pointer-events-none z-0"></div>

            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
                {/* Header Section */}
                <div className="pt-10 pb-6 px-8 text-center bg-white relative">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-[#5da012]"></div>
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl mb-4 shadow-sm transform hover:scale-105 transition-transform duration-300">
                        <ShieldCheck size={40} className="text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Hunarmand Punjab</h2>
                    <p className="text-gray-500 text-sm mt-1">Official Workforce Portal</p>
                </div>

                {/* Form Section */}
                <div className="px-8 pb-10">
                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center space-x-3 text-red-600 animate-in slide-in-from-top-2">
                            <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                            <p className="text-xs font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide ml-1">CNIC Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <ShieldCheck className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 placeholder:text-gray-300 font-medium"
                                    placeholder="31103-XXXXXXX-X"
                                    value={cnic}
                                    onChange={handleCnicChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Password</label>
                                <a href="#" className="text-xs text-primary hover:text-green-700 font-bold transition-colors">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 placeholder:text-gray-300 font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off"><path d="M9.88 9.88l-3.29-3.29m7.59 7.59l3.29 3.29" /><path d="M2 2l20 20" /><path d="M10.37 4.37a9 9 0 0 1 8 5.23m-4.7 4.7a9 9 0 0 1-11.48-4.7" /><path d="M15.5 15.5l-2.07-2.07" /><path d="M12 12l.01.01" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-[#5da012] text-white py-4 rounded-xl font-bold text-lg shadow-[0_10px_20px_-10px_rgba(112,185,28,0.5)] hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center group mt-4"
                        >
                            <span>Sign In</span>
                            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400">
                            By logging in, you agree to our <a href="#" className="underline hover:text-gray-600">Terms</a> & <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>
                        </p>
                    </div>


                </div>
            </div>

            <div className="absolute bottom-6 text-white/40 text-xs font-medium z-0">
                © 2026 GovTech Punjab
            </div>
        </div>
    );
}
