type ProgressBarProps = {
  percent: number; // expected 0–100 (can be fractional)
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
};

export default function ProgressBar({
  percent,
  height = 16,
  backgroundColor = "lightgrey",
  fillColor = "black",
}: ProgressBarProps) {
  return (
    <div
      style={{
        height,
        background: backgroundColor,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: "100%",
          background: fillColor,
        }}
      />
    </div>
  );
}
