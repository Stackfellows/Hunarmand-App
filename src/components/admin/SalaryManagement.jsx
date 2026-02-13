import React, { useState, useEffect } from 'react';
import {
    Plus,
    DollarSign,
    Users,
    Calendar,
    Check,
    X,
    Eye,
    CreditCard,
    Filter,
    Download
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../utils/api';

export default function SalaryManagement() {
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [paymentAccounts, setPaymentAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [filters, setFilters] = useState({
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        status: ''
    });

    const [createFormData, setCreateFormData] = useState({
        employee: '',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        basicSalary: '',
        allowances: '',
        deductions: '',
        lateDays: 0,
        lateDeduction: 0,
        notes: ''
    });

    const [payFormData, setPayFormData] = useState({
        paymentAccountId: '',
        transactionId: ''
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchSalaries();
        fetchEmployees();
        fetchPaymentAccounts();
    }, [filters]);

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/salaries', { params: filters });
            if (data.success) {
                setSalaries(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch salaries', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const { data } = await api.get('/api/admin/employees');
            if (data.success) {
                setEmployees(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch employees', err);
        }
    };

    const fetchPaymentAccounts = async () => {
        try {
            const { data } = await api.get('/api/payment-accounts');
            if (data.success) {
                setPaymentAccounts(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch payment accounts', err);
        }
    };

    const handleCreateSalary = async (e) => {
        e.preventDefault();

        if (!createFormData.employee || !createFormData.basicSalary) {
            alert('Please fill all required fields');
            return;
        }

        try {
            const { data } = await api.post('/api/salaries', {
                ...createFormData,
                basicSalary: Number(createFormData.basicSalary),
                allowances: Number(createFormData.allowances) || 0,
                deductions: Number(createFormData.deductions) || 0
            });

            if (data.success) {
                alert('Salary record created successfully');
                setShowCreateModal(false);
                resetCreateForm();
                fetchSalaries();
            }
        } catch (err) {
            console.error('Error creating salary:', err);
            alert(err.response?.data?.message || 'Failed to create salary record');
        }
    };

    const handlePaySalary = async (e) => {
        e.preventDefault();

        if (!payFormData.paymentAccountId || !payFormData.transactionId) {
            alert('Please fill all payment details');
            return;
        }

        try {
            const { data } = await api.put(`/api/salaries/${selectedSalary._id}/pay`, payFormData);

            if (data.success) {
                alert('Salary paid successfully');
                setShowPayModal(false);
                setSelectedSalary(null);
                resetPayForm();
                fetchSalaries();
            }
        } catch (err) {
            console.error('Error paying salary:', err);
            alert(err.response?.data?.message || 'Failed to pay salary');
        }
    };

    const resetCreateForm = () => {
        setCreateFormData({
            employee: '',
            month: new Date().toLocaleString('default', { month: 'long' }),
            year: new Date().getFullYear(),
            basicSalary: '',
            allowances: '',
            deductions: '',
            notes: ''
        });
    };

    const resetPayForm = () => {
        setPayFormData({
            paymentAccountId: '',
            transactionId: ''
        });
    };

    const [calculationStats, setCalculationStats] = useState(null);

    const calculateNetSalary = () => {
        const basic = Number(createFormData.basicSalary) || 0;
        const allowances = Number(createFormData.allowances) || 0;
        const deductions = Number(createFormData.deductions) || 0;
        return basic + allowances - deductions;
    };

    // Auto-calculate deductions when dependencies change
    useEffect(() => {
        if (showCreateModal && createFormData.employee && createFormData.month && createFormData.year) {
            fetchSalaryCalculation();
        }
    }, [createFormData.employee, createFormData.month, createFormData.year, showCreateModal]);

    const fetchSalaryCalculation = async () => {
        try {
            const { data } = await api.get('/api/salaries/calculate', {
                params: {
                    employeeId: createFormData.employee,
                    month: createFormData.month,
                    year: createFormData.year
                }
            });

            if (data.success) {
                setCalculationStats(data.data);
                // Auto-fill deduction if not already manually modified (optional, or just show as suggestion)
                // For now, let's just show it and allow user to apply it
                setCreateFormData(prev => ({
                    ...prev,
                    lateDays: data.data.lateDays,
                    lateDeduction: data.data.deductionAmount,
                    // We can auto-set the deduction field if it's 0
                    deductions: prev.deductions === '' || prev.deductions === 0 ? data.data.deductionAmount : prev.deductions
                }));
            }
        } catch (err) {
            console.error('Failed to calculate salary stats', err);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Salary Management</h2>
                    <p className="text-sm text-gray-500">Manage employee salaries and payments</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:scale-[1.02] transition shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    <span>Create Salary Record</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Month</label>
                        <select
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-sm"
                        >
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Year</label>
                        <select
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-sm"
                        >
                            {[2024, 2025, 2026, 2027].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-sm"
                        >
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={fetchSalaries}
                            className="w-full px-4 py-2 bg-primary text-white rounded-lg font-bold hover:scale-[1.02] transition text-sm flex items-center justify-center space-x-2"
                        >
                            <Filter size={16} />
                            <span>Apply Filters</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Salaries Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="py-20 text-center text-gray-400">Loading payroll data...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Base Salary</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Net Payable</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Details</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {employees.length > 0 ? employees.map((employee) => {
                                    // Find salary record for this employee in the current month/year
                                    const salaryRecord = salaries.find(s => s.employee?._id === employee._id);
                                    const status = salaryRecord ? salaryRecord.status : 'Not Generated';

                                    return (
                                        <tr key={employee._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    {employee.avatar ? (
                                                        <img
                                                            src={employee.avatar}
                                                            alt={employee.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Users size={20} className="text-primary" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-800">{employee.name}</p>
                                                        <p className="text-xs text-gray-400">{employee.title || employee.designation || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                Rs. {(employee.salary || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 font-black text-gray-900">
                                                {salaryRecord ? `Rs. ${salaryRecord.netSalary.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {status === 'Not Generated' ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-gray-100 text-gray-500 border-gray-200">
                                                        Not Generated
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${status === 'Paid'
                                                        ? 'bg-green-50 text-green-600 border-green-200'
                                                        : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                                                        }`}>
                                                        {status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {status === 'Paid' ? (
                                                    <div className="text-xs">
                                                        <p className="font-bold text-gray-800">{salaryRecord.paymentAccount?.accountName}</p>
                                                        <p className="text-gray-400 font-mono">{salaryRecord.transactionId}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {status === 'Not Generated' && (
                                                        <button
                                                            onClick={() => {
                                                                setCreateFormData(prev => ({
                                                                    ...prev,
                                                                    employee: employee._id,
                                                                    basicSalary: employee.salary || '',
                                                                    allowances: '',
                                                                    deductions: ''
                                                                }));
                                                                setShowCreateModal(true);
                                                            }}
                                                            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition shadow-sm"
                                                        >
                                                            Generate Slip
                                                        </button>
                                                    )}
                                                    {status === 'Pending' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSalary(salaryRecord);
                                                                setShowPayModal(true);
                                                            }}
                                                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition shadow-sm"
                                                        >
                                                            Pay Salary
                                                        </button>
                                                    )}
                                                    {salaryRecord && (
                                                        <button
                                                            onClick={() => window.open(`/salary-slip/${salaryRecord._id}`, '_blank')}
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                                                            title="View Slip"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center text-gray-400">
                                            No employees found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create Salary Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">Create Salary Record</h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetCreateForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSalary} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Employee *</label>
                                    <select
                                        required
                                        value={createFormData.employee}
                                        onChange={(e) => setCreateFormData({ ...createFormData, employee: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.name} - {emp.designation}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Month *</label>
                                    <select
                                        required
                                        value={createFormData.month}
                                        onChange={(e) => setCreateFormData({ ...createFormData, month: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
                                    >
                                        {months.map(month => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Year *</label>
                                    <select
                                        required
                                        value={createFormData.year}
                                        onChange={(e) => setCreateFormData({ ...createFormData, year: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
                                    >
                                        {[2024, 2025, 2026, 2027].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Basic Salary (Rs.) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={createFormData.basicSalary}
                                        onChange={(e) => setCreateFormData({ ...createFormData, basicSalary: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Allowances (Rs.)</label>
                                    <input
                                        type="number"
                                        value={createFormData.allowances}
                                        onChange={(e) => setCreateFormData({ ...createFormData, allowances: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Deductions (Rs.)</label>
                                    <input
                                        type="number"
                                        value={createFormData.deductions}
                                        onChange={(e) => setCreateFormData({ ...createFormData, deductions: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-bold"
                                    />
                                </div>

                                {calculationStats && (
                                    <div className="md:col-span-2 bg-orange-50 p-4 rounded-xl border border-orange-100 flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-bold text-orange-800">Attendance Penalty Quote</p>
                                            <p className="text-orange-700">
                                                Late Days: <strong>{calculationStats.lateDays}</strong> →
                                                Deductible: <strong>{calculationStats.deductibleDays} days</strong>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-orange-800">Rec. Deduction</p>
                                            <p className="text-xl font-bold text-orange-600">Rs. {calculationStats.deductionAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
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
                                    value={createFormData.notes}
                                    onChange={(e) => setCreateFormData({ ...createFormData, notes: e.target.value })}
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
                                    <span>Create Salary Record</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetCreateForm();
                                    }}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }

            {/* Pay Salary Modal */}
            {
                showPayModal && selectedSalary && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full">
                            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-800">Pay Salary</h3>
                                <button
                                    onClick={() => {
                                        setShowPayModal(false);
                                        setSelectedSalary(null);
                                        resetPayForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handlePaySalary} className="p-6 space-y-6">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500 mb-2">Paying salary for:</p>
                                    <p className="font-bold text-gray-800">{selectedSalary.employee?.name}</p>
                                    <p className="text-sm text-gray-600">{selectedSalary.month} {selectedSalary.year}</p>
                                    <p className="text-2xl font-black text-primary mt-2">Rs. {selectedSalary.netSalary.toLocaleString()}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Payment Account *</label>
                                    <select
                                        required
                                        value={payFormData.paymentAccountId}
                                        onChange={(e) => setPayFormData({ ...payFormData, paymentAccountId: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Payment Account</option>
                                        {paymentAccounts.map(acc => (
                                            <option key={acc._id} value={acc._id}>
                                                {acc.accountName} ({acc.accountType === 'Bank' ? acc.bankName : acc.accountType})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Transaction ID *</label>
                                    <input
                                        type="text"
                                        required
                                        value={payFormData.transactionId}
                                        onChange={(e) => setPayFormData({ ...payFormData, transactionId: e.target.value })}
                                        placeholder="e.g. TXN123456789"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                    />
                                </div>

                                <div className="flex items-center space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
                                    >
                                        <Check size={18} />
                                        <span>Confirm Payment</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPayModal(false);
                                            setSelectedSalary(null);
                                            resetPayForm();
                                        }}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
