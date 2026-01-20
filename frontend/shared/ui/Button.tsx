interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-colors duration-300';
  const variantClasses = {
    primary: 'bg-terracotta text-ivory hover:bg-terracotta-dark',
    secondary: 'bg-olive text-ivory hover:bg-olive-dark',
    outline: 'border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-ivory',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
