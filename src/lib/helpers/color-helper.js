import chroma from "chroma-js";
import _ from "lodash";

import { CHROMA_COLORSCALES } from "../constants/constants";

export class ColorHelper {
  getScale = (colorScale, values) => {
    return chroma
      .scale(CHROMA_COLORSCALES[colorScale])
      .domain([_.min(values), _.max(values)]);
  };

  getColor = (colorEncoding, state, value, scale = chroma.scale()) => {
    if (colorEncoding === "var") {
      return scale(value).rgb();
    } else if (colorEncoding === "obs") {
      return state.hasOwnProperty(value) ? state[value]["color"] : null;
    }
  };
}
