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
          min && max
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
      const { isCategorical, domain, classes = null } = params;
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
      { alpha = false, gray = false } = {},
      colorEncoding = dataset.colorEncoding
    ) => {
      if (colorEncoding) {
        return [
          ...chroma.mix(scale(value).rgb(), GRAY, gray * 0.95, "rgb").rgb(),
          255 * (alpha ? 0.2 : 1),
        ]; // not using chroma's .alpha as deckgl expects alpha in 0-255 range
      } else {
        return null;
      }
    },
    [dataset.colorEncoding]
  );

  return { getScale, getScaleParams, getColor };
};
