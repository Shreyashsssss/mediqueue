import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', padding = 'p-8' }) => {
    return (
        <div className={`bg-white rounded-[32px] shadow-sm border border-teal-50 ${padding} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
