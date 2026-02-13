import React, { useState, useEffect } from 'react';
import {
    Plus,
    CreditCard,
    Building2,
    Smartphone,
    Wallet,
    Edit3,
    Trash2,
    X,
    Check
} from 'lucide-react';
import api from '../../utils/api';

export default function PaymentAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [formData, setFormData] = useState({
        accountName: '',
        accountType: '',
        bankName: '',
        accountNumber: '',
        iban: '',
        notes: ''
    });

    const pakistaniBanks = [
        'HBL (Habib Bank Limited)',
        'UBL (United Bank Limited)',
        'MCB (Muslim Commercial Bank)',
        'Allied Bank',
        'Meezan Bank',
        'Bank Alfalah',
        'Faysal Bank',
        'Standard Chartered',
        'Habib Metro',
        'Askari Bank',
        'Bank Al-Habib',
        'Soneri Bank',
        'National Bank of Pakistan (NBP)',
        'Bank of Punjab',
        'Silk Bank',
        'Summit Bank',
        'JS Bank',
        'Dubai Islamic Bank',
        'Samba Bank',
        'Bank Islami',
        'Al Baraka Bank',
        'First Women Bank',
        'Industrial Development Bank',
        'SME Bank',
        'Zarai Taraqiati Bank',
        'The Bank of Khyber',
        'Sindh Bank'
    ];

    const mobileWallets = [
        'JazzCash',
        'Easypaisa',
        'SadaPay',
        'NayaPay',
        'Finja',
        'SimSim',
        'UPaisa',
        'Alfa Wallet',
        'Omni',
        'Mobicash'
    ];

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/payment-accounts');
            if (data.success) {
                setAccounts(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch payment accounts', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.accountName || !formData.accountType) {
            alert('Please fill all required fields');
            return;
        }

        try {
            if (editingAccount) {
                const { data } = await api.put(`/api/payment-accounts/${editingAccount._id}`, formData);
                if (data.success) {
                    alert('Payment account updated successfully');
                }
            } else {
                const { data } = await api.post('/api/payment-accounts', formData);
                if (data.success) {
                    alert('Payment account added successfully');
                }
            }

            setShowModal(false);
            setEditingAccount(null);
            resetForm();
            fetchAccounts();
        } catch (err) {
            console.error('Error saving payment account:', err);
            alert(err.response?.data?.message || 'Failed to save payment account');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payment account?')) return;

        try {
            const { data } = await api.delete(`/api/payment-accounts/${id}`);
            if (data.success) {
                alert('Payment account deleted successfully');
                fetchAccounts();
            }
        } catch (err) {
            console.error('Error deleting payment account:', err);
            alert('Failed to delete payment account');
        }
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        setFormData({
            accountName: account.accountName,
            accountType: account.accountType,
            bankName: account.bankName || '',
            accountNumber: account.accountNumber || '',
            iban: account.iban || '',
            notes: account.notes || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            accountName: '',
            accountType: '',
            bankName: '',
            accountNumber: '',
            iban: '',
            notes: ''
        });
    };

    const getAccountIcon = (type) => {
        switch (type) {
            case 'Bank': return Building2;
            case 'JazzCash': return Smartphone;
            case 'Easypaisa': return Wallet;
            default: return CreditCard;
        }
    };

    const getAccountColor = (type) => {
        switch (type) {
            case 'Bank': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'JazzCash': return 'bg-red-50 text-red-600 border-red-200';
            case 'Easypaisa': return 'bg-green-50 text-green-600 border-green-200';
            case 'SadaPay': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'NayaPay': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
            case 'Finja': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'SimSim': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            case 'UPaisa': return 'bg-teal-50 text-teal-600 border-teal-200';
            case 'Alfa Wallet': return 'bg-cyan-50 text-cyan-600 border-cyan-200';
            case 'Omni': return 'bg-pink-50 text-pink-600 border-pink-200';
            case 'Mobicash': return 'bg-lime-50 text-lime-600 border-lime-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Payment Accounts</h2>
                    <p className="text-sm text-gray-500">Manage payment methods and accounts</p>
                </div>
                <button
                    onClick={() => {
                        setEditingAccount(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:scale-[1.02] transition shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    <span>Add Payment Account</span>
                </button>
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-400">Loading accounts...</div>
                ) : accounts.length > 0 ? (
                    accounts.map((account) => {
                        const Icon = getAccountIcon(account.accountType);
                        return (
                            <div
                                key={account._id}
                                className={`p-6 rounded-2xl border-2 ${getAccountColor(account.accountType)} transition-all hover:shadow-lg group`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-white rounded-xl shadow-sm">
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">{account.accountName}</h3>
                                            <p className="text-xs font-medium opacity-70">
                                                {account.accountType === 'Bank' ? account.bankName : account.accountType}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                                        <button
                                            onClick={() => handleEdit(account)}
                                            className="p-2 hover:bg-white rounded-lg transition"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(account._id)}
                                            className="p-2 hover:bg-white rounded-lg transition text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    {account.accountNumber && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-medium">Account #:</span>
                                            <span className="font-bold">****{account.accountNumber.slice(-4)}</span>
                                        </div>
                                    )}
                                    {account.iban && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-medium">IBAN:</span>
                                            <span className="font-mono text-xs font-bold">{account.iban.slice(0, 8)}...</span>
                                        </div>
                                    )}
                                    {account.notes && (
                                        <div className="mt-3 pt-3 border-t border-current/10">
                                            <p className="text-xs opacity-70 line-clamp-2">{account.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        No payment accounts found. Add your first account to get started.
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingAccount ? 'Edit Payment Account' : 'Add Payment Account'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingAccount(null);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Account Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.accountName}
                                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                        placeholder="e.g. Main Office Account"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Account Type *</label>
                                    <select
                                        required
                                        value={formData.accountType}
                                        onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Bank">🏦 Bank Account</option>
                                        <optgroup label="📱 Mobile Wallets">
                                            {mobileWallets.map(wallet => (
                                                <option key={wallet} value={wallet}>{wallet}</option>
                                            ))}
                                        </optgroup>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {formData.accountType === 'Bank' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Bank Name *</label>
                                    <select
                                        required
                                        value={formData.bankName}
                                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Bank</option>
                                        {pakistaniBanks.map(bank => (
                                            <option key={bank} value={bank}>{bank}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        {formData.accountType === 'Bank' ? 'Account Number' : 'Wallet/Account Number'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.accountNumber}
                                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                        placeholder={formData.accountType === 'Bank' ? '1234567890' : '03001234567'}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                    />
                                </div>

                                {formData.accountType === 'Bank' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">IBAN</label>
                                        <input
                                            type="text"
                                            value={formData.iban}
                                            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                            placeholder="PK36HABB0012345678901234"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                        />
                                    </div>
                                )}
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
                                    <span>{editingAccount ? 'Update Account' : 'Add Account'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingAccount(null);
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
