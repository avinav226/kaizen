interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function PrimaryButton({ children, onClick, disabled, type = 'button' }: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="h-[54px] w-full rounded-full bg-accent text-base font-medium text-on-accent disabled:opacity-60"
    >
      {children}
    </button>
  );
}
