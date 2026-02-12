import React from 'react';
import Modal from './Modal';
import { Shield, Clock, Send, ClipboardList } from 'lucide-react';

export default function TermsAndConditionsModal({ isOpen, onClose }) {
    const sections = [
        {
            title: 'Attendance & Punctuality',
            icon: Clock,
            content: 'Employees are required to mark their attendance via the "Swipe to Check-in" feature upon arrival at the designated workplace. Punctuality is essential for maintaining smooth operations.'
        },
        {
            title: 'Daily Progress Sharing',
            icon: Send,
            content: 'Sharing your daily work progress with the Admin is mandatory. This helps in tracking project milestones and ensuring timely completion of assigned tasks.'
        },
        {
            title: 'Task Management',
            icon: ClipboardList,
            content: 'Tasks assigned by the Admin must be acknowledged and updated upon completion. Ensure that all pending tasks are reviewed regularly on your dashboard.'
        },
        {
            title: 'Data Privacy & Security',
            icon: Shield,
            content: 'Your personal data and workplace information are handled with strict confidentiality. Please ensure your login credentials are kept secure and not shared with others.'
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Terms & Conditions">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar py-2">
                <p className="text-sm text-gray-500 italic">
                    By using the Hunarmand Punjab application, you agree to follow the guidelines outlined below to ensure a productive and transparent work environment.
                </p>

                {sections.map((section, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex items-center space-x-2 text-primary">
                            <section.icon size={18} />
                            <h3 className="font-bold text-gray-800">{section.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed pl-7">
                            {section.content}
                        </p>
                    </div>
                ))}

                <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 text-center">
                        Last updated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                </div>
            </div>
        </Modal>
    );
}
