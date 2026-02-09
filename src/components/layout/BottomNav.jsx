import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav() {
    const { logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', icon: Home, path: '/employee/dashboard' },
        { name: 'Attendance', icon: Calendar, path: '/employee/attendance' },
        { name: 'Profile', icon: User, path: '/employee/profile' },
    ];

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                            }`
                        }
                    >
                        <item.icon size={24} strokeWidth={2} />
                        <span className="text-xs font-medium">{item.name}</span>
                    </NavLink>
                ))}
                <button
                    onClick={logout}
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 hover:text-red-500"
                >
                    <LogOut size={24} strokeWidth={2} />
                    <span className="text-xs font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
