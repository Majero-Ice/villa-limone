interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded-lg font-medium transition-colors duration-300 inline-flex items-center justify-center';
  const variantClasses = {
    primary: 'bg-terracotta text-ivory hover:bg-terracotta-dark',
    secondary: 'bg-olive text-ivory hover:bg-olive-dark',
    outline: 'border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-ivory',
    ghost: 'hover:bg-sand text-graphite',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
