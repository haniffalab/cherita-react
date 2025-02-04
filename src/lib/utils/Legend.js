import React, { useMemo } from "react";

import _ from "lodash";

import { formatNumerical, FORMATS } from "./string";
import { COLOR_ENCODINGS } from "../constants/constants";
import { useDataset } from "../context/DatasetContext";
import { rgbToHex, useColor } from "../helpers/color-helper";

export function Legend({
  isCategorical = false,
  min = 0,
  max = 1,
  colorscale = null,
  addText = "",
}) {
  const dataset = useDataset();
  const { getColor } = useColor();

  const spanList = useMemo(() => {
    return _.range(100).map((i) => {
      var color = rgbToHex(
        getColor({
          value: i / 100,
          categorical: isCategorical,
          colorscale: colorscale,
        })
      );
      return (
        <span
          key={i}
          className="grad-step"
          style={{ backgroundColor: color }}
        ></span>
      );
    });
  }, [colorscale, getColor, isCategorical]);

  if (dataset.colorEncoding && !isCategorical) {
    return (
      <div className="cherita-legend">
        <div className="gradient">
          <p className="small m-0 p-0">
            {(dataset.colorEncoding === COLOR_ENCODINGS.VAR
              ? dataset.selectedVar?.name
              : dataset.selectedObs?.name) + addText}
          </p>
          {spanList}
          <span className="domain-min">
            {formatNumerical(min, FORMATS.EXPONENTIAL)}
          </span>
          <span className="domain-med">
            {formatNumerical((min + max) * 0.5, FORMATS.EXPONENTIAL)}
          </span>
          <span className="domain-max">
            {formatNumerical(max, FORMATS.EXPONENTIAL)}
          </span>
        </div>
      </div>
    );
  } else {
    return (
      <div className="cherita-legend">
        <div className="gradient">
          <p className="small m-0 p-0">
            {dataset.colorEncoding === COLOR_ENCODINGS.OBS &&
            dataset.selectedObs
              ? dataset.selectedObs.name
              : ""}
          </p>
        </div>
      </div>
    );
  }
}
