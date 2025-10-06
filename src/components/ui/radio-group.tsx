import * as React from 'react';

export const RadioGroup = ({ onValueChange, defaultValue, className = '', children }: any) => {
  const [value, setValue] = React.useState(defaultValue);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            ...child.props,
            checked: child.props.value === value,
            onChange: () => handleChange(child.props.value)
          } as any);
        }
        return child;
      })}
    </div>
  );
};

export const RadioGroupItem = React.forwardRef<HTMLInputElement, any>(
  ({ className = '', value, checked, onChange, id, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="radio"
        id={id}
        value={value}
        checked={checked}
        onChange={onChange}
        className={`h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
        {...props}
      />
    );
  }
);

RadioGroupItem.displayName = 'RadioGroupItem';
