import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive';
}

export const Alert: React.FC<AlertProps> = ({ children, className = '', variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-white text-gray-900 border-gray-200',
    destructive: 'bg-red-50 text-red-900 border-red-200'
  }[variant];
  
  return (
    <div className={`relative w-full rounded-lg border p-4 ${variantClasses} ${className}`}>
      {children}
    </div>
  );
};

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className = '' }) => {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`}>
      {children}
    </div>
  );
};