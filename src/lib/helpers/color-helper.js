import chroma from "chroma-js";
import _ from "lodash";

import { CHROMA_COLORSCALES } from "../constants/constants";
import { useDataset } from "../context/DatasetContext";
import { useCallback } from "react";

export const useColor = () => {
  const dataset = useDataset();

  const getScale = useCallback(
    (values = null, categorical = false, n_values = null) => {
      let c;
      if (categorical) {
        c = chroma
          .scale("Accent")
          .domain(values ? [_.min(values), _.max(values)] : [0, 1])
          .classes(values ? _.uniq(values).length : n_values);
      } else {
        c = chroma
          .scale(CHROMA_COLORSCALES[dataset.controls.colorScale])
          .domain(values ? [_.min(values), _.max(values)] : [0, 1]);
      }
      return c;
    },
    [dataset.controls.colorScale]
  );

  const getColor = useCallback(
    (scale, value, colorEncoding = dataset.colorEncoding) => {
      if (colorEncoding) {
        return scale(value).rgb();
      } else {
        return null;
      }
    },
    [dataset.colorEncoding]
  );

  return { getScale, getColor };
};
