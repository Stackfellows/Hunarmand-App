import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, MapPin, Send } from 'lucide-react';
import { format } from 'date-fns';
import SwipeButton from '../../components/ui/SwipeButton';
import Modal from '../../components/ui/Modal';
import api from '../../utils/api';

export default function Dashboard() {
    const { user } = useAuth();
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [dailyTask, setDailyTask] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/api/employee/dashboard');
                if (data.success) {
                    setNotifications(data.notifications);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const unreadNotifications = notifications.filter(n => !n.read).length;

    const handleSwipe = async () => {
        try {
            const action = isCheckedIn ? 'check-out' : 'check-in';
            const { data } = await api.post('/api/employee/attendance', {
                action,
                userId: user.id
            });
            if (data.success) {
                setIsCheckedIn(!isCheckedIn);
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to mark attendance');
        }
    };

    const handleProgressSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/api/employee/work-progress', {
                userId: user?.id,
                userName: user?.name,
                task: dailyTask
            });
            if (data.success) {
                setIsProgressModalOpen(false);
                setDailyTask('');
                alert('Daily progress shared with Admin!');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to submit progress');
        }
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto pb-24 scrollbar-hide">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#70b91c] to-[#5da012] pt-12 pb-32 px-6 rounded-b-[2.5rem] relative shrink-0 shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                <div className="flex justify-between items-center text-white mb-6 relative z-10">
                    <div className="flex items-center space-x-3">
                        <img
                            src={user?.avatar || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-12 h-12 rounded-full border-2 border-white"
                        />
                        <div>
                            <p className="text-sm opacity-90">Welcome back,</p>
                            <h2 className="text-xl font-bold">{user?.name}</h2>
                        </div>
                    </div>
                    <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition relative shadow-sm border border-white/10">
                        <Bell size={20} />
                        {unreadNotifications > 0 && (
                            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#6cb31b]"></span>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content Card - Floating up */}
            <div className="px-6 -mt-20 flex-1 flex flex-col mb-24 z-10">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] p-6 mb-6 flex flex-col h-full justify-between border border-gray-100/50">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-gray-500 text-sm">Target Location</p>
                                <div className="flex items-center text-gray-800 font-medium mt-1">
                                    <MapPin size={16} className="text-primary mr-1" />
                                    {user?.workplace || 'Lahore'}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500 text-sm">{format(currentTime, 'EEEE')}</p>
                                <p className="text-2xl font-bold text-gray-800">{format(currentTime, 'hh:mm a')}</p>
                                <p className="text-xs text-gray-400">{format(currentTime, 'dd MMM yyyy')}</p>
                            </div>
                        </div>

                        <div className="py-8 flex justify-center">
                            <img
                                src="https://img.freepik.com/free-vector/time-management-concept-landing-page_52683-22806.jpg?w=740"
                                alt="Attendance Illustration"
                                className="w-full max-h-40 object-contain rounded-xl"
                            />
                        </div>

                    </div>

                    {/* Swipe Button Simulation */}
                    <div className="mt-4">
                        <SwipeButton onSwipe={handleSwipe} isCheckedIn={isCheckedIn} />
                        <p className="text-center text-xs text-gray-400 mt-3">
                            {isCheckedIn ? 'You are currently clocked in' : 'Swipe right to mark attendance'}
                        </p>

                        <button
                            onClick={() => setIsProgressModalOpen(true)}
                            className="w-full mt-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-medium border border-gray-200 hover:bg-gray-100 transition flex items-center justify-center space-x-2"
                        >
                            <Send size={18} />
                            <span>Share Daily Progress</span>
                        </button>
                    </div>
                </div>
            </div>

            <Modal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} title="Share Daily Progress">
                <form onSubmit={handleProgressSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">What did you work on today?</label>
                        <textarea
                            required
                            className="w-full px-3 py-2 border rounded-lg h-32"
                            value={dailyTask}
                            onChange={e => setDailyTask(e.target.value)}
                            placeholder="e.g. Completed stitching unit, fixed overlap issue..."
                        />
                    </div>
                    <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg font-bold">Submit Progress</button>
                </form>
            </Modal>
        </div>
    );
}

