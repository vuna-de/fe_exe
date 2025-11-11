import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  iconOnly?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  iconOnly = false,
  type = 'button',
  ...props
}) => {
  const LoadingSpinner = () => (
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
  
  const renderIcon = () => {
    if (loading) return <LoadingSpinner />;
    if (!icon) return null;
    
    const iconElement = icon as React.ReactElement<{ className?: string }>;
    return React.cloneElement(iconElement, {
      className: cn('w-4 h-4', iconElement.props?.className),
    });
  };
  
  const hasIcon = loading || icon;
  
  return (
    <button
      type={type}
      className={cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full',
        rounded && 'btn-rounded',
        iconOnly && 'btn-icon',
        loading && 'btn-loading',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {hasIcon && iconPosition === 'left' && renderIcon()}
      {children && !iconOnly && children}
      {hasIcon && iconPosition === 'right' && renderIcon()}
    </button>
  );
};

export default Button;
