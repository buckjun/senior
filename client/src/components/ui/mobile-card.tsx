import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
}

export function MobileCard({ 
  children, 
  className,
  padding = 'md',
  variant = 'default'
}: MobileCardProps) {
  const paddingMap = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const variantMap = {
    default: 'bg-card border border-border',
    outlined: 'border-2 border-border bg-transparent',
    filled: 'bg-muted border-0'
  };

  return (
    <div 
      className={cn(
        'rounded-lg transition-colors',
        variantMap[variant],
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  testId?: string;
}

export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
  type = 'button',
  testId
}: MobileButtonProps) {
  const variantMap = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 border-0',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
    ghost: 'hover:bg-hover text-foreground border-0'
  };

  const sizeMap = {
    sm: 'px-3 py-2 text-sm h-9',
    md: 'px-4 py-2 text-sm h-11',
    lg: 'px-6 py-3 text-base h-12'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        variantMap[variant],
        sizeMap[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </button>
  );
}

interface MobileInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'password' | 'email' | 'tel';
  disabled?: boolean;
  className?: string;
  testId?: string;
}

export function MobileInput({
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  className,
  testId
}: MobileInputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      data-testid={testId}
      className={cn(
        'flex h-11 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    />
  );
}