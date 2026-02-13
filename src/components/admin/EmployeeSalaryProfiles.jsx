import React, { useState, useEffect } from 'react';
import {
    Plus,
    Users,
    Edit3,
    Trash2,
    X,
    Check,
    DollarSign,
    TrendingUp,
    History
} from 'lucide-react';
import api from '../../utils/api';

export default function EmployeeSalaryProfiles() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        employee: '',
        basicSalary: '',
        allowances: '',
        deductions: '',
        notes: ''
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/admin/employees');
            if (data.success) {
                setEmployees(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch employees', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        alert('Employee Salary Profile functionality will be implemented in Phase 1');
        setShowModal(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            employee: '',
            basicSalary: '',
            allowances: '',
            deductions: '',
            notes: ''
        });
        setSelectedEmployee(null);
    };

    const calculateNetSalary = () => {
        const basic = Number(formData.basicSalary) || 0;
        const allowances = Number(formData.allowances) || 0;
        const deductions = Number(formData.deductions) || 0;
        return basic + allowances - deductions;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Employee Salary Profiles</h2>
                    <p className="text-sm text-gray-500">Set and manage employee salary configurations</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:scale-[1.02] transition shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    <span>Set Salary Profile</span>
                </button>
            </div>

            {/* Employee Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-400">Loading employees...</div>
                ) : employees.length > 0 ? (
                    employees.map((employee) => (
                        <div
                            key={employee._id}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    {employee.avatar ? (
                                        <img
                                            src={employee.avatar}
                                            alt={employee.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Users size={24} className="text-primary" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-gray-800">{employee.name}</h3>
                                        <p className="text-xs text-gray-400">{employee.title || 'N/A'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedEmployee(employee);
                                        setFormData({
                                            employee: employee._id,
                                            basicSalary: employee.salary || '',
                                            allowances: '',
                                            deductions: '',
                                            notes: ''
                                        });
                                        setShowModal(true);
                                    }}
                                    className="p-2 hover:bg-primary/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                                >
                                    <Edit3 size={16} className="text-primary" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Current Salary</span>
                                    <span className="text-lg font-black text-primary">
                                        Rs. {employee.salary ? employee.salary.toLocaleString() : '0'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 text-center pt-2">
                                    {employee.salary ? 'Salary profile set' : 'No salary profile yet'}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        No employees found.
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">
                                {selectedEmployee ? `Set Salary for ${selectedEmployee.name}` : 'Set Employee Salary'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {!selectedEmployee && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Employee *</label>
                                    <select
                                        required
                                        value={formData.employee}
                                        onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.name} - {emp.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Basic Salary (Rs.) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.basicSalary}
                                        onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Allowances (Rs.)</label>
                                    <input
                                        type="number"
                                        value={formData.allowances}
                                        onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Deductions (Rs.)</label>
                                    <input
                                        type="number"
                                        value={formData.deductions}
                                        onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-bold"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-700">Net Salary:</span>
                                    <span className="text-2xl font-black text-primary">Rs. {calculateNetSalary().toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Notes (Optional)</label>
                                <textarea
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Add any additional information..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
                                ></textarea>
                            </div>

                            <div className="flex items-center space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
                                >
                                    <Check size={18} />
                                    <span>Save Salary Profile</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
