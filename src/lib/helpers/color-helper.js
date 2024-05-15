import chroma from "chroma-js";
import _ from "lodash";

import { CHROMA_COLORSCALES } from "../constants/constants";
import { useDataset } from "../context/DatasetContext";
import { useCallback } from "react";

export const useColor = () => {
  const dataset = useDataset();

  const getScale = useCallback(
    (values = null) => {
      const c = chroma
        .scale(CHROMA_COLORSCALES[dataset.controls.colorScale])
        .domain(values ? [_.min(values), _.max(values)] : [0, 1]);
      return c;
    },
    [dataset.controls.colorScale]
  );

  const getColor = useCallback(
    (scale, value, colorEncoding = dataset.colorEncoding) => {
      if (colorEncoding === "var") {
        return scale(value).rgb();
      } else if (colorEncoding === "obs") {
        return dataset.obs[dataset.selectedObs?.name]?.state?.[value]?.[
          "color"
        ];
      } else {
        return null;
      }
    },
    [dataset.colorEncoding, dataset.obs, dataset.selectedObs?.name]
  );

  return { getScale, getColor };
};
