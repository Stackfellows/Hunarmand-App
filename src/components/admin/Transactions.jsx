import React, { useState, useEffect } from 'react';
import {
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Download,
    Building2,
    Smartphone,
    Wallet,
    CreditCard,
    Receipt
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../utils/api';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        purpose: '',
        type: 'monthly',
        date: new Date().toISOString().split('T')[0]
    });
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        fetchTransactions();
    }, [filters]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/office-account/transactions', {
                params: filters
            });
            if (data.success) {
                setTransactions(data.data || []);
                setTotalAmount(data.total || 0);
            }
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        } finally {
            setLoading(false);
        }
    };

    const getAccountIcon = (type) => {
        switch (type) {
            case 'Bank': return Building2;
            case 'JazzCash': return Smartphone;
            case 'Easypaisa': return Wallet;
            default: return CreditCard;
        }
    };

    const getPurposeColor = (purpose) => {
        switch (purpose) {
            case 'Expense': return 'bg-red-50 text-red-600 border-red-200';
            case 'Salary': return 'bg-green-50 text-green-600 border-green-200';
            default: return 'bg-blue-50 text-blue-600 border-blue-200';
        }
    };

    const exportToPDF = () => {
        // Create a printable version
        const printWindow = window.open('', '_blank');
        const periodText = filters.type === 'daily' ? format(new Date(filters.date), 'dd MMM yyyy') :
            filters.type === 'monthly' ? format(new Date(filters.date), 'MMMM yyyy') :
                format(new Date(filters.date), 'yyyy');

        const purposeText = filters.purpose || 'All Transactions';

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Transaction Ledger Report - ${periodText}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        padding: 40px; 
                        background: white;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 30px; 
                        border-bottom: 3px solid #0a4d0a;
                        padding-bottom: 20px;
                    }
                    .header h1 { 
                        color: #0a4d0a; 
                        font-size: 28px; 
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .header p { 
                        color: #666; 
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .info-section {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        padding: 15px;
                        background: #f9fafb;
                        border-radius: 8px;
                    }
                    .info-item {
                        text-align: center;
                    }
                    .info-label {
                        font-size: 10px;
                        color: #666;
                        text-transform: uppercase;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .info-value {
                        font-size: 14px;
                        color: #111;
                        font-weight: bold;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-bottom: 20px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }
                    th { 
                        background: #0a4d0a; 
                        color: white; 
                        padding: 12px 8px; 
                        text-align: left; 
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        font-weight: bold;
                    }
                    td { 
                        padding: 10px 8px; 
                        border-bottom: 1px solid #e5e7eb; 
                        font-size: 11px;
                    }
                    tr:hover { background: #f9fafb; }
                    .purpose-badge {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 9px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    .purpose-expense { background: #fee2e2; color: #991b1b; }
                    .purpose-salary { background: #dcfce7; color: #166534; }
                    .purpose-other { background: #dbeafe; color: #1e40af; }
                    .total-section {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 15px;
                        background: #0a4d0a;
                        color: white;
                        border-radius: 8px;
                        margin-top: 20px;
                    }
                    .total-label {
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        font-weight: bold;
                    }
                    .total-amount {
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        font-size: 9px;
                        color: #999;
                        border-top: 1px solid #e5e7eb;
                        padding-top: 20px;
                    }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>HUNARMAND PUNJAB</h1>
                    <p>Transaction Ledger Report</p>
                </div>
                
                <div class="info-section">
                    <div class="info-item">
                        <div class="info-label">Period</div>
                        <div class="info-value">${periodText}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Filter</div>
                        <div class="info-value">${purposeText}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Total Transactions</div>
                        <div class="info-value">${transactions.length}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Generated</div>
                        <div class="info-value">${format(new Date(), 'dd MMM yyyy')}</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Purpose</th>
                            <th>Payment Account</th>
                            <th>Transaction ID</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(txn => `
                            <tr>
                                <td>${format(new Date(txn.date), 'dd MMM yyyy')}</td>
                                <td><strong>${txn.description}</strong></td>
                                <td>
                                    <span class="purpose-badge purpose-${txn.purpose.toLowerCase()}">
                                        ${txn.purpose}
                                    </span>
                                </td>
                                <td>
                                    <strong>${txn.paymentAccount?.accountName || 'N/A'}</strong><br>
                                    <small style="color: #666;">
                                        ${txn.paymentAccount?.accountType === 'Bank'
                ? txn.paymentAccount?.bankName
                : txn.paymentAccount?.accountType || ''}
                                    </small>
                                </td>
                                <td style="font-family: monospace; font-size: 10px;">
                                    ${txn.transactionId || 'N/A'}
                                </td>
                                <td style="text-align: right; font-weight: bold;">
                                    Rs. ${txn.amount.toLocaleString()}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <span class="total-label">Total Amount</span>
                    <span class="total-amount">Rs. ${totalAmount.toLocaleString()}</span>
                </div>
                
                <div class="footer">
                    <p>This is a computer-generated document. No signature is required.</p>
                    <p>Generated on ${format(new Date(), 'dd MMMM yyyy, hh:mm a')}</p>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Transaction Ledger</h2>
                    <p className="text-sm text-gray-500">Complete payment history for all transactions</p>
                </div>
                <button
                    onClick={exportToPDF}
                    disabled={transactions.length === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:scale-[1.02] transition shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={18} />
                    <span>Export PDF Report</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Period</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-sm"
                        >
                            <option value="daily">Daily</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Purpose</label>
                        <select
                            value={filters.purpose}
                            onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-sm"
                        >
                            <option value="">All Transactions</option>
                            <option value="Expense">Expenses</option>
                            <option value="Salary">Salaries</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={fetchTransactions}
                            className="w-full px-4 py-2 bg-primary text-white rounded-lg font-bold hover:scale-[1.02] transition text-sm flex items-center justify-center space-x-2"
                        >
                            <Filter size={16} />
                            <span>Apply Filters</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="py-20 text-center text-gray-400">Loading transactions...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Description</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Purpose</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Account</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Transaction ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.length > 0 ? transactions.map((txn) => {
                                    const AccountIcon = getAccountIcon(txn.paymentAccount?.accountType);
                                    return (
                                        <tr key={txn._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                {format(new Date(txn.date), 'dd MMM yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">{txn.description}</p>
                                                    {txn.relatedExpense && (
                                                        <p className="text-xs text-gray-400">Expense: {txn.relatedExpense.title}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getPurposeColor(txn.purpose)}`}>
                                                    {txn.purpose}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <AccountIcon size={16} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">
                                                            {txn.paymentAccount?.accountName || 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {txn.paymentAccount?.accountType === 'Bank'
                                                                ? txn.paymentAccount?.bankName
                                                                : txn.paymentAccount?.accountType}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs text-gray-600">
                                                    {txn.transactionId || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-black text-gray-900">
                                                        Rs. {txn.amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center text-gray-400">
                                            No transactions found for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Total Amount</p>
                    <p className="text-xl font-black text-primary">Rs. {totalAmount.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
