import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ChevronRight, ShieldCheck } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = login(email, password);
        if (result.success) {
            if (email.includes('admin')) {
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
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 placeholder:text-gray-300 font-medium"
                                    placeholder="name@hunarmand.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 placeholder:text-gray-300 font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
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

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <div className="text-[10px] text-gray-400 font-mono space-y-1">
                            <p>Employee: ali@hunarmand.com / password123</p>
                            <p>Admin: admin@hunarmand.com / adminpassword</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 text-white/40 text-xs font-medium z-0">
                © 2026 GovTech Punjab
            </div>
        </div>
    );
}
