interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`premium-card ${className}`}>
      {children}
    </div>
  );
}
