import * as React from 'react';

export const Select = ({ value, onValueChange, disabled, children }: any) => {
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { value, disabled });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

export const SelectTrigger = ({ children, className = '', value, disabled }: any) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setIsOpen(!isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
};

export const SelectValue = ({ placeholder }: any) => {
  return <span className="text-gray-700">{placeholder}</span>;
};

export const SelectContent = ({ children, value, onValueChange }: any) => {
  return (
    <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
      <div className="max-h-60 overflow-auto p-1">
        {React.Children.map(children, child => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, { 
              isSelected: child.props.value === value,
              onSelect: () => onValueChange(child.props.value)
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export const SelectItem = ({ value, children, isSelected, onSelect, className = '' }: any) => {
  return (
    <div
      onClick={onSelect}
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 ${isSelected ? 'bg-blue-50 text-blue-900' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
