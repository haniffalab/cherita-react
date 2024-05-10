import chroma from "chroma-js";
import _ from "lodash";

import { CHROMA_COLORSCALES } from "../constants/constants";

export class ColorHelper {
  getScale = (colorScale = null, values = null) => {
    const c = chroma
      .scale(colorScale ? CHROMA_COLORSCALES[colorScale] : null)
      .domain(values ? [_.min(values), _.max(values)] : [0, 1]);
    return c;
  };

  getColor = (colorEncoding, state, value, scale = chroma.scale()) => {
    if (colorEncoding === "var") {
      return scale(value).rgb();
    } else if (colorEncoding === "obs") {
      return state?.hasOwnProperty(value) ? state[value]["color"] : null;
    }
  };
}
