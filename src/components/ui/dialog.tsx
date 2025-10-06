import * as React from 'react';

export const Dialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
        {children}
      </div>
    </div>
  );
};

export const DialogTrigger = ({ children, asChild }: any) => {
  return React.cloneElement(children);
};

export const DialogContent = ({ children, className = '' }: any) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const DialogHeader = ({ children, className = '' }: any) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

export const DialogTitle = ({ children, className = '' }: any) => {
  return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
};

export const DialogDescription = ({ children, className = '' }: any) => {
  return <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;
};

export const DialogFooter = ({ children, className = '' }: any) => {
  return <div className={`mt-4 flex justify-end gap-2 ${className}`}>{children}</div>;
};
