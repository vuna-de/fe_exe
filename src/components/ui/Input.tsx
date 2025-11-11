import React, { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseInputClasses = 'block px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm transition-colors duration-200';
  
  const stateClasses = error 
    ? 'border-error-300 text-error-900 placeholder-error-300 focus:ring-error-500 focus:border-error-500'
    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500';
  
  const paddingClasses = cn(
    leftIcon && 'pl-10',
    rightIcon && 'pr-10'
  );
  
  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      {label && (
        <label 
          htmlFor={inputId}
          className="form-label"
        >
          {label}
        </label>
      )}
      
      <div className="input-group">
        {leftIcon && (
          <div className="input-icon">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'input',
            leftIcon && 'input-with-icon',
            error && 'input-error',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className="mt-1">
          {error ? (
            <p className="error-message">{error}</p>
          ) : (
            <p className="text-gray-500 text-sm">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
