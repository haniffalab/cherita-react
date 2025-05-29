import React, { useMemo } from "react";

import { faDroplet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";

import { formatNumerical, FORMATS } from "./string";
import { COLOR_ENCODINGS } from "../constants/constants";
import { useSettings } from "../context/SettingsContext";
import { rgbToHex, useColor } from "../helpers/color-helper";

export function Legend({
  isCategorical = false,
  min = 0,
  max = 1,
  colorscale = null,
  addText = "",
}) {
  const settings = useSettings();
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

  if (settings.colorEncoding && !isCategorical) {
    return (
      <div className="cherita-legend">
        <div className="gradient">
          <p className="small m-0 p-0">
            <FontAwesomeIcon icon={faDroplet} className="me-1" />
            {(settings.colorEncoding === COLOR_ENCODINGS.VAR
              ? settings.selectedVar?.name
              : settings.selectedObs?.name) + addText}
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
  } else if (
    settings.colorEncoding === COLOR_ENCODINGS.OBS &&
    settings.selectedObs
  ) {
    return (
      <div className="cherita-legend categorical">
        <p className="legend-text text-end m-0 p-0">
          <FontAwesomeIcon icon={faDroplet} className="me-2" />
          {settings.selectedObs.name}
        </p>
      </div>
    );
  }
}
