import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, MapPin, Send, CheckCircle } from 'lucide-react';
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
    const [tasks, setTasks] = useState([]);
    const [myProgress, setMyProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/api/employee/dashboard');
                if (data.success) {
                    setNotifications(data.notifications || []);
                    setTasks(data.tasks || []);
                    setMyProgress(data.workProgress || []);
                    if (data.attendance) {
                        setIsCheckedIn(data.attendance.isCheckedIn);
                    }
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
            const { data } = await api.post('/api/attendance/mark', {
                action
            });
            if (data.success) {
                setIsCheckedIn(!isCheckedIn);
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to mark attendance');
        }
    };

    const handleProgressSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/api/employee/work-progress', {
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

    const handleTaskComplete = async (taskId) => {
        try {
            const { data } = await api.patch(`/api/employee/tasks/${taskId}`, { status: 'Completed' });
            if (data.success) {
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: 'Completed' } : t));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update task status');
        }
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto pb-24 scrollbar-hide">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#70b91c] to-[#5da012] pt-12 pb-32 px-6 rounded-b-[2.5rem] relative shrink-0 shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                <div className="flex justify-between items-center text-white mb-6 relative z-10">
                    <Link to="/employee/profile" className="flex items-center space-x-3 hover:opacity-80 transition">
                        <img
                            src={user?.avatar || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-12 h-12 rounded-full border-2 border-white"
                        />
                        <div>
                            <p className="text-sm opacity-90">Welcome back,</p>
                            <h2 className="text-xl font-bold">{user?.name}</h2>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsNotificationOpen(true)}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition relative shadow-sm border border-white/10"
                    >
                        <Bell size={20} />
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-[#6cb31b] font-bold">
                                {unreadNotifications}
                            </span>
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

                        <div className="py-2 flex flex-col space-y-4">
                            {/* Assigned Tasks Section */}
                            {tasks.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center">
                                        <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                        Assigned Tasks
                                    </h3>
                                    <div className="space-y-2">
                                        {tasks.filter(t => t.status === 'Pending').map(task => (
                                            <div key={task._id} className="p-3 bg-primary/5 border border-primary/10 rounded-xl flex justify-between items-center group animate-in slide-in-from-left duration-300">
                                                <p className="text-sm text-gray-700 font-medium leading-tight pr-4">{task.description}</p>
                                                <button
                                                    onClick={() => handleTaskComplete(task._id)}
                                                    className="shrink-0 w-8 h-8 rounded-full bg-white border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {tasks.filter(t => t.status === 'Pending').length === 0 && (
                                            <p className="text-xs text-center text-gray-400 py-2">No pending tasks. Great job!</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* My Recent Progress Section */}
                            {myProgress.length > 0 && (
                                <div className="space-y-3 mt-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                                            Recent Reports
                                        </div>
                                        <span className="text-[10px] font-normal lowercase">{myProgress.length} shared</span>
                                    </h3>
                                    <div className="space-y-2">
                                        {myProgress.slice(0, 3).map(progress => (
                                            <div key={progress._id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center group">
                                                <div className="flex-1 pr-4">
                                                    <p className="text-xs text-gray-600 line-clamp-1 italic">"{progress.task}"</p>
                                                    <p className="text-[9px] text-gray-400 mt-0.5">{progress.date}</p>
                                                </div>
                                                <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${progress.status === 'Reviewed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {progress.status === 'Reviewed' ? 'OK' : 'Sent'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!isCheckedIn && tasks.length === 0 && myProgress.length === 0 && (
                                <div className="py-8 flex justify-center">
                                    <img
                                        src="https://img.freepik.com/free-vector/time-management-concept-landing-page_52683-22806.jpg?w=740"
                                        alt="Attendance Illustration"
                                        className="w-full max-h-40 object-contain rounded-xl"
                                    />
                                </div>
                            )}
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
                            className="w-full mt-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-medium border border-gray-200 hover:bg-gray-100 transition flex items-center justify-center space-x-2 relative"
                        >
                            <Send size={18} />
                            <span>Share Daily Progress</span>
                            {myProgress.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                                    {myProgress.length}
                                </span>
                            )}
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
                    <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20">Submit Progress</button>
                </form>
            </Modal>

            {/* Notifications Modal */}
            <Modal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} title="Notifications">
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div key={notif._id} className={`p-4 rounded-2xl border ${notif.read ? 'bg-gray-50 border-gray-100' : 'bg-primary/5 border-primary/10'} transition-all`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${notif.type === 'Task' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {notif.type}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium">{format(new Date(notif.createdAt), 'hh:mm a')}</span>
                                </div>
                                <p className="text-sm text-gray-700 leading-snug">{notif.message}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <Bell size={40} className="mx-auto text-gray-200 mb-2" />
                            <p className="text-gray-400 text-sm">No notifications yet</p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}

