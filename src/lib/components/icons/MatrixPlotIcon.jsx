export default function MatrixPlotIcon({
  size = 40,
  colour = "#000",
  gap = 2,
  ...props
}) {
  const rows = 3;
  const cols = 3;

  const squareSize = (size - gap * (cols - 1)) / cols;

  const squares = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      squares.push({
        x: col * (squareSize + gap),
        y: row * (squareSize + gap),
      });
    }
  }

  // Example: corners semi-transparent
  const semiTransparentSquares = [0, 2, 6, 8];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {squares.map(({ x, y }, i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={squareSize}
          height={squareSize}
          fill={colour}
          fillOpacity={semiTransparentSquares.includes(i) ? 0.5 : 1}
        />
      ))}
    </svg>
  );
}
