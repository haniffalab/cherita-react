import { useCallback } from "react";

import { COLORSCALES } from "../constants/colorscales";
import { useDataset } from "../context/DatasetContext";

const GRAY = [214, 212, 212];

const parseHexColor = (color) => {
  const r = parseInt(color?.substring(1, 3), 16);
  const g = parseInt(color?.substring(3, 5), 16);
  const b = parseInt(color?.substring(5, 7), 16);

  return [r, g, b];
};

const interpolateColor = (color1, color2, factor) => {
  const [r1, g1, b1] = parseHexColor(color1);
  const [r2, g2, b2] = parseHexColor(color2);

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return [r, g, b];
};

const computeColor = (colormap, value) => {
  if (!colormap || isNaN(value)) {
    return [0, 0, 0, 255];
  } else if (value <= 0) {
    return parseHexColor(colormap[0]);
  } else if (value >= 1) {
    return parseHexColor(colormap[colormap.length - 1]);
  }
  const index1 = Math.floor(value * (colormap.length - 1));
  const index2 = Math.ceil(value * (colormap.length - 1));
  const factor = (value * (colormap.length - 1)) % 1;
  return interpolateColor(colormap[index1], colormap[index2], factor);
};

export const rgbToHex = (color) => {
  const [r, g, b] = color || [0, 0, 0, 0];
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const useColor = () => {
  const dataset = useDataset();

  const getColor = useCallback(
    (
      value,
      categorical = false,
      grayOut = false,
      { alpha = 0.75, gray = 0.95 } = {},
      colorEncoding = dataset.colorEncoding
    ) => {
      const colormap =
        COLORSCALES[categorical ? "Accent" : dataset.controls.colorScale];
      if (colorEncoding) {
        if (grayOut) {
          // Mix color with gray manually instead of chroma.mix to get better performance with deck.gl
          const rgb = computeColor(colormap, value);
          return [
            rgb[0] * (1 - gray) + GRAY[0] * gray,
            rgb[1] * (1 - gray) + GRAY[1] * gray,
            rgb[2] * (1 - gray) + GRAY[2] * gray,
            255 * alpha,
          ];
        } else {
          return [...computeColor(colormap, value), 255];
        }
      } else {
        return null;
      }
    },
    [dataset.colorEncoding, dataset.controls.colorScale]
  );

  return { getColor };
};
