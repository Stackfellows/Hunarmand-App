import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import { Download, Printer } from 'lucide-react';
import { format } from 'date-fns';

export default function SalarySlip() {
    const { id } = useParams();
    const [salary, setSalary] = useState(null);
    const [loading, setLoading] = useState(true);
    const slipRef = useRef();

    useEffect(() => {
        fetchSalarySlip();
    }, [id]);

    const fetchSalarySlip = async () => {
        try {
            const { data } = await api.get(`/api/salaries/${id}/slip`);
            if (data.success) {
                setSalary(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch salary slip', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        const element = slipRef.current;
        const opt = {
            margin: 10,
            filename: `Salary_Slip_${salary?.employee?.erpId || 'EMP'}_${salary?.month}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        if (window.html2pdf) {
            window.html2pdf().set(opt).from(element).save().then(() => {
                // Success
            }).catch(err => {
                console.error('PDF Generation Error:', err);
                alert('PDF Error: ' + (err.message || 'Unknown error. check console.'));
            });
        } else {
            alert('PDF Library not ready. Please reload.');
        }
    };

    if (loading) return <div className="p-10 text-center text-[#6b7280]">Loading Slip...</div>;
    if (!salary) return <div className="p-10 text-center text-[#ef4444]">Salary Slip Not Found</div>;

    return (
        <div className="min-h-screen bg-[#f3f4f6] p-8 flex flex-col items-center">
            {/* Actions Bar */}
            <div className="w-full max-w-2xl flex justify-end gap-3 mb-6 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-[#111827] text-white rounded-lg hover:bg-black transition shadow-md"
                >
                    <Printer size={20} />
                    <span className="font-bold">Print Slip</span>
                </button>
                <button
                    onClick={handleDownloadPDF}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-[#15803d] text-white rounded-lg hover:bg-[#166534] transition shadow-md"
                >
                    <Download size={20} />
                    <span className="font-bold">Download PDF</span>
                </button>
            </div>

            {/* Slip Container */}
            <div ref={slipRef} className="relative overflow-hidden bg-white p-8 md:p-12 w-full max-w-2xl shadow-xl rounded-none md:rounded-xl print:shadow-none print:w-full print:p-0 print:m-0">
                {/* Header */}
                <div className="border-b-2 border-[#15803d] pb-6 mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-black text-[#15803d] tracking-tight">HUNARMAND PUNJAB</h1>
                        <p className="text-sm font-semibold text-[#6b7280] tracking-widest uppercase mt-1">Salary Confirmation Slip</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-[#9ca3af] uppercase">Period</p>
                        <p className="text-lg font-bold text-[#111827]">{salary.month} {salary.year}</p>
                        <p className="text-[10px] text-[#9ca3af] font-medium mt-1">Generated: {format(new Date(salary.createdAt || new Date()), 'dd MMM yyyy')}</p>
                    </div>
                </div>

                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-12 mb-8">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-[#9ca3af] tracking-wider mb-1">Employee Name</p>
                        <p className="text-lg font-bold text-[#1f2937]">{salary.employee?.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-[#9ca3af] tracking-wider mb-1">ERP ID</p>
                        <p className="text-lg font-bold text-[#1f2937]">{salary.employee?.erpId || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-[#9ca3af] tracking-wider mb-1">Designation</p>
                        <p className="text-sm font-semibold text-[#374151]">{salary.employee?.designation || 'Worker'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-[#9ca3af] tracking-wider mb-1">Department</p>
                        <p className="text-sm font-semibold text-[#374151]">{salary.employee?.department || 'Production'}</p>
                    </div>
                </div>



                {/* Attendance Summary */}
                {(salary.lateDays > 0 || salary.lateDeduction > 0) && (
                    <div className="bg-[#fff7ed] p-4 rounded-lg border border-[#ffedd5] mb-8 flex justify-between items-center relative z-10">
                        <div>
                            <p className="text-xs font-bold text-[#9a3412] uppercase tracking-wide">Attendance Penalty Applied</p>
                            <p className="text-xs text-[#c2410c] mt-1">Total Lates: <strong>{salary.lateDays}</strong></p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-[#c2410c]">Deduction Amount</p>
                            <p className="text-sm font-bold text-[#dc2626]">- Rs. {salary.lateDeduction?.toLocaleString()}</p>
                        </div>
                    </div>
                )}

                {/* Payment Details (If Paid) */}
                {salary.status === 'Paid' && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-8 grid grid-cols-3 gap-4 relative z-10">
                        <div>
                            <p className="text-[10px] text-green-800 uppercase font-bold">Payment Date</p>
                            <p className="text-sm font-bold text-green-900">{salary.paidDate ? format(new Date(salary.paidDate), 'dd MMM yyyy') : '-'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-green-800 uppercase font-bold">Paid via</p>
                            <p className="text-sm font-bold text-green-900">{salary.paymentAccount?.accountName || 'Cash/Other'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-green-800 uppercase font-bold">Transaction ID</p>
                            <p className="text-sm font-bold text-green-900">{salary.transactionId || 'N/A'}</p>
                        </div>
                    </div>
                )}

                {/* Salary Details Table */}
                <div className="border border-[#f3f4f6] rounded-lg overflow-hidden mb-8 relative z-10 bg-white/50 backdrop-blur-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#f9fafb] border-b border-[#f3f4f6]">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-[#6b7280] uppercase">Description</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#6b7280] uppercase text-right">Amount (PKR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f3f4f6]">
                            <tr>
                                <td className="px-6 py-5 text-sm font-medium text-[#374151]">Basic Salary</td>
                                <td className="px-6 py-5 text-sm font-bold text-[#111827] text-right">
                                    {(salary.basicSalary || 0).toLocaleString()}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-5 text-sm font-medium text-[#374151]">Allowances</td>
                                <td className="px-6 py-5 text-sm font-bold text-[#16a34a] text-right">
                                    + {(salary.allowances || 0).toLocaleString()}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-5 text-sm font-medium text-[#374151] relative">
                                    Other Deductions
                                    {salary.status === 'Paid' && (
                                        <span className="absolute left-40 top-1/2 -translate-y-1/2 transform -rotate-12 border-2 border-green-600 text-green-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest opacity-80">
                                            PAID
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-5 text-sm font-bold text-[#ef4444] text-right">
                                    - {(salary.deductions || 0).toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot className="bg-[#111827] text-white">
                            <tr>
                                <td className="px-6 py-5 text-sm font-bold uppercase tracking-wider">Net Payable</td>
                                <td className="px-6 py-5 text-xl font-bold text-right">
                                    Rs. {(salary.netSalary || 0).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer */}
                <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-[#f3f4f6]">
                    <div className="text-center">
                        <div className="h-16 flex items-end justify-center pb-2">
                            <span className="font-dancing text-xl text-[#6b7280] opacity-70">Authorized Sign</span>
                        </div>
                        <div className="border-t border-[#d1d5db] w-32 mx-auto"></div>
                        <p className="text-[10px] font-bold text-[#9ca3af] uppercase mt-2">Employee Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="h-16 flex items-end justify-center pb-2">
                            <span className="font-dancing text-xl text-[#6b7280] opacity-70">Authorized Sign</span>
                        </div>
                        <div className="border-t border-[#d1d5db] w-32 mx-auto"></div>
                        <p className="text-[10px] font-bold text-[#9ca3af] uppercase mt-2">Authorized Manager</p>
                    </div>
                </div>

                <div className="text-center mt-12">
                    <p className="text-[8px] text-[#d1d5db] uppercase tracking-widest">System Generated | Hunarmand Punjab ERP</p>
                </div>
            </div>
        </div>
    );
}
