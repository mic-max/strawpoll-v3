import './AsyncButton.css'

type AsyncButtonProps = {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
};

export default function AsyncButton({
  label,
  loadingLabel = "Loading…",
  loading = false,
  disabled = false,
  type = "button",
  onClick,
}: AsyncButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`async-button ${loading ? "loading" : ""}`}
      onClick={onClick}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
