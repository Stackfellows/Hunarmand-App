import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    FileText,
    DollarSign,
    Clock,
    UserX,
    CheckCircle,
    Calendar,
    Printer,
    Download
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../utils/api';

export default function AttendancePayroll({ employeesProp }) {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Stats for the month
    const [monthlyStats, setMonthlyStats] = useState({}); // { empId: { present: 0, late: 0, absent: 0 } }
    const [salaryStatus, setSalaryStatus] = useState({}); // { empId: { status: 'Paid' | 'Pending' | 'Not Generated', amount: 0, id: '...' } }

    // Modals State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedEmployeeForSalary, setSelectedEmployeeForSalary] = useState(null);
    const [selectedSalaryRecord, setSelectedSalaryRecord] = useState(null);

    const [paymentAccounts, setPaymentAccounts] = useState([]);
    const [payFormData, setPayFormData] = useState({ paymentAccountId: '', transactionId: '' });

    // Form Data for Salary Creation
    const [createFormData, setCreateFormData] = useState({
        employee: '',
        month: '',
        year: '',
        basicSalary: '',
        allowances: '',
        deductions: '',
        lateDays: 0,
        lateDeduction: 0,
        notes: ''
    });

    const [calculationStats, setCalculationStats] = useState(null);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        if (employeesProp) {
            setEmployees(employeesProp);
        } else {
            fetchEmployees();
        }
        fetchPaymentAccounts();
    }, [employeesProp]);

    const fetchPaymentAccounts = async () => {
        try {
            const { data } = await api.get('/api/office/accounts');
            if (data.success) {
                setPaymentAccounts(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch payment accounts', err);
        }
    };

    const handlePaySalary = async () => {
        if (!payFormData.paymentAccountId) return alert('Please select a payment account');

        try {
            // If selecting CASH manually (simulated if no ID) - or just handle ID
            // Assuming backend requires valid ID for PaymentAccount model.

            const { data } = await api.put(`/api/salaries/${selectedSalaryRecord.id}/pay`, {
                paymentAccountId: payFormData.paymentAccountId,
                transactionId: payFormData.transactionId || 'CASH'
            });

            if (data.success) {
                alert('Salary Marked as Paid!');
                setShowPayModal(false);
                fetchMonthlyData(); // Refresh list
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Payment Failed');
        }
    };

    useEffect(() => {
        if (employees.length > 0) {
            fetchMonthlyData();
        }
    }, [employees, selectedMonth, selectedYear]);

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

    const fetchMonthlyData = async () => {
        // This function would ideally call a bulk endpoint. 
        // For now, we might need to iterate or fetch all salaries for the month and map them.

        // 1. Fetch Salaries for the selected month
        try {
            const { data: salaryData } = await api.get('/api/salaries', {
                params: { month: selectedMonth, year: selectedYear }
            });

            const salaryMap = {};
            if (salaryData.success) {
                salaryData.data.forEach(salary => {
                    if (salary.employee) {
                        salaryMap[salary.employee._id] = {
                            status: salary.status,
                            amount: salary.netSalary,
                            id: salary._id,
                            lateDays: salary.lateDays,
                            deduction: salary.deductions
                        };
                    }
                });
            }
            setSalaryStatus(salaryMap);

            // 2. Fetch Attendance Stats (This is heavier, so we might want to optimize this in backend later)
            // For now, let's fetch for each employee (Not ideal for large lists, but functional for < 50 employees)
            // A better approach: Create a bulk stats endpoint.
            // Let's assume we do this client side for now or use the existing loop if list is small.
            // Or better: Just fetch "Lates" count for the month for everyone in one go if possible.
            // Let's assume we fetch individual stats for now to be safe with existing APIs.

            const statsMap = {};
            // Parallel fetch limit?
            const statsPromises = employees.map(async (emp) => {
                try {
                    // This endpoint returns history, we need to filter client side or use a better endpoint
                    // Let's use the calculate endpoint for "Preview" logic? No, that's for single.
                    // We need a way to get "Current Late Count" for the list.
                    // Let's retry: we need to show "Lates" in the table. 
                    // Let's try to get stats from /api/attendance/admin/stats/:id 
                    const { data } = await api.get(`/api/attendance/admin/stats/${emp._id}`);
                    if (data.success) {
                        // Filter for selected month/year
                        const currentMonthStats = data.history.filter(h => {
                            const d = new Date(h.date);
                            return d.getMonth() === months.indexOf(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
                        });

                        statsMap[emp._id] = {
                            present: currentMonthStats.filter(s => s.status === 'Present').length,
                            late: currentMonthStats.filter(s => s.status === 'Late').length,
                            absent: currentMonthStats.filter(s => s.status === 'Absent').length
                        };
                    }
                } catch (e) {
                    console.error("Stats fetch error", e);
                }
            });

            await Promise.all(statsPromises);
            setMonthlyStats(statsMap);

        } catch (err) {
            console.error('Failed to fetch monthly data', err);
        }
    };

    // Salary Creation Logic
    const openCreateSalaryModal = (employee) => {
        setSelectedEmployeeForSalary(employee);
        setCreateFormData({
            employee: employee._id,
            month: selectedMonth,
            year: selectedYear,
            basicSalary: employee.salary || '',
            allowances: '',
            deductions: '', // Will be auto-filled
            lateDays: 0,
            lateDeduction: 0,
            notes: ''
        });
        setShowCreateModal(true);
    };

    // Auto-calculate logic (same as SalaryManagement)
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
                setCreateFormData(prev => ({
                    ...prev,
                    lateDays: data.data.lateDays,
                    lateDeduction: data.data.deductionAmount,
                    deductions: prev.deductions === '' || prev.deductions === 0 ? data.data.deductionAmount : prev.deductions
                }));
            }
        } catch (err) {
            console.error('Failed to calculate salary stats', err);
        }
    };

    const handleCreateSalary = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/api/salaries', {
                ...createFormData,
                basicSalary: Number(createFormData.basicSalary),
                allowances: Number(createFormData.allowances) || 0,
                deductions: Number(createFormData.deductions) || 0
            });

            if (data.success) {
                alert('Salary Generated!');
                setShowCreateModal(false);
                fetchMonthlyData(); // Refresh list
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed');
        }
    };

    const calculateNetSalary = () => {
        const basic = Number(createFormData.basicSalary) || 0;
        const allowances = Number(createFormData.allowances) || 0;
        const deductions = Number(createFormData.deductions) || 0;
        return basic + allowances - deductions;
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
                    <p className="text-sm text-gray-500">Attendance tracking & Payroll processing</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-gray-50 hover:bg-white transition"
                    >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-gray-50 hover:bg-white transition"
                    >
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Attendance</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Salary Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Deductions</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredEmployees.map(emp => {
                                const stats = monthlyStats[emp._id] || { present: 0, late: 0, absent: 0 };
                                const salary = salaryStatus[emp._id];

                                return (
                                    <tr key={emp._id} className="hover:bg-gray-50/50 transition bg-white">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <img src={emp.avatar} alt="" className="w-10 h-10 rounded-full border border-gray-100" />
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">{emp.name}</p>
                                                    <p className="text-xs text-gray-400">{emp.designation}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-center space-x-4 text-xs">
                                                <div className="text-center">
                                                    <span className="block font-bold text-green-600">{stats.present}</span>
                                                    <span className="text-gray-400">P</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="block font-bold text-orange-500">{stats.late}</span>
                                                    <span className="text-gray-400">L</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="block font-bold text-red-500">{stats.absent}</span>
                                                    <span className="text-gray-400">A</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {salary ? (
                                                <div>
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                                                        ${salary.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                                                    `}>
                                                        {salary.status}
                                                    </span>
                                                    <p className="text-xs font-bold mt-1">Rs. {salary.amount?.toLocaleString()}</p>
                                                </div>
                                            ) : (
                                                <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-400">
                                                    Not Generated
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {salary ? (
                                                <span className="text-xs font-bold text-red-500">- Rs. {salary.deduction?.toLocaleString()}</span>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Pending Calc...</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center space-x-2">
                                                {!salary && (
                                                    <button
                                                        onClick={() => openCreateSalaryModal(emp)}
                                                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition shadow-sm"
                                                    >
                                                        Generate Slip
                                                    </button>
                                                )}

                                                {salary && (
                                                    <button
                                                        onClick={() => window.open(`/salary-slip/${salary.id}`, '_blank')}
                                                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                                                        title="Print Slip"
                                                    >
                                                        <Printer size={16} />
                                                    </button>
                                                )}

                                                {salary && salary.status !== 'Paid' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSalaryRecord(salary);
                                                            salary.employee = emp;
                                                            salary.netSalary = salary.amount;
                                                            setPayFormData({ paymentAccountId: '', transactionId: '' });
                                                            setShowPayModal(true);
                                                        }}
                                                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition shadow-sm flex items-center space-x-1"
                                                    >
                                                        <DollarSign size={12} />
                                                        <span>Pay Now</span>
                                                    </button>
                                                )}

                                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Salary Modal (Simplified Injection) */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h3 className="font-bold text-lg">Generate Salary Slip</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleCreateSalary} className="p-6 space-y-4">
                            {/* Employee Info Readonly */}
                            <div className="p-3 bg-blue-50 rounded-xl flex items-center space-x-3 mb-4">
                                <img src={selectedEmployeeForSalary?.avatar} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-bold text-sm">{selectedEmployeeForSalary?.name}</p>
                                    <p className="text-xs text-blue-600">{selectedMonth} {selectedYear}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Basic Salary</label>
                                    <input
                                        type="number"
                                        value={createFormData.basicSalary}
                                        onChange={e => setCreateFormData({ ...createFormData, basicSalary: e.target.value })}
                                        className="w-full p-2 border rounded-lg font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deductions</label>
                                    <input
                                        type="number"
                                        value={createFormData.deductions}
                                        onChange={e => setCreateFormData({ ...createFormData, deductions: e.target.value })}
                                        className="w-full p-2 border rounded-lg font-bold text-red-600"
                                    />
                                </div>
                            </div>

                            {/* Auto Calculation Block */}
                            {calculationStats && (
                                <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-xs text-orange-800">
                                    <p className="font-bold mb-1">Attendance Penalty:</p>
                                    <p>{calculationStats.lateDays} Late Days → {calculationStats.deductibleDays} Day(s) Deduction</p>
                                    <p>Recommended: <strong>Rs. {calculationStats.deductionAmount}</strong></p>
                                </div>
                            )}

                            <div className="pt-4 flex justify-between items-center border-t mt-4">
                                <span className="font-bold text-gray-600">Net Payable:</span>
                                <span className="text-2xl font-black text-primary">Rs. {calculateNetSalary().toLocaleString()}</span>
                            </div>

                            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition">
                                Confirm & Generate
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Pay Salary Modal */}
            {showPayModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl scale-100 transform transition-all">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Confirm Payment</h3>
                                <p className="text-xs text-gray-500">Mark salary as paid</p>
                            </div>
                            <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-gray-600 transition">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{selectedSalaryRecord?.employee?.name}</p>
                                    <p className="text-xs text-blue-600 font-medium">Net Payable: <span className="text-lg font-bold">Rs. {selectedSalaryRecord?.netSalary?.toLocaleString()}</span></p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Account</label>
                                    <select
                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-primary/20"
                                        value={payFormData.paymentAccountId}
                                        onChange={(e) => setPayFormData({ ...payFormData, paymentAccountId: e.target.value })}
                                    >
                                        <option value="">Select Account</option>
                                        <optgroup label="Wallets / Cash">
                                            <option value="CASH">Cash in Hand</option>
                                            <option value="JazzCash">JazzCash</option>
                                            <option value="Easypaisa">Easypaisa</option>
                                            <option value="SadaPay">SadaPay</option>
                                            <option value="Nayapay">Nayapay</option>
                                        </optgroup>
                                        <optgroup label="Banks">
                                            <option value="HBL">HBL</option>
                                            <option value="Meezan Bank">Meezan Bank</option>
                                            <option value="UBL">UBL</option>
                                            <option value="Alfalah">Bank Alfalah</option>
                                            <option value="MCB">MCB</option>
                                            <option value="Allied Bank">Allied Bank</option>
                                            <option value="Askari Bank">Askari Bank</option>
                                        </optgroup>
                                        <optgroup label="Registered Accounts">
                                            {paymentAccounts.map(acc => (
                                                <option key={acc._id} value={acc._id}>{acc.accountName} ({acc.bankName})</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Transaction ID / Ref</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TRX-12345678"
                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={payFormData.transactionId}
                                        onChange={(e) => setPayFormData({ ...payFormData, transactionId: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handlePaySalary}
                                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition flex items-center justify-center space-x-2"
                            >
                                <CheckCircle size={18} />
                                <span>Confirm Payment</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
