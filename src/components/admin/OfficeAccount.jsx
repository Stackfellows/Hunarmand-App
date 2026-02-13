import React, { useState, useEffect } from 'react';
import {
    Plus,
    Calendar,
    PieChart,
    TrendingUp,
    DollarSign,
    FileText,
    Search,
    Filter,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Utensils,
    Zap,
    Truck,
    Briefcase,
    MoreHorizontal,
    Download,
    Trash2,
    Edit3,
    Users,
    Settings,
    CreditCard,
    Receipt
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../utils/api';
import PaymentAccounts from './PaymentAccounts';
import Transactions from './Transactions';

export default function OfficeAccount() {
    const [activeSubTab, setActiveSubTab] = useState('expenses'); // 'expenses', 'add', 'reports', 'payment-accounts', 'transactions'
    const [expenseFilter, setExpenseFilter] = useState('daily'); // 'daily', 'monthly', 'yearly'
    const [expenses, setExpenses] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentAccounts, setPaymentAccounts] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        notes: '',
        paymentAccountId: '',
        transactionId: ''
    });

    useEffect(() => {
        if (activeSubTab === 'expenses') {
            fetchExpenses();
        }
        if (activeSubTab === 'add') {
            fetchPaymentAccounts();
        }
    }, [activeSubTab, expenseFilter, filterDate]);

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

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/office-account/expenses?type=${expenseFilter}&date=${filterDate}`);
            if (data.success) {
                setExpenses(data.data || []);
                setTotalAmount(data.total || 0);
            }
        } catch (err) {
            console.error("Failed to fetch expenses", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.title || !formData.amount || !formData.category) {
            alert("Please fill all required fields");
            return;
        }

        try {
            const payload = {
                ...formData,
                amount: Number(formData.amount)
            };

            const { data } = await api.post('/api/office-account/expenses', payload);
            if (data.success) {
                alert('Expense added successfully');
                setFormData({
                    title: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    category: '',
                    notes: '',
                    paymentAccountId: '',
                    transactionId: ''
                });
                setActiveSubTab('expenses');
                fetchExpenses();
            }
        } catch (err) {
            console.error("Add expense error:", err);
            alert(err.response?.data?.message || "Failed to add expense. Please check your connection and try again.");
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            const { data } = await api.delete(`/api/office-account/expenses/${id}`);
            if (data.success) {
                fetchExpenses();
            }
        } catch (err) {
            alert("Failed to delete expense");
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await api.get(`/api/office-account/reports/download?type=${expenseFilter}&date=${filterDate}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Report_${expenseFilter}_${filterDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Failed to download PDF report");
        }
    };

    const categories = [
        { name: 'Utilities', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { name: 'Supplies', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Food', icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50' },
        { name: 'Logistics', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
        { name: 'Salaries', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
        { name: 'Maintenance', icon: Settings, color: 'text-red-600', bg: 'bg-red-50' },
        { name: 'Rent', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { name: 'Other', icon: MoreHorizontal, color: 'text-gray-600', bg: 'bg-gray-50' }
    ];

    const getCategoryStyles = (name) => {
        return categories.find(c => c.name === name) || categories[categories.length - 1];
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Internal Nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Office Account</h2>
                    <p className="text-sm text-gray-500">Manage workplace expenditures and financial reports</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                    <button
                        onClick={() => setActiveSubTab('expenses')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeSubTab === 'expenses' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Expenses
                    </button>
                    <button
                        onClick={() => setActiveSubTab('add')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeSubTab === 'add' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Add New
                    </button>
                    <button
                        onClick={() => setActiveSubTab('payment-accounts')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeSubTab === 'payment-accounts' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Payment Accounts
                    </button>
                    <button
                        onClick={() => setActiveSubTab('transactions')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeSubTab === 'transactions' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Transactions
                    </button>
                    <button
                        onClick={() => setActiveSubTab('reports')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeSubTab === 'reports' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Reports
                    </button>
                </div>
            </div>

            {/* Content Based on Sub-Tab */}
            {activeSubTab === 'expenses' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['daily', 'monthly', 'yearly'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setExpenseFilter(type)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all capitalize ${expenseFilter === type ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleDownloadPDF}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-opacity-90 transition"
                            >
                                <Download size={14} />
                                <span>Export PDF</span>
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto min-h-[400px]">
                        {loading ? (
                            <div className="py-20 text-center text-gray-400">Loading expenses...</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Expense Item</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {expenses.length > 0 ? expenses.map((exp) => {
                                        const cat = getCategoryStyles(exp.category);
                                        return (
                                            <tr key={exp._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold text-gray-800">{exp.title}</p>
                                                        <p className="text-xs text-gray-400 line-clamp-1">{exp.notes || 'No notes'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${cat.bg} ${cat.color}`}>
                                                        <cat.icon size={12} />
                                                        <span className="text-[10px] font-black uppercase tracking-wider">{exp.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                    {format(new Date(exp.date), 'dd MMM yyyy')}
                                                </td>
                                                <td className="px-6 py-4 font-black text-gray-900">
                                                    Rs. {exp.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition">
                                                        <button
                                                            onClick={() => handleDeleteExpense(exp._id)}
                                                            className="p-2 text-red-400 hover:text-red-600 transition"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center text-gray-400">No expenses found for this period.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Total Expenses</p>
                        <p className="text-xl font-black text-primary">Rs. {totalAmount.toLocaleString()}</p>
                    </div>
                </div>
            )}

            {activeSubTab === 'add' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <Plus size={20} className="mr-2 text-primary" />
                            Record New Expenditure
                        </h3>
                        <form onSubmit={handleAddExpense} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Expense Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Utility Bills"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Amount (Rs.)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-bold"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Notes (Optional)</label>
                                <textarea
                                    rows="4"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Add any specific details about this expense..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
                                ></textarea>
                            </div>

                            {/* Payment Details Section */}
                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                                    <CreditCard size={16} className="mr-2 text-primary" />
                                    Payment Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Payment Account</label>
                                        <select
                                            value={formData.paymentAccountId}
                                            onChange={(e) => setFormData({ ...formData, paymentAccountId: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
                                        >
                                            <option value="">💰 Select Payment Account (Optional)</option>

                                            {/* Group Bank Accounts */}
                                            {paymentAccounts.filter(acc => acc.accountType === 'Bank').length > 0 && (
                                                <optgroup label="🏦 Bank Accounts">
                                                    {paymentAccounts
                                                        .filter(acc => acc.accountType === 'Bank')
                                                        .map(acc => (
                                                            <option key={acc._id} value={acc._id}>
                                                                {acc.accountName} - {acc.bankName}
                                                            </option>
                                                        ))
                                                    }
                                                </optgroup>
                                            )}

                                            {/* Group Mobile Wallets */}
                                            {paymentAccounts.filter(acc => acc.accountType !== 'Bank' && acc.accountType !== 'Other').length > 0 && (
                                                <optgroup label="📱 Mobile Wallets">
                                                    {paymentAccounts
                                                        .filter(acc => acc.accountType !== 'Bank' && acc.accountType !== 'Other')
                                                        .map(acc => (
                                                            <option key={acc._id} value={acc._id}>
                                                                {acc.accountName} ({acc.accountType})
                                                            </option>
                                                        ))
                                                    }
                                                </optgroup>
                                            )}

                                            {/* Group Other Accounts */}
                                            {paymentAccounts.filter(acc => acc.accountType === 'Other').length > 0 && (
                                                <optgroup label="💼 Other Accounts">
                                                    {paymentAccounts
                                                        .filter(acc => acc.accountType === 'Other')
                                                        .map(acc => (
                                                            <option key={acc._id} value={acc._id}>
                                                                {acc.accountName}
                                                            </option>
                                                        ))
                                                    }
                                                </optgroup>
                                            )}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Transaction ID</label>
                                        <input
                                            type="text"
                                            value={formData.transactionId}
                                            onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                            placeholder="e.g. TXN123456789"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                            >
                                Save Expense Entry
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeSubTab === 'reports' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-gray-800 flex items-center">
                                    <PieChart size={18} className="mr-2 text-primary" />
                                    Category Distribution
                                </h4>
                                <span className="text-[10px] font-black uppercase text-gray-400">Live Insights</span>
                            </div>
                            <div className="space-y-4">
                                {categories.slice(0, 5).map((cat, idx) => {
                                    const percentage = expenses.length > 0 ? (expenses.filter(e => e.category === cat.name).length / expenses.length * 100).toFixed(0) : 0;
                                    return (
                                        <div key={idx} className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-gray-500">{cat.name}</span>
                                                <span className="text-gray-800">{percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                <div style={{ width: `${percentage}%` }} className={`${cat.bg.replace('bg-', 'bg-')} h-full opacity-100 rounded-full transition-all duration-1000`}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="pt-4 mt-6 border-t border-gray-100">
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-primary transition shadow-lg"
                                    >
                                        <Download size={14} />
                                        <span>Download Full PDF Report</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-gray-800 flex items-center">
                                    <TrendingUp size={18} className="mr-2 text-primary" />
                                    Expense Trends
                                </h4>
                                <span className="text-[10px] font-black uppercase text-gray-400">Past 6 Months</span>
                            </div>
                            <div className="h-48 flex items-end justify-between px-2 gap-2">
                                {[35, 65, 45, 10, 55, 75].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div
                                            style={{ height: `${h}%` }}
                                            className="w-full bg-primary/10 group-hover:bg-primary/20 transition-all rounded-t-lg relative"
                                        >
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                Rs. {h}k
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'][i]}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                    <TrendingUp size={14} className="inline mr-1 text-primary" />
                                    Your office expenses are <span className="text-primary font-bold">12% lower</span> than the previous quarter. Good resource management!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === 'payment-accounts' && <PaymentAccounts />}

            {activeSubTab === 'transactions' && <Transactions />}
        </div>
    );
}
