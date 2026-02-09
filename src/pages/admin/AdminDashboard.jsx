import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { users, attendanceData, addEmployee, addNotification, workProgress } from '../../utils/mockData';
import { LogOut, Users, Clock, AlertCircle, CheckCircle, Plus, MessageSquare, List, DollarSign, Calendar, FileText } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import Modal from '../../components/ui/Modal';

export default function AdminDashboard() {
    const { logout, user } = useAuth();
    const today = new Date();

    // State for Add Employee
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({ name: '', email: '', department: '', title: '', shift: '' });

    // State for Messaging
    const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
    const [message, setMessage] = useState('');

    // State for Attendance/Stats View
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [viewMode, setViewMode] = useState('attendance'); // 'attendance' or 'stats'

    // State for Work Progress View
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

    const employeeUsers = users.filter(u => u.role === 'employee');

    const handleAddEmployee = (e) => {
        e.preventDefault();
        addEmployee({ ...newEmployee, workplace: 'Lahore Factory', status: 'Active', erpId: 'HP-' + Math.floor(Math.random() * 1000) });
        setIsAddModalOpen(false);
        setNewEmployee({ name: '', email: '', department: '', title: '', shift: '' });
        // In real app, re-fetch users
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        addNotification(message);
        setIsMsgModalOpen(false);
        setMessage('');
        alert('Message sent to all employees!');
    };

    const openAttendance = (emp) => {
        setSelectedEmployee(emp);
        setIsAttendanceModalOpen(true);
        setViewMode('attendance'); // Default to attendance
    };

    const openStats = (emp) => {
        setSelectedEmployee(emp);
        setIsAttendanceModalOpen(true);
        setViewMode('stats');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Admin Header */}
            <header className="bg-white shadow-sm z-10 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-primary">Hunarmand Punjab</h1>
                        <span className="ml-3 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500">ADMIN</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full" />
                            <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.name}</span>
                        </div>
                        <button onClick={logout} className="text-gray-500 hover:text-red-600">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Actions Bar */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setIsMsgModalOpen(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            <MessageSquare size={18} />
                            <span>Broadcast Message</span>
                        </button>
                        <button
                            onClick={() => setIsProgressModalOpen(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            <FileText size={18} />
                            <span>Work Progress</span>
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition"
                        >
                            <Plus size={18} />
                            <span>Add Employee</span>
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Total Employees</h3>
                            <Users size={20} className="text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{employeeUsers.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Present Today</h3>
                            <CheckCircle size={20} className="text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">1</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Late / Absent</h3>
                            <AlertCircle size={20} className="text-red-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">0</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Employee Overview</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status (Today)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employeeUsers.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-full" src={emp.avatar} alt="" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                                    <div className="text-sm text-gray-500">{emp.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {emp.department}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {emp.shift}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Present
                                            </span>
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
            </main>

            {/* Add Employee Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee">
                <form onSubmit={handleAddEmployee} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input required type="text" className="w-full px-3 py-2 border rounded-lg" value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input required type="email" className="w-full px-3 py-2 border rounded-lg" value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} />
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                        <input required type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 09:00 - 17:00" value={newEmployee.shift} onChange={e => setNewEmployee({ ...newEmployee, shift: e.target.value })} />
                    </div>
                    <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg font-bold">Add Employee</button>
                </form>
            </Modal>

            {/* Message Modal */}
            <Modal isOpen={isMsgModalOpen} onClose={() => setIsMsgModalOpen(false)} title="Send Notification">
                <form onSubmit={handleSendMessage} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message to All Employees</label>
                        <textarea required className="w-full px-3 py-2 border rounded-lg h-32" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your announcement here..." />
                    </div>
                    <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg font-bold">Send Notification</button>
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
                    <div className="space-y-3">
                        {attendanceData.slice(0, 5).map((record, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{format(new Date(record.date), 'dd MMM yyyy')}</p>
                                    <p className="text-xs text-gray-500">{record.checkIn} - {record.checkOut}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full capitalize ${record.status === 'present' ? 'bg-green-100 text-green-800' :
                                    record.status === 'late' ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {record.status}
                                </span>
                            </div>
                        ))}
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

                        <h4 className="font-semibold text-gray-800 mt-4">Attendance Stats</h4>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{selectedEmployee?.stats?.present || 0}</p>
                                <p className="text-xs text-gray-500">Present</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-orange-500">{selectedEmployee?.stats?.late || 0}</p>
                                <p className="text-xs text-gray-500">Late</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-red-500">{selectedEmployee?.stats?.absent || 0}</p>
                                <p className="text-xs text-gray-500">Absent</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Work Progress Feed Modal */}
            <Modal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} title="Employee Work Progress">
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {workProgress.length > 0 ? (
                        workProgress.map((item) => (
                            <div key={item.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="font-bold text-gray-900">{item.userName}</div>
                                        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border">{item.date}</span>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider ${item.status === 'Reviewed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {item.status}
                                    </span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{item.task}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">No progress reports submitted yet.</div>
                    )}
                </div>
            </Modal>

        </div >
    );
}
