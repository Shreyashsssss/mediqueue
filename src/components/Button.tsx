import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading = false,
    icon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "px-6 py-3 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-teal-600 text-white shadow-lg shadow-teal-100 hover:bg-teal-700",
        secondary: "bg-white text-slate-800 shadow-md border border-slate-100 hover:bg-slate-50",
        danger: "bg-red-600 text-white shadow-lg shadow-red-100 hover:bg-red-700",
        outline: "border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
        ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-700 px-4 py-2"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : icon}
            {children}
        </button>
    );
};

export default Button;
