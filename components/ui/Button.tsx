"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "btn-premium rounded-xl font-bold transition-all duration-300 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none";

  const variants: Record<string, string> = {
    primary: "btn-gold",
    accent: "btn-gold",
    outline: "btn-outline-gold",
  };

  const sizes: Record<string, string> = {
    sm: "px-5 py-2.5 text-xs tracking-wider",
    md: "px-7 py-3.5 text-sm tracking-wide",
    lg: "px-10 py-4 text-sm tracking-wide",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
