import React from 'react';
import { User } from '../types';
import { LogOut } from 'lucide-react';
import Button from './Button';

interface LayoutProps {
    children: React.ReactNode;
    user?: User | null;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    user,
    title,
    subtitle,
    icon,
    onLogout
}) => {
    return (
        <div className="min-h-screen bg-[#f0f9f9]">
            <nav className="bg-white border-b border-teal-50 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm/50 backdrop-blur-md bg-white/80">
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl font-black text-slate-800">{title}</h1>
                        {subtitle && <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">{subtitle}</p>}
                    </div>
                </div>
                {user && onLogout && (
                    <Button variant="secondary" onClick={onLogout} className="!py-2.5 !rounded-xl !text-sm" icon={<LogOut size={16} />}>
                        Logout
                    </Button>
                )}
            </nav>

            <main className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
                {children}
            </main>
        </div>
    );
};

export default Layout;
