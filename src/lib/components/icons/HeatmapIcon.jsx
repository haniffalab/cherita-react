export default function HeatmapIcon({
  size = 40,
  colour = "#000",
  gap = 1,
  ...props
}) {
  const rows = 6; // genes
  const cols = 8; // cells

  // Example expression pattern for visual clusters
  const expressionLevels = [
    [1, 0.8, 0.2, 0.2, 0.5, 0.9, 1, 0.7],
    [0.9, 0.7, 0.1, 0.2, 0.4, 0.8, 0.9, 0.6],
    [0.1, 0.2, 0.8, 0.9, 0.7, 0.2, 0.1, 0.3],
    [0.2, 0.3, 0.9, 1, 0.8, 0.3, 0.2, 0.4],
    [0.5, 0.6, 0.2, 0.1, 0.9, 0.7, 0.6, 0.8],
    [0.6, 0.7, 0.3, 0.2, 0.8, 0.6, 0.7, 0.9],
  ];

  const cellWidth = (size - (cols - 1) * gap) / cols;
  const cellHeight = (size - (rows - 1) * gap) / rows;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {expressionLevels.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <rect
            key={`${rowIndex}-${colIndex}`}
            x={colIndex * (cellWidth + gap)}
            y={rowIndex * (cellHeight + gap)}
            width={cellWidth}
            height={cellHeight}
            fill={colour}
            fillOpacity={value}
          />
        ))
      )}
    </svg>
  );
}
