import React from 'react';

export default function ScatterplotIcon({
  size = 40,
  colour = '#000',
  ...props
}) {
  // Points with cluster assignments
  const points = [
    // Cluster 0
    { x: 15.2, y: 35.9, cluster: 0 },
    { x: 10.0, y: 38.0, cluster: 0 },
    { x: 12.3, y: 40.7, cluster: 0 },
    { x: 15.7, y: 39.9, cluster: 0 },
    { x: 8.1, y: 42.2, cluster: 0 },
    { x: 10.8, y: 44.5, cluster: 0 },
    { x: 14.3, y: 44.6, cluster: 0 },
    { x: 7.4, y: 46.7, cluster: 0 },
    { x: 11.1, y: 48.8, cluster: 0 },
    { x: 14.8, y: 48.5, cluster: 0 },
    { x: 12.6, y: 52.1, cluster: 0 },

    // Cluster 1
    { x: 29.4, y: 37.0, cluster: 1 },
    { x: 26.1, y: 40.2, cluster: 1 },
    { x: 29.8, y: 42.0, cluster: 1 },
    { x: 33.0, y: 39.5, cluster: 1 },
    { x: 34.9, y: 43.6, cluster: 1 },
    { x: 31.5, y: 46.2, cluster: 1 },
    { x: 29.3, y: 49.5, cluster: 1 },
    { x: 26.7, y: 45.2, cluster: 1 },

    // Cluster 2
    { x: 21.6, y: 53.1, cluster: 2 },
    { x: 25.3, y: 53.9, cluster: 2 },
    { x: 25.8, y: 57.9, cluster: 2 },
    { x: 22.1, y: 57.4, cluster: 2 },
    { x: 18.4, y: 56.0, cluster: 2 },
    { x: 18.6, y: 59.8, cluster: 2 },
    { x: 22.5, y: 61.7, cluster: 2 },
  ];

  const radius = 1.8;
  const opacity = 1.0; // uniform expression

  // Compute viewBox dynamically
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs) - radius;
  const minY = Math.min(...ys) - radius;
  const maxX = Math.max(...xs) + radius;
  const maxY = Math.max(...ys) + radius;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {points.map(({ x, y }, i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={radius}
          fill={colour}
          opacity={opacity}
        />
      ))}
    </svg>
  );
}
