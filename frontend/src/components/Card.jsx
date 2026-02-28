import React from 'react';

const Card = ({ title, children, className = '', headerIcon = null, headerAction = null }) => {
    return (
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${className}`}>
            {title && (
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {headerIcon && <span className="text-slate-500">{headerIcon}</span>}
                        <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            <div className="p-5 flex-1 relative">
                {children}
            </div>
        </div>
    );
};

export default Card;
