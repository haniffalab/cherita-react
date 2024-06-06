import { React, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import _ from "lodash";
import { useDataset } from "../../context/DatasetContext";

export function Legend({ scale, min = 0, max = 1 }) {
  const dataset = useDataset();
  const [legendData, setLegendData] = useState({
    dmin: 0,
    dmax: 1,
    list: [],
  });

  useEffect(() => {
    if (scale) {
      const spanList = _.range(100).map((i) => {
        var color = scale(i / 100).hex();
        return (
          <span
            key={i}
            className="grad-step"
            style={{ backgroundColor: color }}
          ></span>
        );
      });

      setLegendData((d) => {
        return {
          ...d,
          list: spanList,
        };
      });
    }
  }, [max, min, scale]);

  useEffect(() => {
    setLegendData((d) => {
      return { ...d, dmin: min, dmax: max };
    });
  }, [min, max]);

  if (
    (dataset.colorEncoding === "var" && scale) ||
    (dataset.colorEncoding === "obs" &&
      dataset.selectedObs?.type === "continuous" &&
      scale)
  ) {
    return (
      <div className="cherita-legend">
        <div className="gradient">
          <p className="small m-0 p-0">
            {dataset.colorEncoding === "var"
              ? dataset.selectedVar?.name
              : dataset.selectedObs?.name}
          </p>
          {legendData.list}
          <span className="domain-min">{legendData.dmin.toFixed(1)}</span>
          <span className="domain-med">
            {((legendData.dmin + legendData.dmax) * 0.5).toFixed(1)}
          </span>
          <span className="domain-max">{legendData.dmax.toFixed(1)}</span>
        </div>
      </div>
    );
  } else {
    return (
      <div className="cherita-legend">
        <div className="gradient">
          <p className="small m-0 p-0">
            {dataset.selectedObs ? dataset.selectedObs.name : ""}
          </p>
        </div>
      </div>
    );
  }
}
