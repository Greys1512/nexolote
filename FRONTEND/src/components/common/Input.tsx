import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, id, ...props }: InputProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
    </div>
  );
}
