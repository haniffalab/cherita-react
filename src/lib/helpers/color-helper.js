import chroma from "chroma-js";
import _ from "lodash";

import { CHROMA_COLORSCALES } from "../constants/constants";
import { useDataset } from "../context/DatasetContext";
import { useCallback } from "react";

const GRAY = [214, 212, 212];

export const useColor = () => {
  const dataset = useDataset();

  const getScaleParams = useCallback(
    (
      { values = null, n_values = null, min = null, max = null } = {},
      isCategorical = false
    ) => {
      return {
        domain:
          min !== null && min !== undefined && max !== null && max !== undefined
            ? [min, max]
            : values
            ? [_.min(values), _.max(values)]
            : [0, 1],
        classes: isCategorical
          ? values
            ? _.uniq(values).length
            : n_values
          : null,
        isCategorical: isCategorical,
      };
    },
    []
  );

  const getScale = useCallback(
    (params) => {
      if (!params) {
        return chroma.scale(
          CHROMA_COLORSCALES[dataset.controls.colorScale],
          [0, 1]
        );
      }
      const { isCategorical, domain = [0, 1], classes = null } = params;
      let c = chroma
        .scale(
          CHROMA_COLORSCALES[
            isCategorical ? "Accent" : dataset.controls.colorScale
          ]
        )
        .domain(domain);
      if (classes) {
        c.classes(classes);
      }
      return c;
    },
    [dataset.controls.colorScale]
  );

  const getColor = useCallback(
    (
      scale,
      value,
      grayOut = false,
      { alpha = 0.2, gray = 0.95 } = {},
      colorEncoding = dataset.colorEncoding
    ) => {
      if (colorEncoding) {
        if (grayOut) {
          // Mix color with gray manually instead of chroma.mix to get better performance with deck.gl
          const rgb = scale(value).rgb();
          return [
            rgb[0] * (1 - gray) + GRAY[0] * gray,
            rgb[1] * (1 - gray) + GRAY[1] * gray,
            rgb[2] * (1 - gray) + GRAY[2] * gray,
            255 * alpha,
          ];
        } else {
          return [...scale(value).rgb(), 255];
        }
      } else {
        return null;
      }
    },
    [dataset.colorEncoding]
  );

  return { getScale, getScaleParams, getColor };
};
