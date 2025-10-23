export default function DotPlotIcon({
  size = 40,
  colour = "#000",
  gap = 20,
  ...props
}) {
  const rows = 3;
  const cols = 3;

  // Define two radii: small and large
  const smallR = 10;
  const largeR = 16;

  // Indices for large circles
  const largeIndices = [1, 4, 5, 6, 7];

  // Indices for semi-transparent circles
  const semiTransparentIndices = [0, 4, 8];

  const circles = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      const r = largeIndices.includes(index) ? largeR : smallR;

      circles.push({
        cx: col * (2 * largeR + gap) + largeR,
        cy: row * (2 * largeR + gap) + largeR,
        r,
        fill: colour,
        fillOpacity: semiTransparentIndices.includes(index) ? 0.5 : 1,
      });
    }
  }

  const viewBoxSize = (cols - 1) * (2 * largeR + gap) + 2 * largeR;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {circles.map((circle, i) => (
        <circle
          key={i}
          cx={circle.cx}
          cy={circle.cy}
          r={circle.r}
          fill={circle.fill}
          fillOpacity={circle.fillOpacity}
        />
      ))}
    </svg>
  );
}
