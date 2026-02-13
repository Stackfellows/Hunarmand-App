import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Briefcase, MapPin, BadgeCheck, Clock, Hash, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    if (!user) return null;

    const InfoItem = ({ icon: Icon, label, value }) => (
        <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-50">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-gray-800 font-medium mt-0.5">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 h-full overflow-y-auto pb-24 scrollbar-hide">
            <div className="bg-gradient-to-br from-[#70b91c] to-[#5da012] pb-24 pt-12 px-6 rounded-b-[3rem] relative shadow-xl overflow-hidden shrink-0">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

                {/* Back Button */}
                <Link to="/employee/dashboard" className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition z-20 border border-white/10 shadow-sm">
                    <ArrowLeft size={20} />
                </Link>

                <div className="text-center relative z-10">
                    <div className="relative inline-block">
                        <img
                            src={user?.avatar || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-28 h-28 rounded-full border-4 border-white shadow-lg mx-auto"
                        />
                        <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-4 text-shadow-sm">{user?.name}</h2>
                    <p className="text-white/90 font-medium">{user?.title}</p>
                </div>
            </div>

            <div className="px-6 -mt-16 space-y-3 pb-8 relative z-20">
                <InfoItem icon={Hash} label="ERP ID" value={user?.erpId} />
                <InfoItem icon={Briefcase} label="Department" value={user?.department || 'Production'} />
                <InfoItem icon={MapPin} label="Workplace" value={user?.workplace || 'Gardan Town Lahore'} />
                <InfoItem icon={Clock} label="Shift" value={user?.shift || '09:00 - 17:00'} />
                <InfoItem icon={BadgeCheck} label="Designation" value={user?.title || 'Employee'} />
                <InfoItem icon={Hash} label="CNIC Number" value={user?.cnic} />
            </div>

            <div className="mt-8 px-6">
                <button className="w-full py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition shadow-sm">
                    Edit Profile Information
                </button>
            </div>
        </div>
    );
}
