import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Modal from '../../components/ui/Modal';

export default function Attendance() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    useEffect(() => {
        const fetchAttendanceAndNotifs = async () => {
            try {
                const [attendanceRes, dashboardRes] = await Promise.all([
                    api.get('/api/attendance/history'),
                    api.get('/api/employee/dashboard')
                ]);

                if (attendanceRes.data.success) {
                    setHistory(attendanceRes.data.history || []);
                }
                if (dashboardRes.data.success) {
                    setNotifications(dashboardRes.data.notifications || []);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendanceAndNotifs();
    }, []);

    const unreadNotifications = notifications.filter(n => !n.read).length;

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    });

    const getDayRecord = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return history.find(d => d.date === dateStr);
    };

    const getStatusColor = (date) => {
        if (!isSameMonth(date, currentDate)) return 'bg-white text-gray-200';

        const record = getDayRecord(date);
        if (!record) {
            // Check if it's a Sunday (Off)
            if (date.getDay() === 0) return 'bg-red-50 text-red-200 border border-red-100';

            // Check if it's a past date (Absent)
            if (date < new Date().setHours(0, 0, 0, 0)) return 'bg-red-600 text-white shadow-sm';

            return 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100';
        }

        switch (record.status) {
            case 'Present': return 'bg-green-600 text-white shadow-sm';
            case 'Absent': return 'bg-red-600 text-white shadow-sm';
            case 'Late': return 'bg-yellow-400 text-gray-900 shadow-sm font-bold';
            case 'Off': return 'bg-red-500 text-white shadow-sm';
            default: return 'bg-gray-200 text-gray-600';
        }
    };

    const handleDateClick = (date) => {
        if (selectedDate && isSameDay(date, selectedDate)) {
            setSelectedDate(null); // Deselect if already selected
        } else {
            setSelectedDate(date);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Professional Header */}
            <div className="bg-gradient-to-br from-[#0f4c75] to-[#0a3554] px-6 pt-12 pb-8 rounded-b-[2rem] shadow-xl relative z-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
                <div className="flex justify-between items-center text-white relative z-10">
                    <Link to="/employee/profile" className="flex items-center space-x-4 hover:opacity-80 transition">
                        <div className="p-0.5 bg-white/20 rounded-full">
                            <img
                                src={user?.avatar || 'https://via.placeholder.com/150'}
                                alt="Profile"
                                className="w-14 h-14 rounded-full border-2 border-white/50"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold leading-tight">{user?.name}</h2>
                            <p className="text-blue-200 text-sm mt-0.5">{user?.title || 'Employee'}</p>
                            <p className="text-blue-300 text-xs">ERP# {user?.erpId || 'N/A'}</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsNotificationOpen(true)}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition relative"
                    >
                        <Bell size={24} />
                        {unreadNotifications > 0 && (
                            <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0f4c75]"></span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 px-4 sm:px-6 -mt-4 z-10 overflow-y-auto pb-24">
                {/* Calendar Card */}
                <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6">

                    {/* Navigation & Filters */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                        <div className="flex space-x-2 text-sm text-gray-600 font-medium">
                            <span className="bg-gray-100 px-3 py-1 rounded-lg">Year: {format(currentDate, 'yyyy')}</span>
                            <span className="bg-gray-100 px-3 py-1 rounded-lg">Month: {format(currentDate, 'MMM')}</span>
                        </div>

                        <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-1">
                            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition duration-200 text-gray-600">
                                <ChevronLeft size={20} />
                            </button>
                            <h2 className="text-lg font-bold text-gray-800 w-32 text-center">{format(currentDate, 'MMMM yyyy')}</h2>
                            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition duration-200 text-gray-600">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-3">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 sm:gap-3">
                        {daysInMonth.map((date, idx) => {
                            const record = getDayRecord(date);
                            const isSelected = selectedDate && isSameDay(date, selectedDate);

                            return (
                                <div key={date.toString()} className="relative">
                                    <button
                                        onClick={() => handleDateClick(date)}
                                        className={`
                                            w-full aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200 relative
                                            ${!isSameMonth(date, currentDate) ? 'opacity-30' : ''}
                                            ${getStatusColor(date)}
                                            ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 scale-105 z-10' : 'hover:scale-105'}
                                        `}
                                    >
                                        {format(date, 'd')}
                                    </button>

                                    {/* Tooltip / Popover */}
                                    {isSelected && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max min-w-[160px] z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="bg-white text-gray-800 text-xs rounded-xl shadow-2xl border border-gray-100 p-3 relative">
                                                <div className="mb-2 border-b pb-1">
                                                    <p className="font-bold text-primary">{format(date, 'dd MMM yyyy')}</p>
                                                </div>
                                                {record ? (
                                                    <div className="flex flex-col space-y-2">
                                                        <div className="flex justify-between space-x-3">
                                                            <span className="font-semibold text-gray-500">Status:</span>
                                                            <span className={`font-bold ${record.status === 'Late' ? 'text-yellow-600' : record.status === 'Present' ? 'text-green-600' : 'text-red-600'}`}>
                                                                {record.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between space-x-3">
                                                            <span className="font-semibold text-gray-500">Clock-In:</span>
                                                            <span className="font-bold text-gray-900">{record.checkIn || '--:--'}</span>
                                                        </div>
                                                        <div className="flex justify-between space-x-3">
                                                            <span className="font-semibold text-gray-500">Clock-Out:</span>
                                                            <span className="font-bold text-gray-900">{record.checkOut || '--:--'}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-400 italic">No record found for this day.</p>
                                                )}
                                                {/* Arrow */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-3 h-3 bg-white border-r border-b border-gray-100 transform rotate-45"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="text-center text-xs text-gray-400 pb-4">
                    Tip: Tap on colored dates to view timing details.
                </div>
            </div>

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
