import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return <button type="button" className={`btn btn-${variant} btn-${size}`} {...props} />;
}
