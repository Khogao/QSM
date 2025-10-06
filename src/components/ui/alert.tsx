import * as React from 'react';

export const Alert = ({ children, variant = 'default', className = '' }: any) => {
  const variants = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800'
  };
  
  return (
    <div className={`rounded-lg border p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const AlertTitle = ({ children, className = '' }: any) => {
  return <h5 className={`font-semibold mb-1 ${className}`}>{children}</h5>;
};

export const AlertDescription = ({ children, className = '' }: any) => {
  return <div className={`text-sm ${className}`}>{children}</div>;
};
