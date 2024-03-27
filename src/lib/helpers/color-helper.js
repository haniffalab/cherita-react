import chroma from "chroma-js";
import _ from "lodash";

import { CHROMA_COLORSCALES } from "../constants/constants";
import { useDataset } from "../context/DatasetContext";

export class ColorHelper {
  getScale(dataset, values) {
    return chroma
      .scale(CHROMA_COLORSCALES[dataset.controls.colorScale])
      .domain([_.min(values), _.max(values)]);
  }

  getColor(dataset, value, scale = chroma.scale()) {
    if (dataset.colorEncoding === "var") {
      return scale(value).rgb();
    } else if (dataset.colorEncoding === "obs") {
      //console.log(dataset.obs[dataset.selectedObs.name].state[value]["color"]);
      return dataset.obs[dataset.selectedObs.name].state.hasOwnProperty(value)
        ? dataset.obs[dataset.selectedObs.name].state[value]["color"]
        : null;
    }
  }
}
