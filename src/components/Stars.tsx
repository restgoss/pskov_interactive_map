interface Props {
  value: number;
  max?: number;
  className?: string;
}

export function Stars({ value, max = 5, className = '' }: Props) {
  return (
    <span className={className}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`star${i < value ? ' star--filled' : ''}`}>
          ★
        </span>
      ))}
    </span>
  );
}
