import * as React from 'react';

// Simple form context
const FormContext = React.createContext<any>(null);

export const Form = ({ children, ...props }: any) => {
  return <form {...props}>{children}</form>;
};

export const FormField = ({ control, name, render }: any) => {
  const field = {
    name,
    value: '',
    onChange: () => {},
    onBlur: () => {}
  };
  
  return render({ field });
};

export const FormItem = ({ children, className = '' }: any) => {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
};

export const FormLabel = ({ children, className = '' }: any) => {
  return <label className={`text-sm font-medium ${className}`}>{children}</label>;
};

export const FormControl = ({ children }: any) => {
  return <>{children}</>;
};

export const FormMessage = ({ children, className = '' }: any) => {
  if (!children) return null;
  return <p className={`text-xs text-red-600 ${className}`}>{children}</p>;
};

export const FormDescription = ({ children, className = '' }: any) => {
  return <p className={`text-xs text-gray-600 ${className}`}>{children}</p>;
};
