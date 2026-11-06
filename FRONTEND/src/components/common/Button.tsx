import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export default function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`${variant === 'primary' ? 'btn-primario' : 'btn-secundario'} ${className}`.trim()}
    />
  );
}
