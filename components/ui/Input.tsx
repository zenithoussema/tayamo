interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-text-secondary tracking-wide">
        {label}
      </label>
      <input
        id={id}
        className="premium-input"
        {...props}
      />
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
