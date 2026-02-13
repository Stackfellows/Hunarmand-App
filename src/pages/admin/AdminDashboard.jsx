import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { users, attendanceData, addEmployee, addNotification } from '../../utils/mockData';
import { LogOut, Users, Clock, AlertCircle, CheckCircle, Plus, MessageSquare, List, DollarSign, Calendar, FileText, Shield } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import Modal from '../../components/ui/Modal';
import api from '../../utils/api';
import OfficeAccount from '../../components/admin/OfficeAccount';
import Payroll from '../../components/admin/Payroll';
import { Wallet, CalendarCheck } from 'lucide-react';
import AttendancePayroll from '../../components/admin/AttendancePayroll';
import { compressImage } from '../../utils/imageCompression';

export default function AdminDashboard() {
    const { logout, user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [realWorkProgress, setRealWorkProgress] = useState([]);
    const [activeMainTab, setActiveMainTab] = useState('dashboard'); // 'dashboard', 'office-account', 'payroll', 'attendance-payroll'
    const [loading, setLoading] = useState(true);
    const today = new Date();

    // State for Add Employee
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({ name: '', cnic: '', department: '', title: '', shift: '', salary: '', workplace: 'Lahore Factory', avatar: '' });
    const [isUploading, setIsUploading] = useState(false);

    // State for Messaging/Broadcast
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState('');

    // State for Daily Tasks
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskData, setTaskData] = useState({ assignedTo: '', description: '' });

    // State for Attendance/Stats View
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [viewMode, setViewMode] = useState('attendance'); // 'attendance' or 'stats'
    const [employeeStats, setEmployeeStats] = useState({ history: [], stats: {}, user: {} });
    const [loadingStats, setLoadingStats] = useState(false);

    // State for Work Progress View
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

    // State for Payroll View
    const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
    const [isMonthlyReportModalOpen, setIsMonthlyReportModalOpen] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState(null);

    useEffect(() => {
        fetchEmployees();
        fetchTodayAttendance();
        fetchWorkProgress();
        const interval = setInterval(() => {
            fetchTodayAttendance();
            fetchWorkProgress();
        }, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            const { data } = await api.get('/api/attendance/admin/today');
            if (data.success) {
                setTodayAttendance(data.attendance || []);
            }
        } catch (err) {
            console.error("Failed to fetch today's attendance", err);
        }
    };

    const fetchWorkProgress = async () => {
        try {
            const { data } = await api.get('/api/admin/work-progress');
            if (data.success) {
                setRealWorkProgress(data.workProgress || []);
            }
        } catch (err) {
            console.error("Failed to fetch work progress", err);
        }
    };

    const handleUpdateProgressStatus = async (id, status) => {
        try {
            const { data } = await api.patch(`/api/admin/work-progress/${id}`, { status });
            if (data.success) {
                setRealWorkProgress(prev => prev.map(p => p._id === id ? { ...p, status } : p));
            }
        } catch (err) {
            console.error("Failed to update progress status", err);
            alert("Failed to update status");
        }
    };

    const fetchEmployees = async () => {
        try {
            const { data } = await api.get('/api/admin/employees');
            if (data.success) {
                setEmployees(data.employees || []);
            }
        } catch (err) {
            console.error("Failed to fetch employees", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/api/admin/employees', newEmployee);
            if (data.success) {
                setIsAddModalOpen(false);
                setNewEmployee({ name: '', cnic: '', department: '', title: '', shift: '', salary: '', workplace: 'Lahore Factory', avatar: '' });
                fetchEmployees();
                alert('Employee added successfully! Default password: hunarmanderp');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add employee');
        }
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/api/admin/broadcast', { message: broadcastMessage });
            if (data.success) {
                setIsBroadcastModalOpen(false);
                setBroadcastMessage('');
                alert('Broadcast message sent to all employees!');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send broadcast');
        }
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                assignedTo: taskData.assignedTo === 'all' ? null : taskData.assignedTo,
                description: taskData.description
            };
            const { data } = await api.post('/api/admin/tasks', payload);
            if (data.success) {
                setIsTaskModalOpen(false);
                setTaskData({ assignedTo: '', description: '' });
                alert('Task assigned successfully!');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign task');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Compress image before upload
            // Max width 800px, quality 0.7
            const compressedFile = await compressImage(file, 0.7, 800);

            const formData = new FormData();
            formData.append('image', compressedFile);

            // Use axios directly to avoid default Content-Type: application/json from api instance
            const token = JSON.parse(localStorage.getItem('hunarmand_user'))?.token;
            const baseUrl = import.meta.env.VITE_API_URL || 'https://hunarmandpunjabbackend.onrender.com';

            const { data } = await axios.post(`${baseUrl}/api/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                    // Content-Type is left undefined so browser sets it with boundary
                }
            });

            if (data.success) {
                setNewEmployee({ ...newEmployee, avatar: data.imageUrl });
            }
        } catch (error) {
            console.error('Image upload failed', error);
            alert('Image upload failed: ' + (error.message || 'Unknown error'));
        } finally {
            setIsUploading(false);
        }
    };

    const fetchEmployeeStats = async (empId) => {
        setLoadingStats(true);
        try {
            const { data } = await api.get(`/api/attendance/admin/stats/${empId}`);
            if (data.success) {
                setEmployeeStats({
                    history: data.history,
                    stats: data.stats,
                    user: data.user
                });
            }
        } catch (error) {
            console.error('Failed to fetch employee stats', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const openAttendance = (emp) => {
        setSelectedEmployee(emp);
        setIsAttendanceModalOpen(true);
        setViewMode('attendance');
        fetchEmployeeStats(emp._id);
    };

    const openStats = (emp) => {
        setSelectedEmployee(emp);
        setIsAttendanceModalOpen(true);
        setViewMode('stats');
        fetchEmployeeStats(emp._id);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Admin Header */}
            <header className="bg-white shadow-sm z-10 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <button
                        onClick={() => setActiveMainTab('dashboard')}
                        className="flex items-center space-x-3 group outline-none"
                    >
                        {/* Logo added here as requested */}
                        <img src="/tab.png" alt="Logo" className="w-10 h-10 object-contain" />
                        <h1 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-primary transition">
                            HUNARMAND <span className="text-primary font-light">PUNJAB</span>
                        </h1>
                        <span className="ml-3 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500 uppercase">Admin</span>
                    </button>
                    <div className="flex items-center space-x-4">
                        {/* Avatar removed and replaced with logo as requested ("admin system a rha os k sth avter haata kr yaa logo add kro") */}
                        <div className="flex items-center space-x-2">
                            <img src="/tab.png" alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <button onClick={logout} className="text-gray-500 hover:text-red-600 transition">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsBroadcastModalOpen(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            <MessageSquare size={18} />
                            <span>Broadcast</span>
                        </button>
                        <button
                            onClick={() => setIsTaskModalOpen(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition shadow-lg shadow-primary/20"
                        >
                            <Plus size={18} />
                            <span>Daily Task</span>
                        </button>
                        <button
                            onClick={() => setIsProgressModalOpen(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition relative"
                        >
                            <FileText size={18} />
                            <span>Work Progress</span>
                            {realWorkProgress.filter(p => p.status !== 'Reviewed').length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                                    {realWorkProgress.filter(p => p.status !== 'Reviewed').length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveMainTab(activeMainTab === 'dashboard' ? 'attendance-payroll' : 'dashboard')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition shadow-lg ${activeMainTab === 'attendance-payroll' ? 'bg-primary text-white shadow-primary/20' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                            <CalendarCheck size={18} />
                            <span>{activeMainTab === 'attendance-payroll' ? 'Back to Dashboard' : 'Employee Management'}</span>
                        </button>
                        <button
                            onClick={() => setActiveMainTab(activeMainTab === 'dashboard' ? 'office-account' : 'dashboard')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition shadow-lg ${activeMainTab === 'office-account' ? 'bg-primary text-white shadow-primary/20' : 'bg-gray-900 text-white hover:bg-opacity-90'}`}
                        >
                            <Wallet size={18} />
                            <span>{activeMainTab === 'office-account' ? 'Back to Dashboard' : 'Office Account'}</span>
                        </button>
                        {(activeMainTab === 'dashboard' || activeMainTab === 'attendance-payroll') && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-opacity-90 transition"
                            >
                                <Plus size={18} />
                                <span>Add Employee</span>
                            </button>
                        )}
                    </div>
                </div>

                {activeMainTab === 'dashboard' ? (
                    <>
                        {/* Stats */}
                        {/* ... existing dashboard content ... */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 text-sm font-medium">Total Employees</h3>
                                    <Users size={20} className="text-blue-500" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 text-sm font-medium">Present Today</h3>
                                    <CheckCircle size={20} className="text-green-500" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {todayAttendance.filter(a => a.status === 'Present').length}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 text-sm font-medium">Late / Absent</h3>
                                    <AlertCircle size={20} className="text-red-500" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {todayAttendance.filter(a => a.status === 'Late' || a.status === 'Absent').length}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 text-center">
                                <h3 className="font-semibold text-gray-900">Employee Overview</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ERP ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {employees.map((emp) => (
                                            <tr key={emp._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <img className="h-10 w-10 rounded-full border border-gray-200" src={emp.avatar} alt="" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900">{emp.name}</div>
                                                            <div className="text-xs text-gray-500">{emp.cnic}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {emp.department}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {emp.erpId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {(() => {
                                                        const record = todayAttendance.find(a => a.user?._id === emp._id);
                                                        if (!record) return (
                                                            <span className="px-2 inline-flex text-[10px] font-bold rounded-full bg-gray-100 text-gray-500 uppercase">
                                                                Not Clocked In
                                                            </span>
                                                        );
                                                        return (
                                                            <span className={`px-2 inline-flex text-[10px] font-bold rounded-full uppercase ${record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                                record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                {record.status}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openAttendance(emp)}
                                                        className="text-primary hover:text-green-700 bg-primary/10 px-3 py-1 rounded-md"
                                                    >
                                                        Details
                                                    </button>
                                                    <button
                                                        onClick={() => openStats(emp)}
                                                        className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-md ml-2"
                                                    >
                                                        Stats
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : activeMainTab === 'office-account' ? (
                    <OfficeAccount />
                ) : (
                    <AttendancePayroll employeesProp={employees} />
                )}
            </main>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee">
                <form onSubmit={handleAddEmployee} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input required type="text" className="w-full px-3 py-2 border rounded-lg" value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CNIC Number</label>
                        <input required type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="31103-XXXXXXX-X" value={newEmployee.cnic} onChange={e => setNewEmployee({ ...newEmployee, cnic: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <img
                                    src={newEmployee.avatar || "https://res.cloudinary.com/dphBu5ZJt/image/upload/v1740000000/placeholder_avatar.png"}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                    onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=Employee&background=random"}
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                                    {isUploading ? 'Compressing & Uploading...' : 'Choose Image'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                </label>
                                <p className="text-[10px] text-gray-400 mt-1">Max 5MB. Auto-compressed.</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <input required type="text" className="w-full px-3 py-2 border rounded-lg" value={newEmployee.department} onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input required type="text" className="w-full px-3 py-2 border rounded-lg" value={newEmployee.title} onChange={e => setNewEmployee({ ...newEmployee, title: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Rs.)</label>
                            <input required type="number" className="w-full px-3 py-2 border rounded-lg" value={newEmployee.salary} onChange={e => setNewEmployee({ ...newEmployee, salary: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                            <input required type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="09:00 - 17:00" value={newEmployee.shift} onChange={e => setNewEmployee({ ...newEmployee, shift: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg font-bold">Add Employee</button>
                </form>
            </Modal>

            {/* Broadcast Modal */}
            <Modal isOpen={isBroadcastModalOpen} onClose={() => setIsBroadcastModalOpen(false)} title="Send Broadcast Message">
                <form onSubmit={handleSendBroadcast} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message to All Employees</label>
                        <textarea required className="w-full px-3 py-2 border rounded-lg h-32" value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} placeholder="Type your announcement here..." />
                    </div>
                    <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20">Send Broadcast</button>
                </form>
            </Modal>

            {/* Daily Task Modal */}
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Assign Daily Task">
                <form onSubmit={handleAssignTask} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                        <select
                            required
                            className="w-full px-3 py-2 border rounded-lg"
                            value={taskData.assignedTo}
                            onChange={e => setTaskData({ ...taskData, assignedTo: e.target.value })}
                        >
                            <option value="">Select Employee</option>
                            <option value="all" className="font-bold text-primary">ALL EMPLOYEES</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name} ({emp.erpId})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
                        <textarea
                            required
                            className="w-full px-3 py-2 border rounded-lg h-24"
                            value={taskData.description}
                            onChange={e => setTaskData({ ...taskData, description: e.target.value })}
                            placeholder="Describe the task..."
                        />
                    </div>
                    <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20">Assign Task</button>
                </form>
            </Modal>



            {/* Combined Details Modal (Attendance/Stats) */}
            <Modal isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} title={`Employee Details: ${selectedEmployee?.name}`}>
                <div className="flex space-x-4 mb-4 border-b">
                    <button
                        className={`pb-2 px-4 ${viewMode === 'attendance' ? 'border-b-2 border-primary text-primary font-bold' : 'text-gray-500'}`}
                        onClick={() => setViewMode('attendance')}
                    >
                        Attendance
                    </button>
                    <button
                        className={`pb-2 px-4 ${viewMode === 'stats' ? 'border-b-2 border-primary text-primary font-bold' : 'text-gray-500'}`}
                        onClick={() => setViewMode('stats')}
                    >
                        Stats & Profile
                    </button>
                </div>

                {viewMode === 'attendance' ? (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {loadingStats ? (
                            <div className="text-center py-4 text-gray-500">Loading attendance history...</div>
                        ) : employeeStats.history.length > 0 ? (
                            employeeStats.history.map((record, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{format(new Date(record.date), 'dd MMM yyyy')}</p>
                                        <p className="text-xs text-gray-500">{record.checkIn} - {record.checkOut || 'Pending'}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                        record.status === 'Late' ? 'bg-orange-100 text-orange-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {record.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500">No attendance records found.</div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-xl">
                                <div className="flex items-center space-x-2 text-blue-600 mb-1">
                                    <DollarSign size={18} />
                                    <span className="text-xs font-bold uppercase">Salary</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">Rs. {selectedEmployee?.salary?.toLocaleString() || 'N/A'}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-xl">
                                <div className="flex items-center space-x-2 text-purple-600 mb-1">
                                    <Calendar size={18} />
                                    <span className="text-xs font-bold uppercase">Joined</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">{selectedEmployee?.joiningDate || 'N/A'}</p>
                            </div>
                        </div>

                        <h4 className="font-semibold text-gray-800 mt-4">Attendance Stats (Last 30 Days)</h4>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{employeeStats.stats?.present || 0}</p>
                                <p className="text-xs text-gray-500">Present</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-orange-500">{employeeStats.stats?.late || 0}</p>
                                <p className="text-xs text-gray-500">Late</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-red-500">{employeeStats.stats?.absent || 0}</p>
                                <p className="text-xs text-gray-500">Absent</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Work Progress Feed Modal */}
            <Modal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} title="Employee Work Progress">
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Daily Reports Feed</p>
                        <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-400 font-bold uppercase">
                            Total: {realWorkProgress.length}
                        </span>
                    </div>
                    {realWorkProgress.length > 0 ? (
                        realWorkProgress.map((item) => (
                            <div key={item._id} className={`p-4 rounded-xl border transition-all ${item.status === 'Reviewed' ? 'bg-green-50/30 border-green-100' : 'bg-white border-gray-100 shadow-sm'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {item.userName?.charAt(0) || 'E'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">{item.userName}</div>
                                            <div className="text-[10px] text-gray-400 font-medium uppercase">{item.date}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-[9px] px-2 py-1 rounded-full uppercase font-black tracking-tighter ${item.status === 'Reviewed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700 font-bold'}`}>
                                            {item.status === 'Reviewed' ? 'OK / Reviewed' : 'Pending Review'}
                                        </span>
                                        {item.status !== 'Reviewed' ? (
                                            <button
                                                onClick={() => handleUpdateProgressStatus(item._id, 'Reviewed')}
                                                className="text-[10px] bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary/90 transition shadow-sm"
                                            >
                                                Mark OK
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleUpdateProgressStatus(item._id, 'Pending')}
                                                className="text-[10px] bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition"
                                            >
                                                UNDO
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="pl-11">
                                    <p className="text-gray-700 text-sm leading-relaxed italic">"{item.task}"</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <FileText size={40} className="mx-auto text-gray-200 mb-2" />
                            <p className="text-gray-400 text-sm">No progress reports submitted yet.</p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Payroll Modal */}
            <Modal isOpen={isPayrollModalOpen} onClose={() => setIsPayrollModalOpen(false)} title="Payroll Management">
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-wider">Payroll Period</p>
                            <p className="text-lg font-bold text-gray-900">{format(today, 'MMMM yyyy')}</p>
                        </div>
                        <button
                            onClick={() => setIsMonthlyReportModalOpen(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-opacity-90 transition"
                        >
                            <FileText size={18} />
                            <span>Generate Monthly Report</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Employee Details</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Base Salary</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {employees.map(emp => (
                                    <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img src={emp.avatar} className="w-8 h-8 rounded-full border border-gray-200 mr-3 object-cover" alt="" />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 leading-none">{emp.name}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight font-medium">{emp.erpId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <p className="text-sm font-semibold text-gray-800">Rs. {emp.salary?.toLocaleString() || '0'}</p>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 text-[9px] font-bold rounded-full bg-blue-50 text-blue-600 uppercase border border-blue-100">Pending</span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedSalary(emp);
                                                    setIsPayslipModalOpen(true);
                                                }}
                                                className="text-primary text-xs font-bold uppercase hover:underline"
                                            >
                                                View Slip
                                            </button>
                                            <button className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all uppercase">
                                                Pay Now
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>

            {/* Individual Payslip Modal */}
            <Modal isOpen={isPayslipModalOpen} onClose={() => setIsPayslipModalOpen(false)} title="Salary Payslip">
                {selectedSalary && (
                    <div className="p-2 print:p-0">
                        {/* Payslip Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-primary/20 pb-4 mb-6 gap-4">
                            <div>
                                <h4 className="text-2xl font-bold text-primary tracking-tight">HUNARMAND PUNJAB</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Employee Salary Statement</p>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-xs font-semibold text-gray-400 uppercase">Statement Month</p>
                                <p className="text-sm font-bold text-gray-900 uppercase">{format(today, 'MMMM yyyy')}</p>
                            </div>
                        </div>

                        {/* Employee Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Employee Name</p>
                                <p className="text-sm font-semibold text-gray-900">{selectedSalary.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">ERP ID</p>
                                <p className="text-sm font-semibold text-gray-900">{selectedSalary.erpId}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Department</p>
                                <p className="text-sm font-semibold text-gray-900">{selectedSalary.department}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Designation</p>
                                <p className="text-sm font-semibold text-gray-900">{selectedSalary.title || 'Worker'}</p>
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-600 uppercase">Basic Salary</span>
                                <span className="text-sm font-bold text-gray-900">Rs. {(selectedSalary.salary || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-600 uppercase">Allowances (Conveyance)</span>
                                <span className="text-sm font-bold text-green-600">+ Rs. 2,000</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-600 uppercase">Deductions</span>
                                    <span className="text-[9px] text-red-500 font-bold uppercase leading-none">(EPF, Tax, Absents)</span>
                                </div>
                                <span className="text-sm font-bold text-red-600">- Rs. 1,500</span>
                            </div>
                            <div className="flex justify-between items-center py-4 bg-primary text-white px-4 rounded-xl shadow-lg shadow-primary/20 mt-6">
                                <span className="text-lg font-bold uppercase tracking-wider">Net Payable</span>
                                <span className="text-2xl font-bold">Rs. {((selectedSalary.salary || 0) + 2000 - 1500).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between items-center">
                            <p className="text-[9px] text-gray-400 italic font-semibold uppercase tracking-widest leading-none">This is a computer generated document.</p>
                            <button
                                onClick={() => window.print()}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold uppercase text-xs hover:bg-primary transition-all"
                            >
                                Print Slip
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Monthly Report Modal */}
            <Modal isOpen={isMonthlyReportModalOpen} onClose={() => setIsMonthlyReportModalOpen(false)} title="Workforce Financial Report">
                <div className="space-y-6">
                    <div className="p-5 bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl shadow-xl shadow-primary/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Total Workforce Budget</p>
                            <h3 className="text-3xl font-bold">Rs. {employees.reduce((acc, emp) => acc + (emp.salary || 0), 0).toLocaleString()}</h3>
                            <p className="text-[10px] font-semibold opacity-70 mt-2 uppercase">Period: {format(today, 'MMMM yyyy')} | Total Staff: {employees.length}</p>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-gray-100 bg-white">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Paid Status</p>
                            <p className="text-xl font-bold text-gray-900">0 / {employees.length}</p>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="bg-green-500 h-full w-0 transform transition-all duration-1000"></div>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl border border-gray-100 bg-white">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Efficiency Score</p>
                            <p className="text-xl font-bold text-primary">94.2%</p>
                            <p className="text-[10px] text-green-600 font-bold mt-2 uppercase flex items-center">
                                <CheckCircle size={10} className="mr-1" />
                                Optimal State
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 ml-1">Departmental Breakdown</h4>
                        {Array.from(new Set(employees.map(e => e.department))).map(dept => {
                            const deptEmployees = employees.filter(e => e.department === dept);
                            const deptTotal = deptEmployees.reduce((acc, e) => acc + (e.salary || 0), 0);
                            return (
                                <div key={dept} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow shadow-primary/50"></div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 uppercase tracking-tight">{dept || 'Other'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">{deptEmployees.length} EMPLOYEES</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">Rs. {deptTotal.toLocaleString()}</p>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-lg hover:shadow-primary/30"
                    >
                        Export Summary Report
                    </button>
                </div>
            </Modal>

        </div>
    );
}
