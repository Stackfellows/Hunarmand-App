import React, { useState } from 'react';
import { DollarSign, Users, Receipt, TrendingUp } from 'lucide-react';
import EmployeeSalaryProfiles from './EmployeeSalaryProfiles';
import SalaryManagement from './SalaryManagement';

export default function Payroll() {
    const [activeTab, setActiveTab] = useState('salary-management');

    const tabs = [
        { id: 'salary-management', name: 'Salary Management', icon: DollarSign },
        { id: 'employee-profiles', name: 'Employee Salary Profiles', icon: Users },
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-300">
                {activeTab === 'salary-management' && <SalaryManagement />}
                {activeTab === 'employee-profiles' && <EmployeeSalaryProfiles />}
            </div>
        </div>
    );
}
