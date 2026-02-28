import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Zap, Users } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { name: 'Predictive Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Optimization Engine', path: '/optimization', icon: <Zap size={18} /> },
        { name: 'MSME Directory', path: '/msmes', icon: <Users size={18} /> }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col w-full">
            <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex flex-1 items-center justify-between">
                            <div className="flex-shrink-0 flex items-center gap-3">
                                <div className="bg-blue-600 text-white p-2 rounded-lg shadow-inner">
                                    <Zap size={20} fill="currentColor" />
                                </div>
                                <span className="font-extrabold text-xl tracking-tight text-slate-800">MSME Predictor</span>
                            </div>
                            <div className="hidden sm:flex sm:space-x-2">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive
                                                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                                }`}
                                        >
                                            <span className={isActive ? "text-blue-600" : "text-slate-400"}>{item.icon}</span>
                                            {item.name}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-1 w-full max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
                {children}
            </main>
        </div>
    );
};

export default Layout;
