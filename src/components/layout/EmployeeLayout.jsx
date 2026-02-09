import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function EmployeeLayout() {
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center text-gray-900 font-sans">
            <div className="w-full max-w-md bg-white h-screen shadow-2xl relative flex flex-col overflow-hidden">
                <div className="flex-1 w-full relative overflow-hidden">
                    <Outlet />
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
